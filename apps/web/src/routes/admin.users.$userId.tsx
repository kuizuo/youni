import { Card, Skeleton } from "@heroui/react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminPage } from "@/components/admin-shell";
import { useUserDetailCollection } from "@/data/user-collection";

import { UserDetailView } from "./-admin-users/user-detail-view";

export const Route = createFileRoute("/admin/users/$userId")({
	component: AdminUserDetailRoute,
});

function AdminUserDetailRoute() {
	const navigate = useNavigate();
	const { userId } = Route.useParams();
	const detail = useUserDetailCollection(userId);
	const userDetail = detail.items[0];

	return (
		<AdminPage title="用户详情">
			{detail.isInitialLoading ? (
				<DetailLoading />
			) : userDetail ? (
				<UserDetailView
					followers={userDetail.followers}
					following={userDetail.following}
					isFetching={detail.isInitialLoading}
					notes={userDetail.notes}
					user={userDetail.user}
					onBack={() => navigate({ to: "/admin/users", search: true })}
					onOpenNote={(item) =>
						navigate({
							to: "/admin/notes/$noteId",
							params: { noteId: item.id },
						})
					}
					onOpenUser={(targetUserId) =>
						navigate({
							to: "/admin/users/$userId",
							params: { userId: targetUserId },
						})
					}
				/>
			) : (
				<Card>
					<Card.Content className="p-4 text-muted text-sm">
						未找到用户
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
