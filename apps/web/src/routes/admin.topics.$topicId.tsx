import { Card, Skeleton } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminPage } from "@/components/admin-shell";
import { useTopicDetailCollection } from "@/data/topic-collection";
import { TopicDetailView } from "./-admin-topics/topic-detail-view";

export const Route = createFileRoute("/admin/topics/$topicId")({
	component: AdminTopicDetailRoute,
});

function AdminTopicDetailRoute() {
	const navigate = useNavigate();
	const { topicId } = Route.useParams();
	const detail = useTopicDetailCollection(topicId);
	const topicDetail = detail.items[0];

	return (
		<AdminPage title="话题详情">
			{detail.isInitialLoading ? (
				<DetailLoading />
			) : topicDetail ? (
				<TopicDetailView
					isFetching={detail.isInitialLoading}
					notes={topicDetail.notes}
					topic={topicDetail.topic}
					onBack={() => navigate({ to: "/admin/topics", search: true })}
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
