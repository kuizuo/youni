import { env } from "@youni/env/server";

export const passwordResetOtpExpiresInMinutes = 5;

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

export function buildPasswordResetOtpEmail({ otp }: { otp: string }) {
	const safeOtp = escapeHtml(otp);
	const subject = "重置你的 Youni 密码";
	const text = [
		"你好。",
		"",
		"我们收到了重置 Youni 密码的请求。请使用下面的一次性验证码设置新密码：",
		otp,
		"",
		`验证码将在 ${passwordResetOtpExpiresInMinutes} 分钟后失效。如果不是你本人操作，可以忽略这封邮件。`,
	].join("\n");
	const html = `
		<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111827;">
			<p>你好。</p>
			<p>我们收到了重置 Youni 密码的请求。请使用下面的一次性验证码设置新密码：</p>
			<p style="font-size: 28px; font-weight: 700; letter-spacing: 6px; color: #111827;">${safeOtp}</p>
			<p>验证码将在 ${passwordResetOtpExpiresInMinutes} 分钟后失效。如果不是你本人操作，可以忽略这封邮件。</p>
		</div>
	`;

	return { html, subject, text };
}

export async function sendPasswordResetOtpEmail({
	email,
	otp,
}: {
	email: string;
	otp: string;
}) {
	const apiKey = env.RESEND_API_KEY;
	const from = env.RESEND_FROM_EMAIL;
	const { html, subject, text } = buildPasswordResetOtpEmail({ otp });

	if (!apiKey || !from) {
		if (process.env.NODE_ENV === "production") {
			throw new Error("Password reset email is not configured");
		}

		console.info(`[auth] Password reset OTP for ${email}: ${otp}`);
		return;
	}

	const response = await fetch("https://api.resend.com/emails", {
		body: JSON.stringify({
			from,
			html,
			subject,
			text,
			to: email,
		}),
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		method: "POST",
	});

	if (!response.ok) {
		const body = await response.text().catch(() => "");
		console.error("Failed to send password reset OTP email", {
			body,
			status: response.status,
		});
		throw new Error("Failed to send password reset OTP email");
	}
}
