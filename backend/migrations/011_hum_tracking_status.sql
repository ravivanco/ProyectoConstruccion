ALTER TABLE meal_logs
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'completed';

CREATE UNIQUE INDEX IF NOT EXISTS idx_meal_logs_patient_type_date
  ON meal_logs (patient_id, meal_type, log_date);

CREATE UNIQUE INDEX IF NOT EXISTS idx_weight_logs_patient_date_unique
  ON weight_logs (patient_id, log_date);

ALTER TABLE additional_food_logs
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'pending';
