import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, CardHeader, CardTitle } from '../../components/Card';
import { Button } from '../../components/Button';
import { useToast, ToastContainer } from '../../components/Toast';
import { useAuth } from '../../context/AuthContext';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { toasts, removeToast, showError } = useToast();

  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.username, formData.password);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      showError(result.error || 'Credenciales inválidas');
    }

    setLoading(false);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'var(--color-bg-secondary)',
      padding: 'var(--spacing-md)'
    }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      <Card hover={false} style={{ maxWidth: '400px', width: '100%' }}>
        <CardHeader>
          <CardTitle style={{ textAlign: 'center', color: 'var(--color-primary)' }}>
            🔐 Panel de Administración
          </CardTitle>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input
                type="text"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="admin"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input
                type="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>


        </CardBody>
      </Card>
    </div>
  );
};
