CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`salt` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `accounts` (
	`userId` integer NOT NULL,
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
CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`coCaptainId` integer,
	`captainId` integer NOT NULL,
	`name` text NOT NULL UNIQUE,
	`invitePolicy` text DEFAULT 'Open' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_teams_coCaptainId_users_id_fk` FOREIGN KEY (`coCaptainId`) REFERENCES `users`(`id`),
	CONSTRAINT `fk_teams_captainId_users_id_fk` FOREIGN KEY (`captainId`) REFERENCES `users`(`id`)
);
