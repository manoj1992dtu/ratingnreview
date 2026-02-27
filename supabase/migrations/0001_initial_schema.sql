


SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."update_scrape_queue_updated_at"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_scrape_queue_updated_at"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."admin_users" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" DEFAULT 'moderator'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    CONSTRAINT "admin_users_role_check" CHECK (("role" = ANY (ARRAY['super_admin'::"text", 'moderator'::"text"])))
);


ALTER TABLE "public"."admin_users" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."companies" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "industry" "text",
    "headquarters" "text",
    "employee_count" "text",
    "website" "text",
    "logo_url" "text",
    "description" "text",
    "overall_review" "text",
    "avg_rating" numeric(3,2) DEFAULT 0,
    "review_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "ceo_name" "text",
    "founded_year" integer,
    "company_type" "text",
    "revenue" "text",
    "status" "text" DEFAULT 'draft'::"text",
    "published_at" timestamp with time zone,
    "city" "text",
    "state" "text",
    "country" "text",
    "competitors" "text"[] DEFAULT '{}'::"text"[],
    "india_presence" "text" DEFAULT 'indian_company'::"text",
    "india_headquarters" "text",
    "india_employee_count" "text",
    CONSTRAINT "companies_india_presence_check" CHECK (("india_presence" = ANY (ARRAY['indian_company'::"text", 'india_office'::"text", 'no_india_presence'::"text"]))),
    CONSTRAINT "companies_status_check" CHECK (("status" = ANY (ARRAY['draft'::"text", 'published'::"text", 'archived'::"text"])))
);


ALTER TABLE "public"."companies" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_industries" (
    "company_id" "uuid" NOT NULL,
    "industry_id" "uuid" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "is_active" boolean DEFAULT true
);


ALTER TABLE "public"."company_industries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_reviews" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "is_anonymous" boolean DEFAULT true,
    "overall_rating" integer NOT NULL,
    "work_life_balance" integer,
    "salary" integer,
    "promotions" integer,
    "job_security" integer,
    "skill_development" integer,
    "work_satisfaction" integer,
    "company_culture" integer,
    "designation" "text",
    "department" "text",
    "employment_type" "text",
    "likes" "text",
    "dislikes" "text",
    "content" "text",
    "status" "text" DEFAULT 'pending_validation'::"text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "published_at" timestamp with time zone,
    "helpful_count" integer DEFAULT 0,
    "likes_count" integer DEFAULT 0,
    "dislikes_count" integer DEFAULT 0,
    "source" "text" DEFAULT 'ai_generated'::"text",
    "is_active" boolean DEFAULT true,
    CONSTRAINT "company_reviews_source_check" CHECK (("source" = ANY (ARRAY['ai_generated'::"text", 'user_submitted'::"text"]))),
    CONSTRAINT "reviews_company_culture_check" CHECK ((("company_culture" >= 1) AND ("company_culture" <= 5))),
    CONSTRAINT "reviews_job_security_check" CHECK ((("job_security" >= 1) AND ("job_security" <= 5))),
    CONSTRAINT "reviews_overall_rating_check" CHECK ((("overall_rating" >= 1) AND ("overall_rating" <= 5))),
    CONSTRAINT "reviews_promotions_check" CHECK ((("promotions" >= 1) AND ("promotions" <= 5))),
    CONSTRAINT "reviews_salary_check" CHECK ((("salary" >= 1) AND ("salary" <= 5))),
    CONSTRAINT "reviews_skill_development_check" CHECK ((("skill_development" >= 1) AND ("skill_development" <= 5))),
    CONSTRAINT "reviews_status_check" CHECK (("status" = ANY (ARRAY['pending_validation'::"text", 'approved'::"text", 'rejected'::"text", 'published'::"text", 'pending'::"text"]))),
    CONSTRAINT "reviews_work_life_balance_check" CHECK ((("work_life_balance" >= 1) AND ("work_life_balance" <= 5))),
    CONSTRAINT "reviews_work_satisfaction_check" CHECK ((("work_satisfaction" >= 1) AND ("work_satisfaction" <= 5)))
);


