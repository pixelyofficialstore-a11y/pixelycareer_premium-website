-- updated_at is set by the database on every update. Everything stays inside the website schema.
CREATE OR REPLACE FUNCTION "website"."set_updated_at"() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;--> statement-breakpoint
CREATE TRIGGER "orders_updated_at" BEFORE UPDATE ON "website"."orders" FOR EACH ROW EXECUTE FUNCTION "website"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "calls_updated_at" BEFORE UPDATE ON "website"."calls" FOR EACH ROW EXECUTE FUNCTION "website"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "cv_reviews_updated_at" BEFORE UPDATE ON "website"."cv_reviews" FOR EACH ROW EXECUTE FUNCTION "website"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "partners_updated_at" BEFORE UPDATE ON "website"."partners" FOR EACH ROW EXECUTE FUNCTION "website"."set_updated_at"();--> statement-breakpoint
CREATE TRIGGER "events_updated_at" BEFORE UPDATE ON "website"."events" FOR EACH ROW EXECUTE FUNCTION "website"."set_updated_at"();--> statement-breakpoint
-- RLS is on with no policies, and the API roles get no access to this schema at all.
REVOKE ALL ON SCHEMA "website" FROM anon, authenticated;--> statement-breakpoint
REVOKE ALL ON ALL TABLES IN SCHEMA "website" FROM anon, authenticated;
