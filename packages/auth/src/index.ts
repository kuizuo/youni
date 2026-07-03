import { expo } from "@better-auth/expo";
import { createDb } from "@youni/db";
import * as schema from "@youni/db/schema/auth";
import { env } from "@youni/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import {
	adminAccessControl,
	adminPermissionRoles,
	backofficeUserRoleOptions,
} from "./permissions";

const isProduction = process.env.NODE_ENV === "production";
const configuredOrigins =
	env.CORS_ORIGIN?.split(",")
		.map((origin: string) => origin.trim())
		.filter(Boolean) ?? [];
const localOrigins = [
	"http://localhost:3001",
	"http://127.0.0.1:3001",
	"http://localhost:8081",
	"http://127.0.0.1:8081",
];
const googleClientIds = [
	env.GOOGLE_WEB_CLIENT_ID,
	env.GOOGLE_IOS_CLIENT_ID,
	env.GOOGLE_ANDROID_CLIENT_ID,
].filter((clientId): clientId is string => Boolean(clientId));
const [firstGoogleClientId, ...additionalGoogleClientIds] = googleClientIds;
const socialProviders = firstGoogleClientId
	? {
			google: {
				clientId:
					additionalGoogleClientIds.length === 0
						? firstGoogleClientId
						: [firstGoogleClientId, ...additionalGoogleClientIds],
				clientSecret: env.GOOGLE_CLIENT_SECRET || undefined,
			},
		}
	: undefined;

function escapeHtml(value: string) {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

async function sendResetPasswordEmail({
	email,
	name,
	url,
}: {
	email: string;
	name: string;
	url: string;
}) {
	const apiKey = env.RESEND_API_KEY;
	const from = env.RESEND_FROM_EMAIL;
	const displayName = name || "Youni 用户";
	const safeName = escapeHtml(displayName);
	const safeUrl = escapeHtml(url);
	const subject = "重置你的 Youni 密码";
	const text = [
		`${displayName}，你好。`,
		"",
		"我们收到了重置 Youni 密码的请求。请打开下面的链接设置新密码：",
		url,
		"",
		"链接将在 1 小时后失效。如果不是你本人操作，可以忽略这封邮件。",
	].join("\n");
	const html = `
		<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #111827;">
			<p>${safeName}，你好。</p>
			<p>我们收到了重置 Youni 密码的请求。点击下面的按钮设置新密码：</p>
			<p>
				<a href="${safeUrl}" style="display: inline-block; border-radius: 999px; background: #111827; color: #ffffff; padding: 12px 18px; text-decoration: none;">
					设置新密码
				</a>
			</p>
			<p>链接将在 1 小时后失效。如果不是你本人操作，可以忽略这封邮件。</p>
			<p style="font-size: 12px; color: #6b7280;">如果按钮打不开，请复制这个链接到浏览器：<br />${safeUrl}</p>
		</div>
	`;

	if (!apiKey || !from) {
		if (isProduction) {
			throw new Error("Password reset email is not configured");
		}

		console.info(`[auth] Password reset link for ${email}: ${url}`);
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
		console.error("Failed to send password reset email", {
			body,
			status: response.status,
		});
		throw new Error("Failed to send password reset email");
	}
}

export function createAuth() {
	const db = createDb();

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "sqlite",

			schema: schema,
		}),
		trustedOrigins: [
			...configuredOrigins,
			"youni://",
			...(!isProduction
				? [...localOrigins, "exp://", "exp://**", "exp://192.168.*.*:*/**"]
				: []),
		],
		emailAndPassword: {
			enabled: true,
			resetPasswordTokenExpiresIn: 60 * 60,
			revokeSessionsOnPasswordReset: true,
			sendResetPassword: async ({ url, user }) => {
				await sendResetPasswordEmail({
					email: user.email,
					name: user.name,
					url,
				});
			},
		},
		user: {
			additionalFields: {
				status: {
					type: "string",
					required: false,
					defaultValue: "active",
					input: false,
				},
			},
		},
		databaseHooks: {
			user: {
				create: {
					async before(user) {
						return {
							data: {
								...user,
								role: user.role ?? "user",
								status: user.status ?? "active",
							},
						};
					},
				},
			},
			session: {
				create: {
					async before(session) {
						const [owner] = await db
							.select({
								banned: schema.user.banned,
								status: schema.user.status,
							})
							.from(schema.user)
							.where(eq(schema.user.id, session.userId))
							.limit(1);

						if (!owner || owner.status !== "active" || owner.banned) {
							return false;
						}
					},
				},
			},
		},
		socialProviders,
		// uncomment cookieCache setting when ready to deploy to Cloudflare using *.workers.dev domains
		// session: {
		//   cookieCache: {
		//     enabled: true,
		//     maxAge: 60,
		//   },
		// },
		secret: env.BETTER_AUTH_SECRET,
		baseURL: env.BETTER_AUTH_URL,
		advanced: {
			defaultCookieAttributes: {
				sameSite: isProduction ? "none" : "lax",
				secure: isProduction,
				httpOnly: true,
			},
			// uncomment crossSubDomainCookies setting when ready to deploy and replace <your-workers-subdomain> with your actual workers subdomain
			// https://developers.cloudflare.com/workers/wrangler/configuration/#workersdev
			// crossSubDomainCookies: {
			//   enabled: true,
			//   domain: "<your-workers-subdomain>",
			// },
		},
		plugins: [
			adminPlugin({
				ac: adminAccessControl,
				adminRoles: [...backofficeUserRoleOptions],
				bannedUserMessage: "账号已被禁用，请联系管理员处理。",
				defaultRole: "user",
				roles: adminPermissionRoles,
			}),
			expo(),
		],
	});
}
