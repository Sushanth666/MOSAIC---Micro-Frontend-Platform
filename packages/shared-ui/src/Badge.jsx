import React from 'react';

export function Badge({
  children,
  variant = 'neutral', // 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral'
  dot = false,
  size = 'md', // 'sm' | 'md'
  className = '',
  style = {}
}) {
  const variantStyles = {
    success: {
      background: 'var(--mfe-success-bg)',
      color: 'var(--mfe-success)',
      borderColor: 'rgba(16, 185, 129, 0.25)'
    },
    warning: {
      background: 'var(--mfe-warning-bg)',
      color: 'var(--mfe-warning)',
      borderColor: 'rgba(245, 158, 11, 0.25)'
    },
    danger: {
      background: 'var(--mfe-danger-bg)',
      color: 'var(--mfe-danger)',
      borderColor: 'rgba(239, 68, 68, 0.25)'
    },
    info: {
      background: 'var(--mfe-info-bg)',
      color: 'var(--mfe-info)',
      borderColor: 'rgba(6, 182, 212, 0.25)'
    },
    primary: {
      background: 'var(--mfe-bg-active)',
      color: 'var(--mfe-primary)',
      borderColor: 'var(--mfe-border-highlight)'
    },
    neutral: {
      background: 'rgba(255, 255, 255, 0.06)',
      color: 'var(--mfe-text-secondary)',
      borderColor: 'var(--mfe-border)'
    }
  };

  const isSmall = size === 'sm';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: isSmall ? '2px 8px' : '4px 10px',
        fontSize: isSmall ? '0.6875rem' : '0.75rem',
        fontWeight: 600,
        fontFamily: 'var(--mfe-font-sans)',
        borderRadius: 'var(--mfe-radius-full)',
        border: '1px solid transparent',
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
        ...variantStyles[variant],
        ...style
      }}
      className={`mfe-badge mfe-badge-${variant} ${className}`}
    >
      {dot && (
        <span
          className="mfe-pulse-dot"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            backgroundColor: 'currentColor',
            boxShadow: '0 0 8px currentColor'
          }}
        />
      )}
      {children}
    </span>
  );
}
