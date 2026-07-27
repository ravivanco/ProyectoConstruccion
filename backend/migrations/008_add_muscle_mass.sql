ALTER TABLE clinical_evaluations
ADD COLUMN IF NOT EXISTS muscle_mass_percentage NUMERIC(5, 2);
