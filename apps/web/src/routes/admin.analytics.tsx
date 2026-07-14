import {
	ChartColumn,
	Comment,
	Eye,
	Heart,
	Magnifier,
	TriangleExclamation,
} from "@gravity-ui/icons";
import { Button, Card, Input, Label, Skeleton, TextField } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from "recharts";

import { AdminMetricGroup } from "@/components/admin-metric-group";
import { AdminPage } from "@/components/admin-shell";
import { orpc } from "@/utils/orpc";

const presets = [7, 30, 90] as const;

function shanghaiToday() {
	return new Intl.DateTimeFormat("en-CA", {
		day: "2-digit",
		month: "2-digit",
		timeZone: "Asia/Shanghai",
		year: "numeric",
	}).format(new Date());
}

function shiftDay(day: string, offset: number) {
	const date = new Date(`${day}T00:00:00Z`);
	date.setUTCDate(date.getUTCDate() + offset);
	return date.toISOString().slice(0, 10);
}

function percent(part: number, total: number) {
	if (total <= 0) return 0;
	return Math.round((part / total) * 1000) / 10;
}

function compactNumber(value: number) {
	return new Intl.NumberFormat("zh-CN", { notation: "compact" }).format(value);
}

function growthLabel(current: number, previous: number) {
	if (previous === 0) return current === 0 ? "—" : "新增";
	const change = Math.round(((current - previous) / previous) * 100);
	return `${change >= 0 ? "+" : ""}${change}%`;
}

export const Route = createFileRoute("/admin/analytics")({
	component: AdminAnalyticsRoute,
});

