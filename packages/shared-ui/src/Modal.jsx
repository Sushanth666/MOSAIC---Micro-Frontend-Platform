import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = '520px'
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        animation: 'mfe-fadeIn 0.2s ease-out'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth,
          maxHeight: '90vh',
          backgroundColor: 'var(--mfe-bg-surface)',
          border: '1px solid var(--mfe-border)',
          borderRadius: 'var(--mfe-radius-lg)',
          boxShadow: 'var(--mfe-shadow-lg)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'mfe-scaleUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid var(--mfe-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--mfe-bg-card)'
          }}
        >
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
              {title}
            </h3>
            {subtitle && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', marginTop: '2px' }}>
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--mfe-text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: 'var(--mfe-radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--mfe-transition)'
            }}
            className="mfe-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        <div style={{ padding: '24px', maxHeight: 'calc(85vh - 140px)', overflowY: 'auto' }}>
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--mfe-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '12px',
              background: 'var(--mfe-bg-card)'
            }}
          >
            {footer}
          </div>
        )}
      </div>

      <style>{`
        @keyframes mfe-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mfe-scaleUp {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .mfe-close-btn:hover {
          color: var(--mfe-text-primary);
          background: rgba(255, 255, 255, 0.08);
        }
      `}</style>
    </div>
  );
}
