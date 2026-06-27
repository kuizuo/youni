export const roleOptions = ["admin", "operator", "user"] as const;
export const manageableRoleOptions = ["user"] as const;
export const statusOptions = ["active", "disabled", "deleted"] as const;
export const manageableStatusOptions = ["active", "disabled"] as const;
export const genderOptions = ["unknown", "male", "female"] as const;

export type UserRole = (typeof roleOptions)[number];
export type UserStatus = (typeof statusOptions)[number];
export type Gender = (typeof genderOptions)[number];
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
	noteCount: number;
	followerCount: number;
	followingCount: number;
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

export const userFormId = "admin-user-form";

export function canManageItem(
	currentRole: UserRole | undefined,
	itemRole: string,
) {
	if (currentRole === "admin") return true;
	return currentRole === "operator" && itemRole === "user";
}

export function toUserRole(value: string): UserRole {
	return roleOptions.includes(value as UserRole) ? (value as UserRole) : "user";
}

export function toUserStatus(value: string): UserStatus {
	return statusOptions.includes(value as UserStatus)
		? (value as UserStatus)
		: "active";
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
