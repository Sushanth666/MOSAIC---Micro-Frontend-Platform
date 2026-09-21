import React from 'react';

export function Switch({ checked, onChange, label, disabled = false }) {
  return (
    <label
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '10px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        userSelect: 'none'
      }}
    >
      <div
        onClick={() => !disabled && onChange(!checked)}
        style={{
          width: '42px',
          height: '24px',
          backgroundColor: checked ? 'var(--mfe-primary)' : 'var(--mfe-border)',
          borderRadius: '9999px',
          position: 'relative',
          transition: 'background-color 0.2s ease',
          boxShadow: checked ? 'var(--mfe-shadow-glow)' : 'none'
        }}
      >
        <div
          style={{
            width: '18px',
            height: '18px',
            backgroundColor: '#ffffff',
            borderRadius: '50%',
            position: 'absolute',
            top: '3px',
            left: checked ? '21px' : '3px',
            transition: 'left 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
          }}
        />
      </div>
      {label && (
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--mfe-text-primary)' }}>
          {label}
        </span>
      )}
    </label>
  );
}
