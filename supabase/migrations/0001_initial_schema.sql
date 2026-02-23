
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Industries Table (Hierarchical)
CREATE TABLE IF NOT EXISTS public.industries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    parent_industry_id UUID REFERENCES public.industries(id) ON DELETE SET NULL,
    search_volume INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT false,
    display_order INTEGER DEFAULT 0,
    meta_title TEXT,
    meta_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_industries_slug ON public.industries(slug);
CREATE INDEX IF NOT EXISTS idx_industries_parent ON public.industries(parent_industry_id);

-- 2. Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    industry TEXT, -- Primary industry name for quick access
    headquarters TEXT,
    employee_count TEXT,
    website TEXT,
    logo_url TEXT,
    description TEXT,
    overall_review TEXT, -- AI generated summary
    avg_rating DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_companies_slug ON public.companies(slug);

-- 3. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    is_anonymous BOOLEAN DEFAULT true,
    
    -- Multidimensional Ratings (1-5)
    overall_rating INTEGER NOT NULL CHECK (overall_rating >= 1 AND overall_rating <= 5),
    work_life_balance INTEGER CHECK (work_life_balance >= 1 AND work_life_balance <= 5),
    salary INTEGER CHECK (salary >= 1 AND salary <= 5),
    promotions INTEGER CHECK (promotions >= 1 AND promotions <= 5),
    job_security INTEGER CHECK (job_security >= 1 AND job_security <= 5),
    skill_development INTEGER CHECK (skill_development >= 1 AND skill_development <= 5),
    work_satisfaction INTEGER CHECK (work_satisfaction >= 1 AND work_satisfaction <= 5),
    company_culture INTEGER CHECK (company_culture >= 1 AND company_culture <= 5),
    
    -- Content
    designation TEXT,
    department TEXT,
    employment_type TEXT, -- Full-time, Intern, etc.
    likes TEXT,
    dislikes TEXT,
    content TEXT, -- General review text
    
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_company_id ON public.reviews(company_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON public.reviews(status);

-- 4. Company Salaries Table
CREATE TABLE IF NOT EXISTS public.company_salaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    department TEXT,
    salary_min BIGINT,
    salary_max BIGINT,
    salary_avg BIGINT,
    currency TEXT DEFAULT 'INR',
    experience_years TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Company Industries (Junction)
CREATE TABLE IF NOT EXISTS public.company_industries (
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    industry_id UUID REFERENCES public.industries(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    PRIMARY KEY (company_id, industry_id)
);

-- 6. Submission Rate Limiting
CREATE TABLE IF NOT EXISTS public.submission_rate_limit (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ip_address TEXT NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    submission_type TEXT NOT NULL, -- e.g., 'review'
    last_submission_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    count_today INTEGER DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_ip ON public.submission_rate_limit(ip_address);
