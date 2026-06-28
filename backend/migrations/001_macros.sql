CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS clinical_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  nutritionist_id VARCHAR(64) NOT NULL,
  weight_kg NUMERIC(6, 2) NOT NULL,
  height_cm NUMERIC(6, 2) NOT NULL,
  bmi NUMERIC(5, 2) NOT NULL,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nutrition_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  nutritionist_id VARCHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  daily_calories INTEGER NOT NULL DEFAULT 2000,
  protein_g INTEGER NOT NULL DEFAULT 120,
  carbs_g INTEGER NOT NULL DEFAULT 220,
  fat_g INTEGER NOT NULL DEFAULT 65,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO clinical_evaluations (patient_id, nutritionist_id, weight_kg, height_cm, bmi)
VALUES ('p-1', 'nutri-1', 72, 168, 25.51)
ON CONFLICT DO NOTHING;
