import React from 'react';
import { Card, CardBody } from '../../components/Card';
import { Button } from '../../components/Button';
import { formatDate, formatTime, formatCurrency, formatPhone, getEstadoPagoLabel, getEstadoPagoBadgeClass } from '../../utils/formatters';

export const ReservaCard = ({ reserva, onUpdatePago, onCancel }) => {
  return (
    <Card hover={false} style={{ marginBottom: 'var(--spacing-md)' }}>
      <CardBody>
        <div className="flex justify-between items-center" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div>
            <h4 style={{ color: 'var(--color-primary)', marginBottom: 'var(--spacing-xs)' }}>
              {reserva.canchas?.nombre || 'Cancha'}
            </h4>
            <span className="badge badge-info">{reserva.canchas?.tipo}</span>
          </div>
          <span className={`badge ${getEstadoPagoBadgeClass(reserva.estado_pago)}`}>
            {getEstadoPagoLabel(reserva.estado_pago)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-md" style={{ marginBottom: 'var(--spacing-md)' }}>
          <div>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>
              📅 Fecha
            </p>
            <p className="font-semibold">{formatDate(reserva.fecha)}</p>
          </div>
          <div>
            <p className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>
              🕐 Horario
            </p>
            <p className="font-semibold">
              {formatTime(reserva.horario_inicio)} - {formatTime(reserva.horario_fin)}
            </p>
          </div>
        </div>

        <div style={{
          padding: 'var(--spacing-md)',
          backgroundColor: 'var(--color-bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          marginBottom: 'var(--spacing-md)'
        }}>
          <div className="flex justify-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
            <span className="text-sm text-secondary">Cliente:</span>
            <strong>{reserva.cliente_nombre}</strong>
          </div>
          <div className="flex justify-between" style={{ marginBottom: 'var(--spacing-sm)' }}>
            <span className="text-sm text-secondary">WhatsApp:</span>
            <a
              href={`https://wa.me/${reserva.cliente_whatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontWeight: '600' }}
            >
              {formatPhone(reserva.cliente_whatsapp)} 📱
            </a>
          </div>
          <div className="flex justify-between" style={{
            paddingTop: 'var(--spacing-sm)',
            borderTop: '1px solid var(--color-border)',
            marginTop: 'var(--spacing-sm)'
          }}>
            <span className="text-sm text-secondary">Monto Total:</span>
            <strong style={{ color: 'var(--color-primary)' }}>
              {formatCurrency(reserva.monto_total)}
            </strong>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-secondary">Monto Pagado:</span>
            <strong style={{ color: reserva.monto_pagado > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
              {formatCurrency(reserva.monto_pagado)}
            </strong>
          </div>
        </div>

        <div className="flex gap-sm mobile-grid-2">
          {reserva.estado_pago !== 'completo' && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onUpdatePago(reserva.id, 'completo')}
              className="w-full"
            >
              Pagado
            </Button>
          )}
          {reserva.estado_pago === 'pendiente' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onUpdatePago(reserva.id, 'seña')}
              className="w-full"
            >
              Seña
            </Button>
          )}
          <Button
            variant="danger"
            size="sm"
            onClick={() => onCancel(reserva.id)}
            className="w-full mobile-span-2"
          >
            Cancelar
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};
