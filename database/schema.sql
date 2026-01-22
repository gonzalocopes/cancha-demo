-- Tabla de Canchas
CREATE TABLE IF NOT EXISTS canchas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('Fútbol 5', 'Fútbol 7', 'Fútbol 8', 'Fútbol 9', 'Fútbol 11')),
    precio_hora DECIMAL(10, 2) NOT NULL,
    activa BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Reservas
CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    cancha_id INTEGER NOT NULL REFERENCES canchas(id) ON DELETE CASCADE,
    fecha DATE NOT NULL,
    horario_inicio TIME NOT NULL,
    horario_fin TIME NOT NULL,
    cliente_nombre VARCHAR(100) NOT NULL,
    cliente_whatsapp VARCHAR(20) NOT NULL,
    estado_pago VARCHAR(20) NOT NULL CHECK (estado_pago IN ('completo', 'seña', 'pendiente')),
    monto_pagado DECIMAL(10, 2) DEFAULT 0,
    monto_total DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(cancha_id, fecha, horario_inicio)
);

-- Tabla de Usuarios Admin
CREATE TABLE IF NOT EXISTS usuarios_admin (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_reservas_fecha ON reservas(fecha);
CREATE INDEX IF NOT EXISTS idx_reservas_cancha ON reservas(cancha_id);
CREATE INDEX IF NOT EXISTS idx_reservas_fecha_cancha ON reservas(fecha, cancha_id);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reservas_updated_at BEFORE UPDATE ON reservas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Habilitar Row Level Security (RLS)
ALTER TABLE canchas ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservas ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios_admin ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad (permitir lectura pública de canchas)
CREATE POLICY "Canchas son públicas" ON canchas FOR SELECT USING (true);
CREATE POLICY "Reservas son públicas para lectura" ON reservas FOR SELECT USING (true);
CREATE POLICY "Permitir insertar reservas" ON reservas FOR INSERT WITH CHECK (true);
