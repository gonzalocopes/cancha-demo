-- Insertar canchas de ejemplo (múltiples canchas del mismo tipo)
-- 5 Canchas de Fútbol 5
INSERT INTO canchas (nombre, tipo, precio_hora) VALUES
('Cancha 1 - Fútbol 5', 'Fútbol 5', 15000.00),
('Cancha 2 - Fútbol 5', 'Fútbol 5', 15000.00),
('Cancha 3 - Fútbol 5', 'Fútbol 5', 15000.00),
('Cancha 4 - Fútbol 5', 'Fútbol 5', 15000.00),
('Cancha 5 - Fútbol 5', 'Fútbol 5', 15000.00),

-- 2 Canchas de Fútbol 8
('Cancha 1 - Fútbol 8', 'Fútbol 8', 25000.00),
('Cancha 2 - Fútbol 8', 'Fútbol 8', 25000.00);

-- Insertar usuario admin por defecto
-- Contraseña: admin123 (cambiar en producción!)
INSERT INTO usuarios_admin (username, password_hash) VALUES
('admin', '$2a$10$rOzJQjYgE5VqZ5xqYqZ5xOZqZ5xqYqZ5xOZqZ5xqYqZ5xOZqZ5xqY');

-- Nota: El hash de arriba es un placeholder. 
-- Deberás generar el hash real usando bcrypt cuando configures el sistema.
