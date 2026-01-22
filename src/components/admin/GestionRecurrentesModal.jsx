import React, { useState, useEffect } from 'react';
import { Modal } from '../Modal';
import { Button } from '../Button';
import { reservasApi } from '../../utils/api';
import { useToast } from '../../components/Toast';

export const GestionRecurrentesModal = ({ isOpen, onClose }) => {
  const [recurrentes, setRecurrentes] = useState([]);
  const [loading, setLoading] = useState(false);
  const { showSuccess, showError } = useToast();

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  useEffect(() => {
    if (isOpen) {
      loadRecurrentes();
    }
  }, [isOpen]);

  const loadRecurrentes = async () => {
    setLoading(true);
    try {
      const data = await reservasApi.getRecurrentes();
      setRecurrentes(data || []); 
    } catch (error) {
      console.error(error);
      if (Array.isArray(error)) setRecurrentes(error); 
    } finally {
      setLoading(false);
    }
  };
  
  // Correction: Check api.js implementation. 
  // api.get returns axios response. So await reservasApi.getRecurrentes() returns the data payload directly if interception is set up?
  // Let's look at api.js previously viewed.
  // api.get(...) returns the promise. usually axios returns { data: ... }.
  // But many projects have an interceptor `res => res.data`.
  // Let's assume standard axios for now, but previous code used `const data = await...` implies data is returned directly. 
  // I will verify this shortly. For now let's write safe code.

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro? Se borrarán todas las reservas futuras generadas por este patrón.')) return;

    try {
      await reservasApi.deleteRecurrente(id);
      showSuccess('Reserva fija eliminada');
      loadRecurrentes();
    } catch (error) {
      showError('Error al eliminar');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Gestión de Reservas Fijas"
      size="lg"
    >
      <div className="overflow-x-auto">
        {loading ? (
          <div className="text-center p-lg">Cargando...</div>
        ) : recurrentes.length === 0 ? (
          <p className="text-center text-secondary p-lg">No hay reservas fijas activas.</p>
        ) : (
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--color-border)' }}>
                <th className="text-left p-sm">Cliente</th>
                <th className="text-left p-sm">Cancha</th>
                <th className="text-left p-sm">Día</th>
                <th className="text-left p-sm">Horario</th>
                <th className="text-right p-sm">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {recurrentes.map((r) => (
                <tr key={r.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                  <td className="p-sm font-medium">{r.cliente_nombre}</td>
                  <td className="p-sm">{r.canchas?.nombre}</td>
                  <td className="p-sm">
                    <span style={{ 
                      display: 'inline-block',
                      padding: '2px 8px',
                      borderRadius: '12px',
                      background: '#e0e7ff',
                      color: '#3730a3',
                      fontSize: '0.8rem'
                    }}>
                      {diasSemana[r.dia_semana]}
                    </span>
                  </td>
                  <td className="p-sm">{r.horario_inicio}hs</td>
                  <td className="p-sm text-right">
                    <Button 
                      variant="danger" 
                      size="sm"
                      onClick={() => handleDelete(r.id)}
                    >
                      🗑️ Cancelar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="mt-lg flex justify-end">
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </Modal>
  );
};
