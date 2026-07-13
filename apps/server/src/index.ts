import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createContext } from "@youni/api/context";
import { cleanupExpiredAnalytics } from "@youni/api/lib/analytics-retention";
import { linkAnonymousUserActivity } from "@youni/api/lib/anonymous-linking";
import {
	type NoteModerationJob,
	processNoteModerationJob,
} from "@youni/api/lib/note-image-moderation";
import { appRouter } from "@youni/api/routers/index";
import { createAuth } from "@youni/auth";
import { hasAdminPermission } from "@youni/auth/permissions";
import { createDb } from "@youni/db";
import { user } from "@youni/db/schema/index";
import { env } from "@youni/env/server";
import { convertToModelMessages, streamText, wrapLanguageModel } from "ai";
import { eq } from "drizzle-orm";
import { Hono, type Context as HonoContext } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";

const app = new Hono();
const isProduction = process.env.NODE_ENV === "production";
const configuredCorsOrigins =
	env.CORS_ORIGIN?.split(",")
		.map((origin) => origin.trim())
		.filter(Boolean) ?? [];
const allowedCorsOrigins = new Set([
	...configuredCorsOrigins,
	...(isProduction
		? []
		: [
				"http://localhost:3001",
				"http://127.0.0.1:3001",
				"http://localhost:8081",
				"http://127.0.0.1:8081",
			]),
]);
const avatarPrefix = "avatar/";
const avatarMaxSize = 2 * 1024 * 1024;
const profileCoverPrefix = "profile-covers/";
const profileCoverMaxSize = 5 * 1024 * 1024;
const noteImagePrefix = "note-images/";
const noteImageMaxSize = 8 * 1024 * 1024;
const noteImageMaxCount = 9;
const avatarContentTypes = new Map([
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
	["image/gif", "gif"],
]);
const noteImageContentTypes = avatarContentTypes;

function getProcedureErrorStatus(error: unknown) {
	if (error instanceof ORPCError) {
		return error.status;
	}

	if (typeof error === "object" && error !== null && "status" in error) {
		const status = (error as { status?: unknown }).status;
		if (typeof status === "number") {
			return status;
		}
	}

	return undefined;
}

function reportProcedureError(error: unknown) {
	const status = getProcedureErrorStatus(error);

	if (status !== undefined && status < 500) {
		return;
	}

	console.error(error);
}

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (origin: string) => {
			if (allowedCorsOrigins.has(origin)) {
				return origin;
			}

			return configuredCorsOrigins[0];
		},
		allowMethods: ["GET", "POST", "OPTIONS"],
		allowHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	}),
);

app.use("/api/auth/admin/*", async (c, next) => {
	const path = new URL(c.req.url).pathname;

	if (path.endsWith("/has-permission")) {
		return next();
	}

	return c.json({ message: "请使用后台业务接口管理用户" }, 403);
});

app.on(["POST", "GET"], "/api/auth/*", (c) =>
	createAuth({ onLinkAnonymousAccount: linkAnonymousUserActivity }).handler(
		c.req.raw,
	),
);

async function assertBackofficeAccess(c: HonoContext) {
	const context = await createContext({ context: c });
	if (!context.session?.user) {
		return null;
	}

	const [account] = await createDb()
		.select({
			banned: user.banned,
			id: user.id,
			role: user.role,
			status: user.status,
		})
		.from(user)
		.where(eq(user.id, context.session.user.id))
		.limit(1);

	if (
		!account ||
		account.status !== "active" ||
		account.banned ||
		!hasAdminPermission(account.role, { backoffice: ["access"] })
	) {
		return null;
	}

	return account;
}

async function assertActiveUploadAccess(c: HonoContext) {
	const context = await createContext({ context: c });
	if (!context.session?.user) {
		return null;
	}

	const [account] = await createDb()
		.select({
			banned: user.banned,
			id: user.id,
			isAnonymous: user.isAnonymous,
			status: user.status,
		})
		.from(user)
		.where(eq(user.id, context.session.user.id))
		.limit(1);

	if (
		!account ||
		account.isAnonymous ||
		account.status !== "active" ||
		account.banned
	) {
		return null;
	}

	return account;
}

