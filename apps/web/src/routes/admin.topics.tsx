import { Button, Card, Input } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin-shell";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/topics")({
	component: AdminTopicsRoute,
});

function AdminTopicsRoute() {
	const session = authClient.useSession();
	const [keyword, setKeyword] = useState("");
	const [name, setName] = useState("");
	const [editingId, setEditingId] = useState<string | null>(null);
	const input = useMemo(
		() => ({ keyword: keyword.trim() || undefined, limit: 100 }),
		[keyword],
	);
	const topics = useQuery({
		...orpc.admin.topics.queryOptions({ input }),
		enabled: !!session.data?.user,
	});
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

	return (
		<AdminShell title="话题管理" description="维护内容话题和查看使用情况。">
			<Card>
				<Card.Content className="flex flex-col gap-3 py-4 md:flex-row">
					<div className="flex flex-1 items-center gap-2">
						<Search className="size-4 text-muted" data-icon="inline-start" />
						<Input
							value={keyword}
							onChange={(event) => setKeyword(event.target.value)}
							placeholder="搜索话题"
							fullWidth
						/>
					</div>
					<form
						className="flex flex-1 gap-2"
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
						<Input
							value={name}
							onChange={(event) => setName(event.target.value)}
							placeholder="新话题名称"
							fullWidth
						/>
						<Button type="submit" isDisabled={!name.trim()}>
							<Plus data-icon="inline-start" />
							保存
						</Button>
					</form>
				</Card.Content>
			</Card>

			<Card>
				<Card.Header>
					<Card.Title>话题列表</Card.Title>
				</Card.Header>
				<Card.Content>
					<div className="overflow-x-auto">
						<table className="w-full min-w-[620px] text-left text-sm">
							<thead className="border-separator border-b text-muted text-xs">
								<tr>
									<th className="py-2 pr-3 font-medium">话题</th>
									<th className="py-2 pr-3 font-medium">图文数量</th>
									<th className="py-2 pr-3 font-medium">创建时间</th>
									<th className="py-2 pr-3 font-medium">操作</th>
								</tr>
							</thead>
							<tbody>
								{topics.data?.map((item) => (
									<tr
										key={item.id}
										className="border-separator border-b last:border-b-0"
									>
										<td className="py-3 pr-3 font-medium">#{item.name}</td>
										<td className="py-3 pr-3 tabular-nums">{item.noteCount}</td>
										<td className="py-3 pr-3 text-muted">
											{new Date(item.createdAt).toLocaleString()}
										</td>
										<td className="py-3 pr-3">
											<div className="flex gap-1">
												<Button
													isIconOnly
													size="sm"
													variant="outline"
													aria-label="编辑"
													onPress={() => {
														setEditingId(item.id);
														setName(item.name);
													}}
												>
													<Pencil data-icon="inline-start" />
												</Button>
												<Button
													isIconOnly
													size="sm"
													variant="danger"
													aria-label="删除"
													onPress={() => {
														if (window.confirm("确认删除这个话题？")) {
															deleteMutation.mutate({ id: item.id });
														}
													}}
												>
													<Trash2 data-icon="inline-start" />
												</Button>
											</div>
										</td>
									</tr>
								))}
								{!topics.isLoading && topics.data?.length === 0 ? (
									<tr>
										<td className="py-8 text-center text-muted" colSpan={4}>
											暂无话题
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
