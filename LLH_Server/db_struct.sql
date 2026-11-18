CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`salt` text NOT NULL
);

CREATE TABLE `accounts` (
	`userId` integer PRIMARY KEY,
	`firstName` text DEFAULT NULL,
	`lastName` text DEFAULT NULL,
	`region` text DEFAULT NULL,
	`prefers` text DEFAULT '[]' NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	CONSTRAINT `fk_accounts_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

CREATE TABLE `teams` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`name` text NOT NULL UNIQUE,
	`invitePolicy` text NOT NULL,
	`sport` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL
);

CREATE TABLE `matches` (
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

CREATE TABLE `team_members` (
	`teamId` integer NOT NULL,
	`userId` integer NOT NULL,
	`joinedAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	`role` text NOT NULL,
	CONSTRAINT `team_members_pk` PRIMARY KEY(`teamId`, `userId`),
	CONSTRAINT `fk_team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);

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

CREATE INDEX `matches_challenger_idx` ON `matches` (`challengerId`);
CREATE INDEX `matches_opponent_idx` ON `matches` (`opponentId`);
CREATE INDEX `team_members_user_idx` ON `team_members` (`userId`);
CREATE INDEX `team_members_team_idx` ON `team_members` (`teamId`);
CREATE INDEX `match_players_user_idx` ON `match_players` (`userId`);
CREATE VIEW `team_records` AS 
  SELECT
    t.id AS teamId,
    COALESCE(SUM(r.win), 0)  AS wins,
    COALESCE(SUM(r.loss), 0) AS losses,
    COALESCE(SUM(r.draw), 0) AS draws
  FROM teams t
  LEFT JOIN (
    SELECT 
      challengerId AS teamId,
      challengerScore > opponentScore AS win,
      challengerScore < opponentScore AS loss,
      challengerScore = opponentScore AS draw
    FROM matches WHERE status = 'Completed'
    UNION ALL
    SELECT 
      opponentId,
      opponentScore > challengerScore,
      opponentScore < challengerScore,
      opponentScore = challengerScore
    FROM matches WHERE status = 'Completed'
  ) r ON r.teamId = t.id
  GROUP BY t.id;;
