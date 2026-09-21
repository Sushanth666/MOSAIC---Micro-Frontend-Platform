import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  LogOut,
  X,
  CheckCircle2,
  Lock
} from 'lucide-react';
import { Avatar } from '@mfe/shared-ui';

export function LogoutModal({
  isOpen,
  step = 'confirm', // 'confirm' | 'countdown'
  countdown = 3,
  user,
  onCancel,
  onConfirm,
  theme = 'dark'
}) {
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light');

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && step === 'confirm') {
        onCancel();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, step, onCancel]);

  if (!isOpen) return null;

  const roleColors = isLight
    ? {
        Admin:  { bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(217, 119, 6, 0.35)', color: '#b45309' },
        Editor: { bg: 'rgba(2, 132, 199, 0.1)',   border: 'rgba(2, 132, 199, 0.3)',   color: '#0284c7' },
        Viewer: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: '#059669' },
      }
    : {
        Admin:  { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)',  color: '#f59e0b' },
        Editor: { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)', color: '#38bdf8' },
        Viewer: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#10b981' },
      };

  const userRole = user?.role || 'Admin';
  const rc = roleColors[userRole] || roleColors.Admin;
  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'OP';

  const progress = ((3 - countdown) / 3) * 100;

  const modalContent = (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.42)' : 'rgba(3, 7, 18, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'mfe-modal-fadeIn 0.2s ease-out'
      }}
      onClick={step === 'confirm' ? onCancel : undefined}
    >
      <style>{`
        @keyframes mfe-modal-fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes mfe-modal-scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(14px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes mfe-halo-pulse {
          0% { transform: scale(0.92); opacity: 0.35; }
          50% { transform: scale(1.12); opacity: 0.75; }
          100% { transform: scale(0.92); opacity: 0.35; }
        }
        .mfe-clean-logout-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .mfe-clean-logout-btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.06);
          box-shadow: 0 8px 24px -2px rgba(239, 68, 68, 0.45) !important;
        }
        .mfe-clean-logout-btn:active {
          transform: translateY(1px);
        }
        .mfe-clean-cancel-btn {
          transition: all 0.18s ease;
        }
        .mfe-clean-cancel-btn:hover {
          background: ${isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)'} !important;
          border-color: ${isLight ? '#cbd5e1' : 'rgba(255, 255, 255, 0.2)'} !important;
          color: ${isLight ? '#0f172a' : '#ffffff'} !important;
        }
        .mfe-clean-close-btn:hover {
          background: ${isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.1)'} !important;
          color: #ef4444 !important;
          transform: rotate(90deg);
        }
      `}</style>

      <div
        style={{
          width: '100%',
          maxWidth: '436px',
          background: isLight
            ? 'linear-gradient(160deg, #ffffff 0%, #faf8f5 100%)'
            : 'linear-gradient(160deg, #161a24 0%, #0d1017 100%)',
          border: isLight
            ? '1px solid rgba(226, 232, 240, 0.95)'
            : '1px solid rgba(239, 68, 68, 0.2)',
          borderRadius: '26px',
          boxShadow: isLight
            ? '0 25px 70px -12px rgba(15, 23, 42, 0.2), 0 0 0 1px rgba(255, 255, 255, 0.85) inset'
            : '0 30px 80px -12px rgba(0, 0, 0, 0.85), 0 0 40px -8px rgba(239, 68, 68, 0.15)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          animation: 'mfe-modal-scaleIn 0.26s cubic-bezier(0.16, 1, 0.3, 1)',
          padding: '32px 30px 24px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Glowing Accent Stripe */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            background: 'linear-gradient(90deg, #f43f5e 0%, #ef4444 50%, #f59e0b 100%)'
          }}
        />

        {/* Top Ambient Radial Glow */}
        <div
          style={{
            position: 'absolute',
            top: '-70px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '280px',
            height: '180px',
            borderRadius: '50%',
            background: isLight
              ? 'radial-gradient(circle, rgba(239, 68, 68, 0.08) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(239, 68, 68, 0.16) 0%, transparent 70%)',
            pointerEvents: 'none',
            zIndex: 0
          }}
        />

        {/* Close Button */}
        {step === 'confirm' && (
          <button
            onClick={onCancel}
            aria-label="Close dialog"
            className="mfe-clean-close-btn"
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--mfe-border)',
              color: isLight ? '#64748b' : 'rgba(255, 255, 255, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              zIndex: 10
            }}
          >
            <X size={15} />
          </button>
        )}

        {step === 'confirm' ? (
          /* ============================================================ */
          /* STEP 1: CONFIRM SIGN OUT SCREEN (MINIMALIST HERO)            */
          /* ============================================================ */
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              {/* Hero Avatar with Exit Badge */}
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '16px' }}>
                <Avatar
                  name={user?.name || 'Kana'}
                  size={72}
                />

                {/* Floating Action Badge on Avatar */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    width: '26px',
                    height: '26px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #f43f5e 0%, #ef4444 100%)',
                    border: `2.5px solid ${isLight ? '#ffffff' : '#141824'}`,
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(239, 68, 68, 0.5)'
                  }}
                >
                  <LogOut size={13} style={{ transform: 'translateX(0.5px)' }} />
                </div>
              </div>

              <h3
                style={{
                  fontSize: '1.38rem',
                  fontWeight: 800,
                  color: isLight ? '#0f172a' : '#fffbf5',
                  letterSpacing: '-0.025em',
                  margin: 0
                }}
              >
                Sign out of MOSAIC?
              </h3>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '8px',
                  flexWrap: 'wrap'
                }}
              >
                <span style={{ fontSize: '0.92rem', fontWeight: 700, color: isLight ? '#334155' : '#e2e8f0' }}>
                  {user?.name || 'Active Operator'}
                </span>
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.68rem',
                    fontWeight: 800,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    background: rc.bg,
                    border: `1px solid ${rc.border}`,
                    color: rc.color
                  }}
                >
                  {userRole}
                </span>
              </div>

              <div
                style={{
                  fontSize: '0.78rem',
                  color: isLight ? '#64748b' : '#94a3b8',
                  marginTop: '4px',
                  fontFamily: 'var(--mfe-font-mono, monospace)'
                }}
              >
                {user?.email || 'user@mosaic.io'}
              </div>

              <p
                style={{
                  fontSize: '0.84rem',
                  color: isLight ? '#64748b' : '#94a3b8',
                  lineHeight: 1.5,
                  margin: '14px 0 0',
                  maxWidth: '350px'
                }}
              >
                Your telemetry logs, open state, and workspace metrics are preserved. You can sign back in anytime.
              </p>

              {/* Minimal Ribbon */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  margin: '16px 0 22px',
                  flexWrap: 'wrap'
                }}
              >
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: isLight ? '#047857' : '#10b981',
                    background: isLight ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.12)',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: `1px solid ${isLight ? 'rgba(16, 185, 129, 0.25)' : 'rgba(16, 185, 129, 0.3)'}`
                  }}
                >
                  <CheckCircle2 size={13} color={isLight ? '#059669' : '#10b981'} />
                  <span>Cloud Synced</span>
                </div>

                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    fontSize: '0.74rem',
                    fontWeight: 600,
                    color: isLight ? '#475569' : '#94a3b8',
                    background: isLight ? 'rgba(241, 245, 249, 0.8)' : 'rgba(255, 255, 255, 0.04)',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`
                  }}
                >
                  <Lock size={12} color={isLight ? '#64748b' : '#94a3b8'} />
                  <span>Session Encrypted</span>
                </div>
              </div>
            </div>

            {/* Dual Modern Action Buttons */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
                width: '100%',
                marginTop: 0
              }}
            >
              {/* Cancel Button */}
              <button
                onClick={onCancel}
                className="mfe-clean-cancel-btn"
                style={{
                  padding: '11px 16px',
                  borderRadius: '13px',
                  border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.12)',
                  background: isLight ? '#ffffff' : 'rgba(255, 255, 255, 0.04)',
                  color: isLight ? '#334155' : '#e2e8f0',
                  fontWeight: 700,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--mfe-font-sans)',
                  boxShadow: isLight ? '0 2px 5px rgba(0, 0, 0, 0.04)' : 'none'
                }}
              >
                Stay Signed In
              </button>

              {/* Confirm Sign Out Button */}
              <button
                onClick={onConfirm}
                className="mfe-clean-logout-btn"
                style={{
                  padding: '11px 16px',
                  borderRadius: '13px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #ef4444 50%, #dc2626 100%)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '0.86rem',
                  cursor: 'pointer',
                  fontFamily: 'var(--mfe-font-sans)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 18px rgba(239, 68, 68, 0.38), 0 0 0 1px rgba(239, 68, 68, 0.3) inset'
                }}
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>

            {/* Subtle Esc shortcut hint */}
            <div
              style={{
                fontSize: '0.7rem',
                color: isLight ? '#94a3b8' : '#64748b',
                marginTop: '12px',
                textAlign: 'center'
              }}
            >
              Press <kbd style={{ padding: '1px 5px', borderRadius: '4px', background: isLight ? '#f1f5f9' : 'rgba(255,255,255,0.08)', border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(255,255,255,0.1)' }}>Esc</kbd> to cancel
            </div>

          </div>
        ) : (
          /* ============================================================ */
          /* STEP 2: 3-SECOND COUNTDOWN LOGOUT SCREEN                     */
          /* ============================================================ */
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              padding: '10px 0 6px'
            }}
          >
            {/* Glowing Pulsing Radar Emblem */}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
              <div
                style={{
                  position: 'absolute',
                  width: '94px',
                  height: '94px',
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(239, 68, 68, 0.28) 0%, transparent 70%)',
                  animation: 'mfe-halo-pulse 1.8s ease-in-out infinite'
                }}
              />
              <div
                style={{
                  width: '70px',
                  height: '70px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.08) 100%)',
                  border: '2px solid rgba(239, 68, 68, 0.45)',
                  boxShadow: '0 0 28px rgba(239, 68, 68, 0.35)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ef4444'
                }}
              >
                <LogOut size={28} style={{ transform: 'translateX(2px)' }} />
              </div>
            </div>

            {/* Countdown Text */}
            <div
              style={{
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: '#ef4444',
                marginBottom: '4px'
              }}
            >
              Signing You Out
            </div>
            <h3
              style={{
                fontSize: '1.6rem',
                fontWeight: 900,
                color: isLight ? '#0f172a' : '#fffbf5',
                letterSpacing: '-0.03em',
                margin: 0
              }}
            >
              Redirecting in <span style={{ color: '#ef4444', fontFamily: 'monospace' }}>0{countdown}s</span>...
            </h3>
            <p
              style={{
                fontSize: '0.84rem',
                color: isLight ? '#64748b' : '#94a3b8',
                marginTop: '6px',
                maxWidth: '320px',
                lineHeight: 1.45
              }}
            >
              Safely preserving telemetry and releasing micro-frontend sessions.
            </p>

            {/* Progress Bar */}
            <div
              style={{
                width: '100%',
                height: '6px',
                borderRadius: '9999px',
                background: isLight ? '#f1f5f9' : 'rgba(255, 255, 255, 0.08)',
                overflow: 'hidden',
                margin: '20px 0 22px',
                position: 'relative'
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${progress}%`,
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #f43f5e 0%, #ef4444 50%, #ea580c 100%)',
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)',
                  transition: 'width 1s linear'
                }}
              />
            </div>

            {/* Clean Checklist */}
            <div
              style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                textAlign: 'left',
                fontSize: '0.8rem',
                padding: '12px 14px',
                background: isLight ? 'rgba(248, 250, 252, 0.8)' : 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={15} color="#10b981" />
                <span style={{ color: isLight ? '#334155' : '#cbd5e1', fontWeight: 600 }}>
                  Workspace state synchronized
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={15} color={countdown <= 2 ? '#10b981' : isLight ? '#94a3b8' : '#64748b'} />
                <span style={{ color: countdown <= 2 ? (isLight ? '#334155' : '#cbd5e1') : (isLight ? '#94a3b8' : '#64748b'), fontWeight: 600 }}>
                  Remote micro-frontends detached
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={15} color={countdown <= 1 ? '#10b981' : isLight ? '#94a3b8' : '#64748b'} />
                <span style={{ color: countdown <= 1 ? (isLight ? '#334155' : '#cbd5e1') : (isLight ? '#94a3b8' : '#64748b'), fontWeight: 600 }}>
                  Returning to authentication portal
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}

export default LogoutModal;
