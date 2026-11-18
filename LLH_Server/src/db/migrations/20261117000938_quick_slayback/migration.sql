CREATE TABLE `team_members` (
	`teamId` integer,
	`userId` integer NOT NULL,
	`joinedAt` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	CONSTRAINT `team_members_pk` PRIMARY KEY(`teamId`, `userId`),
	CONSTRAINT `fk_team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
