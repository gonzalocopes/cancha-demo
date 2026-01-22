import express from 'express';
import bcrypt from 'bcryptjs';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// POST /api/auth/login - Login de administrador
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        error: 'Usuario y contraseña son requeridos' 
      });
    }

    // Por simplicidad, usamos variables de entorno para el admin
    // En producción, deberías usar la tabla usuarios_admin
    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (username === adminUsername && password === adminPassword) {
      // Generar un token simple (en producción usa JWT)
      const token = Buffer.from(`${username}:${Date.now()}`).toString('base64');
      
      res.json({
        message: 'Login exitoso',
        token,
        user: { username }
      });
    } else {
      res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error en el login' });
  }
});

// GET /api/auth/verify - Verificar token
router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'No autorizado' });
    }

    // Verificación simple del token
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const [username] = decoded.split(':');

    if (username === (process.env.ADMIN_USERNAME || 'admin')) {
      res.json({ valid: true, user: { username } });
    } else {
      res.status(401).json({ error: 'Token inválido' });
    }
  } catch (error) {
    console.error('Error al verificar token:', error);
    res.status(401).json({ error: 'Token inválido' });
  }
});

export default router;
