ALTER TABLE "website"."orders" ADD COLUMN IF NOT EXISTS "lead_event_id" text;--> statement-breakpoint
ALTER TABLE "website"."orders" ADD COLUMN IF NOT EXISTS "event_source_url" text;
