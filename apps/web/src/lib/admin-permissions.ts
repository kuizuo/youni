import {
	type AdminPermissionRequest,
	type AdminUserRole,
	parseAdminUserRole,
} from "@youni/auth/permissions";

import { authClient } from "@/lib/auth-client";

export function checkAdminRolePermission(
	role: string | null | undefined,
	permissions: AdminPermissionRequest,
) {
	const parsedRole = parseAdminUserRole(role);
	if (!parsedRole) return false;

	const checkRolePermission = authClient.admin
		.checkRolePermission as unknown as (input: {
		permissions: AdminPermissionRequest;
		role: AdminUserRole;
	}) => boolean;

	return checkRolePermission({
		permissions,
		role: parsedRole,
	});
}

export function getUserManagementPermissions(role: AdminUserRole | undefined) {
	return {
		canBan: checkAdminRolePermission(role, { user: ["ban"] }),
		canCreate: checkAdminRolePermission(role, { user: ["create"] }),
		canDelete: checkAdminRolePermission(role, { user: ["delete"] }),
		canRestore: checkAdminRolePermission(role, { user: ["restore"] }),
		canUpdate: checkAdminRolePermission(role, { user: ["update"] }),
	};
}
