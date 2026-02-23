-- Add published_at column for slow-drip scheduling
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS published_at TIMESTAMP WITH TIME ZONE;
