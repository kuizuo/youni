CREATE TABLE `note_not_interested` (
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`note_id`, `user_id`),
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_not_interested_user_created_idx` ON `note_not_interested` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `recommendation_daily_metric` (
	`day` text PRIMARY KEY NOT NULL,
	`impression_count` integer DEFAULT 0 NOT NULL,
	`open_count` integer DEFAULT 0 NOT NULL,
	`like_count` integer DEFAULT 0 NOT NULL,
	`collect_count` integer DEFAULT 0 NOT NULL,
	`not_interested_count` integer DEFAULT 0 NOT NULL,
	`block_author_count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL
);
--> statement-breakpoint
CREATE INDEX `recommendation_daily_metric_day_idx` ON `recommendation_daily_metric` (`day`);--> statement-breakpoint
CREATE TABLE `recommendation_event` (
	`id` text PRIMARY KEY NOT NULL,
	`impression_id` text NOT NULL,
	`type` text NOT NULL,
	`position` integer,
	`occurred_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`note_id` text NOT NULL,
	`user_id` text NOT NULL,
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recommendation_event_impression_type_idx` ON `recommendation_event` (`impression_id`,`type`);--> statement-breakpoint
CREATE INDEX `recommendation_event_user_occurred_idx` ON `recommendation_event` (`user_id`,`occurred_at`);--> statement-breakpoint
CREATE INDEX `recommendation_event_note_type_idx` ON `recommendation_event` (`note_id`,`type`);--> statement-breakpoint
CREATE INDEX `recommendation_event_occurred_idx` ON `recommendation_event` (`occurred_at`);--> statement-breakpoint
CREATE TABLE `search_keyword_control` (
	`keyword` text PRIMARY KEY NOT NULL,
	`excluded` integer DEFAULT false NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	`updated_by` text,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `search_keyword_daily` (
	`day` text NOT NULL,
	`keyword` text NOT NULL,
	`display_keyword` text NOT NULL,
	`total_count` integer DEFAULT 0 NOT NULL,
	`successful_count` integer DEFAULT 0 NOT NULL,
	`typed_count` integer DEFAULT 0 NOT NULL,
	`history_count` integer DEFAULT 0 NOT NULL,
	`recommended_count` integer DEFAULT 0 NOT NULL,
	`external_count` integer DEFAULT 0 NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`day`, `keyword`)
);
--> statement-breakpoint
CREATE INDEX `search_keyword_daily_day_idx` ON `search_keyword_daily` (`day`);--> statement-breakpoint
CREATE INDEX `search_keyword_daily_keyword_idx` ON `search_keyword_daily` (`keyword`);