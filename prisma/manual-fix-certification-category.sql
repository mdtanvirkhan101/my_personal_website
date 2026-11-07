ALTER TABLE public.certifications
ADD COLUMN IF NOT EXISTS category TEXT;

CREATE INDEX IF NOT EXISTS certifications_category_idx
ON public.certifications (category);