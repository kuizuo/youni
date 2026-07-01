import {
	type AdminUserRole,
	adminUserRoleOptions,
	backofficeUserRoleOptions,
	hasAdminPermission,
	parseAdminUserRole,
} from "@youni/auth/permissions";

export type { AdminUserRole };
export { adminUserRoleOptions, backofficeUserRoleOptions, parseAdminUserRole };

export const adminUserStatusOptions = [
	"active",
	"disabled",
	"deleted",
] as const;
export const manageableUserStatusOptions = ["active", "disabled"] as const;

export type AdminUserStatus = (typeof adminUserStatusOptions)[number];

export type AdminUserRuleResult =
	| { allowed: true }
	| { allowed: false; message?: string };

export type AdminUserRuleTarget = {
	id: string;
	role: string | null;
	status: string | null;
};

function includesOption<T extends string>(
	options: readonly T[],
	value?: string | null,
): value is T {
	return typeof value === "string" && options.includes(value as T);
}

export function parseAdminUserStatus(
	value?: string | null,
): AdminUserStatus | null {
	return includesOption(adminUserStatusOptions, value) ? value : null;
}

export function isBackofficeUserRole(role: AdminUserRole) {
	return includesOption(backofficeUserRoleOptions, role);
}

export function getAssignableUserRoles(
	actorRole: AdminUserRole | undefined,
): readonly AdminUserRole[] {
	return actorRole === "admin" ? adminUserRoleOptions : ["user"];
}

export function getCreatableUserStatuses() {
	return manageableUserStatusOptions;
}

export function getEditableUserStatuses() {
	return adminUserStatusOptions;
}

export function canManageUserRole(
	actorRole: AdminUserRole | undefined,
	targetRole?: string | null,
) {
	return (
		hasAdminPermission(actorRole, { user: ["update"] }) &&
		(actorRole === "admin" || targetRole === "user")
	);
}

export function checkCreateUserPermission({
	actorRole,
}: {
	actorRole: AdminUserRole;
	role: AdminUserRole;
}): AdminUserRuleResult {
	if (hasAdminPermission(actorRole, { user: ["create"] })) {
		return { allowed: true };
	}

	return { allowed: false, message: "没有创建用户权限" };
}

export function checkManageUserPermission({
	actorRole,
	desiredRole,
	target,
}: {
	actorRole: AdminUserRole;
	desiredRole: AdminUserRole;
	target: AdminUserRuleTarget;
}): AdminUserRuleResult {
	const targetRole = parseAdminUserRole(target.role);
	const targetStatus = parseAdminUserStatus(target.status);

	if (!targetRole || !targetStatus) {
		return { allowed: false };
	}

	if (
		hasAdminPermission(actorRole, { user: ["update"] }) &&
		(actorRole === "admin" || (targetRole === "user" && desiredRole === "user"))
	) {
		return { allowed: true };
	}

	return { allowed: false, message: "没有修改用户权限" };
}

export function checkSelfUserManagement({
	actorId,
	desiredRole,
	desiredStatus,
	target,
}: {
	actorId: string;
	desiredRole: AdminUserRole;
	desiredStatus?: AdminUserStatus;
	target: AdminUserRuleTarget;
}): AdminUserRuleResult {
	if (actorId !== target.id) return { allowed: true };

	if (desiredRole !== target.role || desiredStatus !== target.status) {
		return {
			allowed: false,
			message: "不能修改自己的角色或状态",
		};
	}

	return { allowed: true };
}
