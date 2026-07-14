import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	retainSearchParams,
	stripSearchParams,
	useRouterState,
} from "@tanstack/react-router";
import type { AdminTopicListItem } from "@youni/api/contracts/admin";
import type { FormEvent } from "react";
import { useCallback, useState } from "react";
import z from "zod";

import { AdminPage } from "@/components/admin-shell";
import { useTopicsCollection } from "@/data/topic-collection";
import {
	adminListSearchDefaults,
	adminTopicSortFields,
	parseAdminListSearch,
} from "@/lib/admin-list-search";
import { useAdminListWorkflow } from "@/lib/admin-list-workflow";
import { orpc } from "@/utils/orpc";
import { TopicFilters } from "./-admin-topics/topic-filters";
import { TopicFormDrawer } from "./-admin-topics/topic-form-drawer";
import { TopicTable } from "./-admin-topics/topic-table";
import {
	emptyTopicForm,
	getErrorMessage,
	type TopicFormMode,
	type TopicFormState,
} from "./-admin-topics/types";

function validateTopicSearch(search: Record<string, unknown>) {
	return parseAdminListSearch(search, adminTopicSortFields);
}

const topicSearchSchema = z
	.object({
		page: z.unknown().optional(),
		pageSize: z.unknown().optional(),
		q: z.unknown().optional(),
		sort: z.unknown().optional(),
	})
	.transform(validateTopicSearch);

type TopicSearch = z.output<typeof topicSearchSchema>;
type TopicSearchInput = z.input<typeof topicSearchSchema>;

export const Route = createFileRoute("/admin/topics")({
	component: AdminTopicsRoute,
	search: {
		middlewares: [
			stripSearchParams<TopicSearchInput>(adminListSearchDefaults),
			retainSearchParams<TopicSearchInput>(["page", "pageSize", "q", "sort"]),
		],
	},
	validateSearch: topicSearchSchema,
});

function AdminTopicsRoute() {
	const navigate = Route.useNavigate();
	const list = useAdminListWorkflow<TopicSearch>(Route);
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const [formMode, setFormMode] = useState<TopicFormMode>("create");
	const [form, setForm] = useState<TopicFormState>(emptyTopicForm);
	const [formMessage, setFormMessage] = useState<string | null>(null);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const topics = useTopicsCollection(list.paginationInput);
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
		await topics.refetch();
	}, [topics.refetch]);

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
				onClearKeyword={list.clearKeyword}
				onCreateTopic={openCreateDrawer}
				onKeywordChange={list.updateKeyword}
				onKeywordSubmit={list.submitKeyword}
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
				isFetching={topics.isInitialLoading || topics.isRetrying}
				loadError={topics.isError ? "话题加载失败，请稍后重试" : null}
				pagination={list.pagination}
				sorting={list.sorting}
				topics={topics.items}
				total={topics.response?.total ?? 0}
				onDelete={deleteTopic}
				onEdit={startEdit}
				onOpenTopic={(item) =>
					navigate({
						to: "/admin/topics/$topicId",
						params: { topicId: item.id },
						search: true,
					})
				}
				onPaginationChange={list.setPagination}
				onPageIndexCorrection={list.correctPageIndex}
				onRetry={() => topics.refetch(false)}
				onSortingChange={list.setSorting}
			/>
		</AdminPage>
	);
}
