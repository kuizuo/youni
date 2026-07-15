import {
	ChartColumn,
	Check,
	Comment,
	Eye,
	FileText,
	Heart,
	Persons,
	ShieldCheck,
} from "@gravity-ui/icons";
import { Card, Skeleton } from "@heroui/react";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

import {
	AdminDataGrid,
	type AdminDataGridColumn,
} from "@/components/admin-data-grid";
import { AdminMetricGroup } from "@/components/admin-metric-group";
import { AdminPage, useAdminOverview } from "@/components/admin-shell";
import { NoteStatusBadge } from "@/components/admin-status";

const overviewSkeletonKeys = [
	"notes",
	"audit",
	"users",
	"registered-users",
	"anonymous-users",
	"interactions",
];

export const Route = createFileRoute("/admin/")({
	component: AdminOverviewRoute,
});

function AdminOverviewRoute() {
	const overview = useAdminOverview();
	type RecentNote = NonNullable<typeof overview.data>["recentNotes"][number];

	const recentNoteColumns = useMemo<AdminDataGridColumn<RecentNote>[]>(
		() => [
			{
				accessorKey: "title",
				header: "标题",
				id: "title",
				isRowHeader: true,
				minWidth: 260,
				cell: (item) => (
					<span className="line-clamp-1 font-medium">{item.title}</span>
				),
			},
			{
				accessorKey: "authorName",
				header: "作者",
				id: "authorName",
				minWidth: 160,
			},
			{
				accessorKey: "status",
				cellClassName: "whitespace-nowrap",
				header: "状态",
				headerClassName: "whitespace-nowrap",
				id: "status",
				minWidth: 120,
				cell: (item) => <NoteStatusBadge status={item.status} />,
			},
			{
				accessorKey: "createdAt",
				cellClassName: "whitespace-nowrap",
				header: "创建时间",
				headerClassName: "whitespace-nowrap",
				id: "createdAt",
				minWidth: 180,
				cell: (item) => (
					<span className="text-muted tabular-nums">
						{new Date(item.createdAt).toLocaleString()}
					</span>
				),
			},
		],
		[],
	);

	const recentNotes = overview.data?.recentNotes ?? [];
	const metrics = [
		{
			icon: FileText,
			label: "图文总量",
			status: "success",
			value: overview.data?.noteCount ?? 0,
		},
		{
			icon: Check,
			label: "待审核",
			status: "warning",
			value: overview.data?.auditCount ?? 0,
		},
		{
			icon: Persons,
			label: "总用户",
			status: "success",
			value: overview.data?.userCount ?? 0,
		},
		{
			icon: ShieldCheck,
			label: "正式用户",
			status: "success",
			value: overview.data?.registeredUserCount ?? 0,
		},
		{
			icon: Eye,
			label: "匿名访客",
			status: "warning",
			value: overview.data?.anonymousUserCount ?? 0,
		},
		{
			icon: Heart,
			label: "互动",
			status: "danger",
			value: overview.data?.interactionCount ?? 0,
		},
	] as const;

	return (
		<AdminPage title="后台概览">
			{overview.isLoading ? (
				<div className="grid gap-4">
					<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
						{overviewSkeletonKeys.map((key) => (
							<Skeleton key={key} className="h-28 rounded-2xl" />
						))}
					</div>
					<Skeleton className="h-96 rounded-2xl" />
				</div>
			) : (
				<>
					<AdminMetricGroup metrics={metrics} />

					<div className="grid gap-4 xl:grid-cols-[1fr_320px]">
						<Card>
							<Card.Header>
								<Card.Title>最近图文</Card.Title>
							</Card.Header>
							<Card.Content className="p-0">
								<AdminDataGrid
									aria-label="最近图文"
									columns={recentNoteColumns}
									contentClassName="min-w-[720px]"
									data={recentNotes}
									getRowId={(item) => item.id}
									renderEmptyState={() => (
										<span className="text-muted text-sm">暂无图文</span>
									)}
								/>
							</Card.Content>
						</Card>

						<Card>
							<Card.Header>
								<Card.Title>运营提示</Card.Title>
							</Card.Header>
							<Card.Content className="grid content-start gap-6 pt-2">
								<div>
									<div className="flex items-center gap-2 font-medium">
										<ChartColumn className="size-4 text-accent" />
										审核队列
									</div>
									<p className="mt-1 text-muted text-xs">
										{overview.data?.auditCount
											? `还有 ${overview.data.auditCount} 篇图文等待处理。`
											: "当前没有待审核图文。"}
									</p>
								</div>
								<div>
									<div className="flex items-center gap-2 font-medium">
										<Comment className="size-4 text-accent" />
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
		</AdminPage>
	);
}