ALTER TABLE "public"."company_reviews" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."company_salaries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    "department" "text",
    "salary_min" bigint,
    "salary_max" bigint,
    "salary_avg" bigint,
    "currency" "text" DEFAULT 'INR'::"text",
    "experience_years" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "location" "text",
    "skills_required" "text"[] DEFAULT '{}'::"text"[],
    "status" "text" DEFAULT 'pending'::"text",
    "published_at" timestamp with time zone,
    "source" "text" DEFAULT 'ai_generated'::"text",
    CONSTRAINT "company_salaries_source_check" CHECK (("source" = ANY (ARRAY['ai_generated'::"text", 'user_submitted'::"text"]))),
    CONSTRAINT "company_salaries_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."company_salaries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."industries" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "description" "text",
    "icon" "text",
    "parent_industry_id" "uuid",
    "search_volume" integer DEFAULT 0,
    "is_primary" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "meta_title" "text",
    "meta_description" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "is_active" boolean DEFAULT true,
    "company_count" integer DEFAULT 0,
    "review_count" integer DEFAULT 0,
    "avg_rating" numeric DEFAULT 0,
    "stats_updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."industries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."interview_experiences" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "company_id" "uuid" NOT NULL,
    "user_id" "uuid",
    "role" "text",
    "difficulty" "text",
    "outcome" "text",
    "content" "text",
    "interview_date" "text",
    "rounds_count" integer,
    "interview_type" "text",
    "status" "text" DEFAULT 'pending'::"text",
    "published_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "source" "text" DEFAULT 'ai_generated'::"text",
    CONSTRAINT "interview_experiences_source_check" CHECK (("source" = ANY (ARRAY['ai_generated'::"text", 'user_submitted'::"text"]))),
    CONSTRAINT "interview_experiences_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'approved'::"text", 'rejected'::"text"])))
);


ALTER TABLE "public"."interview_experiences" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."scrape_queue" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "company_name" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "status" "text" DEFAULT 'pending'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "employee_count" "text",
    "priority" integer DEFAULT 5,
    CONSTRAINT "scrape_queue_status_check" CHECK (("status" = ANY (ARRAY['pending'::"text", 'completed'::"text", 'failed'::"text"])))
);


ALTER TABLE "public"."scrape_queue" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."submission_rate_limit" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "ip_address" "text" NOT NULL,
    "user_id" "uuid",
    "submission_type" "text" NOT NULL,
    "last_submission_at" timestamp with time zone DEFAULT "now"(),
    "count_today" integer DEFAULT 1
);


ALTER TABLE "public"."submission_rate_limit" OWNER TO "postgres";


ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."companies"
    ADD CONSTRAINT "companies_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."company_industries"
    ADD CONSTRAINT "company_industries_pkey" PRIMARY KEY ("company_id", "industry_id");



ALTER TABLE ONLY "public"."company_salaries"
    ADD CONSTRAINT "company_salaries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."industries"
    ADD CONSTRAINT "industries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."industries"
    ADD CONSTRAINT "industries_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."interview_experiences"
    ADD CONSTRAINT "interview_experiences_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."company_reviews"
    ADD CONSTRAINT "reviews_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scrape_queue"
    ADD CONSTRAINT "scrape_queue_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."scrape_queue"
    ADD CONSTRAINT "scrape_queue_slug_key" UNIQUE ("slug");



ALTER TABLE ONLY "public"."submission_rate_limit"
    ADD CONSTRAINT "submission_rate_limit_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_companies_city" ON "public"."companies" USING "btree" ("city");



CREATE INDEX "idx_companies_india_presence" ON "public"."companies" USING "btree" ("india_presence");



CREATE INDEX "idx_companies_slug" ON "public"."companies" USING "btree" ("slug");



CREATE INDEX "idx_companies_status" ON "public"."companies" USING "btree" ("status");



CREATE INDEX "idx_industries_parent" ON "public"."industries" USING "btree" ("parent_industry_id");



CREATE INDEX "idx_industries_slug" ON "public"."industries" USING "btree" ("slug");



CREATE INDEX "idx_interviews_company_id" ON "public"."interview_experiences" USING "btree" ("company_id");



CREATE INDEX "idx_rate_limit_ip" ON "public"."submission_rate_limit" USING "btree" ("ip_address");



CREATE INDEX "idx_rate_limit_user" ON "public"."submission_rate_limit" USING "btree" ("user_id");



CREATE INDEX "idx_reviews_company_id" ON "public"."company_reviews" USING "btree" ("company_id");



CREATE INDEX "idx_reviews_published_at" ON "public"."company_reviews" USING "btree" ("published_at");



CREATE INDEX "idx_reviews_status" ON "public"."company_reviews" USING "btree" ("status");



CREATE INDEX "idx_salaries_company_id" ON "public"."company_salaries" USING "btree" ("company_id");



CREATE INDEX "idx_scrape_queue_priority" ON "public"."scrape_queue" USING "btree" ("priority");



CREATE OR REPLACE TRIGGER "update_scrape_queue_timestamp" BEFORE UPDATE ON "public"."scrape_queue" FOR EACH ROW EXECUTE FUNCTION "public"."update_scrape_queue_updated_at"();



