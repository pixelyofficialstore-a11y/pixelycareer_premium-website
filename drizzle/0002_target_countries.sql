ALTER TABLE "website"."orders" ADD COLUMN IF NOT EXISTS "target_countries" text[];--> statement-breakpoint
ALTER TABLE "website"."cv_reviews" ADD COLUMN IF NOT EXISTS "target_countries" text[];
