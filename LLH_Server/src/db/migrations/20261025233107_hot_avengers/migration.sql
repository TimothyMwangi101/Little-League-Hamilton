CREATE TABLE `accounts` (
	`userId` integer NOT NULL,
	`region` text DEFAULT 'Downtown Hamilton',
	`prefers` text DEFAULT NULL,
	`goals` integer DEFAULT 0,
	`assists` integer DEFAULT 0,
	`wins` integer DEFAULT 0,
	`losses` integer DEFAULT 0,
	`teams` text DEFAULT NULL,
	CONSTRAINT `fk_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
DROP TABLE `api_keys`;