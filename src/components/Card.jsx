import React from 'react';

export const Card = ({ 
  children, 
  className = '',
  hover = true,
  ...props 
}) => {
  const classes = ['card', className].filter(Boolean).join(' ');
  const style = hover ? {} : { transform: 'none' };

  return (
    <div className={classes} style={style} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`card-title ${className}`}>{children}</h3>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`card-body ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);
