import { Card, Skeleton } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminPage } from "@/components/admin-shell";
import { useNoteDetailCollection } from "@/data/note-collection";

import { NoteDetailView } from "./-admin-notes/note-detail-view";

export const Route = createFileRoute("/admin/notes/$noteId")({
	component: AdminNoteDetailRoute,
});

function AdminNoteDetailRoute() {
	const navigate = useNavigate();
	const { noteId } = Route.useParams();
	const note = useNoteDetailCollection(noteId);
	const noteDetail = note.items[0];

	return (
		<AdminPage title="图文详情">
			{note.isInitialLoading ? (
				<DetailLoading />
			) : noteDetail ? (
				<NoteDetailView
					note={noteDetail}
					onBack={() => navigate({ to: "/admin/notes" })}
					onOpenTopic={(topicId) =>
						navigate({
							to: "/admin/topics/$topicId",
							params: { topicId },
						})
					}
					onOpenUser={(userId) =>
						navigate({ to: "/admin/users/$userId", params: { userId } })
					}
				/>
			) : (
				<Card>
					<Card.Content className="p-4 text-muted text-sm">
						未找到图文
					</Card.Content>
				</Card>
			)}
		</AdminPage>
	);
}

function DetailLoading() {
	return (
		<Card>
			<Card.Content className="grid gap-4 p-4">
				<Skeleton className="h-8 w-48 rounded-lg" />
				<Skeleton className="h-24 rounded-lg" />
				<Skeleton className="h-64 rounded-lg" />
			</Card.Content>
		</Card>
	);
}
