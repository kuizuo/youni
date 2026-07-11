import type { ComponentType } from "react";

export type AdminMetric = {
	readonly icon: ComponentType<{ className?: string }>;
	readonly label: string;
	readonly status: "danger" | "success" | "warning";
	readonly value: number;
};

const statusClassName: Record<AdminMetric["status"], string> = {
	danger: "bg-danger/10 text-danger",
	success: "bg-success/10 text-success",
	warning: "bg-warning/10 text-warning",
};

const numberFormatter = new Intl.NumberFormat("zh-CN", {
	maximumFractionDigits: 0,
});

export function AdminMetricGroup({
	metrics,
}: {
	readonly metrics: readonly AdminMetric[];
}) {
	return (
		<dl className="grid min-h-28 grid-cols-4 overflow-hidden rounded-2xl bg-surface shadow-surface">
			{metrics.map((metric) => {
				const Icon = metric.icon;

				return (
					<div
						className="relative flex min-w-0 flex-col p-4 before:absolute before:inset-y-4 before:left-0 before:w-px before:bg-separator first:before:hidden"
						key={metric.label}
					>
						<div className="mb-1 flex min-w-0 items-center gap-2">
							<span
								className={`flex size-8 shrink-0 items-center justify-center rounded-xl ${statusClassName[metric.status]}`}
							>
								<Icon className="size-4" />
							</span>
							<dt className="truncate font-medium text-muted text-sm">
								{metric.label}
							</dt>
						</div>
						<dd className="mt-auto font-semibold text-2xl text-foreground tracking-tight">
							{numberFormatter.format(metric.value)}
						</dd>
					</div>
				);
			})}
		</dl>
	);
}
