CREATE TABLE `direct_message_user_deletion` (
	`message_id` text NOT NULL,
	`user_id` text NOT NULL,
	`deleted_at` integer DEFAULT (cast((julianday('now') - 2440587.5)*86400000 as integer)) NOT NULL,
	PRIMARY KEY(`message_id`, `user_id`),
	FOREIGN KEY (`message_id`) REFERENCES `direct_message`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `direct_message_user_deletion_user_idx` ON `direct_message_user_deletion` (`user_id`,`message_id`);--> statement-breakpoint
DROP INDEX `direct_message_conversation_created_idx`;--> statement-breakpoint
CREATE INDEX `direct_message_conversation_created_idx` ON `direct_message` (`conversation_id`,`created_at`,`id`);--> statement-breakpoint
ALTER TABLE `direct_conversation_participant` ADD `last_read_message_id` text REFERENCES direct_message(id) ON DELETE SET NULL;--> statement-breakpoint
ALTER TABLE `direct_conversation_participant` ADD `cleared_through_message_id` text REFERENCES direct_message(id) ON DELETE SET NULL;--> statement-breakpoint
UPDATE `direct_conversation_participant`
SET `last_read_message_id` = (
	SELECT `direct_message`.`id`
	FROM `direct_message`
	WHERE `direct_message`.`conversation_id` = `direct_conversation_participant`.`conversation_id`
		AND `direct_conversation_participant`.`last_read_at` IS NOT NULL
		AND `direct_message`.`created_at` <= `direct_conversation_participant`.`last_read_at`
	ORDER BY `direct_message`.`created_at` DESC, `direct_message`.`id` DESC
	LIMIT 1
);--> statement-breakpoint
UPDATE `direct_conversation_participant`
SET `cleared_through_message_id` = (
	SELECT `direct_message`.`id`
	FROM `direct_message`
	WHERE `direct_message`.`conversation_id` = `direct_conversation_participant`.`conversation_id`
		AND `direct_conversation_participant`.`cleared_at` IS NOT NULL
		AND `direct_message`.`created_at` <= `direct_conversation_participant`.`cleared_at`
	ORDER BY `direct_message`.`created_at` DESC, `direct_message`.`id` DESC
	LIMIT 1
);--> statement-breakpoint
ALTER TABLE `direct_conversation_participant` DROP COLUMN `last_read_at`;--> statement-breakpoint
ALTER TABLE `direct_conversation_participant` DROP COLUMN `cleared_at`;
