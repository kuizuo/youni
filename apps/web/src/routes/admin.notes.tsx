import { useMutation, useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	useNavigate,
	useRouterState,
} from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";

import { AdminPage } from "@/components/admin-shell";
import { orpc } from "@/utils/orpc";
import { NoteFilters } from "./-admin-notes/note-filters";
import { NoteTable } from "./-admin-notes/note-table";
import type { AdminNoteListItem, NoteStatus } from "./-admin-notes/types";

export const Route = createFileRoute("/admin/notes")({
	component: AdminNotesRoute,
});

function AdminNotesRoute() {
	const navigate = useNavigate();
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const [keyword, setKeyword] = useState("");
	const [statusFilter, setStatusFilter] = useState<NoteStatus | "">("");
	const input = useMemo(
		() => ({
			keyword: keyword.trim() || undefined,
			status: statusFilter || undefined,
			limit: 100,
		}),
		[keyword, statusFilter],
	);
	const notes = useQuery(orpc.admin.notes.queryOptions({ input }));
	const statusMutation = useMutation(
		orpc.admin.updateNoteStatus.mutationOptions(),
	);
	const deleteMutation = useMutation(orpc.admin.deleteNote.mutationOptions());

	const refetchNotes = useCallback(async () => {
		await notes.refetch();
	}, [notes]);

	const updateStatus = useCallback(
		async (
			item: AdminNoteListItem,
			status: NoteStatus,
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
				keyword={keyword}
				statusFilter={statusFilter}
				onKeywordChange={setKeyword}
				onStatusChange={setStatusFilter}
			/>

			<NoteTable
				isDeletePending={deleteMutation.isPending}
				isFetching={notes.isFetching}
				isStatusBusy={statusMutation.isPending}
				notes={(notes.data ?? []) as AdminNoteListItem[]}
				onDelete={deleteNote}
				onOpenNote={(item) =>
					navigate({ to: "/admin/notes/$noteId", params: { noteId: item.id } })
				}
				onOpenUser={(userId) =>
					navigate({ to: "/admin/users/$userId", params: { userId } })
				}
				onUpdateStatus={updateStatus}
			/>
		</AdminPage>
	);
}
