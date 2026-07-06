import {
	index,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

import { timestampColumn } from "./_columns";
import { user } from "./auth";

export const directConversation = sqliteTable(
	"direct_conversation",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => ulid()),
		memberKey: text("member_key").notNull(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("direct_conversation_member_key_idx").on(table.memberKey),
		index("direct_conversation_updated_idx").on(table.updatedAt),
	],
);

export const directConversationParticipant = sqliteTable(
	"direct_conversation_participant",
	{
		conversationId: text("conversation_id")
			.notNull()
			.references(() => directConversation.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		lastReadAt: timestampColumn("last_read_at"),
		clearedAt: timestampColumn("cleared_at"),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.conversationId, table.userId] }),
		index("direct_conversation_participant_user_idx").on(
			table.userId,
			table.updatedAt,
		),
	],
);

export const directMessage = sqliteTable(
	"direct_message",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => ulid()),
		conversationId: text("conversation_id")
			.notNull()
			.references(() => directConversation.id, { onDelete: "cascade" }),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("direct_message_conversation_created_idx").on(
			table.conversationId,
			table.createdAt,
		),
		index("direct_message_sender_idx").on(table.senderId),
	],
);
