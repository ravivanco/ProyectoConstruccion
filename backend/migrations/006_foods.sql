CREATE TABLE IF NOT EXISTS foods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nutritionist_id VARCHAR(64) NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  serving_size VARCHAR(100) NOT NULL,
  calories NUMERIC(8, 2) NOT NULL,
  protein_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  carbs_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  fat_g NUMERIC(8, 2) NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_foods_nutritionist ON foods (nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_foods_category ON foods (category);
CREATE INDEX IF NOT EXISTS idx_foods_active ON foods (is_active);
