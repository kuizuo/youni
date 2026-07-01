import { ORPCError, os } from "@orpc/server";
import { createDb } from "@youni/db";
import { user } from "@youni/db/schema/index";
import { eq } from "drizzle-orm";

import type { Context } from "./context";

export const o = os.$context<Context>();

export const publicProcedure = o;

const requireAuth = o.middleware(async ({ context, next }) => {
	if (!context.session?.user) {
		throw new ORPCError("UNAUTHORIZED");
	}
	const [account] = await createDb()
		.select({
			banned: user.banned,
			id: user.id,
			email: user.email,
			role: user.role,
			status: user.status,
		})
		.from(user)
		.where(eq(user.id, context.session.user.id))
		.limit(1);

	if (!account || account.status !== "active" || account.banned) {
		throw new ORPCError("UNAUTHORIZED");
	}

	return next({
		context: {
			...context,
			session: context.session,
			account,
		},
	});
});

export const protectedProcedure = publicProcedure.use(requireAuth);

export const activeUserProcedure = protectedProcedure.use(
	async ({ context, next }) => {
		if (context.account.status !== "active") {
			throw new ORPCError("FORBIDDEN", {
				message: "账号已禁用，暂时不能进行此操作",
			});
		}

		return next({
			context,
		});
	},
);
