CREATE TABLE IF NOT EXISTS "apikeys" (
	"id" varchar PRIMARY KEY NOT NULL,
	"label" varchar NOT NULL,
	"key" varchar NOT NULL,
	"integrationId" varchar NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "drafts" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar NOT NULL,
	"dateCreated" timestamp DEFAULT now(),
	"dateUpdated" timestamp,
	"order" integer,
	"projectId" varchar
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "project" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" varchar,
	"color" varchar,
	"order" integer
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "task" (
	"id" varchar PRIMARY KEY NOT NULL,
	"draftId" varchar,
	"title" varchar,
	"status" varchar,
	"order" integer,
	"dateCreated" timestamp DEFAULT now(),
	"dateUpdated" timestamp,
	"dateCommitted" varchar,
	"dateCompleted" varchar,
	"dateTodo" varchar,
	"projectId" varchar
);
