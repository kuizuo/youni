import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	retainSearchParams,
	stripSearchParams,
	useRouterState,
} from "@tanstack/react-router";
import type {
	AdminHydratedContentNote as AdminNoteListItem,
	ContentNoteStatus,
} from "@youni/api/contracts/shared";
import { noteStatuses } from "@youni/api/contracts/shared";
import { useCallback, useMemo } from "react";
import z from "zod";
import { AdminPage } from "@/components/admin-shell";
import { useNotesCollection } from "@/data/note-collection";
import {
	adminListSearchDefaults,
	adminNoteSortFields,
	parseAdminListSearch,
	parseAdminSearchOption,
} from "@/lib/admin-list-search";
import { useAdminListWorkflow } from "@/lib/admin-list-workflow";
import { orpc } from "@/utils/orpc";
import { NoteFilters } from "./-admin-notes/note-filters";
import { NoteTable } from "./-admin-notes/note-table";

const noteSearchDefaults = {
	...adminListSearchDefaults,
	status: "" as ContentNoteStatus | "",
};

function validateNoteSearch(search: Record<string, unknown>) {
	return {
		...parseAdminListSearch(search, adminNoteSortFields),
		status: parseAdminSearchOption(search.status, noteStatuses),
	};
}

const noteSearchSchema = z
	.object({
		page: z.unknown().optional(),
		pageSize: z.unknown().optional(),
		q: z.unknown().optional(),
		sort: z.unknown().optional(),
		status: z.unknown().optional(),
	})
	.transform(validateNoteSearch);

type NoteSearch = z.output<typeof noteSearchSchema>;
type NoteSearchInput = z.input<typeof noteSearchSchema>;

export const Route = createFileRoute("/admin/notes")({
	component: AdminNotesRoute,
	search: {
		middlewares: [
			stripSearchParams<NoteSearchInput>(noteSearchDefaults),
			retainSearchParams<NoteSearchInput>([
				"page",
				"pageSize",
				"q",
				"sort",
				"status",
			]),
		],
	},
	validateSearch: noteSearchSchema,
});

function AdminNotesRoute() {
	const navigate = Route.useNavigate();
	const list = useAdminListWorkflow<NoteSearch>(Route);
	const search = list.search;
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const notesQueryInput = useMemo(
		() => ({
			...list.paginationInput,
			status: search.status || undefined,
		}),
		[list.paginationInput, search.status],
	);
	const notes = useNotesCollection(notesQueryInput);
	const deleteMutation = useMutation(orpc.admin.deleteNote.mutationOptions());
	const refetchNotes = useCallback(async () => {
		await notes.refetch();
	}, [notes.refetch]);

	const deleteNote = useCallback(
		async (item: AdminNoteListItem) => {
			await deleteMutation.mutateAsync({ id: item.id });
			await refetchNotes();
		},
		[deleteMutation, refetchNotes],
	);

	if (pathname !== "/admin/notes") {
		return <Outlet />;
	}

	return (
		<AdminPage title="图文管理">
			<NoteFilters
				keyword={list.keyword}
				statusFilter={search.status}
				onClearKeyword={list.clearKeyword}
				onKeywordChange={list.updateKeyword}
				onKeywordSubmit={list.submitKeyword}
				onStatusChange={(status) =>
					list.updateSearch({ status }, { resetPage: true })
				}
			/>

			<NoteTable
				isDeletePending={deleteMutation.isPending}
				isFetching={notes.isInitialLoading || notes.isRetrying}
				loadError={notes.isError ? "图文加载失败，请稍后重试" : null}
				notes={notes.items}
				onDelete={deleteNote}
				onOpenNote={(item) =>
					navigate({
						to: "/admin/notes/$noteId",
						params: { noteId: item.id },
						search: true,
					})
				}
				onOpenUser={(userId) =>
					navigate({ to: "/admin/users/$userId", params: { userId } })
				}
				onPaginationChange={list.setPagination}
				onPageIndexCorrection={list.correctPageIndex}
				onRetry={() => notes.refetch(false)}
				onSortingChange={list.setSorting}
				pagination={list.pagination}
				sorting={list.sorting}
				total={notes.response?.total ?? 0}
			/>
		</AdminPage>
	);
}
