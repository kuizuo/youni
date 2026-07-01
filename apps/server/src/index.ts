import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createContext } from "@youni/api/context";
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
const avatarContentTypes = new Map([
	["image/jpeg", "jpg"],
	["image/jpg", "jpg"],
	["image/png", "png"],
	["image/webp", "webp"],
	["image/gif", "gif"],
]);

app.use(logger());
app.use(
	"/*",
	cors({
		origin: (origin) => {
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

app.on(["POST", "GET"], "/api/auth/*", (c) => createAuth().handler(c.req.raw));

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
			status: user.status,
		})
		.from(user)
		.where(eq(user.id, context.session.user.id))
		.limit(1);

	if (!account || account.status !== "active" || account.banned) {
		return null;
	}

	return account;
}

async function uploadAvatarFromRequest(c: HonoContext) {
	if (!env.YOUNI_BUCKET) {
		return c.json({ message: "头像存储尚未配置" }, 503);
	}

	const body = await c.req.parseBody();
	const file = body.avatar;

	if (!(file instanceof File)) {
		return c.json({ message: "请选择头像文件" }, 400);
	}

	const extension = avatarContentTypes.get(file.type);
	if (!extension) {
		return c.json({ message: "头像仅支持 JPG、PNG、WebP 或 GIF" }, 400);
	}

	if (file.size > avatarMaxSize) {
		return c.json({ message: "头像不能超过 2MB" }, 400);
	}

	const fileName = `${crypto.randomUUID()}.${extension}`;
	const key = `${avatarPrefix}${fileName}`;

	await env.YOUNI_BUCKET.put(key, file.stream(), {
		httpMetadata: {
			cacheControl: "public, max-age=31536000, immutable",
			contentType: file.type,
		},
	});

	return c.json({
		key,
		url: new URL(`/uploads/avatar/${fileName}`, c.req.url).toString(),
	});
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

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			schemaConverters: [new ZodToJsonSchemaConverter()],
		}),
	],
	interceptors: [
		onError((error) => {
			console.error(error);
		}),
	],
});

export const rpcHandler = new RPCHandler(appRouter, {
	interceptors: [
		onError((error) => {
			console.error(error);
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

export default app;
