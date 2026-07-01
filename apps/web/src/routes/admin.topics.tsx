import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";

import { AdminPage } from "@/components/admin-shell";
import { useAdminListWorkflow } from "@/lib/admin-list-workflow";
import { orpc } from "@/utils/orpc";
import { TopicFilters } from "./-admin-topics/topic-filters";
import { TopicFormDrawer } from "./-admin-topics/topic-form-drawer";
import { TopicTable } from "./-admin-topics/topic-table";
import {
	type AdminTopicListItem,
	emptyTopicForm,
	getErrorMessage,
	type TopicFormMode,
	type TopicFormState,
} from "./-admin-topics/types";

export const Route = createFileRoute("/admin/topics")({
	component: AdminTopicsRoute,
});

function AdminTopicsRoute() {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const list = useAdminListWorkflow();
	const [formMode, setFormMode] = useState<TopicFormMode>("create");
	const [form, setForm] = useState<TopicFormState>(emptyTopicForm);
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const topics = useQuery({
		...orpc.admin.topics.queryOptions({ input: list.paginationInput }),
		placeholderData: keepPreviousData,
	});
	const saveMutation = useMutation(orpc.admin.saveTopic.mutationOptions());
	const deleteMutation = useMutation(orpc.admin.deleteTopic.mutationOptions());

	const resetForm = useCallback(() => {
		setFormMode("create");
		setForm(emptyTopicForm);
		setFormMessage(null);
	}, []);

	const openCreateDrawer = useCallback(() => {
		resetForm();
		setIsFormOpen(true);
	}, [resetForm]);

	const closeFormDrawer = useCallback(() => {
		setIsFormOpen(false);
		resetForm();
	}, [resetForm]);

	const startEdit = useCallback((item: AdminTopicListItem) => {
		setFormMode("edit");
		setForm({ id: item.id, name: item.name });
		setFormMessage(null);
		setIsFormOpen(true);
	}, []);

	const refetchTopics = useCallback(async () => {
		await list.refetchList(topics);
	}, [list, topics]);

	const submitForm = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormMessage(null);

		const name = form.name.trim();
		if (!name) {
			setFormMessage("请填写话题名称");
			return;
		}

		try {
			await saveMutation.mutateAsync({
				id: form.id || undefined,
				name,
			});
			await refetchTopics();
			closeFormDrawer();
		} catch (error) {
			setFormMessage(getErrorMessage(error));
		}
	};

	const deleteTopic = useCallback(
		async (item: AdminTopicListItem) => {
			await deleteMutation.mutateAsync({ id: item.id });
			await refetchTopics();
		},
		[deleteMutation, refetchTopics],
	);

	if (pathname !== "/admin/topics") {
		return <Outlet />;
	}

	return (
		<AdminPage title="话题管理">
			<TopicFilters
				keyword={list.keyword}
				onCreateTopic={openCreateDrawer}
				onKeywordChange={list.updateKeyword}
			/>

			<TopicFormDrawer
				form={form}
				formMessage={formMessage}
				isOpen={isFormOpen}
				isSubmitting={saveMutation.isPending}
				mode={formMode}
				onCancel={closeFormDrawer}
				onChange={setForm}
				onSubmit={submitForm}
			/>

			<TopicTable
				isDeletePending={deleteMutation.isPending}
				isFetching={topics.isFetching}
				pagination={list.pagination}
				topics={(topics.data?.items ?? []) as AdminTopicListItem[]}
				total={topics.data?.total ?? 0}
				onDelete={deleteTopic}
				onEdit={startEdit}
				onOpenTopic={(item) =>
					navigate({
						to: "/admin/topics/$topicId",
						params: { topicId: item.id },
					})
				}
				onPaginationChange={list.setPagination}
			/>
		</AdminPage>
	);
}
