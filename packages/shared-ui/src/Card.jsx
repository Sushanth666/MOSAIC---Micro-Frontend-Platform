import React from 'react';

export function Card({
  children,
  title,
  subtitle,
  action,
  icon: Icon,
  className = '',
  style = {},
  onClick,
  hoverable = true,
  ...props
}) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--mfe-bg-card)',
        backdropFilter: 'var(--mfe-backdrop-blur)',
        WebkitBackdropFilter: 'var(--mfe-backdrop-blur)',
        border: '1px solid var(--mfe-border)',
        borderRadius: 'var(--mfe-radius-lg)',
        padding: '20px',
        boxShadow: 'var(--mfe-shadow-sm)',
        transition: 'var(--mfe-transition)',
        cursor: onClick ? 'pointer' : 'default',
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      className={`mfe-card mfe-animate-in ${hoverable ? 'mfe-card-hoverable' : ''} ${className}`}
      {...props}
    >
      <div className="mfe-card-glow-bar" />
      {(title || subtitle || action || Icon) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {Icon && (
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'var(--mfe-bg-active)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--mfe-primary)',
                  boxShadow: '0 0 16px -2px var(--mfe-primary-glow)',
                  border: '1px solid var(--mfe-border-glow)'
                }}
              >
                <Icon size={18} />
              </div>
            )}
            <div>
              {title && (
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: 'var(--mfe-text-primary)',
                    letterSpacing: '-0.015em'
                  }}
                >
                  {title}
                </h3>
              )}
              {subtitle && (
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--mfe-text-secondary)',
                    marginTop: '2px'
                  }}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
      <style>{`
        .mfe-card {
          position: relative;
        }
        .mfe-card-glow-bar {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2.5px;
          background: linear-gradient(90deg, transparent 0%, var(--mfe-primary) 50%, transparent 100%);
          background-size: 200% 100%;
          opacity: 0;
          transition: opacity 0.35s ease;
          pointer-events: none;
        }
        .mfe-card-hoverable {
          transition: transform 0.28s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.28s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.28s ease !important;
          will-change: transform, box-shadow;
        }
        .mfe-card-hoverable:hover {
          border-color: var(--mfe-border-highlight) !important;
          transform: translateY(-4px);
          box-shadow: var(--mfe-shadow-md), 0 0 24px -4px var(--mfe-primary-glow) !important;
        }
        .mfe-card-hoverable:hover .mfe-card-glow-bar {
          opacity: 1;
          animation: mfe-glow-sweep 2.2s linear infinite;
        }
      `}</style>
    </div>
  );
}
