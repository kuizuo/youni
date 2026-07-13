import {
	index,
	integer,
	primaryKey,
	sqliteTable,
	text,
	uniqueIndex,
} from "drizzle-orm/sqlite-core";
import { ulid } from "ulid";

import { timestampColumn } from "./_columns";
import { user } from "./auth";
import { note } from "./content";

export const noteFeedEventTypes = [
	"impression",
	"open",
	"like",
	"collect",
	"not_interested",
	"block_author",
] as const;

export const searchEntrySources = [
	"typed",
	"history",
	"recommended",
	"external",
] as const;

export const noteNotInterested = sqliteTable(
	"note_not_interested",
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
		index("note_not_interested_user_created_idx").on(
			table.userId,
			table.createdAt,
		),
	],
);

export const noteFeedEvent = sqliteTable(
	"recommendation_event",
	{
		id: text("id")
			.primaryKey()
			.$defaultFn(() => ulid()),
		impressionId: text("impression_id").notNull(),
		type: text("type", { enum: noteFeedEventTypes }).notNull(),
		position: integer("position"),
		occurredAt: timestampColumn("occurred_at").defaultNow().notNull(),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
		noteId: text("note_id")
			.notNull()
			.references(() => note.id, { onDelete: "cascade" }),
		userId: text("user_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
	},
	(table) => [
		uniqueIndex("recommendation_event_impression_type_idx").on(
			table.impressionId,
			table.type,
		),
		index("recommendation_event_user_occurred_idx").on(
			table.userId,
			table.occurredAt,
		),
		index("recommendation_event_note_type_idx").on(table.noteId, table.type),
		index("recommendation_event_occurred_idx").on(table.occurredAt),
	],
);

export const noteFeedDailyMetric = sqliteTable(
	"recommendation_daily_metric",
	{
		day: text("day").primaryKey(),
		impressionCount: integer("impression_count").default(0).notNull(),
		openCount: integer("open_count").default(0).notNull(),
		likeCount: integer("like_count").default(0).notNull(),
		collectCount: integer("collect_count").default(0).notNull(),
		notInterestedCount: integer("not_interested_count").default(0).notNull(),
		blockAuthorCount: integer("block_author_count").default(0).notNull(),
		updatedAt: timestampColumn("updated_at").defaultNow().notNull(),
	},
	(table) => [index("recommendation_daily_metric_day_idx").on(table.day)],
);

export const searchKeywordDaily = sqliteTable(
	"search_keyword_daily",
	{
		day: text("day").notNull(),
		keyword: text("keyword").notNull(),
		displayKeyword: text("display_keyword").notNull(),
		totalCount: integer("total_count").default(0).notNull(),
		successfulCount: integer("successful_count").default(0).notNull(),
		typedCount: integer("typed_count").default(0).notNull(),
		historyCount: integer("history_count").default(0).notNull(),
		recommendedCount: integer("recommended_count").default(0).notNull(),
		externalCount: integer("external_count").default(0).notNull(),
		updatedAt: timestampColumn("updated_at")
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.day, table.keyword] }),
		index("search_keyword_daily_day_idx").on(table.day),
		index("search_keyword_daily_keyword_idx").on(table.keyword),
	],
);

export const searchKeywordControl = sqliteTable("search_keyword_control", {
	keyword: text("keyword").primaryKey(),
	excluded: integer("excluded", { mode: "boolean" }).default(false).notNull(),
	createdAt: timestampColumn("created_at").defaultNow().notNull(),
	updatedAt: timestampColumn("updated_at")
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	updatedBy: text("updated_by").references(() => user.id, {
		onDelete: "set null",
	}),
});
