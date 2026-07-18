import z from "zod";

export const RESEND_COOLDOWN_SECONDS = 60;

const RATE_LIMIT_MESSAGES = new Set([
	"Too many attempts",
	"Too many requests. Please try again later.",
]);

export const forgotPasswordSchema = z.object({
	email: z.string().trim().min(1, "请输入邮箱").email("请输入正确的邮箱"),
});

export const resetPasswordSchema = forgotPasswordSchema
	.extend({
		confirmPassword: z.string().min(1, "请再次输入新密码"),
		otp: z.string().trim().min(1, "请输入验证码"),
		password: z.string().min(8, "密码至少 8 位").max(128, "密码最多 128 位"),
	})
	.refine((value) => value.password === value.confirmPassword, {
		message: "两次输入的密码不一致",
		path: ["confirmPassword"],
	});

export const changePasswordSchema = z
	.object({
		confirmPassword: z.string().min(1, "请再次输入新密码"),
		currentPassword: z.string().min(1, "请输入当前密码"),
		newPassword: z
			.string()
			.min(8, "新密码至少 8 位")
			.max(128, "新密码最多 128 位"),
	})
	.refine((value) => value.newPassword === value.confirmPassword, {
		message: "两次输入的新密码不一致",
		path: ["confirmPassword"],
	});

export function getAuthErrorMessage(
	message: string | undefined,
	fallback: string,
) {
	if (!message) {
		return fallback;
	}

	if (RATE_LIMIT_MESSAGES.has(message)) {
		return "操作太频繁，请 60 秒后再试";
	}

	return message;
}
