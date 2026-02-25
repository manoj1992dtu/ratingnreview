-- Clean up existing data if any (optional, but good for consistent seeding)
-- DELETE FROM company_reviews;
-- DELETE FROM company_industries;
-- DELETE FROM companies;
-- DELETE FROM industries;

-- 1. Insert Industries
INSERT INTO industries (name, slug, description, icon, is_primary, display_order, is_active)
VALUES 
('Information Technology', 'information-technology', 'Software development, cloud computing, and IT services.', 'code', true, 1, true),
('Finance & Banking', 'finance-banking', 'Banking, investment, and financial services.', 'dollar-sign', true, 2, true),
('Healthcare', 'healthcare', 'Medical services, hospitals, and pharmaceutical companies.', 'pill', true, 3, true),
('E-commerce & Retail', 'e-commerce-retail', 'Online shopping and traditional retail businesses.', 'shopping-bag', true, 4, true),
('Real Estate', 'real-estate', 'Residential and commercial property services.', 'building-2', true, 5, true),
('Education', 'education', 'Schools, universities, and ed-tech platforms.', 'graduation-cap', true, 6, true)
ON CONFLICT (slug) DO UPDATE SET is_active = EXCLUDED.is_active;

-- 2. Insert Companies
INSERT INTO companies (name, slug, headquarters, employee_count, description, logo_url, is_active)
VALUES 
('TechGiant', 'techgiant', 'Mountain View, CA', '10,000+', 'A global leader in internet-related services.', 'https://placehold.co/200x200?text=TechGiant', true),
('FinTrust', 'fintrust', 'New York, NY', '5,000-10,000', 'Innovating the future of fintech and traditional banking.', 'https://placehold.co/200x200?text=FinTrust', true),
('HealthPlus', 'healthplus', 'Boston, MA', '1,000-5,000', 'Providing premium healthcare services for over 50 years.', 'https://placehold.co/200x200?text=HealthPlus', true),
('ShopWave', 'shopwave', 'Seattle, WA', '10,000+', 'The worlds fastest growing e-commerce platform.', 'https://placehold.co/200x200?text=ShopWave', true),
('EstateFlow', 'estateflow', 'Chicago, IL', '500-1,000', 'Modern real estate management and investment.', 'https://placehold.co/200x200?text=EstateFlow', true)
ON CONFLICT (slug) DO UPDATE SET is_active = EXCLUDED.is_active;

-- 3. Associate Companies with Industries
INSERT INTO company_industries (company_id, industry_id, is_primary, is_active)
SELECT c.id, i.id, true, true
FROM companies c, industries i
WHERE c.slug = 'techgiant' AND i.slug = 'information-technology'
ON CONFLICT DO NOTHING;

INSERT INTO company_industries (company_id, industry_id, is_primary, is_active)
SELECT c.id, i.id, true, true
FROM companies c, industries i
WHERE c.slug = 'fintrust' AND i.slug = 'finance-banking'
ON CONFLICT DO NOTHING;

INSERT INTO company_industries (company_id, industry_id, is_primary, is_active)
SELECT c.id, i.id, true, true
FROM companies c, industries i
WHERE c.slug = 'healthplus' AND i.slug = 'healthcare'
ON CONFLICT DO NOTHING;

INSERT INTO company_industries (company_id, industry_id, is_primary, is_active)
SELECT c.id, i.id, true, true
FROM companies c, industries i
WHERE c.slug = 'shopwave' AND i.slug = 'e-commerce-retail'
ON CONFLICT DO NOTHING;

INSERT INTO company_industries (company_id, industry_id, is_primary, is_active)
SELECT c.id, i.id, true, true
FROM companies c, industries i
WHERE c.slug = 'estateflow' AND i.slug = 'real-estate'
ON CONFLICT DO NOTHING;

-- 4. Insert Reviews
INSERT INTO company_reviews (company_id, overall_rating, work_life_balance, salary, promotions, job_security, skill_development, work_satisfaction, company_culture, likes, dislikes, is_active, status)
SELECT id, 5, 4, 5, 4, 5, 5, 4, 5, 'Great perks!', 'Fast paced', true, 'approved' FROM companies WHERE slug = 'techgiant';

INSERT INTO company_reviews (company_id, overall_rating, work_life_balance, salary, promotions, job_security, skill_development, work_satisfaction, company_culture, likes, dislikes, is_active, status)
SELECT id, 4, 3, 5, 4, 4, 4, 4, 3, 'High pay', 'Long hours', true, 'approved' FROM companies WHERE slug = 'fintrust';

INSERT INTO company_reviews (company_id, overall_rating, work_life_balance, salary, promotions, job_security, skill_development, work_satisfaction, company_culture, likes, dislikes, is_active, status)
SELECT id, 4, 4, 3, 3, 4, 4, 4, 5, 'Supportive team', 'Budget cuts', true, 'approved' FROM companies WHERE slug = 'healthplus';

INSERT INTO company_reviews (company_id, overall_rating, work_life_balance, salary, promotions, job_security, skill_development, work_satisfaction, company_culture, likes, dislikes, is_active, status)
SELECT id, 4, 3, 4, 5, 4, 5, 4, 4, 'Scale of impact', 'Bureaucracy', true, 'approved' FROM companies WHERE slug = 'shopwave';

-- 5. Update Statistics
UPDATE industries i
SET 
  company_count = (
    SELECT COUNT(DISTINCT company_id) 
    FROM company_industries ci 
    WHERE ci.industry_id = i.id AND ci.is_active = true
  ),
  review_count = (
    SELECT COUNT(*) 
    FROM company_reviews cr
    INNER JOIN company_industries ci ON cr.company_id = ci.company_id
    WHERE ci.industry_id = i.id AND cr.is_active = true AND ci.is_active = true
  ),
  avg_rating = (
    SELECT COALESCE(AVG(cr.overall_rating), 0)
    FROM company_reviews cr
    INNER JOIN company_industries ci ON cr.company_id = ci.company_id
    WHERE ci.industry_id = i.id AND cr.is_active = true AND ci.is_active = true
  ),
  stats_updated_at = NOW();
