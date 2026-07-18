import { describe, expect, test } from "bun:test";

import { changePasswordSchema, resetPasswordSchema } from "./utils";

describe("password settings validation", () => {
	test("requires matching passwords within the supported length", () => {
		expect(
			changePasswordSchema.safeParse({
				confirmPassword: "new-password",
				currentPassword: "old-password",
				newPassword: "new-password",
			}).success,
		).toBe(true);
		expect(
			changePasswordSchema.safeParse({
				confirmPassword: "different-password",
				currentPassword: "old-password",
				newPassword: "new-password",
			}).success,
		).toBe(false);
		expect(
			resetPasswordSchema.safeParse({
				confirmPassword: "short",
				email: "user@example.com",
				otp: "123456",
				password: "short",
			}).success,
		).toBe(false);
	});
});
