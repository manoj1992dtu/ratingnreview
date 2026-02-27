-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.companies (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  industry text,
  headquarters text,
  employee_count text,
  website text,
  logo_url text,
  description text,
  overall_review text,
  avg_rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);
CREATE TABLE public.company_industries (
  company_id uuid NOT NULL,
  industry_id uuid NOT NULL,
  is_primary boolean DEFAULT false,
  is_active boolean DEFAULT true,
  CONSTRAINT company_industries_pkey PRIMARY KEY (company_id, industry_id),
  CONSTRAINT company_industries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT company_industries_industry_id_fkey FOREIGN KEY (industry_id) REFERENCES public.industries(id)
);
CREATE TABLE public.company_reviews (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  user_id uuid,
  is_anonymous boolean DEFAULT true,
  overall_rating integer NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
  work_life_balance integer CHECK (work_life_balance >= 1 AND work_life_balance <= 5),
  salary integer CHECK (salary >= 1 AND salary <= 5),
  promotions integer CHECK (promotions >= 1 AND promotions <= 5),
  job_security integer CHECK (job_security >= 1 AND job_security <= 5),
  skill_development integer CHECK (skill_development >= 1 AND skill_development <= 5),
  work_satisfaction integer CHECK (work_satisfaction >= 1 AND work_satisfaction <= 5),
  company_culture integer CHECK (company_culture >= 1 AND company_culture <= 5),
  designation text,
  department text,
  employment_type text,
  likes text,
  dislikes text,
  content text,
  status text DEFAULT 'pending'::text CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  published_at timestamp with time zone,
  is_active boolean DEFAULT true,
  CONSTRAINT company_reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.company_salaries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  company_id uuid NOT NULL,
  role text NOT NULL,
  department text,
  salary_min bigint,
  salary_max bigint,
  salary_avg bigint,
  currency text DEFAULT 'INR'::text,
  experience_years text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT company_salaries_pkey PRIMARY KEY (id),
  CONSTRAINT company_salaries_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id)
);
CREATE TABLE public.industries (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  description text,
  icon text,
  parent_industry_id uuid,
  search_volume integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  display_order integer DEFAULT 0,
  meta_title text,
  meta_description text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  is_active boolean DEFAULT true,
  company_count integer DEFAULT 0,
  review_count integer DEFAULT 0,
  avg_rating numeric DEFAULT 0,
  stats_updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT industries_pkey PRIMARY KEY (id),
  CONSTRAINT industries_parent_industry_id_fkey FOREIGN KEY (parent_industry_id) REFERENCES public.industries(id)
);
CREATE TABLE public.interview_experiences (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL,
  user_id uuid,
  role text NOT NULL,
  difficulty text,
  outcome text,
  content text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT interview_experiences_pkey PRIMARY KEY (id),
  CONSTRAINT interview_experiences_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id),
  CONSTRAINT interview_experiences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.submission_rate_limit (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  ip_address text NOT NULL,
  user_id uuid,
  submission_type text NOT NULL,
  last_submission_at timestamp with time zone DEFAULT now(),
  count_today integer DEFAULT 1,
  CONSTRAINT submission_rate_limit_pkey PRIMARY KEY (id),
  CONSTRAINT submission_rate_limit_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);