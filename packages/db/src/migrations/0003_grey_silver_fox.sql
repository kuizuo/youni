ALTER TABLE "todo" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "todo" CASCADE;--> statement-breakpoint
ALTER TABLE "comment" ALTER COLUMN "id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "comment" ALTER COLUMN "note_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "note" ALTER COLUMN "id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "note_collection" ALTER COLUMN "note_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "note_like" ALTER COLUMN "note_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "note_topic" ALTER COLUMN "note_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "note_topic" ALTER COLUMN "topic_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "notification" ALTER COLUMN "note_id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "notification_push_token" ALTER COLUMN "id" SET DATA TYPE varchar(256);--> statement-breakpoint
ALTER TABLE "topic" ALTER COLUMN "id" SET DATA TYPE varchar(256);