ALTER TABLE "public"."scrape_queue" ADD COLUMN IF NOT EXISTS "website" text;
ALTER TABLE "public"."scrape_queue" ADD COLUMN IF NOT EXISTS "notes" text;

ALTER TABLE "public"."scrape_queue" DROP CONSTRAINT IF EXISTS "scrape_queue_status_check";
ALTER TABLE "public"."scrape_queue" ADD CONSTRAINT "scrape_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'in_progress'::"text", 'completed'::"text", 'failed'::"text", 'website_inactive'::"text"])));
