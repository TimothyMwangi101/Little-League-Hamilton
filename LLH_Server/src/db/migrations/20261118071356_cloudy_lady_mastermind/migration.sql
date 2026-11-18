PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_team_members` (
	`teamId` integer NOT NULL,
	`userId` integer NOT NULL,
	`joinedAt` text DEFAULT (CURRENT_DATE) NOT NULL,
	`role` text NOT NULL,
	CONSTRAINT `team_members_pk` PRIMARY KEY(`teamId`, `userId`),
	CONSTRAINT `fk_team_members_teamId_teams_id_fk` FOREIGN KEY (`teamId`) REFERENCES `teams`(`id`) ON DELETE CASCADE,
	CONSTRAINT `fk_team_members_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
INSERT INTO `__new_team_members`(`teamId`, `userId`, `joinedAt`, `role`) SELECT `teamId`, `userId`, `joinedAt`, `role` FROM `team_members`;--> statement-breakpoint
DROP TABLE `team_members`;--> statement-breakpoint
ALTER TABLE `__new_team_members` RENAME TO `team_members`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `team_members_user_idx` ON `team_members` (`userId`);--> statement-breakpoint
CREATE INDEX `team_members_team_idx` ON `team_members` (`teamId`);--> statement-breakpoint
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
  GROUP BY t.id;
;