CREATE TABLE `comment_like` (
	`comment_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`comment_id`, `user_id`),
	FOREIGN KEY (`comment_id`) REFERENCES `comment`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `comment_like_user_idx` ON `comment_like` (`user_id`);--> statement-breakpoint
ALTER TABLE `comment` ADD `parent_id` text;--> statement-breakpoint
CREATE INDEX `comment_parent_idx` ON `comment` (`parent_id`,`created_at`);