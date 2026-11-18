DROP VIEW `team_records`;--> statement-breakpoint
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