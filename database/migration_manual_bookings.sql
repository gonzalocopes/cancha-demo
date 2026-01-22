-- Migración para agregar soporte de reservas manuales del admin
-- Ejecutar en Supabase SQL Editor

-- 1. Agregar nuevas columnas a la tabla reservas
ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS tipo_reserva VARCHAR(20) DEFAULT 'cliente' CHECK (tipo_reserva IN ('cliente', 'admin', 'recurrente'));

ALTER TABLE reservas 
ADD COLUMN IF NOT EXISTS notas_admin TEXT;

-- 2. Modificar el constraint de estado_pago para incluir 'cortesia'
ALTER TABLE reservas DROP CONSTRAINT IF EXISTS reservas_estado_pago_check;

ALTER TABLE reservas 
ADD CONSTRAINT reservas_estado_pago_check 
CHECK (estado_pago IN ('completo', 'seña', 'pendiente', 'cortesia'));

-- 3. Modificar monto_pagado para permitir 0 (para cortesías)
ALTER TABLE reservas 
ALTER COLUMN monto_pagado SET DEFAULT 0;

ALTER TABLE reservas 
ALTER COLUMN monto_pagado DROP NOT NULL;

-- 4. Hacer cliente_whatsapp opcional para reservas admin
ALTER TABLE reservas 
ALTER COLUMN cliente_whatsapp DROP NOT NULL;

-- Verificar cambios
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'reservas'
ORDER BY ordinal_position;
