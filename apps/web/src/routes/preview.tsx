import {
	Button,
	Card,
	Chip,
	Input,
	Label,
	Skeleton,
	TextField,
} from "@heroui/react";
import { AreaChart, KPI, Segment } from "@heroui-pro/react";
import { createFileRoute } from "@tanstack/react-router";
import { ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";

export const Route = createFileRoute("/preview")({
	component: PreviewRoute,
});

const chartData = [
	{ label: "Mon", active: 420, posts: 88 },
	{ label: "Tue", active: 510, posts: 112 },
	{ label: "Wed", active: 690, posts: 124 },
	{ label: "Thu", active: 760, posts: 136 },
	{ label: "Fri", active: 830, posts: 168 },
	{ label: "Sat", active: 920, posts: 192 },
	{ label: "Sun", active: 1040, posts: 210 },
];

const kpis = [
	{
		title: "活跃用户",
		value: 12840,
		trend: "12.4%",
		status: "success",
		icon: Users,
	},
	{
		title: "审核通过率",
		value: 94,
		trend: "3.2%",
		status: "success",
		icon: ShieldCheck,
	},
	{
		title: "本周新增内容",
		value: 1268,
		trend: "8.7%",
		status: "warning",
		icon: Sparkles,
	},
] as const;

function PreviewRoute() {
	return (
		<main className="min-h-[calc(100svh-56px)] bg-background">
			<div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-6">
				<section className="grid gap-3">
					<Chip color="accent" variant="soft">
						HeroUI Pro Preview
					</Chip>
					<div className="grid gap-2 md:grid-cols-[1fr_auto] md:items-end">
						<div>
							<h1 className="font-semibold text-3xl text-foreground">
								Web 组件预览
							</h1>
							<p className="mt-2 max-w-2xl text-muted">
								这个页面用于确认 HeroUI 与 HeroUI Pro
								的样式、基础组件、指标卡和图表都能正常渲染。
							</p>
						</div>
						<Segment defaultSelectedKey="web" variant="ghost">
							<Segment.Item id="web">Web</Segment.Item>
							<Segment.Separator />
							<Segment.Item id="native">Native</Segment.Item>
							<Segment.Separator />
							<Segment.Item id="pro">Pro</Segment.Item>
						</Segment>
					</div>
				</section>

				<section className="grid gap-4 md:grid-cols-3">
					{kpis.map((item) => {
						const Icon = item.icon;

						return (
							<KPI key={item.title}>
								<KPI.Header>
									<KPI.Icon status={item.status}>
										<Icon className="size-4" />
									</KPI.Icon>
									<KPI.Title>{item.title}</KPI.Title>
								</KPI.Header>
								<KPI.Content>
									<KPI.Value value={item.value} />
									<KPI.Trend trend="up">{item.trend}</KPI.Trend>
								</KPI.Content>
								<KPI.Chart data={chartData} dataKey="active" />
								<KPI.Footer className="text-muted text-sm">
									与上周相比保持增长
								</KPI.Footer>
							</KPI>
						);
					})}
				</section>

				<section className="grid gap-4 lg:grid-cols-[1.35fr_0.65fr]">
					<Card>
						<Card.Header>
							<Card.Title>趋势图表</Card.Title>
							<Card.Description>
								AreaChart 来自 HeroUI Pro，使用 Pro 图表颜色变量。
							</Card.Description>
						</Card.Header>
						<Card.Content>
							<AreaChart data={chartData} height={280}>
								<AreaChart.Grid vertical={false} />
								<AreaChart.XAxis dataKey="label" />
								<AreaChart.YAxis hide />
								<AreaChart.Tooltip content={<AreaChart.TooltipContent />} />
								<AreaChart.Area
									type="monotone"
									dataKey="active"
									name="活跃用户"
									stroke="var(--chart-3)"
									fill="var(--chart-3)"
									fillOpacity={0.18}
									strokeWidth={2}
								/>
								<AreaChart.Area
									type="monotone"
									dataKey="posts"
									name="新增内容"
									stroke="var(--chart-5)"
									fill="var(--chart-5)"
									fillOpacity={0.12}
									strokeWidth={2}
								/>
							</AreaChart>
						</Card.Content>
					</Card>

					<Card>
						<Card.Header>
							<Card.Title>基础组件</Card.Title>
							<Card.Description>
								Button、Input、Chip、Skeleton 来自 HeroUI。
							</Card.Description>
						</Card.Header>
						<Card.Content className="grid gap-4">
							<TextField className="grid gap-2">
								<Label>项目名称</Label>
								<Input placeholder="Youni Admin" />
							</TextField>
							<div className="flex flex-wrap gap-2">
								<Button>主操作</Button>
								<Button variant="outline">次操作</Button>
								<Button variant="ghost">轻量操作</Button>
							</div>
							<div className="flex flex-wrap gap-2">
								<Chip color="success" variant="soft">
									已启用
								</Chip>
								<Chip color="warning" variant="soft">
									待检查
								</Chip>
								<Chip color="danger" variant="soft">
									需处理
								</Chip>
							</div>
							<div className="grid gap-2">
								<Skeleton className="h-4 w-3/4 rounded-full" />
								<Skeleton className="h-4 w-1/2 rounded-full" />
							</div>
						</Card.Content>
					</Card>
				</section>

				<Card variant="secondary">
					<Card.Content className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<div className="flex items-center gap-2 font-medium">
								<TrendingUp className="size-4 text-accent" />
								样式已接入 Web 项目
							</div>
							<p className="mt-1 text-muted text-sm">
								页面会在构建时验证 HeroUI Pro 包、样式入口和组件导入是否可用。
							</p>
						</div>
						<Button variant="outline">查看状态</Button>
					</Card.Content>
				</Card>
			</div>
		</main>
	);
}
