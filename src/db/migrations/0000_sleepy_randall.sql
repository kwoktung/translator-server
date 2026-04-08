CREATE TABLE `vocabulary` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`word` text NOT NULL,
	`phonetic` text,
	`meaning` text,
	`mnemonic` text,
	`example` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `vocabulary_user_word_idx` ON `vocabulary` (`user_id`,`word`);