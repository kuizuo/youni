CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_userId_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	`impersonated_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_userId_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`handle` text,
	`bio` text,
	`gender` text DEFAULT 'unknown' NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`banned` integer DEFAULT false NOT NULL,
	`ban_reason` text,
	`ban_expires` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `user_handle_unique` ON `user` (`handle`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);--> statement-breakpoint
CREATE TABLE `direct_conversation` (
	`id` text PRIMARY KEY NOT NULL,
	`member_key` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `direct_conversation_member_key_idx` ON `direct_conversation` (`member_key`);--> statement-breakpoint
CREATE INDEX `direct_conversation_updated_idx` ON `direct_conversation` (`updated_at`);--> statement-breakpoint
CREATE TABLE `direct_conversation_participant` (
	`conversation_id` text NOT NULL,
	`user_id` text NOT NULL,
	`last_read_at` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`conversation_id`, `user_id`),
	FOREIGN KEY (`conversation_id`) REFERENCES `direct_conversation`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `direct_conversation_participant_user_idx` ON `direct_conversation_participant` (`user_id`,`updated_at`);--> statement-breakpoint
CREATE TABLE `direct_message` (
	`id` text PRIMARY KEY NOT NULL,
	`conversation_id` text NOT NULL,
	`sender_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`conversation_id`) REFERENCES `direct_conversation`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sender_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `direct_message_conversation_created_idx` ON `direct_message` (`conversation_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `direct_message_sender_idx` ON `direct_message` (`sender_id`);--> statement-breakpoint
CREATE TABLE `comment` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comment_note_idx` ON `comment` (`note_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `note` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`cover` text,
	`location_name` text,
	`visibility` text DEFAULT 'public' NOT NULL,
	`components` text DEFAULT '[]' NOT NULL,
	`advanced_options` text DEFAULT '{"allowComment":true,"allowShare":true,"isOriginal":true}' NOT NULL,
	`status` text DEFAULT 'audit' NOT NULL,
	`rejection_reason` text,
	`published_at` integer,
	`draft_saved_at` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_status_created_idx` ON `note` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `note_user_idx` ON `note` (`user_id`);--> statement-breakpoint
CREATE INDEX `note_visibility_idx` ON `note` (`visibility`);--> statement-breakpoint
CREATE TABLE `note_collection` (
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`note_id`, `user_id`),
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_collection_user_created_idx` ON `note_collection` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `note_like` (
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`note_id`, `user_id`),
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_like_user_idx` ON `note_like` (`user_id`);--> statement-breakpoint
CREATE TABLE `note_topic` (
	`note_id` text NOT NULL,
	`topic_id` text NOT NULL,
	PRIMARY KEY(`note_id`, `topic_id`),
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`topic_id`) REFERENCES `topic`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_topic_topic_idx` ON `note_topic` (`topic_id`);--> statement-breakpoint
CREATE TABLE `note_view_history` (
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	`viewed_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`user_id`, `note_id`),
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_view_history_user_viewed_idx` ON `note_view_history` (`user_id`,`viewed_at`);--> statement-breakpoint
CREATE INDEX `note_view_history_note_idx` ON `note_view_history` (`note_id`);--> statement-breakpoint
CREATE TABLE `topic` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topic_name_idx` ON `topic` (`name`);--> statement-breakpoint
CREATE TABLE `follow` (
	`follower_id` text NOT NULL,
	`following_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`follower_id`, `following_id`),
	FOREIGN KEY (`follower_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`following_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `follow_following_idx` ON `follow` (`following_id`);--> statement-breakpoint
CREATE TABLE `notification` (
	`id` text PRIMARY KEY NOT NULL,
	`recipient_id` text NOT NULL,
	`actor_id` text,
	`type` text NOT NULL,
	`category` text NOT NULL,
	`title` text NOT NULL,
	`body` text NOT NULL,
	`target_type` text,
	`target_id` text,
	`note_id` text,
	`dedupe_key` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`is_deleted` integer DEFAULT false NOT NULL,
	`read_at` integer,
	`deleted_at` integer,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`recipient_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`actor_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `notification_recipient_created_idx` ON `notification` (`recipient_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `notification_recipient_category_idx` ON `notification` (`recipient_id`,`category`);--> statement-breakpoint
CREATE UNIQUE INDEX `notification_recipient_dedupe_idx` ON `notification` (`recipient_id`,`dedupe_key`);--> statement-breakpoint
CREATE TABLE `notification_push_token` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`token` text NOT NULL,
	`platform` text DEFAULT 'unknown' NOT NULL,
	`is_enabled` integer DEFAULT true NOT NULL,
	`last_seen_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `notification_push_token_token_idx` ON `notification_push_token` (`token`);--> statement-breakpoint
CREATE INDEX `notification_push_token_user_idx` ON `notification_push_token` (`user_id`);