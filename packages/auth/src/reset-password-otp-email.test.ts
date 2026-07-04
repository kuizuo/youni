import { describe, expect, test } from "bun:test";
import {
	buildPasswordResetOtpEmail,
	passwordResetOtpExpiresInMinutes,
} from "./reset-password-otp-email";

describe("buildPasswordResetOtpEmail", () => {
	test("includes the OTP and expiry without reset links", () => {
		const email = buildPasswordResetOtpEmail({ otp: "123456" });

		expect(email.subject).toBe("重置你的 Youni 密码");
		expect(email.text).toContain("123456");
		expect(email.html).toContain("123456");
		expect(email.text).toContain(`${passwordResetOtpExpiresInMinutes} 分钟`);
		expect(email.html).toContain(`${passwordResetOtpExpiresInMinutes} 分钟`);
		expect(email.text).not.toContain("http://");
		expect(email.text).not.toContain("https://");
		expect(email.html).not.toContain("href=");
	});
});
