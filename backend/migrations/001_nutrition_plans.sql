CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  nutritionist_id VARCHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  module_locked BOOLEAN NOT NULL DEFAULT TRUE,
  start_date DATE,
  daily_calories INTEGER NOT NULL DEFAULT 2000,
  protein_g INTEGER NOT NULL DEFAULT 120,
  carbs_g INTEGER NOT NULL DEFAULT 220,
  fat_g INTEGER NOT NULL DEFAULT 65,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO nutrition_plans (id, patient_id, nutritionist_id, status, module_locked)
VALUES ('33333333-3333-3333-3333-333333333333', 'p-1', 'nutri-1', 'active', FALSE)
ON CONFLICT (id) DO NOTHING;
