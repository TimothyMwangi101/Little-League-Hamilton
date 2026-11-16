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
	CONSTRAINT `fk_matches_opponentId_teams_id_fk` FOREIGN KEY (`opponentId`) REFERENCES `teams`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_matches`(`id`, `challengerId`, `opponentId`, `sport`, `status`, `matchDate`, `createdAt`) SELECT `id`, `challengerId`, `opponentId`, `sport`, `status`, `matchDate`, `createdAt` FROM `matches`;--> statement-breakpoint
DROP TABLE `matches`;--> statement-breakpoint
ALTER TABLE `__new_matches` RENAME TO `matches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;