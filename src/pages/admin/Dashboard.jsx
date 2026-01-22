import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { LoadingScreen } from '../../components/Loader';
import { useToast, ToastContainer } from '../../components/Toast';
import { ReservaCard } from '../../components/admin/ReservaCard';
import { NuevaReservaModal } from '../../components/admin/NuevaReservaModal';
import { GestionRecurrentesModal } from '../../components/admin/GestionRecurrentesModal';
import { useAuth } from '../../context/AuthContext';
import { canchasApi, reservasApi } from '../../utils/api';
import { getTodayString } from '../../utils/formatters';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toasts, removeToast, showSuccess, showError } = useToast();

  const [reservas, setReservas] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    fecha: '',
    cancha_id: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoPagoFilter, setEstadoPagoFilter] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showNuevaReservaModal, setShowNuevaReservaModal] = useState(false);
  const [showRecurrentesModal, setShowRecurrentesModal] = useState(false);
  const [selectedReservaId, setSelectedReservaId] = useState(null);

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [reservasData, canchasData] = await Promise.all([
        reservasApi.getAll(filters),
        canchasApi.getAll()
      ]);
      setReservas(reservasData);
      setCanchas(canchasData);
    } catch (error) {
      showError('Error al cargar los datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePago = async (id, estadoPago) => {
    try {
      await reservasApi.updatePago(id, estadoPago);
      showSuccess('Estado de pago actualizado');
      loadData();
    } catch (error) {
      showError('Error al actualizar el pago');
      console.error(error);
    }
  };

  const handleCancelClick = (id) => {
    setSelectedReservaId(id);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    try {
      await reservasApi.cancel(selectedReservaId);
      showSuccess('Reserva cancelada exitosamente');
      setShowCancelModal(false);
      setSelectedReservaId(null);
      loadData();
    } catch (error) {
      showError('Error al cancelar la reserva');
      console.error(error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const getEstadisticas = () => {
    const total = reservas.length;
    const pagadas = reservas.filter(r => r.estado_pago === 'completo').length;
    const pendientes = reservas.filter(r => r.estado_pago === 'seña').length;
    const totalIngresos = reservas.reduce((sum, r) => sum + parseFloat(r.monto_pagado || 0), 0);

    const ingresosDia = filters.fecha 
      ? reservas
          .filter(r => r.fecha === filters.fecha)
          .reduce((sum, r) => sum + parseFloat(r.monto_pagado || 0), 0)
      : 0;

    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();
    
    const ingresosMes = reservas
      .filter(r => {
        const fechaReserva = new Date(r.fecha);
        return fechaReserva.getMonth() === mesActual && 
               fechaReserva.getFullYear() === añoActual;
      })
      .reduce((sum, r) => sum + parseFloat(r.monto_pagado || 0), 0);

    return { total, pagadas, pendientes, totalIngresos, ingresosDia, ingresosMes };
  };

  const stats = getEstadisticas();

  const getReservasFiltradas = () => {
    let filtered = reservas;

    // Si no hay filtros activos, ocultar las reservas recurrentes para no inundar la lista
    // El usuario prefiere verlas solo en "Ver Fijas" o buscando específicamente
    const isGeneralView = !filters.fecha && !filters.cancha_id && !searchTerm && !estadoPagoFilter;
    if (isGeneralView) {
      filtered = filtered.filter(r => r.tipo_reserva !== 'recurrente');
    }

    if (searchTerm) {
      filtered = filtered.filter(r => 
        r.cliente_nombre.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (estadoPagoFilter) {
      filtered = filtered.filter(r => r.estado_pago === estadoPagoFilter);
    }

    return filtered;
  };

  const reservasFiltradas = getReservasFiltradas();

  if (loading && reservas.length === 0) {
    return <LoadingScreen message="Cargando dashboard..." />;
  }

  return (
    <div className="container" style={{ paddingTop: 'var(--spacing-2xl)', paddingBottom: 'var(--spacing-2xl)' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* Header */}
      <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-xl)' }}>
        <div>
          <h1 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-xs)' }}>
            Panel de Administración
          </h1>
          <p className="text-secondary">Bienvenido, {user?.username}</p>
        </div>
        <div className="flex gap-md">
          <Button 
            variant="secondary" 
            onClick={loadData}
            disabled={loading}
          >
            {loading ? '🔄 Actualizando...' : '🔄 Actualizar'}
          </Button>
          <Button 
            variant="primary" 
            onClick={() => setShowNuevaReservaModal(true)}
          >
            ➕ Nueva Reserva
          </Button>
          <Button 
            variant="secondary" 
            onClick={() => setShowRecurrentesModal(true)}
            style={{ backgroundColor: '#4f46e5', color: 'white', borderColor: '#4338ca' }}
          >
            📅 Ver Fijas
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Ver Sitio
          </Button>
          <Button variant="danger" onClick={handleLogout}>
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 gap-md" style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        marginBottom: 'var(--spacing-xl)'
      }}>
        <Card hover={false}>
          <CardBody>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>
              Total Reservas
            </p>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--color-primary)', marginBottom: 0 }}>
              {stats.total}
            </p>
          </CardBody>
        </Card>

        <Card hover={false}>
          <CardBody>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>
              Pagadas Completo
            </p>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--color-success)', marginBottom: 0 }}>
              {stats.pagadas}
            </p>
          </CardBody>
        </Card>

        <Card hover={false}>
          <CardBody>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>
              Pago Parcial (Seña)
            </p>
            <p style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700', color: 'var(--color-warning)', marginBottom: 0 }}>
              {stats.pendientes}
            </p>
          </CardBody>
        </Card>

        <Card hover={false}>
          <CardBody>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>
              Ingresos Totales
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: 'var(--color-primary)', marginBottom: 0 }}>
              ${stats.totalIngresos.toLocaleString('es-AR')}
            </p>
          </CardBody>
        </Card>

        {filters.fecha && (
          <Card hover={false} style={{ 
            background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
            border: '2px solid var(--color-info)'
          }}>
            <CardBody>
              <p className="text-sm" style={{ marginBottom: 'var(--spacing-xs)', color: '#1e40af', fontWeight: '600' }}>
                💵 Ingresos del Día
              </p>
              <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: '#1e40af', marginBottom: 0 }}>
                ${stats.ingresosDia.toLocaleString('es-AR')}
              </p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: '#1e40af', marginTop: 'var(--spacing-xs)', opacity: 0.8 }}>
                {new Date(filters.fecha).toLocaleDateString('es-AR', { day: 'numeric', month: 'long' })}
              </p>
            </CardBody>
          </Card>
        )}

        <Card hover={false} style={{ 
          background: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
          border: '2px solid var(--color-success)'
        }}>
          <CardBody>
            <p className="text-sm" style={{ marginBottom: 'var(--spacing-xs)', color: '#065f46', fontWeight: '600' }}>
              📊 Ingresos del Mes
            </p>
            <p style={{ fontSize: 'var(--font-size-2xl)', fontWeight: '700', color: '#065f46', marginBottom: 0 }}>
              ${stats.ingresosMes.toLocaleString('es-AR')}
            </p>
            <p style={{ fontSize: 'var(--font-size-xs)', color: '#065f46', marginTop: 'var(--spacing-xs)', opacity: 0.8 }}>
              {new Date().toLocaleDateString('es-AR', { month: 'long', year: 'numeric' })}
            </p>
          </CardBody>
        </Card>
      </div>

      {/* Filtros y Búsqueda */}
      <Card hover={false} style={{ marginBottom: 'var(--spacing-lg)' }}>
        <CardHeader>
          <CardTitle>Filtros y Búsqueda</CardTitle>
        </CardHeader>
        <CardBody>
          <div className="form-group">
            <label className="form-label">🔍 Buscar por Nombre</label>
            <input
              type="text"
              className="form-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ej: Juan Pérez"
            />
          </div>

          <div className="form-group">
            <label className="form-label">💳 Estado de Pago</label>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
              <Button
                variant={estadoPagoFilter === '' ? 'primary' : 'outline'}
                onClick={() => setEstadoPagoFilter('')}
                size="sm"
              >
                Todos ({reservas.length})
              </Button>
              <Button
                variant={estadoPagoFilter === 'completo' ? 'primary' : 'outline'}
                onClick={() => setEstadoPagoFilter('completo')}
                size="sm"
                style={{
                  borderColor: estadoPagoFilter === 'completo' ? 'var(--color-success)' : undefined,
                  backgroundColor: estadoPagoFilter === 'completo' ? 'var(--color-success)' : undefined
                }}
              >
                ✅ Pagado Completo ({stats.pagadas})
              </Button>
              <Button
                variant={estadoPagoFilter === 'seña' ? 'primary' : 'outline'}
                onClick={() => setEstadoPagoFilter('seña')}
                size="sm"
                style={{
                  borderColor: estadoPagoFilter === 'seña' ? 'var(--color-warning)' : undefined,
                  backgroundColor: estadoPagoFilter === 'seña' ? 'var(--color-warning)' : undefined,
                  color: estadoPagoFilter === 'seña' ? 'var(--color-text-primary)' : undefined
                }}
              >
                ⏳ Seña ({stats.pendientes})
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-md" style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'
          }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">📅 Fecha</label>
              <input
                type="date"
                className="form-input"
                value={filters.fecha}
                onChange={(e) => setFilters(prev => ({ ...prev, fecha: e.target.value }))}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">🏟️ Cancha</label>
              <select
                className="form-select"
                value={filters.cancha_id}
                onChange={(e) => setFilters(prev => ({ ...prev, cancha_id: e.target.value }))}
              >
                <option value="">Todas las canchas</option>
                {canchas.map(cancha => (
                  <option key={cancha.id} value={cancha.id}>
                    {cancha.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({ fecha: '', cancha_id: '' });
                  setSearchTerm('');
                  setEstadoPagoFilter('');
                }}
                style={{ width: '100%' }}
              >
                Limpiar Todo
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Lista de Reservas */}
      <div>
        <h2 className="mb-lg">
          Reservas {searchTerm || estadoPagoFilter || filters.fecha || filters.cancha_id ? 'Filtradas' : 'Recientes'}
          {reservasFiltradas.length !== reservas.length && (
            <span style={{ fontSize: 'var(--font-size-base)', fontWeight: 'normal', color: 'var(--color-text-secondary)', marginLeft: 'var(--spacing-sm)' }}>
              ({reservasFiltradas.length} de {reservas.length})
            </span>
          )}
        </h2>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
            <div className="loader" style={{ margin: '0 auto' }}></div>
            <p className="text-secondary mt-md">Cargando reservas...</p>
          </div>
        ) : reservasFiltradas.length === 0 ? (
          <Card hover={false}>
            <CardBody style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
              <p className="text-secondary">
                {searchTerm || estadoPagoFilter ? 'No se encontraron reservas con los filtros aplicados' : 'No hay reservas para mostrar'}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div>
            {reservasFiltradas.map(reserva => (
              <ReservaCard
                key={reserva.id}
                reserva={reserva}
                onUpdatePago={handleUpdatePago}
                onCancel={handleCancelClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal de Nueva Reserva */}
      <NuevaReservaModal
        isOpen={showNuevaReservaModal}
        onClose={() => setShowNuevaReservaModal(false)}
        onSuccess={(message) => {
          showSuccess(message);
          loadData();
        }}
      />

      {/* Modal de Gestión de Recurrentes */}
      <GestionRecurrentesModal
        isOpen={showRecurrentesModal}
        onClose={() => setShowRecurrentesModal(false)}
      />

      {/* Modal de confirmación de cancelación */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Confirmar Cancelación"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              No, mantener
            </Button>
            <Button variant="danger" onClick={handleCancelConfirm}>
              Sí, cancelar reserva
            </Button>
          </>
        }
      >
        <p>¿Estás seguro que deseas cancelar esta reserva?</p>
        <p className="text-secondary text-sm">Esta acción no se puede deshacer.</p>
      </Modal>
    </div>
  );
};
