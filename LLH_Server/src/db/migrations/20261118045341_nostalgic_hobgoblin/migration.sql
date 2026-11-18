CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`salt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`userId` integer PRIMARY KEY,
	`firstName` text DEFAULT NULL,
	`lastName` text DEFAULT NULL,
	`region` text DEFAULT NULL,
	`prefers` text DEFAULT (json_array()) NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `teams` (
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
CREATE TABLE `matches` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`challengerId` integer NOT NULL,
	`opponentId` integer NOT NULL,
	`sport` text NOT NULL,
	`status` text DEFAULT 'Pending' NOT NULL,
	`matchDate` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	`challengerScore` integer,
	`opponentScore` integer,
	CONSTRAINT `fk_matches_challengerId_teams_id_fk` FOREIGN KEY (`challengerId`) REFERENCES `teams`(`id`),
	CONSTRAINT `fk_matches_opponentId_teams_id_fk` FOREIGN KEY (`opponentId`) REFERENCES `teams`(`id`),
	CONSTRAINT "no dups" CHECK("challengerId" <> "opponentId")
);
--> statement-breakpoint
CREATE TABLE `team_members` (
	`teamId` integer NOT NULL,
	`userId` integer NOT NULL,
	`joinedAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	`role` text DEFAULT 'Member' NOT NULL,
	CONSTRAINT `team_members_pk` PRIMARY KEY(`teamId`, `userId`),
	CONSTRAINT `fk_team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
CREATE TABLE `match_players` (
	`matchId` integer NOT NULL,
	`userId` integer NOT NULL,
	`teamId` integer NOT NULL,
	`goals` integer DEFAULT 0 NOT NULL,
	`assists` integer DEFAULT 0 NOT NULL,
	CONSTRAINT `match_players_pk` PRIMARY KEY(`matchId`, `userId`),
	CONSTRAINT `fk_match_players_matchId_matches_id_fk` FOREIGN KEY (`matchId`) REFERENCES `matches`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_match_players_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_match_players_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`),
	CONSTRAINT "match_players_non_negative" CHECK("goals" >= 0 AND "assists" >= 0)
);
--> statement-breakpoint
CREATE INDEX `match_players_user_idx` ON `match_players` (`userId`);