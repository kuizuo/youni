import { describe, expect, test } from "bun:test";
import { getFieldErrors } from "@/utils/form-errors";

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
		const mismatched = changePasswordSchema.safeParse({
			confirmPassword: "different-password",
			currentPassword: "old-password",
			newPassword: "new-password",
		});
		expect(mismatched.success).toBe(false);
		if (mismatched.success) throw new Error("expected validation to fail");
		expect(getFieldErrors(mismatched.error).confirmPassword).toBe(
			"两次输入的新密码不一致",
		);
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
