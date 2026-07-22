import { devToolsMiddleware } from "@ai-sdk/devtools";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { ORPCError, onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createContext } from "@youni/api/context";
import { cleanupExpiredAnalytics } from "@youni/api/lib/analytics/retention";
import { restoreBuiltinProhibitedTerms } from "@youni/api/lib/moderation/prohibited-terms";
import {
	type ContentReviewJob,
	processContentReviewJob,
} from "@youni/api/lib/notes/moderation";
import { appRouter } from "@youni/api/routers/index";
import { createAuth } from "@youni/auth";
import { env } from "@youni/env/server";
import { convertToModelMessages, streamText, wrapLanguageModel } from "ai";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import uploads from "./uploads";

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

app.on(["POST", "GET"], "/api/auth/*", (c) => createAuth().handler(c.req.raw));

app.route("/", uploads);

export const apiHandler = new OpenAPIHandler(appRouter, {
	plugins: [
		new OpenAPIReferencePlugin({
			docsTitle: "Youni API Docs",
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

const worker: ExportedHandler<Env, ContentReviewJob> = {
	fetch(request, workerEnv, executionContext) {
		return app.fetch(request, workerEnv, executionContext);
	},
	scheduled(controller, _workerEnv, executionContext) {
		const task =
			controller.cron === "0 */12 * * *"
				? restoreBuiltinProhibitedTerms()
				: cleanupExpiredAnalytics();
		executionContext.waitUntil(task);
	},
	async queue(batch) {
		await Promise.all(
			batch.messages.map(async (message) => {
				try {
					await processContentReviewJob(message.body);
					message.ack();
				} catch (error) {
					console.error("content review queue failed", {
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
