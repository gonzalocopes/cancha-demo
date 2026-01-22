import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { canchasApi, reservasApi } from '../../utils/api';
import { getTodayString } from '../../utils/formatters';

export const NuevaReservaModal = ({ isOpen, onClose, onSuccess }) => {
  const [canchas, setCanchas] = useState([]);
  const [formData, setFormData] = useState({
    cancha_id: '',
    fecha: getTodayString(),
    horario_inicio: '',
    cliente_nombre: '',
    cliente_whatsapp: '',
    notas_admin: '',
    es_recurrente: false
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  // Horarios posibles
  const todosLosHorarios = [];
  for (let hora = 17; hora < 24; hora++) {
    todosLosHorarios.push(`${hora.toString().padStart(2, '0')}:00`);
  }

  useEffect(() => {
    if (isOpen) {
      loadCanchas();
    }
  }, [isOpen]);

  useEffect(() => {
    if (formData.cancha_id && formData.fecha) {
      loadDisponibilidad();
    }
  }, [formData.cancha_id, formData.fecha]);

  const loadCanchas = async () => {
    try {
      const data = await canchasApi.getAll();
      setCanchas(data);
    } catch (error) {
      console.error('Error al cargar canchas:', error);
    }
  };

  const loadDisponibilidad = async () => {
    try {
      const data = await reservasApi.getDisponibilidad(formData.cancha_id, formData.fecha);
      const disponibles = data.filter(h => h.disponible).map(h => h.horario);
      setHorariosDisponibles(disponibles);
    } catch (error) {
      console.error('Error al cargar disponibilidad:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    const newErrors = {};
    if (!formData.cancha_id) newErrors.cancha_id = 'Seleccioná una cancha';
    if (!formData.fecha) newErrors.fecha = 'Seleccioná una fecha';
    if (!formData.horario_inicio) newErrors.horario_inicio = 'Seleccioná un horario';
    if (!formData.cliente_nombre.trim()) newErrors.cliente_nombre = 'Ingresá el nombre del cliente';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);

    try {
      if (formData.es_recurrente) {
        // Lógica para recurrente
        // Usar T12:00:00 para asegurar que el día de la semana sea correcto independientemente del timezone
        const fecha = new Date(formData.fecha + 'T12:00:00');
        const diaSemana = fecha.getDay(); // 0-6

        await reservasApi.createRecurrente({
          ...formData,
          dia_semana: diaSemana,
          fecha_inicio: formData.fecha
        });
        onSuccess('Reserva fija creada y turnos generados exitosamente');
      } else {
        // Lógica manual simple
        await reservasApi.createManual(formData);
        onSuccess('Reserva manual creada exitosamente');
      }
      handleClose();
    } catch (error) {
      setErrors({ submit: error.message || 'Error al crear la reserva' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      cancha_id: '',
      fecha: getTodayString(),
      horario_inicio: '',
      cliente_nombre: '',
      cliente_whatsapp: '',
      notas_admin: '',
      es_recurrente: false
    });
    setErrors({});
    setHorariosDisponibles([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={formData.es_recurrente ? "Nueva Reserva Fija (Recurrente)" : "Nueva Reserva Manual"}
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 'var(--spacing-lg)' }}>
          {errors.submit && (
            <div style={{
              padding: 'var(--spacing-md)',
              background: '#fee2e2',
              border: '1px solid var(--color-error)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-error)',
              marginBottom: 'var(--spacing-md)'
            }}>
              {errors.submit}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">🏟️ Cancha *</label>
            <select
              name="cancha_id"
              className={`form-select ${errors.cancha_id ? 'error' : ''}`}
              value={formData.cancha_id}
              onChange={handleInputChange}
            >
              <option value="">Seleccioná una cancha</option>
              {canchas.map(cancha => (
                <option key={cancha.id} value={cancha.id}>
                  {cancha.nombre}
                </option>
              ))}
            </select>
            {errors.cancha_id && <p className="form-error">{errors.cancha_id}</p>}
          </div>

          <div className="grid grid-cols-1 gap-md" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            <div className="form-group">
              <label className="form-label">📅 Fecha de Inicio *</label>
              <input
                type="date"
                name="fecha"
                className={`form-input ${errors.fecha ? 'error' : ''}`}
                value={formData.fecha}
                min={getTodayString()}
                onChange={handleInputChange}
              />
              {errors.fecha && <p className="form-error">{errors.fecha}</p>}
            </div>

            <div className="form-group">
              <label className="form-label">🕐 Horario *</label>
              <select
                name="horario_inicio"
                className={`form-select ${errors.horario_inicio ? 'error' : ''}`}
                value={formData.horario_inicio}
                onChange={handleInputChange}
                disabled={!formData.cancha_id || !formData.fecha}
              >
                <option value="">Seleccioná horario</option>
                {todosLosHorarios.map(horario => (
                  <option
                    key={horario}
                    value={horario}
                    disabled={!horariosDisponibles.includes(horario)}
                  >
                    {horario} {(!horariosDisponibles.includes(horario)) ? '(Ocupado)' : ''}
                  </option>
                ))}
              </select>
              {errors.horario_inicio && <p className="form-error">{errors.horario_inicio}</p>}
            </div>
          </div>

          <div className="form-group">
            <label className="flex items-center gap-sm cursor-pointer" style={{
              padding: 'var(--spacing-sm)',
              background: formData.es_recurrente ? 'var(--color-bg-secondary)' : 'transparent',
              border: formData.es_recurrente ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              transition: 'all 0.2s'
            }}>
              <input
                type="checkbox"
                name="es_recurrente"
                checked={formData.es_recurrente}
                onChange={handleInputChange}
                style={{ width: '1.2rem', height: '1.2rem' }}
              />
              <span style={{ fontWeight: formData.es_recurrente ? '600' : 'normal' }}>
                🔄
                {formData.es_recurrente && formData.fecha
                  ? ` Se repetirá todos los ${new Date(formData.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long' }).toUpperCase()}`
                  : ' Hacer reserva fija (se repite todas las semanas)'
                }
              </span>
            </label>
            {formData.es_recurrente && (
              <p className="text-secondary text-sm mt-xs ml-lg">
                Se generarán reservas automáticamente para las próximas 12 semanas.
              </p>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">👤 Nombre del Cliente *</label>
            <input
              type="text"
              name="cliente_nombre"
              className={`form-input ${errors.cliente_nombre ? 'error' : ''}`}
              value={formData.cliente_nombre}
              onChange={handleInputChange}
              placeholder="Ej: Juan Pérez"
            />
            {errors.cliente_nombre && <p className="form-error">{errors.cliente_nombre}</p>}
          </div>

          <div className="form-group">
            <label className="form-label">📱 WhatsApp (opcional)</label>
            <input
              type="tel"
              name="cliente_whatsapp"
              className="form-input"
              value={formData.cliente_whatsapp}
              onChange={handleInputChange}
              placeholder="Ej: 11 1234-5678"
            />
          </div>

          <div className="form-group">
            <label className="form-label">📝 Notas (opcional)</label>
            <textarea
              name="notas_admin"
              className="form-textarea"
              value={formData.notas_admin}
              onChange={handleInputChange}
              placeholder="Ej: Cliente habitual, paga en efectivo"
              rows="3"
            />
          </div>

          <div style={{
            padding: 'var(--spacing-md)',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            border: '2px solid var(--color-info)'
          }}>
            <p style={{ fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-xs)' }}>
              <strong>ℹ️ Información:</strong>
            </p>
            <ul style={{ fontSize: 'var(--font-size-sm)', marginLeft: 'var(--spacing-lg)', marginBottom: 0 }}>
              <li>Esta reserva no requiere pago</li>
              <li>Se marcará como "Cortesía Admin"</li>
              <li>El horario quedará ocupado automáticamente</li>
              {formData.es_recurrente && (
                <li style={{ color: 'var(--color-primary)', fontWeight: 'bold' }}>
                  Es una reserva FIJA (se repite semanalmente)
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="flex gap-md justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={submitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={submitting}
          >
            {submitting ? 'Creando...' : (formData.es_recurrente ? '✅ Crear Reserva Fija' : '✅ Crear Reserva')}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
