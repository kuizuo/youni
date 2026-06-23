CREATE TYPE "public"."note_visibility" AS ENUM('public', 'followers', 'private');--> statement-breakpoint
ALTER TYPE "public"."note_status" ADD VALUE 'draft' BEFORE 'audit';--> statement-breakpoint
ALTER TABLE "note" ALTER COLUMN "cover" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "location_name" text;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "visibility" "note_visibility" DEFAULT 'public' NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "components" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "advanced_options" jsonb DEFAULT '{"allowComment":true,"allowShare":true,"isOriginal":true}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "note" ADD COLUMN "draft_saved_at" timestamp;--> statement-breakpoint
CREATE INDEX "note_visibility_idx" ON "note" USING btree ("visibility");