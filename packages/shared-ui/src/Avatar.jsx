import React from 'react';

// Fixed, deterministic high-contrast gradient palette per initial letter
const LETTER_GRADIENTS = {
  A: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', // Indigo / Violet
  B: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)', // Rose / Pink
  C: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)', // Cyan / Blue
  D: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', // Emerald
  E: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', // Amber
  F: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)', // Purple / Fuchsia
  G: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)', // Teal / Cyan
  H: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)', // Coral / Red
  I: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', // Blue
  J: 'linear-gradient(135deg, #eab308 0%, #ca8a04 100%)', // Yellow / Gold
  K: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)', // Purple
  L: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)', // Sky Blue
  M: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', // Orange
  N: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', // Deep Indigo
  O: 'linear-gradient(135deg, #8b5cf6 0%, #3b82f6 100%)', // Violet Blue
  P: 'linear-gradient(135deg, #ec4899 0%, #a855f7 100%)', // Pink / Violet
  Q: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)', // Emerald Teal
  R: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)', // Deep Cyan
  S: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)', // Amber Orange
  T: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)', // Blue Indigo
  U: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)', // Purple Pink
  V: 'linear-gradient(135deg, #14b8a6 0%, #10b981 100%)', // Teal Emerald
  W: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)', // Rose
  X: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)', // Violet
  Y: 'linear-gradient(135deg, #eab308 0%, #f59e0b 100%)', // Gold Amber
  Z: 'linear-gradient(135deg, #0ea5e9 0%, #38bdf8 100%)'  // Sky Cyan
};

export function Avatar({
  src,
  name = 'User',
  size = 38,
  status, // 'online' | 'offline' | 'busy'
  role
}) {
  // Always derive the single fixed first letter of the name (no profile photo images)
  const rawName = (name && typeof name === 'string' ? name.trim() : '') || 'User';
  const firstLetter = (rawName.charAt(0) || 'U').toUpperCase();

  const backgroundGradient = LETTER_GRADIENTS[firstLetter] || 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)';

  const statusColors = {
    online: 'var(--mfe-success, #10b981)',
    offline: 'var(--mfe-text-muted, #94a3b8)',
    busy: 'var(--mfe-danger, #ef4444)'
  };

  const isCustomImage = src && src !== 'initials' && !src.includes('mosaic-logo');

  return (
    <div
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
    >
      <div
        title={rawName}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          overflow: 'hidden',
          background: isCustomImage ? '#14110d' : backgroundGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: `${Math.max(12, Math.round(size * 0.46))}px`,
          lineHeight: 1,
          textTransform: 'uppercase',
          userSelect: 'none',
          boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
          border: '2px solid var(--mfe-border, rgba(255, 255, 255, 0.14))',
          flexShrink: 0,
          letterSpacing: '-0.01em'
        }}
      >
        {isCustomImage ? (
          <img
            src={src}
            alt={rawName}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span>{firstLetter}</span>
        )}
      </div>

      {status && (
        <span
          style={{
            position: 'absolute',
            bottom: '0',
            right: '0',
            width: `${Math.max(8, Math.floor(size * 0.26))}px`,
            height: `${Math.max(8, Math.floor(size * 0.26))}px`,
            borderRadius: '50%',
            backgroundColor: statusColors[status] || 'var(--mfe-success)',
            border: '2px solid var(--mfe-bg-surface, #1e293b)',
            boxShadow: '0 0 6px rgba(0,0,0,0.4)'
          }}
        />
      )}
    </div>
  );
}
