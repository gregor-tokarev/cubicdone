ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "dateCreated" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar" text;
