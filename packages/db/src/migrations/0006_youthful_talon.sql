ALTER TABLE "session" ADD COLUMN "impersonated_by" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "banned" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_reason" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "ban_expires" timestamp;--> statement-breakpoint
UPDATE "user" SET "banned" = true, "ban_reason" = CASE WHEN "status" = 'deleted' THEN '账号已删除' ELSE '账号已禁用' END WHERE "status" IN ('disabled', 'deleted');--> statement-breakpoint
DELETE FROM "session" WHERE "user_id" IN (SELECT "id" FROM "user" WHERE "status" IN ('disabled', 'deleted'));
