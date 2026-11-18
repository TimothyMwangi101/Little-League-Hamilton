PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`challengerId` integer NOT NULL,
	`opponentId` integer NOT NULL,
	`sport` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`matchDate` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_matches_challengerId_teams_id_fk` FOREIGN KEY (`challengerId`) REFERENCES `teams`(`id`),
	CONSTRAINT `fk_matches_opponentId_teams_id_fk` FOREIGN KEY (`opponentId`) REFERENCES `teams`(`id`),
	CONSTRAINT "no dups" CHECK(check("challengerId" <> "opponentId"))
);
--> statement-breakpoint
INSERT INTO `__new_matches`(`id`, `challengerId`, `opponentId`, `sport`, `status`, `matchDate`, `createdAt`) SELECT `id`, `challengerId`, `opponentId`, `sport`, `status`, `matchDate`, `createdAt` FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
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
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_accounts`(`userId`, `firstName`, `lastName`, `region`, `prefers`, `goals`, `assists`, `wins`, `losses`, `createdAt`) SELECT `userId`, `firstName`, `lastName`, `region`, `prefers`, `goals`, `assists`, `wins`, `losses`, `createdAt` FROM `accounts`;--> statement-breakpoint
DROP TABLE `accounts`;--> statement-breakpoint
ALTER TABLE `__new_accounts` RENAME TO `accounts`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_team_members` (
	`teamId` integer NOT NULL,
	`userId` integer NOT NULL,
	`joinedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	CONSTRAINT `team_members_pk` PRIMARY KEY(`teamId`, `userId`),
	CONSTRAINT `fk_team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_team_members`(`teamId`, `userId`, `joinedAt`) SELECT `teamId`, `userId`, `joinedAt` FROM `team_members`;--> statement-breakpoint
DROP TABLE `team_members`;--> statement-breakpoint
ALTER TABLE `__new_team_members` RENAME TO `team_members`;--> statement-breakpoint
PRAGMA foreign_keys=ON;