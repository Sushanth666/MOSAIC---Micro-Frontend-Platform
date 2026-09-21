import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  CheckCircle,
  Sparkles,
  LogOut,
  KeyRound,
  Eye,
  EyeOff,
  Layers,
  Cpu,
  Zap,
  Check,
  ExternalLink,
  Shield,
  Activity,
  Server
} from 'lucide-react';
import { Button, Card, Input, Badge, Avatar } from '@mfe/shared-ui';
import { authStore, DEMO_USERS, eventBus, MFE_EVENTS } from '@mfe/shared-bus';

export default function AuthApp({ onAuthSuccess, standalone = false }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [email, setEmail] = useState('sarah.jenkins@mosaic.io');
  const [password, setPassword] = useState('mosaic-demo-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Admin');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState(DEMO_USERS[0].id);
  const [currentUser, setCurrentUser] = useState(authStore.getCurrentUser());
  const [showMatrix, setShowMatrix] = useState(false);
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.getAttribute('data-theme') || localStorage.getItem('mfe_theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    const unsubLogin = eventBus.on(MFE_EVENTS.AUTH_LOGIN, ({ user }) => {
      setCurrentUser(user);
    });
    const unsubLogout = eventBus.on(MFE_EVENTS.AUTH_LOGOUT, () => {
      setCurrentUser(null);
    });
    const unsubTheme = eventBus.on(MFE_EVENTS.THEME_CHANGED, ({ theme: newTheme }) => {
      setTheme(newTheme);
    });

    // Observe data-theme attribute on documentElement
    const observer = new MutationObserver(() => {
      const current = document.documentElement.getAttribute('data-theme') || 'dark';
      setTheme(current);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    return () => {
      unsubLogin();
      unsubLogout();
      unsubTheme();
      observer.disconnect();
    };
  }, []);

  const handleDemoSelect = (demoUser) => {
    setSelectedPresetId(demoUser.id);
    setEmail(demoUser.email);
    setPassword('mosaic-secure-key');
    setLoading(true);
    setTimeout(() => {
      authStore.login(demoUser);
      setLoading(false);
      setSuccessMsg(`Authenticated as ${demoUser.name} (${demoUser.role})`);
      if (onAuthSuccess) {
        onAuthSuccess(demoUser);
      } else if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }, 400);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      let userObj;
      if (mode === 'login') {
        const found = DEMO_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase());
        userObj = found || {
          id: `usr_${Date.now()}`,
          name: email.split('@')[0].replace('.', ' '),
          email,
          role,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          title: `${role} Contributor`,
          status: 'Active',
          joined: 'Just now'
        };
      } else {
        userObj = {
          id: `usr_${Date.now()}`,
          name: name || 'New Engineer',
          email,
          role,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          title: `${role} Contributor`,
          status: 'Active',
          joined: 'Just now'
        };
      }
      authStore.login(userObj);
      setLoading(false);
      setSuccessMsg(`Welcome, ${userObj.name}! Redirecting to dashboard...`);
      if (onAuthSuccess) {
        onAuthSuccess(userObj);
      } else if (typeof window !== 'undefined') {
        window.location.href = '/dashboard';
      }
    }, 550);
  };

  const handleLogout = () => {
    authStore.logout();
    setSuccessMsg('');
  };

  // Password strength calculation for register mode
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 33;
    if (password.length >= 10) score += 34;
    if (/[A-Z]/.test(password) || /[0-9]/.test(password) || /[^A-Za-z0-9]/.test(password)) score += 33;
    return Math.min(100, score);
  };

  const strength = getPasswordStrength();
  const strengthColor = strength < 40 ? 'var(--mfe-danger)' : strength < 80 ? 'var(--mfe-warning)' : 'var(--mfe-success)';
  const isLight = theme === 'light';

  const activeRemotes = [
    { name: 'Host Shell', port: '5000', status: 'Online', latency: '18ms' },
    { name: 'Dashboard MFE', port: '5002', status: 'Online', latency: '24ms' },
    { name: 'User Management', port: '5003', status: 'Online', latency: '31ms' },
    { name: 'Analytics Engine', port: '5004', status: 'Online', latency: '29ms' },
    { name: 'Notification Center', port: '5005', status: 'Online', latency: '22ms' }
  ];

  return (
    <div
      style={{
        width: '100%',
        minHeight: standalone ? '100vh' : 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1180px',
          background: 'var(--mfe-bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid var(--mfe-border)',
          borderRadius: '24px',
          boxShadow: '0 24px 60px -12px rgba(0, 0, 0, 0.5), 0 0 40px -10px rgba(56, 189, 248, 0.15)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          position: 'relative'
        }}
        className="auth-container-grid"
      >
        {/* ================= LEFT HERO COLUMN ================= */}
        <div
          style={{
            padding: '48px 40px',
            background: isLight
              ? 'linear-gradient(155deg, #f8fafc 0%, #f0f9ff 50%, #e0f2fe 100%)'
              : 'linear-gradient(155deg, rgba(14, 21, 37, 0.95) 0%, rgba(8, 12, 22, 0.98) 100%)',
            borderRight: `1px solid ${isLight ? '#e2e8f0' : 'var(--mfe-border)'}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.3s ease, border-color 0.3s ease'
          }}
          className="auth-hero-column"
        >
          {/* Ambient Glow Orbs */}
          <div
            style={{
              position: 'absolute',
              top: '-80px',
              left: '-80px',
              width: '260px',
              height: '260px',
              borderRadius: '50%',
              background: isLight
                ? 'radial-gradient(circle, rgba(56, 189, 248, 0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(56, 189, 248, 0.25) 0%, transparent 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none'
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-80px',
              right: '-80px',
              width: '280px',
              height: '280px',
              borderRadius: '50%',
              background: isLight
                ? 'radial-gradient(circle, rgba(192, 132, 252, 0.12) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(192, 132, 252, 0.2) 0%, transparent 70%)',
              filter: 'blur(50px)',
              pointerEvents: 'none'
            }}
          />

          <div>
            {/* Brand Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '28px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: 'var(--mfe-radius-md)',
                  overflow: 'hidden',
                  boxShadow: isLight ? '0 4px 16px rgba(217, 119, 6, 0.2)' : '0 0 20px rgba(245, 158, 11, 0.5)',
                  border: `1.5px solid ${isLight ? 'rgba(217, 119, 6, 0.35)' : 'rgba(245, 158, 11, 0.6)'}`,
                  flexShrink: 0,
                  background: isLight ? '#ffffff' : '#14110d'
                }}
              >
                <img
                  src="/mosaic-logo.png"
                  alt="MOSAIC Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <div>
                <div style={{ fontSize: '1.375rem', fontWeight: 900, letterSpacing: '0.04em', background: isLight ? 'linear-gradient(135deg, #d97706 0%, #ea580c 100%)' : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  MOSAIC
                </div>
                <div style={{ fontSize: '0.6875rem', fontWeight: 800, color: 'var(--mfe-primary)', letterSpacing: '0.1em' }}>
                  MICRO-FRONTEND PLATFORM
                </div>
              </div>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontSize: '2rem',
                fontWeight: 800,
                color: isLight ? '#0f172a' : '#f8fafc',
                lineHeight: 1.25,
                letterSpacing: '-0.02em',
                marginBottom: '14px'
              }}
              className="auth-hero-title"
            >
              Unified Architecture for Autonomous Frontend Teams.
            </h1>
            <p
              style={{
                fontSize: '0.9375rem',
                color: isLight ? '#475569' : '#94a3b8',
                lineHeight: 1.6,
                marginBottom: '32px'
              }}
              className="auth-hero-desc"
            >
              Seamlessly orchestrate decoupled business domains with high-speed Vite Module Federation, isolated fault boundaries, and real-time event-bus telemetry.
            </p>

            {/* Live Micro-Frontend Mesh Telemetry Card */}
            <div
              style={{
                background: isLight ? 'rgba(255, 255, 255, 0.88)' : 'rgba(16, 24, 40, 0.7)',
                border: `1px solid ${isLight ? 'rgba(14, 165, 233, 0.25)' : 'rgba(56, 189, 248, 0.2)'}`,
                borderRadius: 'var(--mfe-radius-lg)',
                padding: '16px 20px',
                marginBottom: '28px',
                boxShadow: isLight
                  ? '0 8px 24px -4px rgba(2, 132, 199, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04)'
                  : 'inset 0 1px 1px rgba(255, 255, 255, 0.05)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                transition: 'all 0.3s ease'
              }}
              className="auth-telemetry-card"
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={14} color="var(--mfe-success)" />
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: isLight ? '#0f172a' : '#f1f5f9',
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em'
                    }}
                    className="auth-telemetry-title"
                  >
                    Live Federation Mesh Status
                  </span>
                </div>
                <Badge variant="success" dot size="sm">
                  All Remotes Healthy
                </Badge>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {activeRemotes.map((remote, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '0.75rem',
                      padding: '4px 0',
                      borderBottom: idx === activeRemotes.length - 1
                        ? 'none'
                        : isLight
                        ? '1px solid rgba(0, 0, 0, 0.06)'
                        : '1px solid rgba(255, 255, 255, 0.04)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: 'var(--mfe-success)',
                          boxShadow: '0 0 6px var(--mfe-success)'
                        }}
                      />
                      <span
                        style={{ color: isLight ? '#1e293b' : 'var(--mfe-text-secondary)', fontWeight: 600 }}
                        className="auth-telemetry-item-name"
                      >
                        {remote.name}
                      </span>
                      <span
                        style={{ color: isLight ? '#64748b' : 'var(--mfe-text-muted)', fontFamily: 'var(--mfe-font-mono)' }}
                        className="auth-telemetry-item-port"
                      >
                        :{remote.port}
                      </span>
                    </div>
                    <span
                      style={{ color: isLight ? '#0284c7' : 'var(--mfe-primary)', fontFamily: 'var(--mfe-font-mono)', fontWeight: 600 }}
                      className="auth-telemetry-item-latency"
                    >
                      {remote.latency}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Highlights */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '20px',
              borderTop: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)'}`,
              fontSize: '0.75rem',
              color: isLight ? '#64748b' : 'var(--mfe-text-muted)'
            }}
            className="auth-footer"
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} color="var(--mfe-success)" />
              <span>JWT + Role-Based Access Control</span>
            </div>
            <span>Vite 6 • React 18</span>
          </div>
        </div>

        {/* ================= RIGHT FORM COLUMN ================= */}
        <div
          style={{
            padding: '44px 40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            background: 'var(--mfe-bg-surface)'
          }}
          className="auth-form-column"
        >
          {/* Active Session Alert if user is currently logged in */}
          {currentUser && (
            <div
              style={{
                padding: '14px 18px',
                marginBottom: '20px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(56, 189, 248, 0.08) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Avatar src={currentUser.avatar} name={currentUser.name} size={36} status="online" />
                <div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                    Active: {currentUser.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)' }}>
                    Role: <strong style={{ color: 'var(--mfe-primary)' }}>{currentUser.role}</strong> • Token Active
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Button
                  size="sm"
                  variant="primary"
                  icon={ArrowRight}
                  onClick={() => {
                    if (onAuthSuccess) onAuthSuccess(currentUser);
                    else window.location.href = '/dashboard';
                  }}
                >
                  Go to Dashboard
                </Button>
                <Button size="sm" variant="ghost" icon={LogOut} onClick={handleLogout}>
                  Sign Out
                </Button>
              </div>
            </div>
          )}

          {/* Tab Switcher: Sign In vs Create Account */}
          <div
            style={{
              display: 'flex',
              background: 'var(--mfe-bg-card)',
              border: '1px solid var(--mfe-border)',
              borderRadius: 'var(--mfe-radius-md)',
              padding: '4px',
              marginBottom: '24px',
              position: 'relative'
            }}
          >
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '9px 16px',
                border: 'none',
                borderRadius: 'calc(var(--mfe-radius-md) - 2px)',
                background: mode === 'login' ? 'var(--mfe-primary)' : 'transparent',
                color: mode === 'login' ? '#ffffff' : 'var(--mfe-text-secondary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: mode === 'login' ? 'var(--mfe-shadow-glow)' : 'none'
              }}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setSuccessMsg('');
              }}
              style={{
                flex: 1,
                padding: '9px 16px',
                border: 'none',
                borderRadius: 'calc(var(--mfe-radius-md) - 2px)',
                background: mode === 'register' ? 'var(--mfe-primary)' : 'transparent',
                color: mode === 'register' ? '#ffffff' : 'var(--mfe-text-secondary)',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: mode === 'register' ? 'var(--mfe-shadow-glow)' : 'none'
              }}
            >
              Create Account
            </button>
          </div>

          {/* 1-Click Persona Quick Access */}
          <div style={{ marginBottom: '22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={13} color="var(--mfe-primary)" /> Instant 1-Click Role Login:
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)' }}>Demo Accounts</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {DEMO_USERS.map((demo) => {
                const isSelected = selectedPresetId === demo.id;
                return (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleDemoSelect(demo)}
                    style={{
                      padding: '10px 8px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: isSelected ? 'var(--mfe-bg-active)' : 'var(--mfe-bg-card)',
                      border: `1.5px solid ${isSelected ? 'var(--mfe-primary)' : 'var(--mfe-border)'}`,
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'var(--mfe-transition)'
                    }}
                    className="demo-persona-card"
                  >
                    <Avatar src={demo.avatar} name={demo.name} size={30} />
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                        {demo.role}
                      </div>
                      <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', whiteSpace: 'nowrap' }}>
                        {demo.name.split(' ')[0]}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Expandable Permissions Matrix */}
            <button
              type="button"
              onClick={() => setShowMatrix(!showMatrix)}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '8px 12px',
                background: showMatrix ? 'var(--mfe-bg-active)' : 'transparent',
                border: '1px solid var(--mfe-border)',
                borderRadius: 'var(--mfe-radius-md)',
                color: 'var(--mfe-primary)',
                fontSize: '0.75rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'var(--mfe-transition)'
              }}
            >
              <Shield size={14} />
              <span>{showMatrix ? 'Hide Role Permissions Matrix' : 'Inspect RBAC Permissions Matrix'}</span>
            </button>

            {showMatrix && (
              <div
                style={{
                  marginTop: '10px',
                  padding: '12px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  fontSize: '0.75rem',
                  animation: 'mfe-fadeIn 0.2s ease'
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--mfe-border)', color: 'var(--mfe-text-muted)' }}>
                      <th style={{ padding: '6px 4px' }}>Action</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>Admin</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>Editor</th>
                      <th style={{ padding: '6px 4px', textAlign: 'center' }}>Viewer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'View Telemetry / Dashboards', a: true, e: true, v: true },
                      { name: 'Create & Edit Users', a: true, e: true, v: false },
                      { name: 'Delete User Accounts', a: true, e: false, v: false },
                      { name: 'Export Analytics Reports', a: true, e: true, v: false },
                      { name: 'Purge / Clear Notifications', a: true, e: false, v: false },
                      { name: 'Chaos Outage Injections', a: true, e: false, v: false }
                    ].map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid var(--mfe-border-subtle)' }}>
                        <td style={{ padding: '6px 4px', color: 'var(--mfe-text-primary)' }}>{row.name}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: row.a ? 'var(--mfe-success)' : 'var(--mfe-danger)', fontWeight: 700 }}>{row.a ? '✓' : '✕'}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: row.e ? 'var(--mfe-success)' : 'var(--mfe-danger)', fontWeight: 700 }}>{row.e ? '✓' : '✕'}</td>
                        <td style={{ padding: '6px 4px', textAlign: 'center', color: row.v ? 'var(--mfe-success)' : 'var(--mfe-danger)', fontWeight: 700 }}>{row.v ? '✓' : '✕'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '8px 0 18px' }}>
            <div style={{ flex: 1, height: '1px', background: 'var(--mfe-border)' }} />
            <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Or with credentials
            </span>
            <div style={{ flex: 1, height: '1px', background: 'var(--mfe-border)' }} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {mode === 'register' && (
              <Input
                label="Full Legal Name"
                placeholder="e.g. Marcus Vance"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={User}
                required
              />
            )}

            <Input
              label="Work Email Address"
              type="email"
              placeholder="user@mosaic.io"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              icon={Mail}
              required
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)' }}>
                  Password
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to demo account inbox.')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      fontSize: '0.75rem',
                      color: 'var(--mfe-primary)',
                      cursor: 'pointer',
                      fontWeight: 600
                    }}
                  >
                    Forgot Password?
                  </button>
                )}
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
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
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 38px',
                    background: 'var(--mfe-bg-surface)',
                    border: '1px solid var(--mfe-border)',
                    borderRadius: 'var(--mfe-radius-md)',
                    color: 'var(--mfe-text-primary)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--mfe-font-sans)',
                    outline: 'none',
                    transition: 'var(--mfe-transition)'
                  }}
                  className="mfe-input"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--mfe-text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Password Strength Indicator (Register mode) */}
              {mode === 'register' && (
                <div style={{ marginTop: '4px' }}>
                  <div
                    style={{
                      height: '4px',
                      width: '100%',
                      backgroundColor: 'var(--mfe-border)',
                      borderRadius: '9999px',
                      overflow: 'hidden'
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${strength}%`,
                        backgroundColor: strengthColor,
                        borderRadius: '9999px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                  <span style={{ fontSize: '0.6875rem', color: strengthColor, marginTop: '2px', display: 'block' }}>
                    Password Strength: {strength < 40 ? 'Weak' : strength < 80 ? 'Good' : 'Strong & Encrypted'}
                  </span>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)' }}>
                  Assigned Team Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    background: 'var(--mfe-bg-surface)',
                    border: '1px solid var(--mfe-border)',
                    borderRadius: 'var(--mfe-radius-md)',
                    color: 'var(--mfe-text-primary)',
                    fontSize: '0.875rem',
                    fontFamily: 'var(--mfe-font-sans)',
                    outline: 'none'
                  }}
                >
                  <option value="Admin">Admin (Full Access & User Deletion)</option>
                  <option value="Editor">Editor (Analytics & CRUD permissions)</option>
                  <option value="Viewer">Viewer (Read-only dashboards)</option>
                </select>
              </div>
            )}

            {mode === 'login' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ cursor: 'pointer', accentColor: 'var(--mfe-primary)' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', cursor: 'pointer' }}>
                  Remember this device for 30 days
                </label>
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  fontSize: '0.8125rem',
                  color: 'var(--mfe-success)',
                  backgroundColor: 'var(--mfe-success-bg)',
                  padding: '10px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <CheckCircle size={16} />
                {successMsg}
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              icon={ArrowRight}
              style={{
                marginTop: '4px',
                width: '100%',
                padding: '13px 20px',
                fontSize: '0.9375rem',
                background: 'linear-gradient(135deg, #0284c7 0%, #6366f1 100%)',
                boxShadow: '0 8px 24px -4px rgba(56, 189, 248, 0.4)'
              }}
            >
              {mode === 'login' ? 'Authenticate & Enter Dashboard' : 'Complete Registration'}
            </Button>
          </form>

          {/* Social / SSO Alternative */}
          <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <button
              type="button"
              onClick={() => handleDemoSelect(DEMO_USERS[0])}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-bg-card)',
                border: '1px solid var(--mfe-border)',
                color: 'var(--mfe-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--mfe-transition)'
              }}
              className="sso-btn"
            >
              <Shield size={14} color="var(--mfe-primary)" />
              Okta / SSO
            </button>
            <button
              type="button"
              onClick={() => handleDemoSelect(DEMO_USERS[1])}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 12px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-bg-card)',
                border: '1px solid var(--mfe-border)',
                color: 'var(--mfe-text-primary)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'var(--mfe-transition)'
              }}
              className="sso-btn"
            >
              <Cpu size={14} color="var(--mfe-accent)" />
              GitHub Auth
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .demo-persona-card:hover {
          border-color: var(--mfe-primary) !important;
          background: var(--mfe-bg-active) !important;
          transform: translateY(-2px);
        }
        .sso-btn:hover {
          border-color: var(--mfe-border-highlight) !important;
          background: var(--mfe-bg-active) !important;
        }
        [data-theme='light'] .auth-hero-column {
          background: linear-gradient(155deg, #f8fafc 0%, #f0f9ff 50%, #e0f2fe 100%) !important;
          border-right: 1px solid #e2e8f0 !important;
        }
        [data-theme='light'] .auth-hero-title {
          color: #0f172a !important;
        }
        [data-theme='light'] .auth-hero-desc {
          color: #475569 !important;
        }
        [data-theme='light'] .auth-telemetry-card {
          background: rgba(255, 255, 255, 0.88) !important;
          border: 1px solid rgba(14, 165, 233, 0.25) !important;
          box-shadow: 0 8px 24px -4px rgba(2, 132, 199, 0.1), 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }
        [data-theme='light'] .auth-telemetry-title {
          color: #0f172a !important;
        }
        [data-theme='light'] .auth-telemetry-item-name {
          color: #1e293b !important;
        }
        [data-theme='light'] .auth-telemetry-item-port {
          color: #64748b !important;
        }
        [data-theme='light'] .auth-telemetry-item-latency {
          color: #0284c7 !important;
        }
        [data-theme='light'] .auth-footer {
          border-top: 1px solid #e2e8f0 !important;
          color: #64748b !important;
        }
        @media (max-width: 860px) {
          .auth-hero-column {
            display: none !important;
          }
          .auth-container-grid {
            grid-template-columns: 1fr !important;
            max-width: 500px !important;
          }
        }
      `}</style>
    </div>
  );
}
