import { expo } from "@better-auth/expo";
import { i18n } from "@better-auth/i18n";
import { createDb } from "@youni/db";
import * as schema from "@youni/db/schema/auth";
import { env } from "@youni/env/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin as adminPlugin, anonymous, emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { passwordResetOtpRateLimitPlugin } from "./password-reset-otp-rate-limit";
import {
	adminAccessControl,
	adminPermissionRoles,
	backofficeUserRoleOptions,
} from "./permissions";
import { sendPasswordResetOtpEmail } from "./reset-password-otp-email";

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

const zhAuthErrorTranslations = {
	CREDENTIAL_ACCOUNT_NOT_FOUND: "邮箱或密码错误",
	EMAIL_NOT_VERIFIED: "邮箱还未验证",
	FAILED_TO_CREATE_SESSION: "登录失败，请稍后重试",
	INVALID_EMAIL: "请输入正确的邮箱",
	INVALID_EMAIL_OR_PASSWORD: "邮箱或密码错误",
	INVALID_OTP: "验证码错误或已失效",
	INVALID_PASSWORD: "密码错误",
	INVALID_TOKEN: "验证信息无效或已失效",
	PASSWORD_TOO_SHORT: "密码长度不够",
	SESSION_EXPIRED: "登录已过期，请重新登录",
	TOO_MANY_ATTEMPTS: "尝试次数过多，请稍后再试",
	UNAUTHORIZED: "请先登录",
	USER_ALREADY_EXISTS: "该邮箱已注册",
	USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "该邮箱已注册，请使用其他邮箱",
	USER_NOT_FOUND: "用户不存在",
} satisfies Record<string, string>;

export type CreateAuthOptions = {
	onLinkAnonymousAccount?: (input: {
		anonymousUserId: string;
		newUserId: string;
	}) => Promise<void>;
};

export function createAuth(options: CreateAuthOptions = {}) {
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
			revokeSessionsOnPasswordReset: true,
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
			ipAddress: {
				ipAddressHeaders: ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"],
			},
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
		rateLimit: {
			enabled: true,
			window: 60,
			max: 100,
			customRules: {
				"/email-otp/request-password-reset": {
					window: 60,
					max: 3,
				},
				"/forget-password/email-otp": {
					window: 60,
					max: 3,
				},
			},
		},
		plugins: [
			anonymous({
				generateName: () => "匿名用户",
				async onLinkAccount({ anonymousUser, newUser }) {
					await options.onLinkAnonymousAccount?.({
						anonymousUserId: anonymousUser.user.id,
						newUserId: newUser.user.id,
					});
				},
			}),
			i18n({
				defaultLocale: "zh",
				translations: {
					zh: zhAuthErrorTranslations,
				},
			}),
			adminPlugin({
				ac: adminAccessControl,
				adminRoles: [...backofficeUserRoleOptions],
				bannedUserMessage: "账号已被禁用，请联系管理员处理。",
				defaultRole: "user",
				roles: adminPermissionRoles,
			}),
			passwordResetOtpRateLimitPlugin(db),
			emailOTP({
				async sendVerificationOTP({ email, otp, type }) {
					if (type !== "forget-password") {
						return;
					}

					await sendPasswordResetOtpEmail({ email, otp });
				},
			}),
			expo(),
		],
	});
}
