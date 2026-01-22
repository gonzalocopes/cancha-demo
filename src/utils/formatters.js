import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

export const formatDate = (date, formatStr = 'dd/MM/yyyy') => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr, { locale: es });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

export const formatTime = (time) => {
  if (!time) return '';
  return time.substring(0, 5); // HH:MM
};

export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '';
  
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  
  // Eliminar caracteres no numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Formatear según longitud
  if (cleaned.length === 10) {
    return `(${cleaned.substring(0, 3)}) ${cleaned.substring(3, 6)}-${cleaned.substring(6)}`;
  }
  
  return phone;
};

export const getTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getEstadoPagoLabel = (estadoPago) => {
  const labels = {
    completo: 'Pagado Completo',
    seña: 'Seña - Falta 50%',
    pendiente: 'Pago Presencial',
    cortesia: 'Cortesía Admin',
  };
  return labels[estadoPago] || estadoPago;
};

export const getEstadoPagoBadgeClass = (estadoPago) => {
  const classes = {
    completo: 'badge-success',
    seña: 'badge-warning',
    pendiente: 'badge-error',
    cortesia: 'badge-info',
  };
  return classes[estadoPago] || 'badge-info';
};
