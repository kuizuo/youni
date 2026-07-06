import { index, primaryKey, sqliteTable, text } from "drizzle-orm/sqlite-core";

import { timestampColumn } from "./_columns";
import { user } from "./auth";

export const follow = sqliteTable(
	"follow",
	{
		followerId: text("follower_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		followingId: text("following_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.followerId, table.followingId] }),
		index("follow_following_idx").on(table.followingId),
	],
);

export const userBlock = sqliteTable(
	"user_block",
	{
		blockerId: text("blocker_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		blockedId: text("blocked_id")
			.notNull()
			.references(() => user.id, { onDelete: "cascade" }),
		createdAt: timestampColumn("created_at").defaultNow().notNull(),
	},
	(table) => [
		primaryKey({ columns: [table.blockerId, table.blockedId] }),
		index("user_block_blocked_idx").on(table.blockedId),
	],
);
