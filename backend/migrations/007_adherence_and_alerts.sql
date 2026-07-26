-- 007_adherence_and_alerts.sql

-- Tabla para el registro de adherencia diaria del paciente
CREATE TABLE IF NOT EXISTS adherence_logs (
    id SERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    meal_adherence_percent NUMERIC(5,2) DEFAULT 0,
    physical_adherence_percent NUMERIC(5,2) DEFAULT 0,
    daily_weight_kg NUMERIC(5,2),
    extra_calories_consumed INTEGER DEFAULT 0,
    adherence_level VARCHAR(20) CHECK (adherence_level IN ('ALTA', 'MEDIA', 'BAJA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(patient_id, log_date)
);

-- Tabla para consumos adicionales (fuera del plan)
CREATE TABLE IF NOT EXISTS extra_consumptions (
    id SERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    log_date DATE NOT NULL DEFAULT CURRENT_DATE,
    food_description TEXT NOT NULL,
    calories INTEGER NOT NULL,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para alertas clínicas automáticas (Nutricionista)
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ADHERENCIA', 'PESO', 'EXCESO_CALORICO', 'INACTIVIDAD')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('INFO', 'WARNING', 'CRITICAL')),
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- Tabla para citas del nutricionista
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    date_time TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('PROGRAMADA', 'ATENDIDA', 'CANCELADA', 'REPROGRAMADA')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
