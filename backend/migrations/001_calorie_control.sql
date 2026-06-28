CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS clinical_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  nutritionist_id VARCHAR(64) NOT NULL,
  weight_kg NUMERIC(6, 2) NOT NULL,
  height_cm NUMERIC(6, 2) NOT NULL,
  bmi NUMERIC(5, 2) NOT NULL,
  body_fat_percentage NUMERIC(5, 2),
  waist_cm NUMERIC(6, 2),
  notes TEXT,
  evaluation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type VARCHAR(30) NOT NULL,
  calories INTEGER NOT NULL,
  protein_g INTEGER DEFAULT 0,
  carbs_g INTEGER DEFAULT 0,
  fat_g INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO clinical_evaluations (patient_id, nutritionist_id, weight_kg, height_cm, bmi, evaluation_date)
VALUES ('p-1', 'nutri-1', 75, 170, 25.95, CURRENT_DATE)
ON CONFLICT DO NOTHING;

INSERT INTO nutrition_plans (patient_id, nutritionist_id, status, daily_calories, protein_g, carbs_g, fat_g, module_locked)
VALUES ('p-1', 'nutri-1', 'active', 2100, 130, 230, 70, FALSE)
ON CONFLICT DO NOTHING;

INSERT INTO meal_logs (patient_id, log_date, meal_type, calories, protein_g, carbs_g, fat_g)
VALUES ('p-1', CURRENT_DATE, 'lunch', 650, 35, 80, 20)
ON CONFLICT DO NOTHING;
