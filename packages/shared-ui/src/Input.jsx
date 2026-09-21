import React from 'react';

export function Input({
  label,
  error,
  icon: Icon,
  type = 'text',
  placeholder,
  value,
  onChange,
  className = '',
  style = {},
  required = false,
  ...props
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%', ...style }} className={className}>
      {label && (
        <label
          style={{
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--mfe-text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--mfe-danger)' }}>*</span>}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--mfe-text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none'
            }}
          >
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          style={{
            width: '100%',
            padding: Icon ? '10px 14px 10px 38px' : '10px 14px',
            background: 'var(--mfe-bg-surface)',
            border: `1px solid ${error ? 'var(--mfe-danger)' : 'var(--mfe-border)'}`,
            borderRadius: 'var(--mfe-radius-md)',
            color: 'var(--mfe-text-primary)',
            fontSize: '0.875rem',
            fontFamily: 'var(--mfe-font-sans)',
            outline: 'none',
            transition: 'var(--mfe-transition)'
          }}
          className="mfe-input"
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: '0.75rem', color: 'var(--mfe-danger)', marginTop: '2px' }}>
          {error}
        </span>
      )}
      <style>{`
        .mfe-input:focus {
          border-color: var(--mfe-primary);
          box-shadow: 0 0 0 3px var(--mfe-primary-glow);
        }
        .mfe-input::placeholder {
          color: var(--mfe-text-muted);
        }
      `}</style>
    </div>
  );
}
