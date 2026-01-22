import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../components/Card';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import { LoadingScreen } from '../components/Loader';
import { useToast, ToastContainer } from '../components/Toast';
import { canchasApi, reservasApi } from '../utils/api';
import { formatCurrency, formatDate, getTodayString } from '../utils/formatters';
import { validateForm } from '../utils/validators';

export const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tipo = searchParams.get('tipo');
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fecha, setFecha] = useState(getTodayString());
  const [disponibilidadMatrix, setDisponibilidadMatrix] = useState({});
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null); // { canchaId, horario }
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    cliente_nombre: '',
    cliente_whatsapp: '',
    estado_pago: 'completo'
  });

  const [errors, setErrors] = useState({});

  // Horarios disponibles (17:00 a 23:00)
  const horarios = [];
  for (let hora = 17; hora < 23; hora++) {
    horarios.push(`${hora.toString().padStart(2, '0')}:00`);
  }

  useEffect(() => {
    loadCanchas();
  }, [id, tipo]);

  useEffect(() => {
    if (fecha && canchas.length > 0) {
      loadDisponibilidad();
    }
  }, [fecha, canchas]);

  const loadCanchas = async () => {
    try {
      let data;
      if (tipo) {
        // Cargar todas las canchas del mismo tipo
        data = await canchasApi.getByTipo(tipo);
      } else {
        // Cargar solo la cancha específica
        const cancha = await canchasApi.getById(id);
        data = [cancha];
      }
      setCanchas(data);
    } catch (error) {
      showError('Error al cargar las canchas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadDisponibilidad = async () => {
    setLoadingDisponibilidad(true);
    try {
      const matrix = {};
      
      // Cargar disponibilidad para cada cancha
      await Promise.all(
        canchas.map(async (cancha) => {
          const data = await reservasApi.getDisponibilidad(cancha.id, fecha);
          matrix[cancha.id] = data.reduce((acc, slot) => {
            acc[slot.horario] = slot.disponible;
            return acc;
          }, {});
        })
      );
      
      setDisponibilidadMatrix(matrix);
    } catch (error) {
      showError('Error al cargar disponibilidad');
      console.error(error);
    } finally {
      setLoadingDisponibilidad(false);
    }
  };

  const handleSlotClick = (canchaId, horario) => {
    if (disponibilidadMatrix[canchaId]?.[horario]) {
      setSelectedSlot({ canchaId, horario });
      setShowModal(true);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateForm(formData, {
      cliente_nombre: { required: true, minLength: 3 },
      cliente_whatsapp: { required: true, phone: true },
      estado_pago: { required: true }
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setSubmitting(true);

    try {
      await reservasApi.create({
        cancha_id: parseInt(selectedSlot.canchaId),
        fecha,
        horario_inicio: selectedSlot.horario,
        ...formData
      });

      showSuccess('¡Reserva creada exitosamente!');
      
      setTimeout(() => {
        navigate('/');
      }, 2000);
    } catch (error) {
      showError(error.message || 'Error al crear la reserva');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando información..."/>;
  }

  if (canchas.length === 0) {
    return (
      <div className="container" style={{ paddingTop: 'var(--spacing-2xl)' }}>
        <Card>
          <CardBody>
            <h2>No hay canchas disponibles</h2>
            <Button onClick={() => navigate('/')}>Volver al inicio</Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  const selectedCancha = selectedSlot ? canchas.find(c => c.id === selectedSlot.canchaId) : null;

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Button 
        variant="outline" 
        onClick={() => navigate('/')}
        style={{ marginBottom: 'var(--spacing-lg)' }}
      >
        ← Volver
      </Button>

      <h1 className="mb-lg" style={{ color: 'var(--color-primary)' }}>
        {tipo || canchas[0].tipo} - Disponibilidad
      </h1>

      {/* Selector de fecha */}
      <Card hover={false} style={{ marginBottom: 'var(--spacing-lg)' }}>
        <CardBody>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">📅 Seleccionar Fecha</label>
            <input
              type="date"
              className="form-input"
              value={fecha}
              min={getTodayString()}
              onChange={(e) => setFecha(e.target.value)}
              style={{ maxWidth: '300px' }}
            />
            <p className="text-sm text-secondary" style={{ marginTop: 'var(--spacing-xs)', marginBottom: 0 }}>
              Fecha seleccionada: <strong>{formatDate(fecha)}</strong>
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Matriz de disponibilidad */}
      <Card hover={false}>
        <CardHeader>
          <CardTitle>Disponibilidad por Cancha y Horario</CardTitle>
        </CardHeader>
        <CardBody>
          {loadingDisponibilidad ? (
            <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
              <div className="loader" style={{ margin: '0 auto' }}></div>
              <p className="text-secondary mt-md">Cargando disponibilidad...</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 'var(--font-size-sm)'
              }}>
                <thead>
                  <tr>
                    <th style={{
                      padding: 'var(--spacing-sm)',
                      textAlign: 'left',
                      borderBottom: '2px solid var(--color-border)',
                      position: 'sticky',
                      left: 0,
                      background: 'white',
                      zIndex: 2
                    }}>
                      Horario
                    </th>
                    {canchas.map((cancha) => (
                      <th key={cancha.id} style={{
                        padding: 'var(--spacing-sm)',
                        textAlign: 'center',
                        borderBottom: '2px solid var(--color-border)',
                        minWidth: '100px'
                      }}>
                        {cancha.nombre.split(' - ')[0]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {horarios.map((horario) => (
                    <tr key={horario}>
                      <td style={{
                        padding: 'var(--spacing-sm)',
                        fontWeight: '600',
                        borderBottom: '1px solid var(--color-border)',
                        position: 'sticky',
                        left: 0,
                        background: 'white',
                        zIndex: 1
                      }}>
                        {horario}
                      </td>
                      {canchas.map((cancha) => {
                        const disponible = disponibilidadMatrix[cancha.id]?.[horario];
                        return (
                          <td key={`${cancha.id}-${horario}`} style={{
                            padding: '4px',
                            borderBottom: '1px solid var(--color-border)',
                            textAlign: 'center'
                          }}>
                            <button
                              onClick={() => handleSlotClick(cancha.id, horario)}
                              disabled={!disponible}
                              style={{
                                width: '100%',
                                padding: 'var(--spacing-sm)',
                                border: '2px solid',
                                borderColor: disponible ? 'var(--color-success)' : 'var(--color-error)',
                                backgroundColor: disponible ? '#d1fae5' : '#fee2e2',
                                color: disponible ? '#065f46' : '#991b1b',
                                borderRadius: 'var(--radius-sm)',
                                cursor: disponible ? 'pointer' : 'not-allowed',
                                fontWeight: '600',
                                fontSize: 'var(--font-size-xs)',
                                transition: 'all var(--transition-base)'
                              }}
                              className={disponible ? 'hover-scale' : ''}
                            >
                              {disponible ? '✓' : '✕'}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{
            marginTop: 'var(--spacing-lg)',
            padding: 'var(--spacing-md)',
            background: 'var(--color-bg-tertiary)',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            gap: 'var(--spacing-lg)',
            flexWrap: 'wrap',
            justifyContent: 'center'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: '#d1fae5',
                border: '2px solid var(--color-success)',
                borderRadius: 'var(--radius-sm)'
              }}></div>
              <span className="text-sm">Disponible</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: '#fee2e2',
                border: '2px solid var(--color-error)',
                borderRadius: 'var(--radius-sm)'
              }}></div>
              <span className="text-sm">Ocupado</span>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Modal de reserva */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Completar Reserva"
        size="lg"
      >
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--spacing-lg)'
            }}>
              <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Resumen de Reserva</h4>
              <div className="flex flex-col gap-sm text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary">Cancha:</span>
                  <strong>{selectedCancha?.nombre}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Fecha:</span>
                  <strong>{formatDate(fecha)}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">Horario:</span>
                  <strong>{selectedSlot?.horario}</strong>
                </div>
                <div className="flex justify-between" style={{ 
                  paddingTop: 'var(--spacing-sm)',
                  borderTop: '1px solid var(--color-border)',
                  marginTop: 'var(--spacing-sm)'
                }}>
                  <span className="text-secondary">Precio:</span>
                  <strong style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-lg)' }}>
                    {selectedCancha && formatCurrency(selectedCancha.precio_hora)}
                  </strong>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Nombre Completo *</label>
              <input
                type="text"
                name="cliente_nombre"
                className={`form-input ${errors.cliente_nombre ? 'error' : ''}`}
                value={formData.cliente_nombre}
                onChange={handleInputChange}
                placeholder="Ej: Juan Pérez"
              />
              {errors.cliente_nombre && (
                <p className="form-error">{errors.cliente_nombre}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Número de WhatsApp *</label>
              <input
                type="tel"
                name="cliente_whatsapp"
                className={`form-input ${errors.cliente_whatsapp ? 'error' : ''}`}
                value={formData.cliente_whatsapp}
                onChange={handleInputChange}
                placeholder="Ej: 11 1234-5678"
              />
              {errors.cliente_whatsapp && (
                <p className="form-error">{errors.cliente_whatsapp}</p>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Tipo de Pago *</label>
              <div className="flex flex-col gap-sm">
                <label style={{
                  padding: 'var(--spacing-md)',
                  border: '2px solid',
                  borderColor: formData.estado_pago === 'completo' ? 'var(--color-primary)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: formData.estado_pago === 'completo' ? 'rgba(22, 163, 74, 0.05)' : 'transparent',
                  transition: 'all var(--transition-base)'
                }}>
                  <input
                    type="radio"
                    name="estado_pago"
                    value="completo"
                    checked={formData.estado_pago === 'completo'}
                    onChange={handleInputChange}
                    style={{ marginRight: 'var(--spacing-sm)' }}
                  />
                  <strong>Pago Completo</strong> - {selectedCancha && formatCurrency(selectedCancha.precio_hora)}
                </label>

                <label style={{
                  padding: 'var(--spacing-md)',
                  border: '2px solid',
                  borderColor: formData.estado_pago === 'seña' ? 'var(--color-primary)' : 'var(--color-border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  backgroundColor: formData.estado_pago === 'seña' ? 'rgba(22, 163, 74, 0.05)' : 'transparent',
                  transition: 'all var(--transition-base)'
                }}>
                  <input
                    type="radio"
                    name="estado_pago"
                    value="seña"
                    checked={formData.estado_pago === 'seña'}
                    onChange={handleInputChange}
                    style={{ marginRight: 'var(--spacing-sm)' }}
                  />
                  <div>
                    <strong>Seña (50%)</strong> - {selectedCancha && formatCurrency(selectedCancha.precio_hora * 0.5)}
                    <div style={{ 
                      fontSize: 'var(--font-size-sm)', 
                      color: 'var(--color-text-secondary)',
                      marginTop: 'var(--spacing-xs)'
                    }}>
                      Abonás el resto ({selectedCancha && formatCurrency(selectedCancha.precio_hora * 0.5)}) en la cancha
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <div style={{
              padding: 'var(--spacing-md)',
              backgroundColor: 'var(--color-bg-tertiary)',
              borderRadius: 'var(--radius-md)',
              border: '2px solid var(--color-primary)'
            }}>
              <p className="text-sm" style={{ marginBottom: 'var(--spacing-xs)' }}>
                <strong>Monto a pagar ahora:</strong>
              </p>
              <p style={{ 
                fontSize: 'var(--font-size-2xl)',
                fontWeight: '700',
                color: 'var(--color-primary)',
                marginBottom: 0
              }}>
                {selectedCancha && formatCurrency(
                  formData.estado_pago === 'completo' 
                    ? selectedCancha.precio_hora 
                    : selectedCancha.precio_hora * 0.5
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-md justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting}
            >
              {submitting ? 'Procesando...' : 'Confirmar Reserva'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
