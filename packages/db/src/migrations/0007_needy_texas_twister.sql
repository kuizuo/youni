ALTER TABLE `note` ADD `moderation_status` text DEFAULT 'not_started' NOT NULL;--> statement-breakpoint
ALTER TABLE `note` ADD `moderation_reason` text;--> statement-breakpoint
ALTER TABLE `note` ADD `moderation_details` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `note` ADD `moderated_at` integer;