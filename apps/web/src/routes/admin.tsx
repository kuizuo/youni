import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@youni/ui/components/card";
import { Skeleton } from "@youni/ui/components/skeleton";

import { AdminShell } from "@/components/admin-shell";
import { NoteStatusBadge } from "@/components/admin-status";
import { authClient } from "@/lib/auth-client";
import { orpc } from "@/utils/orpc";

const overviewSkeletonKeys = ["notes", "audit", "users", "interactions"];

export const Route = createFileRoute("/admin")({
	component: AdminDashboardRoute,
});

function AdminDashboardRoute() {
	const session = authClient.useSession();
	const overview = useQuery({
		...orpc.admin.overview.queryOptions(),
		enabled: !!session.data?.user,
	});

	return (
		<AdminShell title="后台概览" description="查看内容、用户和待处理事项。">
			{overview.isLoading ? (
				<div className="grid gap-4 md:grid-cols-4">
					{overviewSkeletonKeys.map((key) => (
						<Skeleton key={key} className="h-28" />
					))}
				</div>
			) : (
				<>
					<div className="grid gap-4 md:grid-cols-4">
						<MetricCard label="图文" value={overview.data?.noteCount ?? 0} />
						<MetricCard label="待审核" value={overview.data?.auditCount ?? 0} />
						<MetricCard label="用户" value={overview.data?.userCount ?? 0} />
						<MetricCard
							label="互动"
							value={overview.data?.interactionCount ?? 0}
						/>
					</div>
					<Card>
						<CardHeader>
							<CardTitle>最近图文</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="overflow-x-auto">
								<table className="w-full min-w-[620px] text-left text-sm">
									<thead className="border-b text-muted-foreground text-xs">
										<tr>
											<th className="py-2 pr-3 font-medium">标题</th>
											<th className="py-2 pr-3 font-medium">作者</th>
											<th className="py-2 pr-3 font-medium">状态</th>
											<th className="py-2 pr-3 font-medium">创建时间</th>
										</tr>
									</thead>
									<tbody>
										{overview.data?.recentNotes.map((item) => (
											<tr key={item.id} className="border-b last:border-b-0">
												<td className="max-w-[260px] truncate py-3 pr-3">
													{item.title}
												</td>
												<td className="py-3 pr-3">{item.authorName}</td>
												<td className="py-3 pr-3">
													<NoteStatusBadge status={item.status} />
												</td>
												<td className="py-3 pr-3 text-muted-foreground">
													{new Date(item.createdAt).toLocaleString()}
												</td>
											</tr>
										))}
										{overview.data?.recentNotes.length === 0 ? (
											<tr>
												<td
													className="py-8 text-center text-muted-foreground"
													colSpan={4}
												>
													暂无图文
												</td>
											</tr>
										) : null}
									</tbody>
								</table>
							</div>
						</CardContent>
					</Card>
				</>
			)}
		</AdminShell>
	);
}

function MetricCard({ label, value }: { label: string; value: number }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{label}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="font-semibold text-3xl tabular-nums">{value}</div>
			</CardContent>
		</Card>
	);
}
