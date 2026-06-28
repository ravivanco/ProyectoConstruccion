CREATE TABLE IF NOT EXISTS patient_profiles (
  patient_id VARCHAR(64) PRIMARY KEY,
  activity_level VARCHAR(20),
  medical_conditions JSONB NOT NULL DEFAULT '[]',
  allergies JSONB NOT NULL DEFAULT '[]',
  intolerances JSONB NOT NULL DEFAULT '[]',
  nutrition_goal VARCHAR(30),
  sports JSONB NOT NULL DEFAULT '[]',
  food_preferences JSONB NOT NULL DEFAULT '[]',
  food_restrictions JSONB NOT NULL DEFAULT '[]',
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO patient_profiles (
  patient_id, activity_level, medical_conditions, allergies, intolerances,
  nutrition_goal, sports, food_preferences, food_restrictions, completed
) VALUES (
  'p-1', 'moderate',
  '["Hipertensión"]', '["Mariscos"]', '["Lactosa"]',
  'lose_weight', '["Ciclismo"]', '["Vegetariano parcial"]', '["Azúcar refinada"]', TRUE
) ON CONFLICT (patient_id) DO NOTHING;
