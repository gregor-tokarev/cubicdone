ALTER TABLE "apikeys" ADD COLUMN "authorId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "drafts" ADD COLUMN "authorId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "authorId" varchar NOT NULL;--> statement-breakpoint
ALTER TABLE "task" ADD COLUMN "authorId" varchar NOT NULL;