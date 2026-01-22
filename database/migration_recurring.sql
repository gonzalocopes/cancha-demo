-- Migración para reservas recurrentes
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS reservas_recurrentes (
  id SERIAL PRIMARY KEY,
  cancha_id INTEGER REFERENCES canchas(id),
  cliente_nombre VARCHAR(255) NOT NULL,
  cliente_whatsapp VARCHAR(20),
  dia_semana INTEGER NOT NULL, -- 0=Domingo, 1=Lunes, 2=Martes, etc.
  horario_inicio TIME NOT NULL,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE, -- Opcional, si es NULL es indefinido (pero el sistema generará por lotes)
  notas TEXT,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indice para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_reservas_recurrentes_dia ON reservas_recurrentes(dia_semana);
