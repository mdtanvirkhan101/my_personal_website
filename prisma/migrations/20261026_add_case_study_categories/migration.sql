-- Safe guard for incomplete/legacy migration history.
-- The previous SQL failed in Prisma's shadow database when case_studies
-- had not yet been created by an earlier migration.
CREATE TABLE IF NOT EXISTS "case_study_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "case_study_categories_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "case_study_categories_name_key"
  ON "case_study_categories"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "case_study_categories_slug_key"
  ON "case_study_categories"("slug");

-- Only alter case_studies if it exists at this point in the migration history.
DO $$
BEGIN
  IF to_regclass('public.case_studies') IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'case_studies'
        AND column_name = 'categoryId'
    ) THEN
      ALTER TABLE "case_studies" ADD COLUMN "categoryId" TEXT;
    END IF;

    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND table_name = 'case_studies'
        AND constraint_name = 'case_studies_categoryId_fkey'
    ) THEN
      ALTER TABLE "case_studies"
        ADD CONSTRAINT "case_studies_categoryId_fkey"
        FOREIGN KEY ("categoryId")
        REFERENCES "case_study_categories"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
  END IF;
END $$;
