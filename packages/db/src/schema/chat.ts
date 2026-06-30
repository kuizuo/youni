import {
	index,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
	varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { user } from "./auth";

export const directConversation = pgTable(
	"direct_conversation",
	{
		id: varchar("id", { length: 256 })
			.primaryKey()
			.$defaultFn(() => ulid()),
		memberKey: text("member_key").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("direct_conversation_member_key_idx").on(table.memberKey),
		index("direct_conversation_updated_idx").on(table.updatedAt),
	],
);

export const directConversationParticipant = pgTable(
	"direct_conversation_participant",
	{
		conversationId: varchar("conversation_id", { length: 256 })
			.notNull()
			.references(() => directConversation.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		lastReadAt: timestamp("last_read_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
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

export const directMessage = pgTable(
	"direct_message",
	{
		id: varchar("id", { length: 256 })
			.primaryKey()
			.$defaultFn(() => ulid()),
		conversationId: varchar("conversation_id", { length: 256 })
			.notNull()
			.references(() => directConversation.id, { onDelete: "cascade" }),
		senderId: text("sender_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		content: text("content").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
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