async function uploadProfileImageFromRequest(
	c: HonoContext,
	options: {
		fieldName: string;
		label: string;
		maxSize: number;
		prefix: string;
		publicPath: string;
	},
) {
	if (!env.YOUNI_BUCKET) {
		return c.json({ message: `${options.label}存储尚未配置` }, 503);
	}

	const body = await c.req.parseBody();
	const file = body[options.fieldName];

	if (!(file instanceof File)) {
		return c.json({ message: `请选择${options.label}文件` }, 400);
	}

	const extension = avatarContentTypes.get(file.type);
	if (!extension) {
		return c.json(
			{ message: `${options.label}仅支持 JPG、PNG、WebP 或 GIF` },
			400,
		);
	}

	if (file.size > options.maxSize) {
		return c.json(
			{
				message: `${options.label}不能超过 ${options.maxSize / 1024 / 1024}MB`,
			},
			400,
		);
	}

	const fileName = `${crypto.randomUUID()}.${extension}`;
	const key = `${options.prefix}${fileName}`;

	await env.YOUNI_BUCKET.put(key, file.stream(), {
		httpMetadata: {
			cacheControl: "public, max-age=31536000, immutable",
			contentType: file.type,
		},
	});

	return c.json({
		key,
		url: new URL(`${options.publicPath}/${fileName}`, c.req.url).toString(),
	});
}

function uploadAvatarFromRequest(c: HonoContext) {
	return uploadProfileImageFromRequest(c, {
		fieldName: "avatar",
		label: "头像",
		maxSize: avatarMaxSize,
		prefix: avatarPrefix,
		publicPath: "/uploads/avatar",
	});
}

function uploadProfileCoverFromRequest(c: HonoContext) {
	return uploadProfileImageFromRequest(c, {
		fieldName: "cover",
		label: "背景图",
		maxSize: profileCoverMaxSize,
		prefix: profileCoverPrefix,
		publicPath: "/uploads/profile-cover",
	});
}

function getBodyFiles(body: Record<string, unknown>) {
	return Object.values(body).flatMap((value) => {
		if (value instanceof File) return [value];
		if (Array.isArray(value)) {
			return value.filter((item): item is File => item instanceof File);
		}
		return [];
	});
}

async function uploadNoteImagesFromRequest(c: HonoContext, userId: string) {
	if (!env.YOUNI_BUCKET) {
		return c.json({ message: "图片存储尚未配置" }, 503);
	}

	const body = await c.req.parseBody({ all: true });
	const files = getBodyFiles(body);

	if (files.length === 0) {
		return c.json({ message: "请选择图片文件" }, 400);
	}

	if (files.length > noteImageMaxCount) {
		return c.json({ message: `最多只能上传 ${noteImageMaxCount} 张图片` }, 400);
	}

	const preparedFiles = files.map((file) => {
		const extension = noteImageContentTypes.get(file.type);
		if (!extension) {
			return null;
		}
		return { extension, file };
	});
	if (preparedFiles.some((item) => item === null)) {
		return c.json({ message: "图片仅支持 JPG、PNG、WebP 或 GIF" }, 400);
	}
	if (files.some((file) => file.size > noteImageMaxSize)) {
		return c.json({ message: "单张图片不能超过 8MB" }, 400);
	}

	const uploaded: Array<{ key: string; url: string }> = [];
	try {
		for (const item of preparedFiles) {
			if (!item) continue;
			const fileName = `${crypto.randomUUID()}.${item.extension}`;
			const key = `${noteImagePrefix}${userId}/${fileName}`;

			await env.YOUNI_BUCKET.put(key, item.file.stream(), {
				httpMetadata: {
					cacheControl: "public, max-age=31536000, immutable",
					contentType: item.file.type,
				},
			});

			uploaded.push({
				key,
				url: new URL(
					`/uploads/note-images/${userId}/${fileName}`,
					c.req.url,
				).toString(),
			});
		}
	} catch (error) {
		await Promise.allSettled(
			uploaded.map((item) => env.YOUNI_BUCKET?.delete(item.key)),
		);
		throw error;
	}

	return c.json({ items: uploaded });
}

app.post("/admin/uploads/avatar", async (c) => {
	const account = await assertBackofficeAccess(c);
	if (!account) {
		return c.json({ message: "没有权限上传头像" }, 403);
	}

	return uploadAvatarFromRequest(c);
});

app.post("/uploads/avatar", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) {
		return c.json({ message: "请先登录后再上传头像" }, 401);
	}

	return uploadAvatarFromRequest(c);
});

app.post("/uploads/profile-cover", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) {
		return c.json({ message: "请先登录后再上传背景图" }, 401);
	}

	return uploadProfileCoverFromRequest(c);
});

app.post("/uploads/note-images", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) {
		return c.json({ message: "请先登录后再上传图片" }, 401);
	}

	return uploadNoteImagesFromRequest(c, account.id);
});

