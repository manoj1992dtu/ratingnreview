-- Create function to update companies stats
CREATE OR REPLACE FUNCTION update_company_rating_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Logic to run on insert/update/delete
  IF TG_OP = 'DELETE' THEN
    UPDATE companies
    SET 
      avg_rating = COALESCE((
        SELECT ROUND(AVG(overall_rating), 2)
        FROM company_reviews
        WHERE company_id = OLD.company_id
        AND status = 'published'
      ), 0),
      review_count = COALESCE((
        SELECT COUNT(*)
        FROM company_reviews
        WHERE company_id = OLD.company_id
        AND status = 'published'
      ), 0)
    WHERE id = OLD.company_id;
  ELSE
    UPDATE companies
    SET 
      avg_rating = COALESCE((
        SELECT ROUND(AVG(overall_rating), 2)
        FROM company_reviews
        WHERE company_id = NEW.company_id
        AND status = 'published'
      ), 0),
      review_count = COALESCE((
        SELECT COUNT(*)
        FROM company_reviews
        WHERE company_id = NEW.company_id
        AND status = 'published'
      ), 0)
    WHERE id = NEW.company_id;
  END IF;
  
  RETURN NULL; -- AFTER trigger
END;
$$ LANGUAGE plpgsql;

-- Create the trigger
DROP TRIGGER IF EXISTS on_review_status_change ON company_reviews;
CREATE TRIGGER on_review_status_change
AFTER INSERT OR UPDATE OR DELETE ON company_reviews
FOR EACH ROW
EXECUTE FUNCTION update_company_rating_stats();
