CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`key` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_idx` ON `api_keys` (`key`);--> statement-breakpoint
CREATE INDEX `api_keys_user_created_idx` ON `api_keys` (`user_id`,`created_at`);--> statement-breakpoint
CREATE TABLE `vocabulary` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`word` text NOT NULL,
	`phonetic` text,
	`meaning` text,
	`mnemonic` text,
	`example` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vocabulary_user_word_idx` ON `vocabulary` (`user_id`,`word`);--> statement-breakpoint
CREATE TABLE `writing_turns` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` text NOT NULL,
	`original` text NOT NULL,
	`revised` text NOT NULL,
	`suggestions` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `writing_turns_user_created_idx` ON `writing_turns` (`user_id`,`created_at`);