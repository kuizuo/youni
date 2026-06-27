import { Card, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminPage } from "@/components/admin-shell";
import { orpc } from "@/utils/orpc";
import type { AdminNoteListItem } from "./-admin-notes/types";
import { TopicDetailView } from "./-admin-topics/topic-detail-view";
import type { AdminTopicListItem } from "./-admin-topics/types";

export const Route = createFileRoute("/admin/topics/$topicId")({
	component: AdminTopicDetailRoute,
});

function AdminTopicDetailRoute() {
	const navigate = useNavigate();
	const { topicId } = Route.useParams();
	const detail = useQuery(
		orpc.admin.topicDetail.queryOptions({ input: { id: topicId } }),
	);

	return (
		<AdminPage title="话题详情">
			{detail.isLoading ? (
				<DetailLoading />
			) : detail.data ? (
				<TopicDetailView
					isFetching={detail.isFetching}
					notes={detail.data.notes as AdminNoteListItem[]}
					topic={detail.data.topic as AdminTopicListItem}
					onBack={() => navigate({ to: "/admin/topics" })}
					onOpenNote={(item) =>
						navigate({
							to: "/admin/notes/$noteId",
							params: { noteId: item.id },
						})
					}
					onOpenUser={(userId) =>
						navigate({ to: "/admin/users/$userId", params: { userId } })
					}
				/>
			) : (
				<Card>
					<Card.Content className="p-4 text-muted text-sm">
						未找到话题
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
				<Skeleton className="h-80 rounded-lg" />
			</Card.Content>
		</Card>
	);
}
