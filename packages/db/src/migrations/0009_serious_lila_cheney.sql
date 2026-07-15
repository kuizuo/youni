CREATE TABLE `note_view_count_state` (
	`note_id` text NOT NULL,
	`viewer_key` text NOT NULL,
	`last_counted_day` text NOT NULL,
	`updated_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`note_id`, `viewer_key`),
	FOREIGN KEY (`note_id`) REFERENCES `note`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `note_view_count_state_viewer_idx` ON `note_view_count_state` (`viewer_key`);--> statement-breakpoint
ALTER TABLE `note` ADD `view_count` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
CREATE TRIGGER `note_view_count_state_insert`
AFTER INSERT ON `note_view_count_state`
BEGIN
	UPDATE `note`
	SET `view_count` = `view_count` + 1
	WHERE `id` = NEW.`note_id`;
END;--> statement-breakpoint
CREATE TRIGGER `note_view_count_state_new_day`
AFTER UPDATE OF `last_counted_day` ON `note_view_count_state`
WHEN OLD.`last_counted_day` <> NEW.`last_counted_day`
BEGIN
	UPDATE `note`
	SET `view_count` = `view_count` + 1
	WHERE `id` = NEW.`note_id`;
END;
