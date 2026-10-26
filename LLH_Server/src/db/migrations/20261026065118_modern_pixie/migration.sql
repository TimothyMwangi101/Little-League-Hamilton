PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`userId` integer NOT NULL,
	`region` text DEFAULT NULL,
	`prefers` text DEFAULT (json_array()) NOT NULL,
	`goals` integer DEFAULT 0 NOT NULL,
	`assists` integer DEFAULT 0 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`teams` text DEFAULT (json_array()) NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_accounts`(`userId`, `region`, `prefers`, `goals`, `assists`, `wins`, `losses`, `teams`, `createdAt`) SELECT `userId`, `region`, `prefers`, `goals`, `assists`, `wins`, `losses`, `teams`, `createdAt` FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;