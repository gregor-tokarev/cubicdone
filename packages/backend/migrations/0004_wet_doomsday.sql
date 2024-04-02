CREATE TABLE IF NOT EXISTS "project_status" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar NOT NULL,
	"icon" varchar
);
--> statement-breakpoint
ALTER TABLE "project" ADD COLUMN "status_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "project" ADD CONSTRAINT "project_status_id_project_status_id_fk" FOREIGN KEY ("status_id") REFERENCES "project_status"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
