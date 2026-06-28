CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  treatment_status VARCHAR(40) NOT NULL DEFAULT 'Pendiente',
  last_visit DATE,
  nutritionist_id VARCHAR(64) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patients_nutritionist ON patients (nutritionist_id);
CREATE INDEX IF NOT EXISTS idx_patients_treatment_status ON patients (treatment_status);

INSERT INTO patients (id, name, email, treatment_status, last_visit, nutritionist_id) VALUES
  ('p-1', 'Carlos Mendoza', 'carlos.m@gmail.com', 'Alta Adherencia', '2026-06-10', 'nutri-1'),
  ('p-2', 'Ana Gutiérrez', 'ana.g@hotmail.com', 'Media Adherencia', '2026-06-12', 'nutri-1'),
  ('p-3', 'Luis Ramírez', 'luis.ramirez@yahoo.com', 'Baja Adherencia', '2026-06-05', 'nutri-1'),
  ('p-4', 'María Fernanda Salas', 'mafer.salas@gmail.com', 'Alta Adherencia', '2026-06-14', 'nutri-1'),
  ('p-5', 'Jorge Villalobos', 'jorgev89@outlook.com', 'Pendiente', '2026-06-16', 'nutri-1')
ON CONFLICT (id) DO NOTHING;
