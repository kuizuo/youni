import { Card, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AdminPage } from "@/components/admin-shell";
import { orpc } from "@/utils/orpc";

import { UserDetailView } from "./-admin-users/user-detail-view";

export const Route = createFileRoute("/admin/users/$userId")({
	component: AdminUserDetailRoute,
});

function AdminUserDetailRoute() {
	const navigate = useNavigate();
	const { userId } = Route.useParams();
	const detail = useQuery(
		orpc.admin.userDetail.queryOptions({ input: { id: userId } }),
	);

	return (
		<AdminPage title="用户详情">
			{detail.isLoading ? (
				<DetailLoading />
			) : detail.data ? (
				<UserDetailView
					followers={detail.data.followers}
					following={detail.data.following}
					isFetching={detail.isFetching}
					notes={detail.data.notes}
					user={detail.data.user}
					onBack={() => navigate({ to: "/admin/users" })}
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
