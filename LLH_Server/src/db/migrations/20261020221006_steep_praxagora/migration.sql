CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT,
	`email` text(70) NOT NULL UNIQUE,
	`password` text(30) NOT NULL,
	`createdAt` text DEFAULT (CURRENT_DATE) NOT NULL
);
