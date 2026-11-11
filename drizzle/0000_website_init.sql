CREATE SCHEMA IF NOT EXISTS "website";
--> statement-breakpoint
CREATE TYPE "website"."call_status" AS ENUM('requested', 'confirmed', 'completed', 'no_show', 'cancelled');--> statement-breakpoint
CREATE TYPE "website"."order_status" AS ENUM('cart', 'abandoned', 'new', 'payment_submitted', 'paid', 'in_progress', 'delivered', 'refunded', 'cancelled');--> statement-breakpoint
CREATE TYPE "website"."partner_status" AS ENUM('new', 'contacted', 'trial', 'active', 'lost');--> statement-breakpoint
CREATE TYPE "website"."cv_review_status" AS ENUM('new', 'in_review', 'sent', 'converted');--> statement-breakpoint
CREATE TABLE "website"."calls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"market" text,
	"country" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"fbclid" text,
	"gclid" text,
	"fbp" text,
	"fbc" text,
	"landing_page" text,
	"referrer" text,
	"client_ip" text,
	"user_agent" text,
	"assigned_to" text,
	"internal_notes" text,
	"status" "website"."call_status" DEFAULT 'requested' NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text,
	"preferred_date" text,
	"preferred_time" text,
	"timezone" text,
	"target_role" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "website"."calls" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "website"."cv_reviews" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"market" text,
	"country" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"fbclid" text,
	"gclid" text,
	"fbp" text,
	"fbc" text,
	"landing_page" text,
	"referrer" text,
	"client_ip" text,
	"user_agent" text,
	"assigned_to" text,
	"internal_notes" text,
	"status" "website"."cv_review_status" DEFAULT 'new' NOT NULL,
	"name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"email" text,
	"target_role" text,
	"target_country" text,
	"cv_url" text,
	"cv_public_id" text,
	"cv_filename" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "website"."cv_reviews" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "website"."events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"market" text,
	"country" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"fbclid" text,
	"gclid" text,
	"fbp" text,
	"fbc" text,
	"landing_page" text,
	"referrer" text,
	"client_ip" text,
	"user_agent" text,
	"assigned_to" text,
	"internal_notes" text,
	"status" text DEFAULT 'recorded' NOT NULL,
	"session_id" text,
	"order_id" uuid,
	"name" text NOT NULL,
	"value" numeric,
	"currency" text,
	"page" text,
	"meta" jsonb DEFAULT '{}'::jsonb NOT NULL
);
--> statement-breakpoint
ALTER TABLE "website"."events" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "website"."orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"market" text,
	"country" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"fbclid" text,
	"gclid" text,
	"fbp" text,
	"fbc" text,
	"landing_page" text,
	"referrer" text,
	"client_ip" text,
	"user_agent" text,
	"assigned_to" text,
	"internal_notes" text,
	"status" "website"."order_status" DEFAULT 'cart' NOT NULL,
	"package" text NOT NULL,
	"package_price" integer NOT NULL,
	"addons" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"same_day" boolean DEFAULT false NOT NULL,
	"offer" text,
	"is_bundle" boolean DEFAULT false NOT NULL,
	"pay_choice" text,
	"discount" integer DEFAULT 0 NOT NULL,
	"subtotal" integer NOT NULL,
	"total" integer NOT NULL,
	"currency" text NOT NULL,
	"name" text,
	"whatsapp" text,
	"email" text,
	"target_country" text,
	"target_role" text,
	"notes" text,
	"cv_url" text,
	"cv_public_id" text,
	"payment_method" text,
	"payment_screenshot_url" text,
	"payment_screenshot_public_id" text,
	"transaction_id" text,
	"step_reached" integer DEFAULT 1 NOT NULL,
	"last_activity_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" text,
	"paid_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "website"."orders" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "website"."partners" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"market" text,
	"country" text,
	"utm_source" text,
	"utm_medium" text,
	"utm_campaign" text,
	"utm_content" text,
	"utm_term" text,
	"fbclid" text,
	"gclid" text,
	"fbp" text,
	"fbc" text,
	"landing_page" text,
	"referrer" text,
	"client_ip" text,
	"user_agent" text,
	"assigned_to" text,
	"internal_notes" text,
	"status" "website"."partner_status" DEFAULT 'new' NOT NULL,
	"org_name" text NOT NULL,
	"org_type" text,
	"contact_name" text NOT NULL,
	"designation" text,
	"whatsapp" text NOT NULL,
	"email" text,
	"country_hq" text,
	"destinations" text,
	"monthly_volume" text,
	"model" text,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "website"."partners" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE INDEX "calls_status_idx" ON "website"."calls" USING btree ("status");--> statement-breakpoint
CREATE INDEX "calls_created_at_idx" ON "website"."calls" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "calls_whatsapp_idx" ON "website"."calls" USING btree ("whatsapp");--> statement-breakpoint
CREATE INDEX "cv_reviews_status_idx" ON "website"."cv_reviews" USING btree ("status");--> statement-breakpoint
CREATE INDEX "cv_reviews_created_at_idx" ON "website"."cv_reviews" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "cv_reviews_whatsapp_idx" ON "website"."cv_reviews" USING btree ("whatsapp");--> statement-breakpoint
CREATE INDEX "events_status_idx" ON "website"."events" USING btree ("status");--> statement-breakpoint
CREATE INDEX "events_created_at_idx" ON "website"."events" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "events_name_idx" ON "website"."events" USING btree ("name");--> statement-breakpoint
CREATE INDEX "orders_status_idx" ON "website"."orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "orders_created_at_idx" ON "website"."orders" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "orders_whatsapp_idx" ON "website"."orders" USING btree ("whatsapp");--> statement-breakpoint
CREATE INDEX "partners_status_idx" ON "website"."partners" USING btree ("status");--> statement-breakpoint
CREATE INDEX "partners_created_at_idx" ON "website"."partners" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "partners_whatsapp_idx" ON "website"."partners" USING btree ("whatsapp");