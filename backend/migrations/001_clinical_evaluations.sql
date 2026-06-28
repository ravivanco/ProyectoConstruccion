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

INSERT INTO clinical_evaluations (
  patient_id, nutritionist_id, weight_kg, height_cm, bmi, evaluation_date
) VALUES
  ('p-1', 'nutri-1', 78.5, 175, 25.63, '2026-05-10'),
  ('p-1', 'nutri-1', 76.2, 175, 24.88, '2026-06-01')
ON CONFLICT DO NOTHING;
