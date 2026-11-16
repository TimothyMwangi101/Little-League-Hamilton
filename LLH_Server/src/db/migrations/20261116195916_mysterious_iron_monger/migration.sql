PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`coCaptainId` integer,
	`captainId` integer NOT NULL,
	`name` text NOT NULL UNIQUE,
	`invitePolicy` text DEFAULT 'Open' NOT NULL,
	`sport` text DEFAULT 'Basketball' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_teams_coCaptainId_users_id_fk` FOREIGN KEY (`coCaptainId`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_teams_captainId_users_id_fk` FOREIGN KEY (`captainId`) REFERENCES `users`(`id`)
);
--> statement-breakpoint
INSERT INTO `__new_teams`(`id`, `coCaptainId`, `captainId`, `name`, `invitePolicy`, `sport`, `createdAt`) SELECT `id`, `coCaptainId`, `captainId`, `name`, `invitePolicy`, `sport`, `createdAt` FROM `teams`;--> statement-breakpoint
DROP TABLE `teams`;--> statement-breakpoint
ALTER TABLE `__new_teams` RENAME TO `teams`;--> statement-breakpoint
PRAGMA foreign_keys=ON;