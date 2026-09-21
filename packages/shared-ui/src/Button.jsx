import React from 'react';

export function Button({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size = 'md', // 'sm' | 'md' | 'lg'
  isLoading = false,
  icon: Icon,
  disabled = false,
  className = '',
  style = {},
  ...props
}) {
  const baseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontWeight: 600,
    fontFamily: 'var(--mfe-font-sans)',
    borderRadius: 'var(--mfe-radius-md)',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    opacity: disabled || isLoading ? 0.6 : 1,
    transition: 'var(--mfe-transition)',
    border: '1px solid transparent',
    outline: 'none',
    userSelect: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap'
  };

  const sizeStyles = {
    sm: { padding: '6px 12px', fontSize: '0.8125rem' },
    md: { padding: '9px 18px', fontSize: '0.875rem' },
    lg: { padding: '12px 24px', fontSize: '1rem' }
  };

  const variantStyles = {
    primary: {
      background: 'var(--mfe-primary-gradient)',
      color: 'var(--mfe-text-inverse)',
      fontWeight: 700,
      boxShadow: 'var(--mfe-shadow-glow)',
      border: 'none'
    },
    secondary: {
      background: 'var(--mfe-bg-card)',
      color: 'var(--mfe-text-primary)',
      borderColor: 'var(--mfe-border)'
    },
    outline: {
      background: 'transparent',
      color: 'var(--mfe-text-primary)',
      borderColor: 'var(--mfe-border)'
    },
    ghost: {
      background: 'transparent',
      color: 'var(--mfe-text-secondary)',
      borderColor: 'transparent'
    },
    danger: {
      background: 'linear-gradient(135deg, #ff3366 0%, #dc2626 100%)',
      color: '#ffffff',
      fontWeight: 700,
      boxShadow: '0 0 18px -2px var(--mfe-danger-glow)',
      border: 'none'
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        ...baseStyle,
        ...sizeStyles[size],
        ...variantStyles[variant],
        ...style
      }}
      className={`mfe-btn mfe-btn-${variant} ${className}`}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid currentColor',
            borderRightColor: 'transparent',
            borderRadius: '50%',
            display: 'inline-block',
            animation: 'mfe-spin 0.6s linear infinite'
          }}
        />
      )}
      {!isLoading && Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
      {children}
      <style>{`
        @keyframes mfe-spin {
          to { transform: rotate(360deg); }
        }
        .mfe-btn {
          transition: transform 0.15s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease, filter 0.2s ease;
        }
        .mfe-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          filter: brightness(1.12);
        }
        .mfe-btn-primary:hover:not(:disabled) {
          box-shadow: 0 0 24px -2px var(--mfe-primary-glow);
        }
        .mfe-btn:active:not(:disabled) {
          transform: scale(0.96);
        }
      `}</style>
    </button>
  );
}
