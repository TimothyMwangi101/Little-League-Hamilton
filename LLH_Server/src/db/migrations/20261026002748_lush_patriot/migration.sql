PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`userId` integer NOT NULL,
	`region` text DEFAULT NULL,
	`prefers` text DEFAULT NULL,
	`goals` integer DEFAULT 0,
	`assists` integer DEFAULT 0,
	`wins` integer DEFAULT 0,
	`losses` integer DEFAULT 0,
	`teams` text DEFAULT NULL,
	CONSTRAINT `fk_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_accounts`(`userId`, `region`, `prefers`, `goals`, `assists`, `wins`, `losses`, `teams`) SELECT `userId`, `region`, `prefers`, `goals`, `assists`, `wins`, `losses`, `teams` FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;