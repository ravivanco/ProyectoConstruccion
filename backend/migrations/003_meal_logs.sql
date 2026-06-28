CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  meal_type VARCHAR(20) NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_meal_logs_patient_date
  ON meal_logs (patient_id, log_date DESC);
