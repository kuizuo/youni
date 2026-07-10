import type { ContractRouterClient } from "@orpc/contract";

import { adminContract } from "./admin";
import { commentsContract } from "./comments";
import { messagesContract } from "./messages";
import { notesContract } from "./notes";
import { notificationsContract } from "./notifications";
import { output, procedure } from "./procedure";
import { profilesContract } from "./profiles";
import { topicsContract } from "./topics";

export const appContract = {
	healthCheck: procedure.output(output<"OK">()),
	admin: adminContract,
	messages: messagesContract,
	notifications: notificationsContract,
	...notesContract,
	...topicsContract,
	...profilesContract,
	...commentsContract,
};

export type AppContract = typeof appContract;
export type AppRouterClient = ContractRouterClient<AppContract>;
