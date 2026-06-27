import { Chip } from "@heroui/react";

const noteStatusLabel = {
	draft: "草稿",
	audit: "待审核",
	published: "已发布",
	rejected: "已拒绝",
	hidden: "已隐藏",
} as const;

const userStatusLabel = {
	active: "正常",
	disabled: "禁用",
	deleted: "已删除",
} as const;

const userRoleLabel = {
	admin: "管理员",
	operator: "运营",
	user: "用户",
} as const;

const colors = {
	draft: "default",
	audit: "warning",
	published: "success",
	rejected: "danger",
	hidden: "default",
	active: "success",
	disabled: "danger",
	deleted: "default",
	admin: "accent",
	operator: "warning",
	user: "default",
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

export function UserRoleBadge({ role }: { role: keyof typeof userRoleLabel }) {
	return (
		<Chip color={colors[role]} size="sm" variant="soft">
			{userRoleLabel[role]}
		</Chip>
	);
}

export { noteStatusLabel, userRoleLabel, userStatusLabel };
