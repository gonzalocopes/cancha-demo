import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardFooter } from '../components/Card';
import { Button } from '../components/Button';
import { LoadingScreen } from '../components/Loader';
import { useToast, ToastContainer } from '../components/Toast';
import { canchasApi } from '../utils/api';
import { formatCurrency } from '../utils/formatters';

export const Home = () => {
  const [canchas, setCanchas] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toasts, removeToast, showError } = useToast();

  useEffect(() => {
    loadCanchas();
  }, []);

  const loadCanchas = async () => {
    try {
      const data = await canchasApi.getAll();
      setCanchas(data);
    } catch (error) {
      showError('Error al cargar las canchas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingScreen message="Cargando canchas disponibles..." />;
  }

  // Agrupar canchas por tipo
  const canchasPorTipo = canchas.reduce((acc, cancha) => {
    if (!acc[cancha.tipo]) {
      acc[cancha.tipo] = [];
    }
    acc[cancha.tipo].push(cancha);
    return acc;
  }, {});

  return (
    <div style={{ paddingBottom: 'var(--spacing-2xl)' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* Hero Section con imagen de fondo */}
      <div style={{
        position: 'relative',
        minHeight: '500px',
        backgroundImage: 'url(/hero-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        marginBottom: 'var(--spacing-2xl)',
        borderRadius: '0 0 var(--radius-xl) var(--radius-xl)',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.9) 0%, rgba(21, 128, 61, 0.85) 100%)',
          zIndex: 1
        }}></div>
        
        <div className="container" style={{
          position: 'relative',
          zIndex: 2,
          paddingTop: 'var(--spacing-2xl)',
          paddingBottom: 'var(--spacing-2xl)',
          textAlign: 'center',
          color: 'white'
        }}>
          <div className="fade-in-up" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{
              display: 'inline-block',
              padding: 'var(--spacing-xs) var(--spacing-lg)',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: 'var(--radius-full)',
              marginBottom: 'var(--spacing-md)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.3)'
            }}>
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: '600', letterSpacing: '1px' }}>
                ⚽ COMPLEJO DEPORTIVO
              </span>
            </div>
            
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 4rem)',
              fontWeight: '900',
              marginBottom: 'var(--spacing-md)',
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              lineHeight: '1.1'
            }}>
              La Cancha FC
            </h1>
            
            <p style={{ 
              fontSize: 'var(--font-size-xl)',
              maxWidth: '700px',
              margin: '0 auto var(--spacing-xl)',
              opacity: 0.95,
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)'
            }}>
              Reservá tu cancha de forma rápida y sencilla. 
              Elegí el día, horario y pagá con Mercado Pago.
            </p>
            
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}>
              <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-xs)' }}>🏟️</div>
                <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Canchas Premium</div>
              </div>
              <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-xs)' }}>⚡</div>
                <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Reserva Instantánea</div>
              </div>
              <div style={{
                padding: 'var(--spacing-md) var(--spacing-lg)',
                background: 'rgba(255, 255, 255, 0.15)',
                borderRadius: 'var(--radius-lg)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}>
                <div style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--spacing-xs)' }}>💳</div>
                <div style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>Mercado Pago</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Canchas Grid */}
        <div style={{ marginBottom: 'var(--spacing-xl)' }}>
          <h2 className="mb-lg" style={{ fontSize: 'var(--font-size-3xl)', fontWeight: '700' }}>
            🏟️ Nuestras Canchas
          </h2>
          
          <div className="grid grid-cols-1 gap-lg" style={{
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))'
          }}>
            {Object.entries(canchasPorTipo).map(([tipo, canchasDelTipo]) => (
              <Card key={tipo} hover={true}>
                <CardBody>
                  <div style={{ marginBottom: 'var(--spacing-md)' }}>
                    <h3 style={{ 
                      color: 'var(--color-primary)',
                      marginBottom: 'var(--spacing-sm)',
                      fontSize: 'var(--font-size-xl)',
                      fontWeight: '700'
                    }}>
                      {tipo}
                    </h3>
                    <div className="flex items-center gap-sm" style={{ marginBottom: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                      <span className="badge badge-success">
                        ✅ {canchasDelTipo.length} {canchasDelTipo.length === 1 ? 'cancha' : 'canchas'} disponibles
                      </span>
                    </div>
                    <p className="text-secondary" style={{ fontSize: 'var(--font-size-sm)' }}>
                      🕐 Horarios: 17:00 - 23:00
                    </p>
                    
                    {/* Lista de canchas */}
                    <div style={{ 
                      marginTop: 'var(--spacing-md)',
                      padding: 'var(--spacing-sm)',
                      background: 'var(--color-bg-tertiary)',
                      borderRadius: 'var(--radius-md)'
                    }}>
                      <p style={{ fontSize: 'var(--font-size-xs)', fontWeight: '600', marginBottom: 'var(--spacing-xs)', color: 'var(--color-text-secondary)' }}>
                        Canchas disponibles:
                      </p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-xs)' }}>
                        {canchasDelTipo.map((cancha) => (
                          <span 
                            key={cancha.id}
                            style={{
                              fontSize: 'var(--font-size-xs)',
                              padding: '2px 8px',
                              background: 'white',
                              borderRadius: 'var(--radius-sm)',
                              border: '1px solid var(--color-border)'
                            }}
                          >
                            {cancha.nombre.split(' - ')[0]}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ 
                    padding: 'var(--spacing-md)',
                    backgroundColor: 'var(--color-bg-tertiary)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 'var(--spacing-md)'
                  }}>
                    <p className="text-sm text-secondary" style={{ marginBottom: 'var(--spacing-xs)' }}>
                      💰 Precio por hora
                    </p>
                    <p style={{ 
                      fontSize: 'var(--font-size-3xl)',
                      fontWeight: '700',
                      color: 'var(--color-primary)',
                      marginBottom: 0
                    }}>
                      {formatCurrency(canchasDelTipo[0].precio_hora)}
                    </p>
                  </div>
                </CardBody>

                <CardFooter>
                  <Link to={`/reservar/${canchasDelTipo[0].id}?tipo=${encodeURIComponent(tipo)}`} style={{ width: '100%' }}>
                    <Button variant="primary" style={{ width: '100%' }}>
                      🎯 Ver Disponibilidad
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Info Section */}
        <div style={{
          background: 'var(--gradient-primary)',
          color: 'var(--color-text-inverse)',
          padding: 'var(--spacing-2xl)',
          borderRadius: 'var(--radius-xl)',
          textAlign: 'center',
          boxShadow: 'var(--shadow-colored)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '-50%',
            right: '-50%',
            width: '200%',
            height: '200%',
            background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)',
            pointerEvents: 'none'
          }}></div>
          
          <h3 style={{ color: 'white', marginBottom: 'var(--spacing-md)', fontSize: 'var(--font-size-2xl)', fontWeight: '700', position: 'relative' }}>
            ❓ ¿Cómo funciona?
          </h3>
          <div className="grid grid-cols-1 gap-lg" style={{
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            marginTop: 'var(--spacing-xl)',
            position: 'relative'
          }}>
            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-sm)' }}>
                1️⃣
              </div>
              <h4 style={{ color: 'white', fontWeight: '600' }}>Elegí tu cancha</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                Seleccioná la cancha que mejor se adapte a tu grupo
              </p>
            </div>
            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-sm)' }}>
                2️⃣
              </div>
              <h4 style={{ color: 'white', fontWeight: '600' }}>Seleccioná fecha y horario</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                Verificá la disponibilidad en tiempo real
              </p>
            </div>
            <div style={{
              padding: 'var(--spacing-lg)',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 'var(--radius-lg)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)'
            }}>
              <div style={{ fontSize: 'var(--font-size-4xl)', marginBottom: 'var(--spacing-sm)' }}>
                3️⃣
              </div>
              <h4 style={{ color: 'white', fontWeight: '600' }}>Pagá con Mercado Pago</h4>
              <p style={{ fontSize: 'var(--font-size-sm)', opacity: 0.9 }}>
                Seña (50%) o cancha completa de forma segura
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
