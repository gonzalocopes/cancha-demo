import React from 'react';

export const Loader = ({ size = 'md', className = '' }) => {
  const sizeClass = size !== 'md' ? `loader-${size}` : '';
  const classes = ['loader', sizeClass, className].filter(Boolean).join(' ');

  return <div className={classes}></div>;
};

export const LoadingScreen = ({ message = 'Cargando...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '400px',
      gap: 'var(--spacing-lg)'
    }}>
      <Loader size="lg" />
      <p className="text-secondary">{message}</p>
    </div>
  );
};
