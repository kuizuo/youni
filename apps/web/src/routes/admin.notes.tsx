import { Check, EyeSlash, Magnifier, TrashBin, Xmark } from "@gravity-ui/icons";
import { Card, Chip, SearchField } from "@heroui/react";
import type { DataGridColumn } from "@heroui-pro/react";
import { DataGrid } from "@heroui-pro/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AdminPage, IconButton } from "@/components/admin-shell";
import { NoteStatusBadge, noteStatusLabel } from "@/components/admin-status";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/notes")({
	component: AdminNotesRoute,
});

const statuses = ["all", "audit", "published", "rejected", "hidden"] as const;

function AdminNotesRoute() {
	const [keyword, setKeyword] = useState("");
	const [status, setStatus] = useState<(typeof statuses)[number]>("all");
	const [activeId, setActiveId] = useState<string | null>(null);
	const input = useMemo(
		() => ({
			keyword: keyword.trim() || undefined,
			status: status === "all" ? undefined : status,
			limit: 80,
		}),
		[keyword, status],
	);
	const notes = useQuery(orpc.admin.notes.queryOptions({ input }));

	const statusMutation = useMutation(
		orpc.admin.updateNoteStatus.mutationOptions({
			onSuccess: () => {
				console.info("状态已更新");
				notes.refetch();
			},
		}),
	);
	const deleteMutation = useMutation(
		orpc.admin.deleteNote.mutationOptions({
			onSuccess: () => {
				console.info("图文已删除");
				notes.refetch();
			},
		}),
	);
	type NoteItem = NonNullable<typeof notes.data>[number];

	const noteColumns = useMemo<DataGridColumn<NoteItem>[]>(
		() => [
			{
				header: "封面",
				id: "cover",
				minWidth: 110,
				cell: (item) =>
					item.cover ? (
						<img
							src={item.cover}
							alt=""
							className="size-20 rounded-lg object-cover ring-1 ring-border"
						/>
					) : (
						<div className="flex size-20 items-center justify-center rounded-lg bg-surface-secondary text-muted text-xs ring-1 ring-border">
							无封面
						</div>
					),
			},
			{
				accessorKey: "title",
				header: "内容",
				id: "content",
				isRowHeader: true,
				minWidth: 360,
				cell: (item) => (
					<div className="grid gap-2">
						<button
							type="button"
							className="line-clamp-1 text-left font-medium text-accent hover:underline"
							onClick={() => setActiveId(activeId === item.id ? null : item.id)}
						>
							{item.title}
						</button>
						<p className="line-clamp-2 text-muted text-sm">{item.content}</p>
						<div className="flex flex-wrap gap-1">
							{item.topics.map((topic) => (
								<Chip key={topic} color="accent" size="sm" variant="soft">
									#{topic}
								</Chip>
							))}
						</div>
						{activeId === item.id ? (
							<div className="grid gap-2 rounded-2xl bg-background p-3 text-muted text-sm ring-1 ring-border">
								<p>{item.content}</p>
								<div className="flex gap-2 overflow-x-auto">
									{item.images.map((image) => (
										<img
											key={image}
											src={image}
											alt=""
											className="size-24 rounded-md object-cover ring-1 ring-border"
										/>
									))}
								</div>
							</div>
						) : null}
					</div>
				),
			},
			{
				header: "作者",
				id: "author",
				minWidth: 220,
				cell: (item) => (
					<div>
						<div className="font-medium">{item.authorName}</div>
						<div className="text-muted text-xs">{item.authorEmail}</div>
					</div>
				),
			},
			{
				accessorKey: "status",
				header: "状态",
				id: "status",
				minWidth: 150,
				cell: (item) => (
					<div className="grid gap-1">
						<NoteStatusBadge status={item.status} />
						{item.rejectionReason ? (
							<div className="text-danger text-xs">{item.rejectionReason}</div>
						) : null}
					</div>
				),
			},
			{
				header: "数据",
				id: "stats",
				minWidth: 120,
				cell: (item) => (
					<div className="text-muted text-sm">
						<div>赞 {item.likedCount}</div>
						<div>藏 {item.collectedCount}</div>
						<div>评 {item.commentCount}</div>
					</div>
				),
			},
			{
				align: "end",
				header: "操作",
				id: "actions",
				minWidth: 180,
				cell: (item) => (
					<div className="flex flex-wrap justify-end gap-1">
						<IconButton
							label="通过"
							isDisabled={statusMutation.isPending}
							size="sm"
							variant="outline"
							onPress={() =>
								statusMutation.mutate({
									id: item.id,
									status: "published",
								})
							}
						>
							<Check className="size-4" />
						</IconButton>
						<IconButton
							label="拒绝"
							isDisabled={statusMutation.isPending}
							size="sm"
							variant="outline"
							onPress={() =>
								statusMutation.mutate({
									id: item.id,
									status: "rejected",
									rejectionReason: "内容未通过审核",
								})
							}
						>
							<Xmark className="size-4" />
						</IconButton>
						<IconButton
							label="隐藏"
							isDisabled={statusMutation.isPending}
							size="sm"
							variant="outline"
							onPress={() =>
								statusMutation.mutate({
									id: item.id,
									status: "hidden",
								})
							}
						>
							<EyeSlash className="size-4" />
						</IconButton>
						<IconButton
							label="删除"
							isDisabled={deleteMutation.isPending}
							size="sm"
							variant="danger"
							onPress={() => {
								if (window.confirm("确认删除这篇图文？")) {
									deleteMutation.mutate({ id: item.id });
								}
							}}
						>
							<TrashBin className="size-4" />
						</IconButton>
					</div>
				),
			},
		],
		[activeId, deleteMutation, statusMutation],
	);

	return (
		<AdminPage title="图文管理" description="处理用户发布、审核和下架图文。">
			<Card>
				<Card.Content className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
					<SearchField
						aria-label="搜索图文"
						className="w-full md:max-w-sm"
						name="notes-search"
						value={keyword}
						onChange={setKeyword}
					>
						<SearchField.Group>
							<SearchField.SearchIcon>
								<Magnifier className="size-4" />
							</SearchField.SearchIcon>
							<SearchField.Input placeholder="搜索标题或内容" />
							<SearchField.ClearButton />
						</SearchField.Group>
					</SearchField>
					<select
						aria-label="筛选图文状态"
						value={status}
						onChange={(event) =>
							setStatus(event.target.value as (typeof statuses)[number])
						}
						className="h-10 rounded-2xl border border-border bg-background px-3 text-sm"
					>
						{statuses.map((item) => (
							<option key={item} value={item}>
								{item === "all" ? "全部状态" : noteStatusLabel[item]}
							</option>
						))}
					</select>
				</Card.Content>
			</Card>

			<Card>
				<Card.Header>
					<Card.Title>图文列表</Card.Title>
					<Card.Description>
						点击标题展开详情，图片支持横向预览。
					</Card.Description>
				</Card.Header>
				<Card.Content className="p-0">
					<DataGrid
						aria-label="图文列表"
						columns={noteColumns}
						contentClassName="min-w-[1120px]"
						data={notes.data ?? []}
						getRowId={(item) => item.id}
						isLoadingMore={notes.isFetching}
						renderEmptyState={() => (
							<span className="text-muted text-sm">暂无图文</span>
						)}
						verticalAlign="top"
					/>
				</Card.Content>
			</Card>
		</AdminPage>
	);
}
