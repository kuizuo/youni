import { useMutation } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import type {
	AdminHydratedContentNote as AdminNoteListItem,
	ContentNoteStatus,
} from "@youni/api/contracts/shared";
import { useCallback } from "react";
import { AdminPage } from "@/components/admin-shell";
import { useNotesCollection } from "@/data/note-collection";
import { useAdminListWorkflow } from "@/lib/admin-list-workflow";
import { orpc } from "@/utils/orpc";
import { NoteFilters } from "./-admin-notes/note-filters";
import { NoteTable } from "./-admin-notes/note-table";
import type { MutableNoteStatus } from "./-admin-notes/types";

export const Route = createFileRoute("/admin/notes")({
	component: AdminNotesRoute,
});

function AdminNotesRoute() {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const list = useAdminListWorkflow<ContentNoteStatus>();
	const notes = useNotesCollection(list.queryInput);
	const statusMutation = useMutation(
		orpc.admin.updateNoteStatus.mutationOptions(),
	);
	const deleteMutation = useMutation(orpc.admin.deleteNote.mutationOptions());
	const refetchNotes = useCallback(async () => {
		await notes.refetch();
	}, [notes.refetch]);

	const updateStatus = useCallback(
		async (
			item: AdminNoteListItem,
			status: MutableNoteStatus,
			rejectionReason?: string,
		) => {
			await statusMutation.mutateAsync({
				id: item.id,
				status,
				rejectionReason,
			});
			await refetchNotes();
		},
		[refetchNotes, statusMutation],
	);

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
				statusFilter={list.statusFilter}
				onKeywordChange={list.updateKeyword}
				onStatusChange={list.updateStatusFilter}
			/>

			<NoteTable
				isDeletePending={deleteMutation.isPending}
				isFetching={notes.isInitialLoading}
				isStatusBusy={statusMutation.isPending}
				notes={notes.items}
				onDelete={deleteNote}
				onOpenNote={(item) =>
					navigate({ to: "/admin/notes/$noteId", params: { noteId: item.id } })
				}
				onOpenUser={(userId) =>
					navigate({ to: "/admin/users/$userId", params: { userId } })
				}
				onPaginationChange={list.setPagination}
				onUpdateStatus={updateStatus}
				pagination={list.pagination}
				total={notes.response?.total ?? 0}
			/>
		</AdminPage>
	);
}
