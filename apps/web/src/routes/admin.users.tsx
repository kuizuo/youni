import { Magnifier } from "@gravity-ui/icons";
import { Avatar, Button, Card, SearchField } from "@heroui/react";
import type { DataGridColumn } from "@heroui-pro/react";
import { DataGrid } from "@heroui-pro/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AdminPage } from "@/components/admin-shell";
import { UserStatusBadge } from "@/components/admin-status";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/users")({
	component: AdminUsersRoute,
});

function AdminUsersRoute() {
	const [keyword, setKeyword] = useState("");
	const input = useMemo(
		() => ({ keyword: keyword.trim() || undefined, limit: 100 }),
		[keyword],
	);
	const users = useQuery(orpc.admin.users.queryOptions({ input }));
	const statusMutation = useMutation(
		orpc.admin.updateUserStatus.mutationOptions({
			onSuccess: () => {
				console.info("用户状态已更新");
				users.refetch();
			},
		}),
	);
	type UserItem = NonNullable<typeof users.data>[number];

	const userColumns = useMemo<DataGridColumn<UserItem>[]>(
		() => [
			{
				accessorKey: "name",
				allowsSorting: true,
				header: "用户",
				id: "user",
				isRowHeader: true,
				minWidth: 260,
				cell: (item) => (
					<div className="flex items-center gap-3">
						<Avatar className="size-10">
							{item.image ? (
								<Avatar.Image alt={item.name} src={item.image} />
							) : null}
							<Avatar.Fallback>{item.name.slice(0, 1)}</Avatar.Fallback>
						</Avatar>
						<div className="min-w-0">
							<div className="truncate font-medium">{item.name}</div>
							<div className="truncate text-muted text-xs">{item.email}</div>
							{item.handle ? (
								<div className="truncate text-muted text-xs">
									@{item.handle}
								</div>
							) : null}
						</div>
					</div>
				),
			},
			{
				accessorKey: "bio",
				header: "简介",
				id: "bio",
				minWidth: 260,
				cell: (item) => (
					<span className="line-clamp-2 text-muted">
						{item.bio || "暂无简介"}
					</span>
				),
			},
			{
				accessorKey: "status",
				allowsSorting: true,
				header: "状态",
				id: "status",
				minWidth: 120,
				cell: (item) => (
					<UserStatusBadge status={item.status as "active" | "disabled"} />
				),
			},
			{
				header: "数据",
				id: "stats",
				minWidth: 140,
				cell: (item) => (
					<div className="text-muted text-sm">
						<div>图文 {item.noteCount}</div>
						<div>粉丝 {item.followerCount}</div>
						<div>关注 {item.followingCount}</div>
					</div>
				),
			},
			{
				accessorKey: "createdAt",
				allowsSorting: true,
				header: "创建时间",
				id: "createdAt",
				minWidth: 180,
				cell: (item) => (
					<span className="text-muted tabular-nums">
						{new Date(item.createdAt).toLocaleString()}
					</span>
				),
			},
			{
				align: "end",
				header: "操作",
				id: "actions",
				minWidth: 120,
				cell: (item) => (
					<Button
						size="sm"
						variant={item.status === "active" ? "danger" : "outline"}
						isPending={statusMutation.isPending}
						onPress={() =>
							statusMutation.mutate({
								id: item.id,
								status: item.status === "active" ? "disabled" : "active",
							})
						}
					>
						{item.status === "active" ? "禁用" : "恢复"}
					</Button>
				),
			},
		],
		[statusMutation],
	);

	return (
		<AdminPage title="用户管理" description="查看用户资料、内容和账号状态。">
			<Card>
				<Card.Content className="py-4">
					<SearchField
						aria-label="搜索用户"
						className="w-full md:max-w-sm"
						name="users-search"
						value={keyword}
						onChange={setKeyword}
					>
						<SearchField.Group>
							<SearchField.SearchIcon>
								<Magnifier className="size-4" />
							</SearchField.SearchIcon>
							<SearchField.Input placeholder="搜索昵称或邮箱" />
							<SearchField.ClearButton />
						</SearchField.Group>
					</SearchField>
				</Card.Content>
			</Card>

			<Card>
				<Card.Header>
					<Card.Title>用户列表</Card.Title>
					<Card.Description>
						查看用户状态、内容数量和社交数据。
					</Card.Description>
				</Card.Header>
				<Card.Content className="p-0">
					<DataGrid
						aria-label="用户列表"
						columns={userColumns}
						contentClassName="min-w-[1040px]"
						data={users.data ?? []}
						getRowId={(item) => item.id}
						isLoadingMore={users.isFetching}
						renderEmptyState={() => (
							<span className="text-muted text-sm">暂无用户</span>
						)}
						verticalAlign="top"
					/>
				</Card.Content>
			</Card>
		</AdminPage>
	);
}
