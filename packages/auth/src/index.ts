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
		.map((origin) => origin.trim())
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

export function createAuth() {
	const db = createDb();

	return betterAuth({
		database: drizzleAdapter(db, {
			provider: "pg",

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
