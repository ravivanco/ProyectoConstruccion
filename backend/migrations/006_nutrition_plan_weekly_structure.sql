ALTER TABLE nutrition_plans
ADD COLUMN IF NOT EXISTS weekly_structure JSONB DEFAULT '[]'::jsonb;
