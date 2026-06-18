import { Button, Card, Input } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin-shell";
import { UserStatusBadge } from "@/components/admin-status";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/users")({
	component: AdminUsersRoute,
});

function AdminUsersRoute() {
	const session = authClient.useSession();
	const [keyword, setKeyword] = useState("");
	const input = useMemo(
		() => ({ keyword: keyword.trim() || undefined, limit: 100 }),
		[keyword],
	);
	const users = useQuery({
		...orpc.admin.users.queryOptions({ input }),
		enabled: !!session.data?.user,
	});
	const statusMutation = useMutation(
		orpc.admin.updateUserStatus.mutationOptions({
			onSuccess: () => {
				console.info("用户状态已更新");
				users.refetch();
			},
		}),
	);

	return (
		<AdminShell title="用户管理" description="查看用户资料、内容和账号状态。">
			<Card>
				<Card.Content className="flex items-center gap-2 py-4">
					<Search className="size-4 text-muted" data-icon="inline-start" />
					<Input
						value={keyword}
						onChange={(event) => setKeyword(event.target.value)}
						placeholder="搜索昵称或邮箱"
						fullWidth
					/>
				</Card.Content>
			</Card>

			<Card>
				<Card.Header>
					<Card.Title>用户列表</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[920px] text-left text-sm">
							<thead className="border-separator border-b text-muted text-xs">
								<tr>
									<th className="py-2 pr-3 font-medium">用户</th>
									<th className="py-2 pr-3 font-medium">简介</th>
									<th className="py-2 pr-3 font-medium">状态</th>
									<th className="py-2 pr-3 font-medium">数据</th>
									<th className="py-2 pr-3 font-medium">创建时间</th>
									<th className="py-2 pr-3 font-medium">操作</th>
								</tr>
							</thead>
							<tbody>
								{users.data?.map((item) => (
									<tr
										key={item.id}
										className="border-separator border-b align-top last:border-b-0"
									>
										<td className="py-3 pr-3">
											<div className="flex items-center gap-3">
												{item.image ? (
													<img
														src={item.image}
														alt=""
														className="size-10 object-cover"
													/>
												) : (
													<div className="flex size-10 items-center justify-center rounded-full bg-surface-secondary text-xs">
														{item.name.slice(0, 1)}
													</div>
												)}
												<div>
													<div className="font-medium">{item.name}</div>
													<div className="text-muted text-xs">{item.email}</div>
													{item.handle ? (
														<div className="text-muted text-xs">
															@{item.handle}
														</div>
													) : null}
												</div>
											</div>
										</td>
										<td className="max-w-[260px] py-3 pr-3 text-muted">
											{item.bio || "暂无简介"}
										</td>
										<td className="py-3 pr-3">
											<UserStatusBadge
												status={item.status as "active" | "disabled"}
											/>
										</td>
										<td className="py-3 pr-3 text-muted">
											<div>图文 {item.noteCount}</div>
											<div>粉丝 {item.followerCount}</div>
											<div>关注 {item.followingCount}</div>
										</td>
										<td className="py-3 pr-3 text-muted">
											{new Date(item.createdAt).toLocaleString()}
										</td>
										<td className="py-3 pr-3">
											<Button
												size="sm"
												variant={
													item.status === "active" ? "danger" : "outline"
												}
												onPress={() =>
													statusMutation.mutate({
														id: item.id,
														status:
															item.status === "active" ? "disabled" : "active",
													})
												}
											>
												{item.status === "active" ? "禁用" : "恢复"}
											</Button>
										</td>
									</tr>
								))}
								{!users.isLoading && users.data?.length === 0 ? (
									<tr>
										<td className="py-8 text-center text-muted" colSpan={6}>
											暂无用户
										</td>
									</tr>
								) : null}
							</tbody>
						</table>
					</div>
				</Card.Content>
			</Card>
		</AdminShell>
	);
}
