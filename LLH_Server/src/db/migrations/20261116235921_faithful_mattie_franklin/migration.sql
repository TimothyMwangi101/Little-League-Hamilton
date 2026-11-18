PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_accounts` (
	`userId` integer PRIMARY KEY,
	`firstName` text DEFAULT NULL,
	`lastName` text DEFAULT NULL,
	`region` text DEFAULT NULL,
	`prefers` text DEFAULT (json_array()) NOT NULL,
	`goals` integer DEFAULT 0 NOT NULL,
	`assists` integer DEFAULT 0 NOT NULL,
	`wins` integer DEFAULT 0 NOT NULL,
	`losses` integer DEFAULT 0 NOT NULL,
	`team` integer DEFAULT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_accounts_team_teams_id_fk` FOREIGN KEY (`team`) REFERENCES `teams`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_accounts`(`userId`, `firstName`, `lastName`, `region`, `prefers`, `goals`, `assists`, `wins`, `losses`, `team`, `createdAt`) SELECT `userId`, `firstName`, `lastName`, `region`, `prefers`, `goals`, `assists`, `wins`, `losses`, `team`, `createdAt` FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`coCaptainId` integer,
	`captainId` integer NOT NULL,
	`name` text NOT NULL UNIQUE,
	`invitePolicy` text DEFAULT 'Open' NOT NULL,
	`sport` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_teams_coCaptainId_users_id_fk` FOREIGN KEY (`coCaptainId`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_teams_captainId_users_id_fk` FOREIGN KEY (`captainId`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_teams`(`id`, `coCaptainId`, `captainId`, `name`, `invitePolicy`, `sport`, `createdAt`) SELECT `id`, `coCaptainId`, `captainId`, `name`, `invitePolicy`, `sport`, `createdAt` FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
PRAGMA foreign_keys=ON;