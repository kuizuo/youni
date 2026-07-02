import { index, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

import { booleanColumn, timestampColumn } from "./_columns";
import { user } from "./auth";
import { note } from "./content";

export const notificationCategories = [
	"activity",
	"followers",
	"system",
] as const;

export const notificationTypes = [
	"like",
	"collect",
	"comment",
	"mention",
	"follow",
	"message",
	"announcement",
	"event",
	"system",
] as const;

export const notification = sqliteTable(
	"notification",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => ulid()),
		recipientId: text("recipient_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		actorId: text("actor_id").references(() => user.id, {
			onDelete: "set null",
		}),
		type: text("type", { enum: notificationTypes }).notNull(),
		category: text("category", { enum: notificationCategories }).notNull(),
		title: text("title").notNull(),
		body: text("body").notNull(),
		targetType: text("target_type"),
		targetId: text("target_id"),
		noteId: text("note_id").references(() => note.id, {
			onDelete: "set null",
		}),
		dedupeKey: text("dedupe_key").notNull(),
		isRead: booleanColumn("is_read").default(false).notNull(),
		isDeleted: booleanColumn("is_deleted").default(false).notNull(),
		readAt: timestampColumn("read_at"),
		deletedAt: timestampColumn("deleted_at"),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		index("notification_recipient_created_idx").on(
			table.recipientId,
			table.createdAt,
		),
		index("notification_recipient_category_idx").on(
			table.recipientId,
			table.category,
		),
		uniqueIndex("notification_recipient_dedupe_idx").on(
			table.recipientId,
			table.dedupeKey,
		),
	],
);

export const notificationPushToken = sqliteTable(
	"notification_push_token",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => ulid()),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		token: text("token").notNull(),
		platform: text("platform").default("unknown").notNull(),
		isEnabled: booleanColumn("is_enabled").default(true).notNull(),
		lastSeenAt: timestampColumn("last_seen_at").defaultNow().notNull(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		uniqueIndex("notification_push_token_token_idx").on(table.token),
		index("notification_push_token_user_idx").on(table.userId),
	],
);
