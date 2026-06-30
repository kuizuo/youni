import type { RouterClient } from "@orpc/server";

import { protectedProcedure, publicProcedure } from "../index";
import { adminRouter } from "./admin";
import { messagesRouter } from "./messages";
import { notificationsRouter } from "./notifications";
import { socialRouter } from "./social";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	privateData: protectedProcedure.handler(({ context }) => {
		return {
			message: "This is private",
			user: context.session?.user,
		};
	}),
	admin: adminRouter,
	messages: messagesRouter,
	notifications: notificationsRouter,
	social: socialRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