app.post("/uploads/note-images/cleanup", async (c) => {
	const account = await assertActiveUploadAccess(c);
	if (!account) {
		return c.json({ message: "请先登录后再清理图片" }, 401);
	}
	if (!env.YOUNI_BUCKET) {
		return c.json({ message: "图片存储尚未配置" }, 503);
	}

	const body = await c.req.json<{ keys?: unknown }>().catch(() => null);
	if (
		!body ||
		!Array.isArray(body.keys) ||
		body.keys.length > noteImageMaxCount
	) {
		return c.json({ message: "图片清理请求无效" }, 400);
	}
	const keyPattern = new RegExp(
		`^${noteImagePrefix}${account.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}/[a-f0-9-]{36}\\.(?:jpg|png|webp|gif)$`,
	);
	const keys = body.keys.filter(
		(key): key is string => typeof key === "string" && keyPattern.test(key),
	);
	if (keys.length !== body.keys.length) {
		return c.json({ message: "图片清理请求无效" }, 400);
	}

	await Promise.all(keys.map((key) => env.YOUNI_BUCKET?.delete(key)));
	return c.json({ deleted: keys.length });
});

app.get("/uploads/avatar/:fileName", async (c) => {
	if (!env.YOUNI_BUCKET) {
		return c.notFound();
	}

	const fileName = c.req.param("fileName");
	if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(fileName)) {
		return c.notFound();
	}

	const object = await env.YOUNI_BUCKET.get(`${avatarPrefix}${fileName}`);
	if (!object) {
		return c.notFound();
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "public, max-age=31536000, immutable");

	return new Response(object.body, { headers });
});

app.get("/uploads/profile-cover/:fileName", async (c) => {
	if (!env.YOUNI_BUCKET) {
		return c.notFound();
	}

	const fileName = c.req.param("fileName");
	if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(fileName)) {
		return c.notFound();
	}

	const object = await env.YOUNI_BUCKET.get(`${profileCoverPrefix}${fileName}`);
	if (!object) {
		return c.notFound();
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "public, max-age=31536000, immutable");

	return new Response(object.body, { headers });
});

app.get("/uploads/note-images/:fileName", async (c) => {
	if (!env.YOUNI_BUCKET) {
		return c.notFound();
	}

	const fileName = c.req.param("fileName");
	if (!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(fileName)) {
		return c.notFound();
	}

	const object = await env.YOUNI_BUCKET.get(`${noteImagePrefix}${fileName}`);
	if (!object) {
		return c.notFound();
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "public, max-age=31536000, immutable");

	return new Response(object.body, { headers });
});

app.get("/uploads/note-images/:userId/:fileName", async (c) => {
	if (!env.YOUNI_BUCKET) {
		return c.notFound();
	}

	const userId = c.req.param("userId");
	const fileName = c.req.param("fileName");
	if (
		!userId ||
		userId.includes("/") ||
		!/^[a-f0-9-]+\.(jpg|png|webp|gif)$/.test(fileName)
	) {
		return c.notFound();
	}

	const object = await env.YOUNI_BUCKET.get(
		`${noteImagePrefix}${userId}/${fileName}`,
	);
	if (!object) {
		return c.notFound();
	}

	const headers = new Headers();
	object.writeHttpMetadata(headers);
	headers.set("etag", object.httpEtag);
	headers.set("cache-control", "public, max-age=31536000, immutable");

	return new Response(object.body, { headers });
});

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			reportProcedureError(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			reportProcedureError(error);
		}),
	],
});

app.use("/*", async (c, next) => {
	const context = await createContext({ context: c });

	const rpcResult = await rpcHandler.handle(c.req.raw, {
		prefix: "/rpc",
		context: context,
	});

	if (rpcResult.matched) {
		return c.newResponse(rpcResult.response.body, rpcResult.response);
	}

	const apiResult = await apiHandler.handle(c.req.raw, {
		prefix: "/api-reference",
		context: context,
	});

	if (apiResult.matched) {
		return c.newResponse(apiResult.response.body, apiResult.response);
	}

	await next();
});

app.post("/ai", async (c) => {
	const body = await c.req.json();
	const uiMessages = body.messages || [];
	const google = createGoogleGenerativeAI({
		apiKey: env.GOOGLE_GENERATIVE_AI_API_KEY,
	});
	const model = wrapLanguageModel({
		model: google("gemini-2.5-flash"),
		middleware: devToolsMiddleware(),
	});
	const result = streamText({
		model,
		messages: await convertToModelMessages(uiMessages),
	});

	return result.toUIMessageStreamResponse();
});

app.get("/", (c) => {
	return c.text("OK");
});

const worker: ExportedHandler<Env, NoteModerationJob> = {
	fetch(request, workerEnv, executionContext) {
		return app.fetch(request, workerEnv, executionContext);
	},
	scheduled(_controller, _workerEnv, executionContext) {
		executionContext.waitUntil(cleanupExpiredAnalytics());
	},
	async queue(batch) {
		await Promise.all(
			batch.messages.map(async (message) => {
				try {
					await processNoteModerationJob(message.body);
					message.ack();
				} catch (error) {
					console.error("note moderation queue failed", {
						attempts: message.attempts,
						error,
						messageId: message.id,
					});
					message.retry();
				}
			}),
		);
	},
};

export default worker;
