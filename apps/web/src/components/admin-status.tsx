import { Chip } from "@heroui/react";

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

const colors = {
	audit: "warning",
	published: "success",
	rejected: "danger",
	hidden: "default",
	active: "success",
	disabled: "danger",
} as const;

export function NoteStatusBadge({
	status,
}: {
	status: keyof typeof noteStatusLabel;
}) {
	return (
		<Chip color={colors[status]} size="sm" variant="soft">
			{noteStatusLabel[status]}
		</Chip>
	);
}

export function UserStatusBadge({
	status,
}: {
	status: keyof typeof userStatusLabel;
}) {
	return (
		<Chip color={colors[status]} size="sm" variant="soft">
			{userStatusLabel[status]}
		</Chip>
	);
}

export { noteStatusLabel, userStatusLabel };
