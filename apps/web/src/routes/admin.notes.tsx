import { Button, Card, Input } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Check, EyeOff, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";

import { AdminShell } from "@/components/admin-shell";
import { NoteStatusBadge, noteStatusLabel } from "@/components/admin-status";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

export const Route = createFileRoute("/admin/notes")({
	component: AdminNotesRoute,
});

const statuses = ["all", "audit", "published", "rejected", "hidden"] as const;

function AdminNotesRoute() {
	const session = authClient.useSession();
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
	const notes = useQuery({
		...orpc.admin.notes.queryOptions({ input }),
		enabled: !!session.data?.user,
	});

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

	return (
		<AdminShell title="图文管理" description="处理用户发布、审核和下架图文。">
			<Card className="shadow-sm">
				<Card.Content className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
					<div className="flex flex-1 items-center gap-2 rounded-2xl border border-border bg-background px-3">
						<Search className="size-4 text-muted" />
						<Input
							value={keyword}
							onChange={(event) => setKeyword(event.target.value)}
							placeholder="搜索标题或内容"
							className="border-0 px-0 shadow-none"
							fullWidth
						/>
					</div>
					<select
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
				<Card.Header className="border-separator border-b bg-surface-secondary">
					<Card.Title>图文列表</Card.Title>
					<Card.Description>
						点击标题展开详情，图片支持横向预览。
					</Card.Description>
				</Card.Header>
				<Card.Content className="p-0">
					<div className="overflow-x-auto">
						<table className="w-full min-w-[980px] text-left text-sm">
							<thead className="border-separator border-b bg-background/60 text-muted text-xs">
								<tr>
									<th className="px-4 py-3 font-medium">封面</th>
									<th className="px-4 py-3 font-medium">内容</th>
									<th className="px-4 py-3 font-medium">作者</th>
									<th className="px-4 py-3 font-medium">状态</th>
									<th className="px-4 py-3 font-medium">数据</th>
									<th className="px-4 py-3 font-medium">操作</th>
								</tr>
							</thead>
							<tbody>
								{notes.data?.map((item) => (
									<tr
										key={item.id}
										className="border-separator border-b bg-surface align-top transition last:border-b-0 hover:bg-surface-secondary"
									>
										<td className="px-4 py-3">
											<img
												src={item.cover}
												alt=""
												className="size-20 rounded-md object-cover ring-1 ring-border"
											/>
										</td>
										<td className="max-w-[360px] px-4 py-3">
											<button
												type="button"
												className="text-left font-medium text-accent hover:underline"
												onClick={() =>
													setActiveId(activeId === item.id ? null : item.id)
												}
											>
												{item.title}
											</button>
											<p className="mt-1 line-clamp-2 text-muted">
												{item.content}
											</p>
											<div className="mt-2 flex flex-wrap gap-1">
												{item.topics.map((topic) => (
													<span
														key={topic}
														className="rounded-full bg-accent-soft px-2 py-0.5 text-accent-soft-foreground text-xs ring-1 ring-accent/20"
													>
														#{topic}
													</span>
												))}
											</div>
											{activeId === item.id ? (
												<div className="mt-3 grid gap-2 text-muted">
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
										</td>
										<td className="px-4 py-3">
											<div>{item.authorName}</div>
											<div className="text-muted text-xs">
												{item.authorEmail}
											</div>
										</td>
										<td className="px-4 py-3">
											<NoteStatusBadge status={item.status} />
											{item.rejectionReason ? (
												<div className="mt-1 text-danger text-xs">
													{item.rejectionReason}
												</div>
											) : null}
										</td>
										<td className="px-4 py-3 text-muted">
											<div>赞 {item.likedCount}</div>
											<div>藏 {item.collectedCount}</div>
											<div>评 {item.commentCount}</div>
										</td>
										<td className="px-4 py-3">
											<div className="flex flex-wrap gap-1">
												<Button
													isIconOnly
													size="sm"
													variant="outline"
													aria-label="通过"
													onPress={() =>
														statusMutation.mutate({
															id: item.id,
															status: "published",
														})
													}
												>
													<Check data-icon="inline-start" />
												</Button>
												<Button
													isIconOnly
													size="sm"
													variant="outline"
													aria-label="拒绝"
													onPress={() =>
														statusMutation.mutate({
															id: item.id,
															status: "rejected",
															rejectionReason: "内容未通过审核",
														})
													}
												>
													<X data-icon="inline-start" />
												</Button>
												<Button
													isIconOnly
													size="sm"
													variant="outline"
													aria-label="隐藏"
													onPress={() =>
														statusMutation.mutate({
															id: item.id,
															status: "hidden",
														})
													}
												>
													<EyeOff data-icon="inline-start" />
												</Button>
												<Button
													isIconOnly
													size="sm"
													variant="danger"
													aria-label="删除"
													onPress={() => {
														if (window.confirm("确认删除这篇图文？")) {
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
								{!notes.isLoading && notes.data?.length === 0 ? (
									<tr>
										<td className="py-8 text-center text-muted" colSpan={6}>
											暂无图文
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
