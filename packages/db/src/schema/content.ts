import { sql } from "drizzle-orm";
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

export const noteStatuses = [
	"draft",
	"audit",
	"published",
	"rejected",
	"hidden",
] as const;

export const noteVisibilities = ["public", "followers", "private"] as const;

export const note = sqliteTable(
	"note",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => ulid()),
		title: text("title").notNull(),
		content: text("content").notNull(),
		images: text("images", { mode: "json" })
			.$type<string[]>()
			.default(sql`'[]'`)
			.notNull(),
		cover: text("cover"),
		locationName: text("location_name"),
		visibility: text("visibility", { enum: noteVisibilities })
			.default("public")
			.notNull(),
		components: text("components", { mode: "json" })
			.$type<
				Array<{
					options?: string[];
					title: string;
					type: "file" | "poll";
					value?: string;
				}>
			>()
			.default(sql`'[]'`)
			.notNull(),
		advancedOptions: text("advanced_options", { mode: "json" })
			.$type<{
				allowComment: boolean;
				allowShare: boolean;
				contentDisclosure?: string | null;
				isOriginal: boolean;
			}>()
			.default(sql`'{"allowComment":true,"allowShare":true,"isOriginal":true}'`)
			.notNull(),
		status: text("status", { enum: noteStatuses }).default("audit").notNull(),
		rejectionReason: text("rejection_reason"),
		publishedAt: timestampColumn("published_at"),
		draftSavedAt: timestampColumn("draft_saved_at"),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
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

export const topic = sqliteTable(
	"topic",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => ulid()),
		name: text("name").notNull(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [uniqueIndex("topic_name_idx").on(table.name)],
);

export const noteTopic = sqliteTable(
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

export const comment = sqliteTable(
	"comment",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => ulid()),
		content: text("content").notNull(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [index("comment_note_idx").on(table.noteId, table.createdAt)],
);

export const noteLike = sqliteTable(
	"note_like",
	{
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.noteId, table.userId] }),
		index("note_like_user_idx").on(table.userId),
	],
);

export const noteCollection = sqliteTable(
	"note_collection",
	{
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.noteId, table.userId] }),
		index("note_collection_user_created_idx").on(table.userId, table.createdAt),
	],
);

export const noteViewHistory = sqliteTable(
	"note_view_history",
	{
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		viewedAt: timestampColumn("viewed_at").defaultNow().notNull(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.userId, table.noteId] }),
		index("note_view_history_user_viewed_idx").on(table.userId, table.viewedAt),
		index("note_view_history_note_idx").on(table.noteId),
	],
);
