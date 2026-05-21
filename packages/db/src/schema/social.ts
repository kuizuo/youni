import { sql } from "drizzle-orm";
import {
	index,
	jsonb,
	pgEnum,
	pgTable,
	primaryKey,
	text,
	timestamp,
	uniqueIndex,
} from "drizzle-orm/pg-core";

import { user } from "./auth";

export const noteStatus = pgEnum("note_status", [
	"audit",
	"published",
	"rejected",
	"hidden",
]);

export const note = pgTable(
	"note",
	{
		id: text("id").primaryKey(),
		title: text("title").notNull(),
		content: text("content").notNull(),
		images: jsonb("images")
			.$type<string[]>()
			.default(sql`'[]'::jsonb`)
			.notNull(),
		cover: text("cover").notNull(),
		status: noteStatus("status").default("audit").notNull(),
		rejectionReason: text("rejection_reason"),
		publishedAt: timestamp("published_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		index("note_status_created_idx").on(table.status, table.createdAt),
		index("note_user_idx").on(table.userId),
	],
);

export const topic = pgTable(
	"topic",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [uniqueIndex("topic_name_idx").on(table.name)],
);

export const noteTopic = pgTable(
	"note_topic",
	{
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		topicId: text("topic_id")
			.notNull()
			.references(() => topic.id, { onDelete: "cascade" }),
	},
	(table) => [
		primaryKey({ columns: [table.noteId, table.topicId] }),
		index("note_topic_topic_idx").on(table.topicId),
	],
);

export const comment = pgTable(
	"comment",
	{
		id: text("id").primaryKey(),
		content: text("content").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("comment_note_idx").on(table.noteId, table.createdAt)],
);

export const noteLike = pgTable(
	"note_like",
	{
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.noteId, table.userId] })],
);

export const noteCollection = pgTable(
	"note_collection",
	{
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [primaryKey({ columns: [table.noteId, table.userId] })],
);

export const follow = pgTable(
	"follow",
	{
		followerId: text("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		followingId: text("following_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.followerId, table.followingId] }),
		index("follow_following_idx").on(table.followingId),
	],
);
