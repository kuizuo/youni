import { Magnifier, Pencil, Plus, TrashBin } from "@gravity-ui/icons";
import {
	Button,
	Card,
	Input,
	Label,
	SearchField,
	TextField,
} from "@heroui/react";
import type { DataGridColumn } from "@heroui-pro/react";
import { DataGrid } from "@heroui-pro/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { AdminPage, IconButton } from "@/components/admin-shell";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/topics")({
	component: AdminTopicsRoute,
});

function AdminTopicsRoute() {
	const [keyword, setKeyword] = useState("");
	const [name, setName] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const input = useMemo(
		() => ({ keyword: keyword.trim() || undefined, limit: 100 }),
		[keyword],
	);
	const topics = useQuery(orpc.admin.topics.queryOptions({ input }));
	const saveMutation = useMutation(
		orpc.admin.saveTopic.mutationOptions({
			onSuccess: () => {
				console.info(editingId ? "话题已更新" : "话题已新增");
				setName("");
				setEditingId(null);
				topics.refetch();
			},
		}),
	);
	const deleteMutation = useMutation(
		orpc.admin.deleteTopic.mutationOptions({
			onSuccess: () => {
				console.info("话题已删除");
				topics.refetch();
			},
		}),
	);
	type TopicItem = NonNullable<typeof topics.data>[number];

	const topicColumns = useMemo<DataGridColumn<TopicItem>[]>(
		() => [
			{
				accessorKey: "name",
				allowsSorting: true,
				header: "话题",
				id: "name",
				isRowHeader: true,
				minWidth: 240,
				cell: (item) => <span className="font-medium">#{item.name}</span>,
			},
			{
				accessorKey: "noteCount",
				allowsSorting: true,
				header: "图文数量",
				id: "noteCount",
				minWidth: 140,
				cell: (item) => <span className="tabular-nums">{item.noteCount}</span>,
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
				minWidth: 140,
				cell: (item) => (
					<div className="flex justify-end gap-1">
						<IconButton
							label="编辑"
							size="sm"
							variant="outline"
							onPress={() => {
								setEditingId(item.id);
								setName(item.name);
							}}
						>
							<Pencil className="size-4" />
						</IconButton>
						<IconButton
							label="删除"
							isDisabled={deleteMutation.isPending}
							size="sm"
							variant="danger"
							onPress={() => {
								if (window.confirm("确认删除这个话题？")) {
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
		[deleteMutation],
	);

	return (
		<AdminPage title="话题管理" description="维护内容话题和查看使用情况。">
			<Card>
				<Card.Content className="grid gap-3 py-4 lg:grid-cols-[1fr_1.4fr]">
					<SearchField
						aria-label="搜索话题"
						name="topics-search"
						value={keyword}
						onChange={setKeyword}
					>
						<SearchField.Group>
							<SearchField.SearchIcon>
								<Magnifier className="size-4" />
							</SearchField.SearchIcon>
							<SearchField.Input placeholder="搜索话题" />
							<SearchField.ClearButton />
						</SearchField.Group>
					</SearchField>
					<form
						className="flex gap-2"
						onSubmit={(event) => {
							event.preventDefault();
							if (name.trim()) {
								saveMutation.mutate({
									id: editingId || undefined,
									name: name.trim(),
								});
							}
						}}
					>
						<TextField className="flex-1" name="topic-name">
							<Label className="sr-only">话题名称</Label>
							<Input
								fullWidth
								placeholder={editingId ? "编辑话题名称" : "新话题名称"}
								value={name}
								onChange={(event) => setName(event.target.value)}
							/>
						</TextField>
						<Button
							type="submit"
							isDisabled={!name.trim()}
							isPending={saveMutation.isPending}
						>
							<Plus className="size-4" />
							保存
						</Button>
					</form>
				</Card.Content>
			</Card>

			<Card>
				<Card.Header>
					<Card.Title>话题列表</Card.Title>
					<Card.Description>
						维护内容分类，并查看每个话题的使用量。
					</Card.Description>
				</Card.Header>
				<Card.Content className="p-0">
					<DataGrid
						aria-label="话题列表"
						columns={topicColumns}
						contentClassName="min-w-[720px]"
						data={topics.data ?? []}
						getRowId={(item) => item.id}
						isLoadingMore={topics.isFetching}
						renderEmptyState={() => (
							<span className="text-muted text-sm">暂无话题</span>
						)}
					/>
				</Card.Content>
			</Card>
		</AdminPage>
	);
}
