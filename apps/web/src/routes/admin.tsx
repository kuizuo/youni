import { Card, Skeleton } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import {
	createFileRoute,
	Outlet,
	useRouterState,
} from "@tanstack/react-router";
import {
	FileCheck2,
	Heart,
	ImageIcon,
	MessageCircle,
	Users,
} from "lucide-react";

import { AdminShell } from "@/components/admin-shell";
import { NoteStatusBadge } from "@/components/admin-status";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const overviewSkeletonKeys = ["notes", "audit", "users", "interactions"];

export const Route = createFileRoute("/admin")({
	component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
	const pathname = useRouterState({
		select: (state) => state.location.pathname,
	});
	const session = authClient.useSession();
	const overview = useQuery({
		...orpc.admin.overview.queryOptions(),
		enabled: pathname === "/admin" && !!session.data?.user,
	});
	if (pathname !== "/admin") {
		return <Outlet />;
	}

	return (
		<AdminShell title="后台概览" description="查看内容、用户和待处理事项。">
			{overview.isLoading ? (
				<div className="grid gap-4 md:grid-cols-4">
					{overviewSkeletonKeys.map((key) => (
						<Skeleton key={key} className="h-28 rounded-2xl" />
					))}
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-4">
						<MetricCard
							icon={ImageIcon}
							label="图文总量"
							value={overview.data?.noteCount ?? 0}
							description="社区内容沉淀"
						/>
						<MetricCard
							icon={FileCheck2}
							label="待审核"
							value={overview.data?.auditCount ?? 0}
							description="需要运营处理"
							tone="warning"
						/>
						<MetricCard
							icon={Users}
							label="用户"
							value={overview.data?.userCount ?? 0}
							description="已注册成员"
						/>
						<MetricCard
							icon={Heart}
							label="互动"
							value={overview.data?.interactionCount ?? 0}
							description="点赞与评论"
							tone="rose"
						/>
					</div>
					<div className="grid gap-4 xl:grid-cols-[1fr_320px]">
						<Card>
							<Card.Header className="border-separator border-b bg-surface-secondary">
								<Card.Title>最近图文</Card.Title>
								<Card.Description>
									按创建时间排序，快速进入审核判断。
								</Card.Description>
							</Card.Header>
							<Card.Content className="p-0">
								<div className="overflow-x-auto">
									<table className="w-full min-w-[680px] text-left text-sm">
										<thead className="border-separator border-b bg-background/60 text-muted text-xs">
											<tr>
												<th className="px-4 py-3 font-medium">标题</th>
												<th className="px-4 py-3 font-medium">作者</th>
												<th className="px-4 py-3 font-medium">状态</th>
												<th className="px-4 py-3 font-medium">创建时间</th>
											</tr>
										</thead>
										<tbody>
											{overview.data?.recentNotes.map((item) => (
												<tr
													key={item.id}
													className="border-separator border-b bg-surface transition last:border-b-0 hover:bg-surface-secondary"
												>
													<td className="max-w-[280px] truncate px-4 py-3 font-medium">
														{item.title}
													</td>
													<td className="px-4 py-3">{item.authorName}</td>
													<td className="px-4 py-3">
														<NoteStatusBadge status={item.status} />
													</td>
													<td className="px-4 py-3 text-muted">
														{new Date(item.createdAt).toLocaleString()}
													</td>
												</tr>
											))}
											{overview.data?.recentNotes.length === 0 ? (
												<tr>
													<td
														className="py-10 text-center text-muted"
														colSpan={4}
													>
														暂无图文
													</td>
												</tr>
											) : null}
										</tbody>
									</table>
								</div>
							</Card.Content>
						</Card>
						<Card>
							<Card.Header className="border-separator border-b bg-surface-secondary">
								<Card.Title>运营提示</Card.Title>
								<Card.Description>保持内容流动和审核节奏。</Card.Description>
							</Card.Header>
							<Card.Content className="grid gap-3">
								<div className="rounded-2xl border border-border bg-background p-3">
									<div className="flex items-center gap-2 font-medium">
										<FileCheck2 className="size-4 text-accent" />
										审核队列
									</div>
									<p className="mt-1 text-muted text-xs">
										{overview.data?.auditCount
											? `还有 ${overview.data.auditCount} 篇图文等待处理。`
											: "当前没有待审核图文。"}
									</p>
								</div>
								<div className="rounded-2xl border border-border bg-background p-3">
									<div className="flex items-center gap-2 font-medium">
										<MessageCircle className="size-4 text-accent" />
										互动反馈
									</div>
									<p className="mt-1 text-muted text-xs">
										用点赞、评论和收藏判断内容质量，优先观察高互动图文。
									</p>
								</div>
							</Card.Content>
						</Card>
					</div>
				</>
			)}
		</AdminShell>
	);
}

function MetricCard({
	icon: Icon,
	label,
	value,
	description,
	tone = "blue",
}: {
	icon: typeof ImageIcon;
	label: string;
	value: number;
	description: string;
	tone?: "blue" | "warning" | "rose";
}) {
	const toneClass =
		tone === "warning"
			? "bg-warning-soft text-warning-soft-foreground ring-warning/20"
			: tone === "rose"
				? "bg-danger-soft text-danger-soft-foreground ring-danger/20"
				: "bg-accent-soft text-accent-soft-foreground ring-accent/20";

	return (
		<Card>
			<Card.Header className="flex-row items-start justify-between">
				<div>
					<Card.Title>{label}</Card.Title>
					<Card.Description>{description}</Card.Description>
				</div>
				<div className={`rounded-xl p-2 ring-1 ${toneClass}`}>
					<Icon className="size-4" />
				</div>
			</Card.Header>
			<Card.Content>
				<div className="font-semibold text-3xl tabular-nums">{value}</div>
			</Card.Content>
		</Card>
	);
}
