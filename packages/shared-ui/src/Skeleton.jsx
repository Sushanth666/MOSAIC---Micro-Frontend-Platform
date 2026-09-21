import React from 'react';

export function Skeleton({
  width = '100%',
  height = '20px',
  borderRadius = 'var(--mfe-radius-sm)',
  className = '',
  style = {}
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        ...style
      }}
      className={`mfe-skeleton ${className}`}
    />
  );
}

export function CardSkeleton() {
  return (
    <div
      style={{
        background: 'var(--mfe-bg-card)',
        border: '1px solid var(--mfe-border)',
        borderRadius: 'var(--mfe-radius-lg)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="40%" height="16px" />
        <Skeleton width="24px" height="24px" borderRadius="50%" />
      </div>
      <Skeleton width="60%" height="28px" />
      <Skeleton width="30%" height="14px" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
      <div style={{ display: 'flex', gap: '16px', padding: '12px 16px', borderBottom: '1px solid var(--mfe-border)' }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} width={`${100 / cols}%`} height="16px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '16px', padding: '14px 16px' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} width={`${100 / cols}%`} height="18px" />
          ))}
        </div>
      ))}
    </div>
  );
}
