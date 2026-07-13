import {
	type AdminUserRole,
	type AdminUserStatus,
	adminUserRoleOptions,
	adminUserStatusOptions,
	canManageUserRole,
	getAssignableUserRoles,
	getCreatableUserStatuses,
	parseAdminUserRole,
	parseAdminUserStatus,
} from "@youni/api/admin-user-governance";
import { type UserGender, userGenders } from "@youni/api/contracts/shared";

export const roleOptions = adminUserRoleOptions;
export const statusOptions = adminUserStatusOptions;
export const genderOptions = userGenders;
export const accountTypeOptions = ["registered", "anonymous"] as const;

export type UserAccountType = (typeof accountTypeOptions)[number];
export type UserFormMode = "create" | "edit";

export type UserFormState = {
	id: string | null;
	name: string;
	email: string;
	password: string;
	role: AdminUserRole;
	status: AdminUserStatus;
	image: string;
	handle: string;
	bio: string;
	gender: UserGender;
};

export const emptyForm: UserFormState = {
	id: null,
	name: "",
	email: "",
	password: "",
	role: "user",
	status: "active",
	image: "",
	handle: "",
	bio: "",
	gender: "unknown",
};

export const genderLabel: Record<UserGender, string> = {
	unknown: "未知",
	male: "男",
	female: "女",
};

export const accountTypeLabel: Record<UserAccountType, string> = {
	registered: "正式用户",
	anonymous: "匿名用户",
};

export const userFormId = "admin-user-form";

export function canManageItem(
	currentRole: AdminUserRole | undefined,
	itemRole: string,
) {
	return canManageUserRole(currentRole, itemRole);
}

export function getAvailableRoleOptions(
	currentRole: AdminUserRole | undefined,
) {
	return getAssignableUserRoles(currentRole);
}

export function getAvailableStatusOptions(isEdit: boolean) {
	return isEdit ? statusOptions : getCreatableUserStatuses();
}

export function toUserRole(value: string): AdminUserRole {
	return parseAdminUserRole(value) ?? "user";
}

export function toUserStatus(value: string): AdminUserStatus {
	return parseAdminUserStatus(value) ?? "active";
}

export function toGender(value: string | null | undefined): UserGender {
	return genderOptions.includes(value as UserGender)
		? (value as UserGender)
		: "unknown";
}

export function getErrorMessage(error: unknown) {
	if (error instanceof Error && error.message) return error.message;
	return "操作失败，请稍后重试";
}
