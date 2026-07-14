import { createAuth } from "@youni/auth";
import { env } from "@youni/env/server";
import type { Context as HonoContext } from "hono";

export type CreateContextOptions = {
	context: HonoContext;
};

export async function createContext({ context }: CreateContextOptions) {
	const session = await createAuth().api.getSession({
		headers: context.req.raw.headers,
	});
	return {
		auth: null,
		rateLimitKey:
			context.req.header("CF-Connecting-IP") ??
			context.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
			"local",
		requestOrigin: new URL(context.req.url).origin,
		searchRateLimit: env.SEARCH_RATE_LIMIT,
		session,
	};
}

export type Context = Awaited<ReturnType<typeof createContext>>;
