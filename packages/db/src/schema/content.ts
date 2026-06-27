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
	varchar,
} from "drizzle-orm/pg-core";
import { ulid } from "ulid";

import { user } from "./auth";

export const noteStatus = pgEnum("note_status", [
	"draft",
	"audit",
	"published",
	"rejected",
	"hidden",
]);

export const noteVisibility = pgEnum("note_visibility", [
	"public",
	"followers",
	"private",
]);

export const note = pgTable(
	"note",
	{
		id: varchar("id", { length: 256 })
			.primaryKey()
			.$defaultFn(() => ulid()),
		title: text("title").notNull(),
		content: text("content").notNull(),
		images: jsonb("images")
			.$type<string[]>()
			.default(sql`'[]'::jsonb`)
			.notNull(),
		cover: text("cover"),
		locationName: text("location_name"),
		visibility: noteVisibility("visibility").default("public").notNull(),
		components: jsonb("components")
			.$type<
				Array<{
					options?: string[];
					title: string;
					type: "file" | "poll";
					value?: string;
				}>
			>()
			.default(sql`'[]'::jsonb`)
			.notNull(),
		advancedOptions: jsonb("advanced_options")
			.$type<{
				allowComment: boolean;
				allowShare: boolean;
				contentDisclosure?: string | null;
				isOriginal: boolean;
			}>()
			.default(
				sql`'{"allowComment":true,"allowShare":true,"isOriginal":true}'::jsonb`,
			)
			.notNull(),
		status: noteStatus("status").default("audit").notNull(),
		rejectionReason: text("rejection_reason"),
		publishedAt: timestamp("published_at"),
		draftSavedAt: timestamp("draft_saved_at"),
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
		index("note_visibility_idx").on(table.visibility),
	],
);

export const topic = pgTable(
	"topic",
	{
		id: varchar("id", { length: 256 })
			.primaryKey()
			.$defaultFn(() => ulid()),
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
		noteId: varchar("note_id", { length: 256 })
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		topicId: varchar("topic_id", { length: 256 })
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
		id: varchar("id", { length: 256 })
			.primaryKey()
			.$defaultFn(() => ulid()),
		content: text("content").notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		noteId: varchar("note_id", { length: 256 })
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
		noteId: varchar("note_id", { length: 256 })
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.noteId, table.userId] }),
		index("note_like_user_idx").on(table.userId),
	],
);

export const noteCollection = pgTable(
	"note_collection",
	{
		noteId: varchar("note_id", { length: 256 })
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.noteId, table.userId] }),
		index("note_collection_user_created_idx").on(table.userId, table.createdAt),
	],
);
