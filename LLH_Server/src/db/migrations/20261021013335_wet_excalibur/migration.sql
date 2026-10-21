CREATE TABLE `api_keys` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`userId` integer NOT NULL,
	`name` text NOT NULL,
	`keyHash` text NOT NULL,
	`keyPrefix` text(8) NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE),
	CONSTRAINT `fk_api_keys_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text NOT NULL UNIQUE,
	`password` text NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE)
);
--> statement-breakpoint
INSERT INTO `__new_users`(`id`, `email`, `password`, `createdAt`) SELECT `id`, `email`, `password`, `createdAt` FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;