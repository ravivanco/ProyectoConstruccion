ALTER TABLE meal_logs
  ADD COLUMN IF NOT EXISTS food_name VARCHAR(200),
  ADD COLUMN IF NOT EXISTS protein INTEGER NOT NULL DEFAULT 0 CHECK (protein >= 0),
  ADD COLUMN IF NOT EXISTS carbs INTEGER NOT NULL DEFAULT 0 CHECK (carbs >= 0),
  ADD COLUMN IF NOT EXISTS fat INTEGER NOT NULL DEFAULT 0 CHECK (fat >= 0),
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS dish_id UUID REFERENCES dishes(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

CREATE TABLE IF NOT EXISTS exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  exercise_name VARCHAR(120) NOT NULL,
  category VARCHAR(40) NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  calories_burned INTEGER NOT NULL DEFAULT 0 CHECK (calories_burned >= 0),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_logs_patient_date
  ON exercise_logs (patient_id, log_date DESC);

CREATE TABLE IF NOT EXISTS weight_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg > 0),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weight_logs_patient_date
  ON weight_logs (patient_id, log_date DESC);

CREATE TABLE IF NOT EXISTS additional_food_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  food_name VARCHAR(200) NOT NULL,
  calories INTEGER NOT NULL CHECK (calories >= 0),
  protein INTEGER NOT NULL DEFAULT 0 CHECK (protein >= 0),
  carbs INTEGER NOT NULL DEFAULT 0 CHECK (carbs >= 0),
  fat INTEGER NOT NULL DEFAULT 0 CHECK (fat >= 0),
  quantity VARCHAR(80),
  log_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_additional_food_logs_patient_date
  ON additional_food_logs (patient_id, log_date DESC);
