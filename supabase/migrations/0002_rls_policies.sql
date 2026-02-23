
-- Enable RLS on all tables
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_salaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_industries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submission_rate_limit ENABLE ROW LEVEL SECURITY;

-- 1. Industries: Public Read, Authenticated All
CREATE POLICY "Public Read Industries" ON public.industries FOR SELECT USING (true);
CREATE POLICY "Admin All Industries" ON public.industries FOR ALL TO authenticated USING (auth.jwt() ->> 'role' = 'service_role' OR (auth.jwt() ->> 'email') IN (SELECT email FROM auth.users WHERE raw_user_meta_data->>'is_admin' = 'true'));

-- 2. Companies: Public Read, Authenticated All (for scripts/admin)
CREATE POLICY "Public Read Companies" ON public.companies FOR SELECT USING (true);
CREATE POLICY "Admin All Companies" ON public.companies FOR ALL TO authenticated USING (true);

-- 3. Reviews: 
-- Public Read only if approved
CREATE POLICY "Public Read Approved Reviews" ON public.reviews FOR SELECT 
USING (status = 'approved');

-- Anonymous users can insert (pending by default)
CREATE POLICY "Anonymous Insert Review" ON public.reviews FOR INSERT 
TO anon
WITH CHECK (status = 'pending' AND is_anonymous = true);

-- Authenticated users can insert
CREATE POLICY "Auth Insert Review" ON public.reviews FOR INSERT 
TO authenticated
WITH CHECK (status = 'pending');

-- Users can read their own reviews regardless of status
CREATE POLICY "Users Read Own Reviews" ON public.reviews FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admin can do everything
CREATE POLICY "Admin All Reviews" ON public.reviews FOR ALL
TO authenticated
USING (true);

-- 4. Salaries: Public Read, Admin All
CREATE POLICY "Public Read Salaries" ON public.company_salaries FOR SELECT USING (true);
CREATE POLICY "Admin All Salaries" ON public.company_salaries FOR ALL TO authenticated USING (true);

-- 5. Junction: Public Read, Admin All
CREATE POLICY "Public Read Company Industries" ON public.company_industries FOR SELECT USING (true);
CREATE POLICY "Admin All Company Industries" ON public.company_industries FOR ALL TO authenticated USING (true);

-- 6. Rate Limit: Service Role only
CREATE POLICY "Service Role All Rate Limit" ON public.submission_rate_limit FOR ALL TO service_role USING (true);
