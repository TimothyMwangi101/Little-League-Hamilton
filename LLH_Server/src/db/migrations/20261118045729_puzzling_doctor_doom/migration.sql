PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`userId` integer PRIMARY KEY,
	`firstName` text DEFAULT NULL,
	`lastName` text DEFAULT NULL,
	`region` text DEFAULT NULL,
	`prefers` text DEFAULT '[]' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_accounts`(`userId`, `firstName`, `lastName`, `region`, `prefers`, `createdAt`) SELECT `userId`, `firstName`, `lastName`, `region`, `prefers`, `createdAt` FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;