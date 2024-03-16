ALTER TABLE "drafts" ALTER COLUMN "dateCreated" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "drafts" ALTER COLUMN "dateCreated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "drafts" ALTER COLUMN "dateUpdated" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "dateCreated" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "dateCreated" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "task" ALTER COLUMN "dateUpdated" SET DATA TYPE varchar;