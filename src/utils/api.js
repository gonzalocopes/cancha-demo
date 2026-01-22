const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Agregar token si existe
    const token = localStorage.getItem('admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  get(endpoint) {
    return this.request(endpoint);
  }

  post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  patch(endpoint, body) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  }

  delete(endpoint) {
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }
}

export const api = new ApiClient();

// Endpoints// API Endpoints
export const canchasApi = {
  getAll: () => api.get('/canchas'),
  getById: (id) => api.get(`/canchas/${id}`),
  getByTipo: (tipo) => api.get(`/canchas/tipo/${encodeURIComponent(tipo)}`),
};

export const reservasApi = {
  getDisponibilidad: (canchaId, fecha) => 
    api.get(`/reservas/disponibilidad?cancha_id=${canchaId}&fecha=${fecha}`),
  create: (data) => api.post('/reservas', data),
  createManual: (data) => api.post('/reservas/manual', data),
  createRecurrente: (data) => api.post('/reservas/recurrente', data),
  getRecurrentes: () => api.get('/reservas/recurrente'),
  deleteRecurrente: (id) => api.delete(`/reservas/recurrente/${id}`),
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.fecha) params.append('fecha', filters.fecha);
    if (filters.cancha_id) params.append('cancha_id', filters.cancha_id);
    return api.get(`/reservas?${params.toString()}`);
  },
  updatePago: (id, estadoPago) => 
    api.patch(`/reservas/${id}/pago`, { estado_pago: estadoPago }),
  cancel: (id) => api.delete(`/reservas/${id}`),
};

export const authApi = {
  login: (username, password) => api.post('/auth/login', { username, password }),
  verify: () => api.get('/auth/verify'),
};
