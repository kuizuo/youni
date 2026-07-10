import { publicProcedure } from "../index";
import { adminRouter } from "./admin";
import { commentsRouter } from "./comments";
import { messagesRouter } from "./messages";
import { notesRouter } from "./notes";
import { notificationsRouter } from "./notifications";
import { profilesRouter } from "./profiles";
import { topicsRouter } from "./topics";

export const implementationRouter = {
	healthCheck: publicProcedure.healthCheck.handler(() => "OK" as const),
	admin: adminRouter,
	messages: messagesRouter,
	notifications: notificationsRouter,
	...notesRouter,
	...topicsRouter,
	...profilesRouter,
	...commentsRouter,
};
