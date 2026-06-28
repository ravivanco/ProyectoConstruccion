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

CREATE INDEX IF NOT EXISTS idx_clinical_evaluations_patient
  ON clinical_evaluations (patient_id, evaluation_date DESC);
