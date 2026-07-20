CREATE TABLE IF NOT EXISTS plan_weeks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES nutrition_plans(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL,
  title VARCHAR(255),
  objective TEXT,
  include_weekends BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (plan_id, week_number)
);

CREATE TABLE IF NOT EXISTS plan_week_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_id UUID NOT NULL REFERENCES plan_weeks(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  UNIQUE (week_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS plan_day_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_day_id UUID NOT NULL REFERENCES plan_week_days(id) ON DELETE CASCADE,
  meal_slot VARCHAR(50) NOT NULL,
  dish_id UUID,
  dish_name VARCHAR(255) NOT NULL,
  portion VARCHAR(100),
  calories NUMERIC(8, 2) NOT NULL DEFAULT 0,
  protein_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  carbs_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  fat_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_plan_weeks_plan ON plan_weeks (plan_id);
CREATE INDEX IF NOT EXISTS idx_plan_day_menus_day ON plan_day_menus (week_day_id);
