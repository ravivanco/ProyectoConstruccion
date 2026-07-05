CREATE TABLE IF NOT EXISTS dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  default_portion VARCHAR(100),
  calories NUMERIC(8, 2) NOT NULL,
  protein_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  carbs_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  fat_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  ingredients JSONB NOT NULL DEFAULT '[]',
  preparation TEXT,
  image_url TEXT,
  tags JSONB NOT NULL DEFAULT '[]',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dishes_nutritionist ON dishes (nutritionist_id);

ALTER TABLE plan_day_menus
  ADD CONSTRAINT fk_plan_day_menus_dish
  FOREIGN KEY (dish_id) REFERENCES dishes(id) ON DELETE SET NULL;
