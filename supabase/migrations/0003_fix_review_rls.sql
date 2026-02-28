-- Drop the old policy
DROP POLICY IF EXISTS "Public Read Approved Reviews" ON "public"."company_reviews";

-- Create the new policy that allows reading both approved and published reviews
CREATE POLICY "Public Read Published Reviews" ON "public"."company_reviews" 
FOR SELECT USING (status IN ('approved', 'published'));