ALTER TABLE ONLY "public"."admin_users"
    ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."company_industries"
    ADD CONSTRAINT "company_industries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_industries"
    ADD CONSTRAINT "company_industries_industry_id_fkey" FOREIGN KEY ("industry_id") REFERENCES "public"."industries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_salaries"
    ADD CONSTRAINT "company_salaries_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."industries"
    ADD CONSTRAINT "industries_parent_industry_id_fkey" FOREIGN KEY ("parent_industry_id") REFERENCES "public"."industries"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."interview_experiences"
    ADD CONSTRAINT "interview_experiences_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."interview_experiences"
    ADD CONSTRAINT "interview_experiences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."company_reviews"
    ADD CONSTRAINT "reviews_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."company_reviews"
    ADD CONSTRAINT "reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."submission_rate_limit"
    ADD CONSTRAINT "submission_rate_limit_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Admin All Companies" ON "public"."companies" TO "authenticated" USING (true);



CREATE POLICY "Admin All Company Industries" ON "public"."company_industries" TO "authenticated" USING (true);



CREATE POLICY "Admin All Industries" ON "public"."industries" TO "authenticated" USING (((("auth"."jwt"() ->> 'role'::"text") = 'service_role'::"text") OR (("auth"."jwt"() ->> 'email'::"text") IN ( SELECT "users"."email"
   FROM "auth"."users"
  WHERE (("users"."raw_user_meta_data" ->> 'is_admin'::"text") = 'true'::"text")))));



CREATE POLICY "Admin All Reviews" ON "public"."company_reviews" TO "authenticated" USING (true);



CREATE POLICY "Admin All Salaries" ON "public"."company_salaries" TO "authenticated" USING (true);



CREATE POLICY "Allow service role full access to scrape_queue" ON "public"."scrape_queue" TO "service_role" USING (true) WITH CHECK (true);



CREATE POLICY "Anonymous Insert Review" ON "public"."company_reviews" FOR INSERT TO "anon" WITH CHECK ((("status" = 'pending'::"text") AND ("is_anonymous" = true)));



CREATE POLICY "Auth Insert Review" ON "public"."company_reviews" FOR INSERT TO "authenticated" WITH CHECK (("status" = 'pending'::"text"));



CREATE POLICY "Public Read Approved Reviews" ON "public"."company_reviews" FOR SELECT USING (("status" = 'approved'::"text"));



CREATE POLICY "Public Read Companies" ON "public"."companies" FOR SELECT USING (true);



CREATE POLICY "Public Read Company Industries" ON "public"."company_industries" FOR SELECT USING (true);



CREATE POLICY "Public Read Industries" ON "public"."industries" FOR SELECT USING (true);



CREATE POLICY "Public Read Salaries" ON "public"."company_salaries" FOR SELECT USING (true);



CREATE POLICY "Service Role All Rate Limit" ON "public"."submission_rate_limit" TO "service_role" USING (true);



CREATE POLICY "Users Read Own Reviews" ON "public"."company_reviews" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."companies" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_industries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_reviews" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."company_salaries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."industries" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."scrape_queue" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."submission_rate_limit" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."update_scrape_queue_updated_at"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_scrape_queue_updated_at"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_scrape_queue_updated_at"() TO "service_role";



GRANT ALL ON TABLE "public"."admin_users" TO "anon";
GRANT ALL ON TABLE "public"."admin_users" TO "authenticated";
GRANT ALL ON TABLE "public"."admin_users" TO "service_role";



GRANT ALL ON TABLE "public"."companies" TO "anon";
GRANT ALL ON TABLE "public"."companies" TO "authenticated";
GRANT ALL ON TABLE "public"."companies" TO "service_role";



GRANT ALL ON TABLE "public"."company_industries" TO "anon";
GRANT ALL ON TABLE "public"."company_industries" TO "authenticated";
GRANT ALL ON TABLE "public"."company_industries" TO "service_role";



GRANT ALL ON TABLE "public"."company_reviews" TO "anon";
GRANT ALL ON TABLE "public"."company_reviews" TO "authenticated";
GRANT ALL ON TABLE "public"."company_reviews" TO "service_role";



GRANT ALL ON TABLE "public"."company_salaries" TO "anon";
GRANT ALL ON TABLE "public"."company_salaries" TO "authenticated";
GRANT ALL ON TABLE "public"."company_salaries" TO "service_role";



GRANT ALL ON TABLE "public"."industries" TO "anon";
GRANT ALL ON TABLE "public"."industries" TO "authenticated";
GRANT ALL ON TABLE "public"."industries" TO "service_role";



GRANT ALL ON TABLE "public"."interview_experiences" TO "anon";
GRANT ALL ON TABLE "public"."interview_experiences" TO "authenticated";
GRANT ALL ON TABLE "public"."interview_experiences" TO "service_role";



GRANT ALL ON TABLE "public"."scrape_queue" TO "anon";
GRANT ALL ON TABLE "public"."scrape_queue" TO "authenticated";
GRANT ALL ON TABLE "public"."scrape_queue" TO "service_role";



GRANT ALL ON TABLE "public"."submission_rate_limit" TO "anon";
GRANT ALL ON TABLE "public"."submission_rate_limit" TO "authenticated";
GRANT ALL ON TABLE "public"."submission_rate_limit" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