function AdminAnalyticsRoute() {
	const today = shanghaiToday();
	const [range, setRange] = useState({ from: shiftDay(today, -6), to: today });
	const [draftRange, setDraftRange] = useState(range);
	const analytics = useQuery({
		...orpc.admin.analytics.queryOptions({ input: range }),
		refetchInterval: 2_000,
		refetchOnReconnect: "always",
		refetchOnWindowFocus: "always",
	});
	const admin = useQuery(orpc.admin.me.queryOptions());
	const keywordMutation = useMutation(
		orpc.admin.setSearchKeywordExcluded.mutationOptions(),
	);
	const data = analytics.data;
	const impressions = data?.discovery.totals.impressionCount ?? 0;
	const searchTotal = data?.search.summary.totalCount ?? 0;
	const presetDays = useMemo(() => {
		const days =
			Math.round(
				(new Date(`${range.to}T00:00:00Z`).getTime() -
					new Date(`${range.from}T00:00:00Z`).getTime()) /
					86_400_000,
			) + 1;
		return presets.includes(days as (typeof presets)[number]) ? days : null;
	}, [range]);
	const metrics = [
		{
			icon: Eye,
			label: "发现页展示",
			status: "success" as const,
			value: impressions,
		},
		{
			icon: ChartColumn,
			label: "打开率",
			status: "success" as const,
			value: `${percent(data?.discovery.totals.openCount ?? 0, impressions)}%`,
		},
		{
			icon: Heart,
			label: "点赞收藏率",
			status: "success" as const,
			value: `${percent(
				(data?.discovery.totals.likeCount ?? 0) +
					(data?.discovery.totals.collectCount ?? 0),
				impressions,
			)}%`,
		},
		{
			icon: TriangleExclamation,
			label: "不感兴趣率",
			status: "warning" as const,
			value: `${percent(
				data?.discovery.totals.notInterestedCount ?? 0,
				impressions,
			)}%`,
		},
		{
			icon: Magnifier,
			label: "搜索总量",
			status: "success" as const,
			value: searchTotal,
		},
		{
			icon: Comment,
			label: "无结果搜索",
			status: "danger" as const,
			value: searchTotal - (data?.search.summary.successfulCount ?? 0),
		},
	] as const;
	const sourceData = data
		? [
				{ name: "主动输入", value: data.search.summary.typedCount },
				{ name: "历史记录", value: data.search.summary.historyCount },
				{ name: "推荐词", value: data.search.summary.recommendedCount },
				{ name: "外部跳转", value: data.search.summary.externalCount },
			]
		: [];
	const discoverySeries = (data?.discovery.series ?? []).map((item) => ({
		...item,
		likeCollectCount: item.likeCount + item.collectCount,
	}));

	const applyPreset = (days: (typeof presets)[number]) => {
		const next = { from: shiftDay(today, -(days - 1)), to: today };
		setDraftRange(next);
		setRange(next);
	};

	const applyCustomRange = () => {
		if (!draftRange.from || !draftRange.to || draftRange.from > draftRange.to) {
			return;
		}
		const earliest = shiftDay(today, -89);
		setRange({
			from: draftRange.from < earliest ? earliest : draftRange.from,
			to: draftRange.to > today ? today : draftRange.to,
		});
	};

	const toggleKeyword = async (keyword: string, excluded: boolean) => {
		await keywordMutation.mutateAsync({ excluded, keyword });
		await analytics.refetch();
	};

	return (
		<AdminPage
			description="这里仅展示汇总结果，不保存谁搜索过什么。数据最多保留 90 天。"
			title="推荐与搜索"
		>
			<Card>
				<Card.Content className="flex flex-col gap-3 p-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="flex flex-wrap gap-2">
						{presets.map((days) => (
							<Button
								key={days}
								size="sm"
								variant={presetDays === days ? "primary" : "secondary"}
								onPress={() => applyPreset(days)}
							>
								最近 {days} 天
							</Button>
						))}
					</div>
					<div className="flex flex-wrap items-end gap-2">
						<DateInput
							label="开始日期"
							max={today}
							min={shiftDay(today, -89)}
							value={draftRange.from}
							onChange={(from) =>
								setDraftRange((current) => ({ ...current, from }))
							}
						/>
						<DateInput
							label="结束日期"
							max={today}
							min={shiftDay(today, -89)}
							value={draftRange.to}
							onChange={(to) =>
								setDraftRange((current) => ({ ...current, to }))
							}
						/>
						<Button size="sm" variant="secondary" onPress={applyCustomRange}>
							应用
						</Button>
					</div>
				</Card.Content>
			</Card>

			{analytics.isLoading ? (
				<div className="grid gap-4">
					<Skeleton className="h-28 rounded-2xl" />
					<div className="grid gap-4 lg:grid-cols-2">
						<Skeleton className="h-80 rounded-2xl" />
						<Skeleton className="h-80 rounded-2xl" />
					</div>
				</div>
			) : analytics.isError ? (
				<Card>
					<Card.Content className="p-6 text-danger text-sm">
						暂时无法加载汇总，请稍后重试。
					</Card.Content>
				</Card>
			) : (
				<>
					<AdminMetricGroup metrics={metrics} />
					<div className="grid gap-4 xl:grid-cols-2">
						<ChartCard title="发现页每日变化">
							<ResponsiveContainer height="100%" width="100%">
								<AreaChart data={discoverySeries}>
									<CartesianGrid strokeDasharray="3 3" vertical={false} />
									<XAxis
										dataKey="day"
										minTickGap={24}
										tickFormatter={(day) => day.slice(5)}
									/>
									<YAxis tickFormatter={compactNumber} width={42} />
									<Tooltip />
									<Legend />
									<Area
										dataKey="impressionCount"
										fill="var(--color-accent)"
										fillOpacity={0.14}
										name="展示"
										stroke="var(--color-accent)"
									/>
									<Area
										dataKey="openCount"
										fill="var(--color-success)"
										fillOpacity={0.08}
										name="打开"
										stroke="var(--color-success)"
									/>
									<Area
										dataKey="likeCollectCount"
										fill="var(--color-warning)"
										fillOpacity={0.08}
										name="点赞收藏"
										stroke="var(--color-warning)"
									/>
									<Area
										dataKey="notInterestedCount"
										fill="var(--color-danger)"
										fillOpacity={0.05}
										name="不感兴趣"
										stroke="var(--color-danger)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</ChartCard>

						<ChartCard title="搜索每日变化">
							<ResponsiveContainer height="100%" width="100%">
								<AreaChart data={data?.search.series ?? []}>
									<CartesianGrid strokeDasharray="3 3" vertical={false} />
									<XAxis
										dataKey="day"
										minTickGap={24}
										tickFormatter={(day) => day.slice(5)}
									/>
									<YAxis tickFormatter={compactNumber} width={42} />
									<Tooltip />
									<Legend />
									<Area
										dataKey="totalCount"
										fill="var(--color-accent)"
										fillOpacity={0.14}
										name="搜索"
										stroke="var(--color-accent)"
									/>
									<Area
										dataKey="successfulCount"
										fill="var(--color-success)"
										fillOpacity={0.08}
										name="有结果"
										stroke="var(--color-success)"
									/>
								</AreaChart>
							</ResponsiveContainer>
						</ChartCard>
					</div>

					<div className="grid gap-4 xl:grid-cols-[360px_1fr]">
						<ChartCard title="搜索入口占比">
							<ResponsiveContainer height="100%" width="100%">
								<BarChart data={sourceData} layout="vertical">
									<CartesianGrid horizontal={false} strokeDasharray="3 3" />
									<XAxis type="number" tickFormatter={compactNumber} />
									<YAxis dataKey="name" type="category" width={72} />
									<Tooltip />
									<Bar
										dataKey="value"
										fill="var(--color-accent)"
										name="搜索次数"
										radius={[0, 6, 6, 0]}
									/>
								</BarChart>
							</ResponsiveContainer>
						</ChartCard>

						<Card>
							<Card.Header>
								<Card.Title>关键词排行</Card.Title>
								<Card.Description>
									展示次数、前一时段变化及无结果情况。
								</Card.Description>
							</Card.Header>
							<Card.Content className="overflow-x-auto p-0">
								<table className="w-full min-w-[720px] text-left text-sm">
									<thead className="border-separator border-b text-muted">
										<tr>
											<th className="px-4 py-3 font-medium">关键词</th>
											<th className="px-4 py-3 font-medium">搜索</th>
											<th className="px-4 py-3 font-medium">变化</th>
											<th className="px-4 py-3 font-medium">无结果</th>
											<th className="px-4 py-3 font-medium">状态</th>
										</tr>
									</thead>
									<tbody>
										{data?.search.keywords.map((item) => (
											<tr
												className="border-separator border-b last:border-0"
												key={item.keyword}
											>
												<td className="px-4 py-3 font-medium">
													{item.displayKeyword}
												</td>
												<td className="px-4 py-3 tabular-nums">
													{item.totalCount}
												</td>
												<td className="px-4 py-3 tabular-nums">
													{growthLabel(item.totalCount, item.previousCount)}
												</td>
												<td className="px-4 py-3 tabular-nums">
													{item.totalCount - item.successfulCount}
												</td>
												<td className="px-4 py-3">
													{admin.data?.role === "admin" ? (
														<Button
															isPending={
																keywordMutation.isPending &&
																keywordMutation.variables?.keyword ===
																	item.keyword
															}
															size="sm"
															variant={item.excluded ? "secondary" : "tertiary"}
															onPress={() =>
																void toggleKeyword(item.keyword, !item.excluded)
															}
														>
															{item.excluded ? "恢复推荐" : "停止推荐"}
														</Button>
													) : item.excluded ? (
														"已停止推荐"
													) : (
														"正常"
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
								{data?.search.keywords.length === 0 ? (
									<p className="p-6 text-center text-muted text-sm">
										这个时段还没有搜索汇总。
									</p>
								) : null}
							</Card.Content>
						</Card>
					</div>
				</>
			)}
		</AdminPage>
	);
}

function DateInput({
	label,
	max,
	min,
	onChange,
	value,
}: {
	label: string;
	max: string;
	min: string;
	onChange: (value: string) => void;
	value: string;
}) {
	return (
		<TextField className="w-40" name={label}>
			<Label className="text-xs">{label}</Label>
			<Input
				max={max}
				min={min}
				type="date"
				value={value}
				onChange={(event) => onChange(event.currentTarget.value)}
			/>
		</TextField>
	);
}

function ChartCard({
	children,
	title,
}: {
	children: React.ReactNode;
	title: string;
}) {
	return (
		<Card>
			<Card.Header>
				<Card.Title>{title}</Card.Title>
			</Card.Header>
			<Card.Content className="p-4 pt-0">
				<div className="w-full" style={{ height: 256 }}>
					{children}
				</div>
			</Card.Content>
		</Card>
	);
}
