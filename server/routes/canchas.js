import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/canchas - Obtener todas las canchas activas
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('canchas')
      .select('*')
      .eq('activa', true)
      .order('tipo')
      .order('nombre');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener canchas:', error);
    res.status(500).json({ error: 'Error al obtener las canchas' });
  }
});

// GET /api/canchas/tipo/:tipo - Obtener canchas por tipo
router.get('/tipo/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;

    const { data, error } = await supabase
      .from('canchas')
      .select('*')
      .eq('activa', true)
      .eq('tipo', tipo)
      .order('nombre');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener canchas por tipo:', error);
    res.status(500).json({ error: 'Error al obtener las canchas' });
  }
});

// GET /api/canchas/:id - Obtener una cancha específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('canchas')
      .select('*')
      .eq('id', id)
      .eq('activa', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Cancha no encontrada' });
      }
      throw error;
    }

    res.json(data);
  } catch (error) {
    console.error('Error al obtener cancha:', error);
    res.status(500).json({ error: 'Error al obtener la cancha' });
  }
});

export default router;
