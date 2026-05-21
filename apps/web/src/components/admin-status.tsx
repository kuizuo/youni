import { cn } from "@youni/ui/lib/utils";

const noteStatusLabel = {
	audit: "待审核",
	published: "已发布",
	rejected: "已拒绝",
	hidden: "已隐藏",
} as const;

const userStatusLabel = {
	active: "正常",
	disabled: "禁用",
} as const;

const styles = {
	audit: "border-chart-1/40 bg-chart-1/10 text-foreground",
	published: "border-primary/30 bg-primary/10 text-foreground",
	rejected: "border-destructive/30 bg-destructive/10 text-destructive",
	hidden: "border-muted-foreground/30 bg-muted text-muted-foreground",
	active: "border-primary/30 bg-primary/10 text-foreground",
	disabled: "border-destructive/30 bg-destructive/10 text-destructive",
} as const;

export function NoteStatusBadge({
	status,
}: {
	status: keyof typeof noteStatusLabel;
}) {
	return (
		<span
			className={cn("inline-flex border px-2 py-0.5 text-xs", styles[status])}
		>
			{noteStatusLabel[status]}
		</span>
	);
}

export function UserStatusBadge({
	status,
}: {
	status: keyof typeof userStatusLabel;
}) {
	return (
		<span
			className={cn("inline-flex border px-2 py-0.5 text-xs", styles[status])}
		>
			{userStatusLabel[status]}
		</span>
	);
}

export { noteStatusLabel, userStatusLabel };
