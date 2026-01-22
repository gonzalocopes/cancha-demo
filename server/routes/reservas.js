import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

// GET /api/reservas/disponibilidad - Verificar disponibilidad de horarios
router.get('/disponibilidad', async (req, res) => {
  try {
    const { cancha_id, fecha } = req.query;

    if (!cancha_id || !fecha) {
      return res.status(400).json({ 
        error: 'Se requiere cancha_id y fecha' 
      });
    }

    const { data, error } = await supabase
      .from('reservas')
      .select('horario_inicio, horario_fin')
      .eq('cancha_id', cancha_id)
      .eq('fecha', fecha);

    if (error) throw error;

    // Generar todos los horarios posibles (17:00 a 23:00)
    const horariosDisponibles = [];
    for (let hora = 17; hora < 23; hora++) {
      const horario = `${hora.toString().padStart(2, '0')}:00`;
      
      // Verificar si el horario está ocupado (comparar solo HH:MM, ignorando segundos)
      const ocupado = data.some(reserva => {
        const horarioInicio = reserva.horario_inicio.substring(0, 5); // HH:MM
        return horarioInicio === horario;
      });
      
      horariosDisponibles.push({
        horario,
        disponible: !ocupado
      });
    }

    res.json(horariosDisponibles);
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ error: 'Error al verificar disponibilidad' });
  }
});

// POST /api/reservas - Crear nueva reserva
router.post('/', async (req, res) => {
  try {
    const {
      cancha_id,
      fecha,
      horario_inicio,
      cliente_nombre,
      cliente_whatsapp,
      estado_pago
    } = req.body;

    // Validaciones
    if (!cancha_id || !fecha || !horario_inicio || !cliente_nombre || !cliente_whatsapp || !estado_pago) {
      return res.status(400).json({ 
        error: 'Todos los campos son requeridos' 
      });
    }

    // Obtener precio de la cancha
    const { data: cancha, error: canchaError } = await supabase
      .from('canchas')
      .select('precio_hora')
      .eq('id', cancha_id)
      .single();

    if (canchaError) throw canchaError;

    // Calcular horario_fin (1 hora después)
    const [hora, minuto] = horario_inicio.split(':');
    const horaFin = (parseInt(hora) + 1).toString().padStart(2, '0');
    const horario_fin = `${horaFin}:${minuto}`;

    // Calcular monto según tipo de pago
    const monto_total = parseFloat(cancha.precio_hora);
    let monto_pagado = 0;
    
    if (estado_pago === 'completo') {
      monto_pagado = monto_total;
    } else if (estado_pago === 'seña') {
      monto_pagado = monto_total * 0.5;
    }

    // Verificar disponibilidad antes de insertar
    const { data: existente } = await supabase
      .from('reservas')
      .select('id')
      .eq('cancha_id', cancha_id)
      .eq('fecha', fecha)
      .eq('horario_inicio', horario_inicio)
      .maybeSingle();

    if (existente) {
      return res.status(409).json({ 
        error: 'Este horario ya está ocupado' 
      });
    }

    // Crear reserva
    const { data, error } = await supabase
      .from('reservas')
      .insert([{
        cancha_id,
        fecha,
        horario_inicio,
        horario_fin,
        cliente_nombre,
        cliente_whatsapp,
        estado_pago,
        monto_pagado,
        monto_total
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Reserva creada exitosamente',
      reserva: data
    });
  } catch (error) {
    console.error('Error al crear reserva:', error);
    res.status(500).json({ error: 'Error al crear la reserva' });
  }
});

// GET /api/reservas - Listar todas las reservas (admin)
router.get('/', async (req, res) => {
  try {
    const { fecha, cancha_id } = req.query;

    let query = supabase
      .from('reservas')
      .select(`
        *,
        canchas (
          nombre,
          tipo
        )
      `)
      .order('fecha', { ascending: false })
      .order('horario_inicio');

    if (fecha) {
      query = query.eq('fecha', fecha);
    }

    if (cancha_id) {
      query = query.eq('cancha_id', cancha_id);
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener reservas:', error);
    res.status(500).json({ error: 'Error al obtener las reservas' });
  }
});

// PATCH /api/reservas/:id/pago - Actualizar estado de pago
router.patch('/:id/pago', async (req, res) => {
  try {
    const { id } = req.params;
    const { estado_pago } = req.body;

    if (!estado_pago || !['completo', 'seña', 'pendiente'].includes(estado_pago)) {
      return res.status(400).json({ 
        error: 'Estado de pago inválido' 
      });
    }

    // Obtener reserva actual
    const { data: reserva, error: getError } = await supabase
      .from('reservas')
      .select('monto_total')
      .eq('id', id)
      .single();

    if (getError) throw getError;

    // Calcular nuevo monto pagado
    let monto_pagado = 0;
    if (estado_pago === 'completo') {
      monto_pagado = reserva.monto_total;
    } else if (estado_pago === 'seña') {
      monto_pagado = reserva.monto_total * 0.5;
    }

    // Actualizar reserva
    const { data, error } = await supabase
      .from('reservas')
      .update({ estado_pago, monto_pagado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      message: 'Estado de pago actualizado',
      reserva: data
    });
  } catch (error) {
    console.error('Error al actualizar pago:', error);
    res.status(500).json({ error: 'Error al actualizar el pago' });
  }
});

// DELETE /api/reservas/:id - Cancelar reserva
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Primero verificar que existe
    const { data: reservaExistente, error: errorBuscar } = await supabase
      .from('reservas')
      .select('id')
      .eq('id', id)
      .single();

    if (errorBuscar || !reservaExistente) {
      return res.status(404).json({ error: 'Reserva no encontrada' });
    }

    // Eliminar la reserva
    const { error } = await supabase
      .from('reservas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error de Supabase:', error);
      throw error;
    }

    res.json({ message: 'Reserva cancelada exitosamente' });
  } catch (error) {
    console.error('Error al cancelar reserva:', error);
    res.status(500).json({ error: error.message || 'Error al cancelar la reserva' });
  }
});

