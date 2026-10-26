ALTER TABLE `accounts` ADD `createdAt` text DEFAULT (CURRENT_DATE);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `createdAt`;