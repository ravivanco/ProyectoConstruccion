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

CREATE INDEX IF NOT EXISTS idx_nutrition_plans_patient
  ON nutrition_plans (patient_id, status);

INSERT INTO nutrition_plans (id, patient_id, nutritionist_id, status, daily_calories)
VALUES ('11111111-1111-1111-1111-111111111111', 'p-1', 'nutri-1', 'draft', 2100)
ON CONFLICT (id) DO NOTHING;
