CREATE TABLE IF NOT EXISTS exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(120) NOT NULL,
  category VARCHAR(40) NOT NULL,
  duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
  intensity VARCHAR(20) NOT NULL DEFAULT 'media',
  calories_per_session INTEGER NOT NULL DEFAULT 0 CHECK (calories_per_session >= 0),
  description TEXT,
  is_recommended BOOLEAN NOT NULL DEFAULT false,
  min_activity_level VARCHAR(20) NOT NULL DEFAULT 'sedentary',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercises_category ON exercises (category);
CREATE INDEX IF NOT EXISTS idx_exercises_recommended ON exercises (is_recommended);

CREATE TABLE IF NOT EXISTS patient_exercise_schedule (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id VARCHAR(64) NOT NULL,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  scheduled_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (patient_id, exercise_id, scheduled_date)
);

CREATE INDEX IF NOT EXISTS idx_patient_exercise_schedule_date
  ON patient_exercise_schedule (patient_id, scheduled_date);

INSERT INTO exercises (name, category, duration_minutes, intensity, calories_per_session, description, is_recommended, min_activity_level) VALUES
  ('Caminata rápida', 'Cardio', 30, 'baja', 150, 'Caminata a ritmo moderado en superficie plana', true, 'sedentary'),
  ('Trote ligero', 'Cardio', 25, 'media', 220, 'Trote continuo a ritmo cómodo', true, 'light'),
  ('Sentadillas', 'Fuerza', 20, 'media', 120, 'Series de sentadillas con peso corporal', true, 'light'),
  ('Flexiones', 'Fuerza', 15, 'media', 90, 'Flexiones adaptadas al nivel del paciente', false, 'moderate'),
  ('Estiramientos', 'Flexibilidad', 15, 'baja', 45, 'Rutina de estiramientos articulares', true, 'sedentary'),
  ('Yoga suave', 'Flexibilidad', 30, 'baja', 100, 'Posturas básicas de yoga restaurativo', true, 'sedentary'),
  ('Bicicleta estática', 'Cardio', 30, 'media', 200, 'Pedaleo en bicicleta fija o al aire libre', true, 'light'),
  ('Natación recreativa', 'Deporte', 40, 'media', 280, 'Nado suave en piscina', false, 'moderate'),
  ('Entrenamiento con bandas', 'Fuerza', 25, 'media', 140, 'Ejercicios de resistencia con bandas elásticas', true, 'light'),
  ('HIIT básico', 'Cardio', 20, 'alta', 250, 'Intervalos de alta intensidad adaptados', false, 'high')
ON CONFLICT DO NOTHING;
