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

export const roleOptions = adminUserRoleOptions;
export const statusOptions = adminUserStatusOptions;
export const genderOptions = ["unknown", "male", "female"] as const;
export const accountTypeOptions = ["registered", "anonymous"] as const;

export type UserRole = AdminUserRole;
export type UserStatus = AdminUserStatus;
export type Gender = (typeof genderOptions)[number];
export type UserAccountType = (typeof accountTypeOptions)[number];
export type UserFormMode = "create" | "edit";

export type UserFormState = {
	id: string | null;
	name: string;
	email: string;
	password: string;
	role: UserRole;
	status: UserStatus;
	image: string;
	handle: string;
	bio: string;
	gender: Gender;
};

export type AdminUserListItem = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	handle?: string | null;
	role: string;
	status: string;
	bio?: string | null;
	gender?: string | null;
	isAnonymous: boolean;
	noteCount: number;
	followerCount: number;
	followingCount: number;
	createdAt: Date | string;
	updatedAt?: Date | string;
};

export type AdminUserRelationItem = {
	userId: string;
	name: string;
	email: string;
	image?: string | null;
	createdAt: Date | string;
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

export const genderLabel: Record<Gender, string> = {
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
	currentRole: UserRole | undefined,
	itemRole: string,
) {
	return canManageUserRole(currentRole, itemRole);
}

export function getAvailableRoleOptions(currentRole: UserRole | undefined) {
	return getAssignableUserRoles(currentRole);
}

export function getAvailableStatusOptions(isEdit: boolean) {
	return isEdit ? statusOptions : getCreatableUserStatuses();
}

export function toUserRole(value: string): UserRole {
	return parseAdminUserRole(value) ?? "user";
}

export function toUserStatus(value: string): UserStatus {
	return parseAdminUserStatus(value) ?? "active";
}

export function toGender(value: string | null | undefined): Gender {
	return genderOptions.includes(value as Gender)
		? (value as Gender)
		: "unknown";
}

export function getErrorMessage(error: unknown) {
	if (error instanceof Error && error.message) return error.message;
	return "操作失败，请稍后重试";
}
