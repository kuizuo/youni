import type {
	AdminHydratedContentNote,
	ContentNoteStatus,
} from "@youni/api/contracts/shared";
import { useMemo } from "react";

import {
	createQueryCollection,
	createSingletonQueryCollection,
	useQueryCollection,
} from "@/data/query-collection";
import { client, queryClient } from "@/utils/orpc";

export type NotesQueryInput = {
	keyword?: string;
	limit: number;
	offset: number;
	sortBy: "title" | "author" | "status" | "createdAt";
	sortDirection: "asc" | "desc";
	status?: ContentNoteStatus;
};

export function useNotesCollection(input: NotesQueryInput) {
	const scope = useMemo(
		() =>
			createQueryCollection({
				getKey: (item: AdminHydratedContentNote) => item.id,
				id: `admin-notes:${JSON.stringify(input)}`,
				queryClient,
				queryFn: ({ signal }) => client.admin.notes(input, { signal }),
				queryKey: ["admin", "notes", input] as const,
				select: (response) => response.items,
			}),
		[input],
	);

	return useQueryCollection(scope);
}

export function useNoteDetailCollection(noteId: string) {
	const scope = useMemo(
		() =>
			createSingletonQueryCollection({
				id: `admin-note-detail:${noteId}`,
				queryClient,
				queryFn: ({ signal }) =>
					client.admin.noteDetail({ id: noteId }, { signal }),
				queryKey: ["admin", "note-detail", noteId] as const,
			}),
		[noteId],
	);

	return useQueryCollection(scope);
}