export default router;

// POST /api/reservas/manual - Crear reserva manual (admin)
router.post('/manual', async (req, res) => {
  try {
    const { cancha_id, fecha, horario_inicio, cliente_nombre, cliente_whatsapp, notas_admin } = req.body;

    if (!cancha_id || !fecha || !horario_inicio || !cliente_nombre) {
      return res.status(400).json({ error: 'Faltan campos requeridos' });
    }

    const { data: existente } = await supabase
      .from('reservas')
      .select('id')
      .eq('cancha_id', cancha_id)
      .eq('fecha', fecha)
      .eq('horario_inicio', horario_inicio)
      .maybeSingle();

    if (existente) {
      return res.status(409).json({ error: 'Este horario ya está ocupado' });
    }

    const { data, error } = await supabase
      .from('reservas')
      .insert([{
        cancha_id: parseInt(cancha_id),
        fecha,
        horario_inicio,
        cliente_nombre,
        cliente_whatsapp: cliente_whatsapp || 'N/A',
        estado_pago: 'cortesia',
        monto_pagado: 0,
        tipo_reserva: 'admin',
        notas_admin: notas_admin || null
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json(data);
  } catch (error) {
    console.error('Error al crear reserva manual:', error);
    res.status(500).json({ error: error.message || 'Error al crear la reserva manual' });
  }
});

// POST /api/reservas/recurrente - Crear reserva recurrente y generar futuras
router.post('/recurrente', async (req, res) => {
  try {
    const { 
      cancha_id, 
      cliente_nombre, 
      cliente_whatsapp, 
      dia_semana, 
      horario_inicio, 
      fecha_inicio,
      notas_admin 
    } = req.body;

    if (!cancha_id || !cliente_nombre || dia_semana === undefined || !horario_inicio) {
      return res.status(400).json({ error: 'Faltan campos requeridos para reserva recurrente' });
    }

    // Parsear fecha asegurando que no reste un día por timezone
    // Agregamos T12:00:00 para que sea mediodía y absorba cualquier diferencia horaria local
    let currentDate = fecha_inicio ? new Date(fecha_inicio + 'T12:00:00') : new Date();
    
    // CRÍTICO: Recalcular el día de la semana basado en la fecha de inicio real
    // Esto evita discrepancias si el cliente manda un día incorrecto por timezone
    const diaReal = currentDate.getDay();
    console.log('Fecha inicial:', currentDate.toISOString(), 'Día Real:', diaReal, 'Día Enviado:', dia_semana);
    
    // Actualizamos el patrón con el día real
    const { data: patron, error: errorPatron } = await supabase
      .from('reservas_recurrentes')
      .insert([{
        cancha_id: parseInt(cancha_id),
        cliente_nombre,
        cliente_whatsapp,
        dia_semana: diaReal, // Usamos el calculado
        horario_inicio,
        fecha_inicio: fecha_inicio || new Date(),
        notas: notas_admin,
        activa: true
      }])
      .select()
      .single();

    if (errorPatron) {
        console.error('Error insertando patrón:', errorPatron);
        throw errorPatron;
    }
    console.log('Patrón creado:', patron);

    // 2. Generar reservas para las próximas 12 semanas
    const reservasGeneradas = [];
    const reservasFallidas = []; // Por colisiones
    
    // currentDate ya fue inicializada arriba correctamente con T12:00:00
    console.log('Fecha inicial para generación:', currentDate.toISOString());
    
    // Generar 12 semanas (aprox 3 meses)
    for (let i = 0; i < 12; i++) {
        const fechaStr = currentDate.toISOString().split('T')[0];
        
        // Verificar si ya existe reserva
        const { data: existente } = await supabase
            .from('reservas')
            .select('id')
            .eq('cancha_id', cancha_id)
            .eq('fecha', fechaStr)
            .eq('horario_inicio', horario_inicio)
            .maybeSingle();

        if (!existente) {
             // Calcular horario_fin (necesario por not-null constraint)
            const [hora, minuto] = horario_inicio.split(':');
            const horaFin = (parseInt(hora) + 1).toString().padStart(2, '0');
            const horario_fin = `${horaFin}:${minuto}`;

            const { error: errorReserva } = await supabase
                .from('reservas')
                .insert([{
                    cancha_id: parseInt(cancha_id),
                    fecha: fechaStr,
                    horario_inicio,
                    horario_fin, // Agregado horario_fin
                    cliente_nombre: `${cliente_nombre} (Fijo)`,
                    cliente_whatsapp: cliente_whatsapp || 'N/A',
                    estado_pago: 'cortesia',
                    monto_pagado: 0,
                    monto_total: 0,
                    tipo_reserva: 'recurrente',
                    notas_admin: `Generada por patrón recurrente #${patron.id}. ${notas_admin || ''}`
                }]);
            
            if (!errorReserva) {
                console.log(`Reserva generada para ${fechaStr}`);
                reservasGeneradas.push(fechaStr);
            } else {
                console.error(`Error generando reserva ${fechaStr}:`, errorReserva);
            }
        } else {
            console.log(`Colisión en ${fechaStr} - ${horario_inicio}`);
            reservasFallidas.push(fechaStr);
        }

        // Avanzar 1 semana
        currentDate.setDate(currentDate.getDate() + 7);
    }

    res.status(201).json({ 
        message: 'Reserva recurrente creada', 
        patron, 
        generadas: reservasGeneradas.length,
        fallidas: reservasFallidas.length,
        fechas_generadas: reservasGeneradas
    });

  } catch (error) {
    console.error('Error al crear reserva recurrente:', error);
    res.status(500).json({ error: error.message || 'Error interno' });
  }
});

// GET /api/reservas/recurrente - Listar reservas recurrentes activas
router.get('/recurrente', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('reservas_recurrentes')
      .select(`
        *,
        canchas ( nombre )
      `)
      .eq('activa', true)
      .order('dia_semana', { ascending: true })
      .order('horario_inicio', { ascending: true });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Error al obtener recurrentes:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/reservas/recurrente/:id - Eliminar patrón y reservas futuras asociadas
router.delete('/recurrente/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Obtener el patrón antes de borrarlo para saber qué reservas borrar
    const { data: patron, error: errorGet } = await supabase
      .from('reservas_recurrentes')
      .select('*')
      .eq('id', id)
      .single();

    if (errorGet) return res.status(404).json({ error: 'Patrón no encontrado' });

    // 2. Marcar patrón como inactivo (o borrar)
    const { error: errorDelete } = await supabase
      .from('reservas_recurrentes')
      .delete() // O .update({ active: false }) si preferimos soft delete. Borramos físico por simplicidad.
      .eq('id', id);

    if (errorDelete) throw errorDelete;

    // 3. Borrar reservas futuras generadas por este patrón
    // Estrategia: Borrar reservas de tipo 'recurrente' para esa cancha/hora/dia que sean futuras.
    // Ojo: Esto asume que no hay otras recurrentes superpuestas (el sistema deberia haberlo prevenido).
    
    // Postgres DOW: 0=Domingo, 6=Sabado. JS Day: 0=Domingo. Coinciden.
    const today = new Date().toISOString().split('T')[0];
    
    // Primero buscamos las reservas futuras que coincidan
    // Supabase no tiene una forma directa fácil de filtrar por DOW en JS client builder simple sin RPC,
    // pero podemos filtrar por cancha, horario y tipo, y fecha >= hoy.
    // Como borramos un patrón de "Lunes 17:00", borrar todas las futuras de "Lunes 17:00" recurrente es correcto.
    
    // Nota: Como no tenemos RPC para extract dow, vamos a traer las futuras candidatas y filtrar en backend
    // O mejor, confiamos en borrar por cancha+horario+tipo='recurrente' y nos aseguramos de no borrar otras.
    // Pero si hay otro patrón recurrente (raro en misma hora), podria conflictuar. 
    // Dado que bloqueamos colisiones al crear, asumimos que es seguro borrar por cancha+hora.

    /*
    Alternativa más segura si tuvieramos el ID del patrón guardado en la reserva.
    Como guardamos "Generada por patrón recurrente #ID" en notas_admin, podemos usar eso con un filtro like/textSearch.
    */

    const { error: errorReservas } = await supabase
      .from('reservas')
      .delete()
      .eq('cancha_id', patron.cancha_id)
      .eq('horario_inicio', patron.horario_inicio)
      .eq('tipo_reserva', 'recurrente')
      .gte('fecha', today)
      .ilike('notas_admin', `%patrón recurrente #${id}%`); // Filtro de seguridad usando el ID guardado en notas

    if (errorReservas) console.error('Error al borrar reservas futuras:', errorReservas);

    res.json({ message: 'Reserva recurrente eliminada y turnos futuros liberados' });

  } catch (error) {
    console.error('Error al eliminar recurrente:', error);
    res.status(500).json({ error: error.message });
  }
});
