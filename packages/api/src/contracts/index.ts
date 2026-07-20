import type { ContractRouterClient } from "@orpc/contract";

import { adminContract } from "./admin";
import { commentsContract } from "./comments";
import { messagesContract } from "./messages";
import { notesContract } from "./notes";
import { notificationsContract } from "./notifications";
import { output, procedure } from "./procedure";
import { profilesContract } from "./profiles";
import { searchDiscoveryContract } from "./search-discovery";
import { topicsContract } from "./topics";

export const appContract = {
	healthCheck: procedure.route({ tags: ["系统"] }).output(output<"OK">()),
	admin: procedure.tag("后台管理").router(adminContract),
	comments: procedure.tag("评论").router(commentsContract),
	messages: procedure.tag("消息").router(messagesContract),
	notes: procedure.tag("笔记").router(notesContract),
	notifications: procedure.tag("通知").router(notificationsContract),
	profiles: procedure.tag("用户资料").router(profilesContract),
	searchDiscovery: procedure.tag("搜索与发现").router(searchDiscoveryContract),
	topics: procedure.tag("话题").router(topicsContract),
};

export type AppContract = typeof appContract;
export type AppRouterClient = ContractRouterClient<AppContract>;
