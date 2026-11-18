PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`invitePolicy` text NOT NULL,
	`sport` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_teams`(`id`, `name`, `invitePolicy`, `sport`, `createdAt`) SELECT `id`, `name`, `invitePolicy`, `sport`, `createdAt` FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`challengerId` integer NOT NULL,
	`opponentId` integer NOT NULL,
	`sport` text NOT NULL,
	`status` text NOT NULL,
	`matchDate` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	`challengerScore` integer,
	`opponentScore` integer,
	CONSTRAINT `fk_matches_challengerId_teams_id_fk` FOREIGN KEY (`challengerId`) REFERENCES `teams`(`id`),
	CONSTRAINT `fk_matches_opponentId_teams_id_fk` FOREIGN KEY (`opponentId`) REFERENCES `teams`(`id`),
	CONSTRAINT "no dups" CHECK("challengerId" <> "opponentId"),
	CONSTRAINT "matches_scores_non_negative" CHECK("challengerScore" >= 0 AND "opponentScore" >= 0),
	CONSTRAINT "matches_completed_has_scores" CHECK("status" <> 'Completed' OR ("challengerScore" IS NOT NULL AND "opponentScore" IS NOT NULL))
);
--> statement-breakpoint
INSERT INTO `__new_matches`(`id`, `challengerId`, `opponentId`, `sport`, `status`, `matchDate`, `createdAt`, `challengerScore`, `opponentScore`) SELECT `id`, `challengerId`, `opponentId`, `sport`, `status`, `matchDate`, `createdAt`, `challengerScore`, `opponentScore` FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `matches_challenger_idx` ON `matches` (`challengerId`);--> statement-breakpoint
CREATE INDEX `matches_opponent_idx` ON `matches` (`opponentId`);