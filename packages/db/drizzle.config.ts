import dotenv from "dotenv";
import { defineConfig } from "drizzle-kit";

dotenv.config({
	path: "../../packages/infra/.env",
});
dotenv.config({
	path: "../../apps/server/.env",
});

export default defineConfig({
	schema: "./src/schema/index.ts",
	out: "./src/migrations",
	dialect: "sqlite",
	driver: "d1-http",
	tablesFilter: [
		"account",
		"comment",
		"comment_like",
		"direct_conversation",
		"direct_conversation_participant",
		"direct_message",
		"direct_message_user_deletion",
		"follow",
		"note",
		"note_collection",
		"note_not_interested",
		"note_like",
		"note_topic",
		"note_view_count_state",
		"note_view_history",
		"notification",
		"notification_push_token",
		"prohibited_term",
		"recommendation_daily_metric",
		"recommendation_event",
		"search_keyword_control",
		"search_keyword_daily",
		"session",
		"topic",
		"user",
		"user_block",
		"verification",
	],
	dbCredentials: {
		accountId: process.env.CLOUDFLARE_ACCOUNT_ID || "",
		databaseId:
			process.env.CLOUDFLARE_D1_DATABASE_ID || process.env.D1_DATABASE_ID || "",
		token: process.env.CLOUDFLARE_API_TOKEN || "",
	},
});
