import type { RouterClient } from "@orpc/server";

import { publicProcedure } from "../index";
import { adminRouter } from "./admin";
import { commentsRouter } from "./comments";
import { messagesRouter } from "./messages";
import { notesRouter } from "./notes";
import { notificationsRouter } from "./notifications";
import { profilesRouter } from "./profiles";
import { topicsRouter } from "./topics";

export const appRouter = {
	healthCheck: publicProcedure.handler(() => {
		return "OK";
	}),
	admin: adminRouter,
	messages: messagesRouter,
	notifications: notificationsRouter,
	...notesRouter,
	...topicsRouter,
	...profilesRouter,
	...commentsRouter,
};
export type AppRouter = typeof appRouter;
export type AppRouterClient = RouterClient<typeof appRouter>;
