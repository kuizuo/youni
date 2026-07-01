import { createAccessControl } from "better-auth/plugins/access";

export const adminUserRoleOptions = ["admin", "operator", "user"] as const;
export const backofficeUserRoleOptions = ["admin", "operator"] as const;

export const adminPermissionStatements = {
	backoffice: ["access"],
	dashboard: ["view"],
	note: ["list", "detail", "audit", "delete"],
	topic: ["list", "detail", "save", "delete"],
	user: [
		"list",
		"get",
		"create",
		"update",
		"set-role",
		"ban",
		"delete",
		"restore",
		"set-password",
	],
	profile: ["view", "update"],
	session: ["list", "revoke", "delete"],
} as const;

export type AdminUserRole = (typeof adminUserRoleOptions)[number];
export type BackofficeUserRole = (typeof backofficeUserRoleOptions)[number];
export type AdminPermissionResource = keyof typeof adminPermissionStatements;
export type AdminPermissionRequest = {
	[K in AdminPermissionResource]?: (typeof adminPermissionStatements)[K][number][];
};

export const adminAccessControl = createAccessControl(
	adminPermissionStatements,
);

const adminPermissionRole = adminAccessControl.newRole({
	backoffice: ["access"],
	dashboard: ["view"],
	note: ["list", "detail", "audit", "delete"],
	topic: ["list", "detail", "save", "delete"],
	user: [
		"list",
		"get",
		"create",
		"update",
		"set-role",
		"ban",
		"delete",
		"restore",
		"set-password",
	],
	profile: ["view", "update"],
	session: ["list", "revoke", "delete"],
});

const operatorPermissionRole = adminAccessControl.newRole({
	backoffice: ["access"],
	dashboard: ["view"],
	note: ["list", "detail", "audit", "delete"],
	topic: ["list", "detail", "save", "delete"],
	user: ["list", "get"],
	profile: ["view", "update"],
});

const userPermissionRole = adminAccessControl.newRole({
	backoffice: [],
	dashboard: [],
	note: [],
	profile: [],
	session: [],
	topic: [],
	user: [],
});

export const adminPermissionRoles = {
	admin: adminPermissionRole,
	operator: operatorPermissionRole,
	user: userPermissionRole,
} as const;

export function parseAdminUserRole(
	value?: string | null,
): AdminUserRole | null {
	if (!value) return null;
	return adminUserRoleOptions.includes(value as AdminUserRole)
		? (value as AdminUserRole)
		: null;
}

export function isBackofficeUserRole(
	role?: string | null,
): role is BackofficeUserRole {
	return backofficeUserRoleOptions.includes(role as BackofficeUserRole);
}

export function hasAdminPermission(
	role: string | null | undefined,
	permissions: AdminPermissionRequest,
) {
	const roleNames = role?.split(",").map((value) => value.trim()) ?? [];

	return roleNames.some((roleName) => {
		const parsedRole = parseAdminUserRole(roleName);
		if (!parsedRole) return false;

		switch (parsedRole) {
			case "admin":
				return adminPermissionRoles.admin.authorize(permissions).success;
			case "operator":
				return adminPermissionRoles.operator.authorize(permissions).success;
			case "user":
				return adminPermissionRoles.user.authorize(permissions).success;
			default:
				return false;
		}
	});
}
