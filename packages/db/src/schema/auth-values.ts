export const userRoles = ["admin", "operator", "user"] as const;
export const userStatuses = ["active", "disabled", "deleted"] as const;
export const userGenders = ["unknown", "male", "female"] as const;

export type UserRole = (typeof userRoles)[number];
export type UserStatus = (typeof userStatuses)[number];
export type UserGender = (typeof userGenders)[number];
