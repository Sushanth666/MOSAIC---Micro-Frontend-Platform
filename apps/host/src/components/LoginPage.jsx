import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  Shield,
  Check,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Building,
  Briefcase,
  Activity,
  Cpu,
  Layers,
  Globe,
  Radio,
  Zap,
  ChevronRight,
  X
} from 'lucide-react';
import { Button, Badge, Avatar } from '@mfe/shared-ui';
import { authStore, DEMO_USERS, eventBus, MFE_EVENTS } from '@mfe/shared-bus';

function calculatePasswordStrength(pass) {
  if (!pass) return { score: 0, label: 'Empty', color: 'var(--mfe-border)' };
  let score = 0;
  if (pass.length >= 8) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;

  if (score <= 1) return { score: 1, label: 'Weak', color: '#ef4444' };
  if (score === 2) return { score: 2, label: 'Fair', color: '#f59e0b' };
  if (score === 3) return { score: 3, label: 'Strong', color: '#38bdf8' };
  return { score: 4, label: 'Very Secure', color: '#10b981' };
}

export function LoginPage({ initialMode = 'signin', onLoginSuccess, theme, onToggleTheme }) {
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'

  // Sign In State - unselected by default
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up State
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupRole, setSignupRole] = useState('Admin'); // 'Admin' | 'Editor' | 'Viewer'
  const [signupPassword, setSignupPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(true);

  // Common State
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [selectedPersonaId, setSelectedPersonaId] = useState(null);
  const [signupSuccess, setSignupSuccess] = useState(null); // { name, role, email }
  const [loginSuccess, setLoginSuccess] = useState(null);  // { name, role, email, user, token }

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleModeSwitch = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', newMode === 'signup' ? '/signup' : '/login');
    }
  };

  const handleAuthenticate = (userObj) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    setTimeout(() => {
      try {
        const token = `mfe-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        // Show login success popup — authentication & dashboard transition happen on popup countdown completion
        setLoading(false);
        setLoginSuccess({
          name: userObj.name,
          role: userObj.role,
          email: userObj.email,
          title: userObj.title,
          user: userObj,
          token
        });
      } catch (err) {
        setErrorMsg('Login failed. Please check your email and password.');
        setLoading(false);
      }
    }, 400);
  };

  const handleSigninSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Please provide both email and password.');
      return;
    }

    const matched = DEMO_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    const user = matched || {
      id: `usr_${Date.now()}`,
      name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      email: email.trim(),
      role: 'Admin',
      title: 'Platform Engineer',
      avatar: 'initials',
      status: 'Active',
      joined: 'Today'
    };

    handleAuthenticate(user);
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!signupName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!signupEmail.trim() || !signupEmail.includes('@')) {
      setErrorMsg('Please enter a valid work email address.');
      return;
    }
    if (!signupPassword || signupPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('Please accept the Enterprise Terms of Service.');
      return;
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      name: signupName.trim(),
      email: signupEmail.trim(),
      role: signupRole,
      title: signupRole === 'Admin' ? 'Platform Architect' : signupRole === 'Editor' ? 'Frontend Engineer' : 'Product Analyst',
      avatar: 'initials',
      status: 'Active',
      joined: 'Today'
    };

    setLoading(true);
    setErrorMsg('');

    // Simulate account creation delay
    setTimeout(() => {
      try {
        const token = `mfe-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;
        // Show success popup — authentication & dashboard transition happen on popup countdown completion
        setLoading(false);
        setSignupSuccess({
          name: newUser.name,
          role: newUser.role,
          email: newUser.email,
          user: newUser,
          token
        });
      } catch (err) {
        setErrorMsg('Account creation failed. Please try again.');
        setLoading(false);
      }
    }, 500);
  };

  const handleSelectPersona = (persona) => {
    if (selectedPersonaId === persona.id) {
      // Toggle to unselect if already chosen
      handleClearPersona();
    } else {
      // Select persona and fill credentials
      setSelectedPersonaId(persona.id);
      setEmail(persona.email);
      setPassword('mosaic-secure-pass');
      setErrorMsg('');
    }
  };

  const handleClearPersona = () => {
    setSelectedPersonaId(null);
    setEmail('');
    setPassword('');
    setErrorMsg('');
  };

  const handleSocialAuth = (provider) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg(`Redirecting to official ${provider} sign-in portal...`);
    const targetUrl =
      provider === 'Google'
        ? 'https://accounts.google.com'
        : 'https://github.com/login';

    setTimeout(() => {
      window.location.href = targetUrl;
    }, 250);
  };

  const pwdStrength = calculatePasswordStrength(signupPassword);

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        backgroundColor: 'var(--mfe-bg-base)',
        color: 'var(--mfe-text-primary)',
        fontFamily: 'var(--mfe-font-sans)',
        position: 'relative',
        overflowX: 'hidden'
      }}
    >
      {/* Dynamic Background Mesh Gradients */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            theme === 'light'
              ? 'radial-gradient(circle at 12% 18%, rgba(245, 158, 11, 0.08) 0%, transparent 42%), radial-gradient(circle at 88% 82%, rgba(234, 88, 12, 0.06) 0%, transparent 46%)'
              : 'radial-gradient(circle at 10% 15%, rgba(245, 158, 11, 0.08) 0%, transparent 45%), radial-gradient(circle at 90% 85%, rgba(249, 115, 22, 0.07) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(217, 119, 6, 0.03) 0%, transparent 60%)',
          zIndex: 0
        }}
      />

      {/* ========================================================= */}
      {/* LEFT SHOWCASE HERO PANEL (Desktop: 46% width)             */}
      {/* ========================================================= */}
      <div
        className="auth-hero-panel"
        style={{
          flex: '0 0 46%',
          maxWidth: '580px',
          padding: '48px 48px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--mfe-border)',
          background: theme === 'light'
            ? 'linear-gradient(180deg, var(--mfe-bg-surface) 0%, rgba(245, 158, 11, 0.03) 100%)'
            : 'linear-gradient(180deg, var(--mfe-bg-surface) 0%, rgba(18, 15, 11, 0.6) 100%)',
          position: 'relative',
          zIndex: 2
        }}
      >
        {/* Brand Header */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '40px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                overflow: 'hidden',
                boxShadow: '0 0 20px -2px var(--mfe-primary-glow)',
                border: '1.5px solid var(--mfe-primary)',
                flexShrink: 0
              }}
            >
              <img
                src="/mosaic-logo.png"
                alt="MOSAIC Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.03em', background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                MOSAIC
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', fontWeight: 500 }}>
                Enterprise Micro-Frontend Platform
              </div>
            </div>
          </div>

          {/* Hero Headlines */}
          <div style={{ maxWidth: '440px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '5px 12px',
                borderRadius: '9999px',
                background: 'var(--mfe-bg-active)',
                border: '1px solid var(--mfe-border-highlight)',
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--mfe-primary)',
                marginBottom: '16px'
              }}
            >
              <Zap size={14} />
              <span>Next-Gen Module Federation 2.0</span>
            </div>

            <h1
              style={{
                fontSize: '2.25rem',
                fontWeight: 800,
                letterSpacing: '-0.04em',
                lineHeight: 1.15,
                color: 'var(--mfe-text-primary)',
                margin: '0 0 16px 0'
              }}
            >
              Decouple faster. Deploy with zero friction.
            </h1>
            <p
              style={{
                fontSize: '0.9375rem',
                color: 'var(--mfe-text-secondary)',
                lineHeight: 1.6,
                margin: 0
              }}
            >
              Unify independent micro-frontends with real-time state telemetry, role-based isolation, and enterprise security.
            </p>
          </div>
        </div>

        {/* Live Architecture Telemetry Glass Card */}
        <div
          style={{
            margin: '32px 0',
            padding: '22px 24px',
            borderRadius: '18px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            boxShadow: 'var(--mfe-shadow-md), 0 0 30px -10px var(--mfe-primary-glow)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="mfe-pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--mfe-success)' }} />
              <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                Live Mesh Telemetry
              </span>
            </div>
            <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: 'var(--mfe-success)', padding: '2px 8px', borderRadius: '9999px', background: 'var(--mfe-success-bg)' }}>
              99.99% UPTIME
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {[
              { label: 'Host Shell', port: '5000', status: 'Active' },
              { label: 'User Service', port: '5001', status: 'Synced' },
              { label: 'Analytics Engine', port: '5002', status: 'Live' },
              { label: 'Event Bus', port: 'Cross-App', status: '<1ms' }
            ].map((node, i) => (
              <div
                key={i}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--mfe-border-subtle)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-primary)' }}>
                    {node.label}
                  </span>
                  <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-primary)', fontFamily: 'var(--mfe-font-mono)' }}>
                    :{node.port}
                  </span>
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)' }}>
                  {node.status}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Proof Card */}
        <div
          style={{
            padding: '16px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.02)',
            border: '1px solid var(--mfe-border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '14px',
              flexShrink: 0
            }}
          >
            SJ
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', fontStyle: 'italic', lineHeight: 1.4 }}>
              "MOSAIC simplified our multi-team releases with zero bundle cross-contamination."
            </div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', marginTop: '4px', fontWeight: 600 }}>
              Sarah Jenkins • VP Platform Engineering
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT AUTHENTICATION PANEL (Sign In & Sign Up)           */}
      {/* ========================================================= */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '32px 24px',
          position: 'relative',
          zIndex: 5
        }}
      >
        {/* Top Right Utilities */}
        <div
          style={{
            position: 'absolute',
            top: '24px',
            right: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <button
            onClick={onToggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--mfe-radius-md)',
              background: 'var(--mfe-bg-card)',
              border: '1px solid var(--mfe-border)',
              color: 'var(--mfe-text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'var(--mfe-transition)'
            }}
            className="topbar-btn"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* Main Auth Glass Card */}
        <div
          className="mfe-scale-in"
          style={{
            width: '100%',
            maxWidth: '460px',
            background: 'var(--mfe-bg-surface)',
            border: '1px solid var(--mfe-border)',
            borderRadius: '24px',
            boxShadow: 'var(--mfe-shadow-lg), 0 0 45px -5px var(--mfe-primary-glow)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          {/* Top Luminous Gradient Bar */}
          <div style={{ height: '3.5px', background: 'var(--mfe-primary-gradient)' }} />

          {/* Mode Switcher Tabs */}
          <div style={{ padding: '24px 28px 12px' }}>
            <div
              style={{
                display: 'flex',
                background: 'var(--mfe-bg-card)',
                border: '1px solid var(--mfe-border)',
                borderRadius: 'var(--mfe-radius-full)',
                padding: '4px',
                gap: '4px'
              }}
            >
              <button
                type="button"
                onClick={() => handleModeSwitch('signin')}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: 'var(--mfe-radius-full)',
                  border: 'none',
                  background: mode === 'signin' ? 'var(--mfe-primary-gradient)' : 'transparent',
                  color: mode === 'signin' ? '#07090e' : 'var(--mfe-text-secondary)',
                  fontWeight: mode === 'signin' ? 800 : 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: mode === 'signin' ? '0 2px 10px -1px var(--mfe-primary-glow)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => handleModeSwitch('signup')}
                style={{
                  flex: 1,
                  padding: '9px 16px',
                  borderRadius: 'var(--mfe-radius-full)',
                  border: 'none',
                  background: mode === 'signup' ? 'var(--mfe-primary-gradient)' : 'transparent',
                  color: mode === 'signup' ? '#07090e' : 'var(--mfe-text-secondary)',
                  fontWeight: mode === 'signup' ? 800 : 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: mode === 'signup' ? '0 2px 10px -1px var(--mfe-primary-glow)' : 'none',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              >
                Create Account
              </button>
            </div>
          </div>

          {/* Form Header */}
          <div style={{ padding: '8px 28px 16px' }}>
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 800,
                color: 'var(--mfe-text-primary)',
                letterSpacing: '-0.02em',
                margin: '0 0 6px 0'
              }}
            >
              {mode === 'signin' ? 'Welcome Back' : 'Create Your Account'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', margin: 0, lineHeight: 1.5 }}>
              {mode === 'signin'
                ? 'Sign in to access your federated micro-frontend workspace.'
                : 'Join Mosaic to orchestrate and deploy decoupled micro-apps.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div
              style={{
                margin: '0 28px 14px',
                padding: '10px 14px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-danger-bg)',
                border: '1px solid rgba(255, 51, 102, 0.35)',
                color: 'var(--mfe-danger)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div
              style={{
                margin: '0 28px 14px',
                padding: '10px 14px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-success-bg)',
                border: '1px solid rgba(16, 185, 129, 0.35)',
                color: 'var(--mfe-success)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* =================================================== */}
          {/* TAB 1: SIGN IN FORM                                 */}
          {/* =================================================== */}
          {mode === 'signin' ? (
            <form onSubmit={handleSigninSubmit} style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Email Input */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Work Email
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--mfe-text-muted)', display: 'flex' }}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (selectedPersonaId) setSelectedPersonaId(null);
                    }}
                    placeholder="name@company.com"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-card)',
                      border: '1px solid var(--mfe-border)',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    className="mfe-input-focus"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-secondary)' }}>
                    Password
                  </label>
                  <a
                    href="#forgot"
                    onClick={(e) => {
                      e.preventDefault();
                      setErrorMsg('Please select a quick demo persona above or enter any valid password.');
                    }}
                    style={{ fontSize: '0.75rem', color: 'var(--mfe-primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Forgot password?
                  </a>
                </div>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--mfe-text-muted)', display: 'flex' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (selectedPersonaId) setSelectedPersonaId(null);
                    }}
                    placeholder="••••••••••••"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 40px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-card)',
                      border: '1px solid var(--mfe-border)',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    className="mfe-input-focus"
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
                      padding: '4px'
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--mfe-primary)', cursor: 'pointer' }}
                />
                <label htmlFor="rememberMe" style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', cursor: 'pointer' }}>
                  Remember this workstation for 30 days
                </label>
              </div>

              {/* Submit CTA */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
                icon={loading ? undefined : ArrowRight}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? 'Authenticating...' : 'Sign In to Workspace'}
              </Button>

              {/* SSO Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <a
                  href="https://accounts.google.com"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialAuth('Google');
                  }}
                  title="Redirect to official Google account login"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: 'var(--mfe-bg-card)',
                    border: '1px solid var(--mfe-border)',
                    color: 'var(--mfe-text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  className="social-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                  </svg>
                  <span>Google SSO</span>
                </a>

                <a
                  href="https://github.com/login"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialAuth('GitHub');
                  }}
                  title="Redirect to official GitHub login"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: 'var(--mfe-bg-card)',
                    border: '1px solid var(--mfe-border)',
                    color: 'var(--mfe-text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  className="social-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub SSO</span>
                </a>
              </div>

              {/* Bottom Switch Link */}
              <div style={{ textAlign: 'center', marginTop: '6px', fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)' }}>
                Don't have an enterprise account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signup')}
                  style={{ background: 'none', border: 'none', color: 'var(--mfe-primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Create one now
                </button>
              </div>
            </form>
          ) : (
            /* =================================================== */
            /* TAB 2: SIGN UP FORM                                 */
            /* =================================================== */
            <form onSubmit={handleSignupSubmit} style={{ padding: '0 28px 28px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Full Name */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Full Name
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--mfe-text-muted)', display: 'flex' }}>
                    <User size={16} />
                  </div>
                  <input
                    type="text"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Alex Morgan"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-card)',
                      border: '1px solid var(--mfe-border)',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    className="mfe-input-focus"
                  />
                </div>
              </div>

              {/* Work Email */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Work Email
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--mfe-text-muted)', display: 'flex' }}>
                    <Mail size={16} />
                  </div>
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="alex@company.com"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 40px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-card)',
                      border: '1px solid var(--mfe-border)',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    className="mfe-input-focus"
                  />
                </div>
              </div>

              {/* Enterprise Role Selection */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Assigned Architecture Role
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                  {[
                    { id: 'Admin', title: 'Admin', desc: 'Full Control' },
                    { id: 'Editor', title: 'Editor', desc: 'Users & Apps' },
                    { id: 'Viewer', title: 'Viewer', desc: 'Read Only' }
                  ].map((roleItem) => {
                    const isSelected = signupRole === roleItem.id;
                    return (
                      <div
                        key={roleItem.id}
                        onClick={() => setSignupRole(roleItem.id)}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '10px',
                          background: isSelected ? 'rgba(0, 240, 255, 0.08)' : 'var(--mfe-bg-card)',
                          border: isSelected ? '1.5px solid var(--mfe-primary)' : '1px solid var(--mfe-border)',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ fontSize: '0.8125rem', fontWeight: 800, color: isSelected ? 'var(--mfe-primary)' : 'var(--mfe-text-primary)' }}>
                          {roleItem.title}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                          {roleItem.desc}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Password & Live Strength Meter */}
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <div style={{ position: 'absolute', left: '14px', color: 'var(--mfe-text-muted)', display: 'flex' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    type={showSignupPassword ? 'text' : 'password'}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create a strong password"
                    required
                    style={{
                      width: '100%',
                      padding: '11px 40px 11px 40px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-card)',
                      border: '1px solid var(--mfe-border)',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                    }}
                    className="mfe-input-focus"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--mfe-text-muted)',
                      cursor: 'pointer',
                      display: 'flex',
                      padding: '4px'
                    }}
                  >
                    {showSignupPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Meter */}
                {signupPassword && (
                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)' }}>Strength</span>
                      <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: pwdStrength.color }}>
                        {pwdStrength.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
                      {[1, 2, 3, 4].map((seg) => (
                        <div
                          key={seg}
                          style={{
                            flex: 1,
                            borderRadius: '9999px',
                            background: pwdStrength.score >= seg ? pwdStrength.color : 'rgba(255, 255, 255, 0.08)',
                            transition: 'all 0.25s ease'
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginTop: '2px' }}>
                <input
                  type="checkbox"
                  id="agreedTerms"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  style={{ accentColor: 'var(--mfe-primary)', cursor: 'pointer', marginTop: '2px' }}
                />
                <label htmlFor="agreedTerms" style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)', lineHeight: 1.4, cursor: 'pointer' }}>
                  I agree to the Enterprise Terms of Service and Architecture Security Policy.
                </label>
              </div>

              {/* Submit CTA */}
              <Button
                variant="primary"
                size="lg"
                type="submit"
                disabled={loading}
                icon={loading ? undefined : Sparkles}
                style={{ width: '100%', marginTop: '4px' }}
              >
                {loading ? 'Setting up Workspace...' : 'Create Enterprise Account'}
              </Button>

              {/* SSO Registration Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                <a
                  href="https://accounts.google.com"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialAuth('Google');
                  }}
                  title="Redirect to official Google account login"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: 'var(--mfe-bg-card)',
                    border: '1px solid var(--mfe-border)',
                    color: 'var(--mfe-text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  className="social-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                    <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                    <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" />
                    <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" />
                  </svg>
                  <span>Google SSO</span>
                </a>

                <a
                  href="https://github.com/login"
                  onClick={(e) => {
                    e.preventDefault();
                    handleSocialAuth('GitHub');
                  }}
                  title="Redirect to official GitHub login"
                  style={{
                    padding: '9px 12px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: 'var(--mfe-bg-card)',
                    border: '1px solid var(--mfe-border)',
                    color: 'var(--mfe-text-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    textDecoration: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  className="social-btn"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                  <span>GitHub SSO</span>
                </a>
              </div>

              {/* Bottom Switch Link */}
              <div style={{ textAlign: 'center', marginTop: '4px', fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)' }}>
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  style={{ background: 'none', border: 'none', color: 'var(--mfe-primary)', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Sign in here
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* Account Created Successfully — Popup Modal with Countdown    */}
      {/* ============================================================ */}
      {signupSuccess && (
        <SignupSuccessModal
          signupSuccess={signupSuccess}
          onDone={() => {
            const user = signupSuccess.user;
            const token = signupSuccess.token;
            setSignupSuccess(null);
            authStore.login(user);
            if (onLoginSuccess) onLoginSuccess(user, token);
          }}
          theme={theme}
        />
      )}

      {/* ============================================================ */}
      {/* Login Successful — Welcome Back Popup Modal                  */}
      {/* ============================================================ */}
      {loginSuccess && (
        <LoginSuccessModal
          loginSuccess={loginSuccess}
          onDone={() => {
            const user = loginSuccess.user;
            const token = loginSuccess.token;
            setLoginSuccess(null);
            authStore.login(user);
            if (onLoginSuccess) onLoginSuccess(user, token);
          }}
          theme={theme}
        />
      )}
    </div>
  );

}

/** Isolated countdown component so it has its own useEffect timer */
function SignupSuccessModal({ signupSuccess, onDone, theme }) {
  const [countdown, setCountdown] = React.useState(3);
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          onDone();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const roleColors = isLight
    ? {
        Admin: { bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(217, 119, 6, 0.35)', color: '#b45309' },
        Editor: { bg: 'rgba(2, 132, 199, 0.1)', border: 'rgba(2, 132, 199, 0.3)', color: '#0284c7' },
        Viewer: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: '#059669' },
      }
    : {
        Admin: { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)', color: '#f59e0b' },
        Editor: { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)', color: '#38bdf8' },
        Viewer: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#10b981' },
      };

  const rc = roleColors[signupSuccess.role] || roleColors.Admin;
  const initials = signupSuccess.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
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
        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(8, 6, 4, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'mfe-fadeIn 0.3s ease',
        padding: '20px',
      }}
    >
      <style>{`
        @keyframes mfe-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mfe-slideInUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes mfe-bounceIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); } }
      `}</style>
      <div
        style={{
          background: isLight
            ? 'linear-gradient(145deg, #ffffff 0%, #fffdfa 100%)'
            : 'linear-gradient(145deg, #1a1510 0%, #0f0c08 100%)',
          border: isLight
            ? '1px solid rgba(217, 119, 6, 0.25)'
            : '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '24px',
          padding: '44px 40px 36px',
          maxWidth: '440px',
          width: '100%',
          textAlign: 'center',
          boxShadow: isLight
            ? '0 25px 70px -10px rgba(180, 83, 9, 0.22), 0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.9) inset'
            : '0 32px 80px rgba(0, 0, 0, 0.7), 0 0 60px rgba(245, 158, 11, 0.12)',
          animation: 'mfe-slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Amber glow background blob */}
        <div style={{
          position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)',
          width: '280px', height: '280px', borderRadius: '50%',
          background: isLight
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.18) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Success checkmark ring */}
        <div
          style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: isLight
              ? '0 0 0 12px rgba(245, 158, 11, 0.12), 0 8px 24px rgba(245, 158, 11, 0.3)'
              : '0 0 0 12px rgba(245, 158, 11, 0.12), 0 0 32px rgba(245, 158, 11, 0.35)',
            animation: 'mfe-bounceIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <path
              d="M8 18L14.5 24.5L28 11"
              stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 40, strokeDashoffset: 0 }}
            />
          </svg>
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em',
          background: isLight
            ? 'linear-gradient(135deg, #d97706 0%, #b45309 60%, #9a3412 100%)'
            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '6px',
        }}>
          Account Created!
        </h2>
        <p style={{
          fontSize: '0.9rem',
          color: isLight ? '#57534e' : 'rgba(255, 251, 245, 0.6)',
          marginBottom: '24px'
        }}>
          Welcome to MOSAIC. Your workspace is ready.
        </p>

        {/* User Info Card */}
        <div style={{
          background: isLight
            ? 'linear-gradient(135deg, #fefaf6 0%, #fbf5ee 100%)'
            : 'rgba(255, 255, 255, 0.04)',
          border: isLight ? '1px solid #ede4d8' : '1px solid rgba(255, 230, 190, 0.1)',
          borderRadius: '14px', padding: '16px 20px', marginBottom: '24px',
          display: 'flex', alignItems: 'center', gap: '14px', textAlign: 'left',
          boxShadow: isLight ? '0 2px 8px rgba(217, 119, 6, 0.05)' : 'none',
        }}>
          {/* Avatar */}
          <div style={{
            width: '46px', height: '46px', borderRadius: '12px', flexShrink: 0,
            overflow: 'hidden',
            background: '#14110d',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(245, 158, 11, 0.35)',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <img
              src="/mosaic-logo.png"
              alt="MOSAIC Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.9375rem', fontWeight: 800,
              color: isLight ? '#1c1917' : '#fffbf5',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
            }}>
              {signupSuccess.name}
            </div>
            <div style={{
              fontSize: '0.78rem',
              color: isLight ? '#78716c' : 'rgba(255, 251, 245, 0.5)',
              marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              fontFamily: 'var(--mfe-font-mono, monospace)'
            }}>
              {signupSuccess.email}
            </div>
          </div>
          <span style={{
            padding: '4px 10px', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
            background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color,
          }}>
            {signupSuccess.role}
          </span>
        </div>

        {/* Redirecting countdown */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{
            fontSize: '0.8125rem',
            color: isLight ? '#78716c' : 'rgba(255, 251, 245, 0.45)',
            marginBottom: '12px'
          }}>
            Redirecting to dashboard in <strong style={{ color: isLight ? '#d97706' : '#f59e0b' }}>{countdown}s</strong>...
          </p>
          {/* Progress bar */}
          <div style={{
            height: '5px', borderRadius: '9999px',
            background: isLight ? '#f1e8dc' : 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '9999px',
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #ea580c)',
              width: `${progress}%`,
              transition: 'width 1s linear',
              boxShadow: isLight ? '0 0 8px rgba(245, 158, 11, 0.4)' : '0 0 8px rgba(245, 158, 11, 0.6)',
            }} />
          </div>
        </div>

        {/* Go now button */}
        <button
          onClick={onDone}
          style={{
            width: '100%', padding: '12px 20px',
            background: isLight
              ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
              : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
            border: 'none', borderRadius: '12px',
            color: isLight ? '#ffffff' : '#0c0a08',
            fontWeight: 800, fontSize: '0.9375rem',
            cursor: 'pointer', fontFamily: 'var(--mfe-font-sans)',
            boxShadow: isLight
              ? '0 4px 18px rgba(234, 88, 12, 0.35)'
              : '0 4px 20px rgba(245, 158, 11, 0.4)',
            transition: 'opacity 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.92';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Go to Dashboard →
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}



/** Login Success Popup — shown after a successful sign-in */
function LoginSuccessModal({ loginSuccess, onDone, theme }) {
  const [countdown, setCountdown] = React.useState(3);
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light');

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timer);
          onDone();
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const roleColors = isLight
    ? {
        Admin:  { bg: 'rgba(245, 158, 11, 0.14)', border: 'rgba(217, 119, 6, 0.35)', color: '#b45309' },
        Editor: { bg: 'rgba(2, 132, 199, 0.1)',   border: 'rgba(2, 132, 199, 0.3)',   color: '#0284c7' },
        Viewer: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)', color: '#059669' },
      }
    : {
        Admin:  { bg: 'rgba(245, 158, 11, 0.15)', border: 'rgba(245, 158, 11, 0.4)',  color: '#f59e0b' },
        Editor: { bg: 'rgba(56, 189, 248, 0.12)', border: 'rgba(56, 189, 248, 0.35)', color: '#38bdf8' },
        Viewer: { bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', color: '#10b981' },
      };

  const rc = roleColors[loginSuccess.role] || roleColors.Admin;
  const initials = loginSuccess.name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
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
        backgroundColor: isLight ? 'rgba(15, 23, 42, 0.45)' : 'rgba(8, 6, 4, 0.78)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        animation: 'mfe-fadeIn 0.3s ease',
        padding: '20px',
      }}
    >
      <style>{`
        @keyframes mfe-fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mfe-slideInUp { from { opacity: 0; transform: translateY(20px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes mfe-bounceIn { 0% { transform: scale(0.5); opacity: 0; } 70% { transform: scale(1.06); opacity: 1; } 100% { transform: scale(1); } }
      `}</style>
      <div
        style={{
          background: isLight
            ? 'linear-gradient(145deg, #ffffff 0%, #fffdfa 100%)'
            : 'linear-gradient(145deg, #1a1510 0%, #0f0c08 100%)',
          border: isLight
            ? '1px solid rgba(217, 119, 6, 0.25)'
            : '1px solid rgba(245, 158, 11, 0.3)',
          borderRadius: '24px',
          padding: '40px 36px 32px',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          boxShadow: isLight
            ? '0 25px 70px -10px rgba(180, 83, 9, 0.22), 0 10px 25px -5px rgba(0, 0, 0, 0.06), 0 0 0 1px rgba(255, 255, 255, 0.9) inset'
            : '0 32px 80px rgba(0, 0, 0, 0.7), 0 0 60px rgba(245, 158, 11, 0.1)',
          animation: 'mfe-slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Ambient amber glow */}
        <div style={{
          position: 'absolute', top: '-80px', left: '50%', transform: 'translateX(-50%)',
          width: '300px', height: '300px', borderRadius: '50%',
          background: isLight
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(245, 158, 11, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Avatar */}
        <div style={{ position: 'relative', display: 'inline-block', marginBottom: '18px' }}>
          <div
            style={{
              width: '76px', height: '76px', borderRadius: '50%',
              overflow: 'hidden',
              background: '#14110d',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: isLight
                ? '0 0 0 10px rgba(245, 158, 11, 0.12), 0 8px 24px rgba(245, 158, 11, 0.3)'
                : '0 0 0 10px rgba(245, 158, 11, 0.1), 0 0 28px rgba(245, 158, 11, 0.35)',
              animation: 'mfe-bounceIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
              margin: '0 auto',
              border: `3px solid ${isLight ? '#ffffff' : 'rgba(245, 158, 11, 0.4)'}`
            }}
          >
            <img
              src="/mosaic-logo.png"
              alt="MOSAIC Logo"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          {/* Online green dot */}
          <span style={{
            position: 'absolute', bottom: '2px', right: '2px',
            width: '16px', height: '16px', borderRadius: '50%',
            background: '#10b981',
            border: `2.5px solid ${isLight ? '#ffffff' : '#0f0c08'}`,
            boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
          }} />
        </div>

        {/* Greeting */}
        <div style={{
          fontSize: '0.8125rem', fontWeight: 700,
          color: isLight ? '#92400e' : 'rgba(255, 251, 245, 0.45)',
          letterSpacing: '0.05em', textTransform: 'uppercase',
          marginBottom: '6px',
        }}>
          {greeting} 👋
        </div>

        {/* Welcome headline */}
        <h2 style={{
          fontSize: '1.55rem', fontWeight: 900, letterSpacing: '-0.03em',
          background: isLight
            ? 'linear-gradient(135deg, #d97706 0%, #b45309 60%, #9a3412 100%)'
            : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '4px',
        }}>
          Welcome back, {loginSuccess.name.split(' ')[0]}!
        </h2>
        <p style={{
          fontSize: '0.875rem',
          color: isLight ? '#57534e' : 'rgba(255, 251, 245, 0.5)',
          marginBottom: '22px', lineHeight: 1.5,
        }}>
          You're now signed in. Your dashboard is ready.
        </p>

        {/* User info card */}
        <div style={{
          background: isLight
            ? 'linear-gradient(135deg, #fefaf6 0%, #fbf5ee 100%)'
            : 'rgba(255, 255, 255, 0.04)',
          border: isLight ? '1px solid #ede4d8' : '1px solid rgba(255, 230, 190, 0.1)',
          borderRadius: '14px', padding: '14px 18px',
          marginBottom: '22px',
          display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left',
          boxShadow: isLight ? '0 2px 8px rgba(217, 119, 6, 0.05)' : 'none',
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: isLight ? '#1c1917' : '#fffbf5' }}>
              {loginSuccess.name}
            </div>
            <div style={{
              fontSize: '0.75rem',
              color: isLight ? '#78716c' : 'rgba(255, 251, 245, 0.45)',
              marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              fontFamily: 'var(--mfe-font-mono, monospace)',
            }}>
              {loginSuccess.email}
            </div>
            {loginSuccess.title && (
              <div style={{
                fontSize: '0.7rem',
                color: isLight ? '#a8a29e' : 'rgba(255, 251, 245, 0.3)',
                marginTop: '2px'
              }}>
                {loginSuccess.title}
              </div>
            )}
          </div>
          <span style={{
            padding: '4px 12px', borderRadius: '9999px',
            fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
            background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color,
          }}>
            {loginSuccess.role}
          </span>
        </div>

        {/* Countdown */}
        <div style={{ marginBottom: '16px' }}>
          <p style={{
            fontSize: '0.8rem',
            color: isLight ? '#78716c' : 'rgba(255, 251, 245, 0.4)',
            marginBottom: '10px',
          }}>
            Taking you to your dashboard in <strong style={{ color: isLight ? '#d97706' : '#f59e0b' }}>{countdown}s</strong>...
          </p>
          <div style={{
            height: '5px', borderRadius: '9999px',
            background: isLight ? '#f1e8dc' : 'rgba(255, 255, 255, 0.08)',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%', borderRadius: '9999px',
              background: 'linear-gradient(90deg, #fbbf24, #f59e0b, #ea580c)',
              width: `${progress}%`,
              transition: 'width 1s linear',
              boxShadow: isLight ? '0 0 8px rgba(245, 158, 11, 0.4)' : '0 0 8px rgba(245, 158, 11, 0.55)',
            }} />
          </div>
        </div>

        {/* Enter button */}
        <button
          onClick={onDone}
          style={{
            width: '100%', padding: '12px 20px',
            background: isLight
              ? 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)'
              : 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #ea580c 100%)',
            border: 'none', borderRadius: '12px',
            color: isLight ? '#ffffff' : '#0c0a08',
            fontWeight: 800, fontSize: '0.9375rem',
            cursor: 'pointer', fontFamily: 'var(--mfe-font-sans)',
            boxShadow: isLight
              ? '0 4px 18px rgba(234, 88, 12, 0.35)'
              : '0 4px 20px rgba(245, 158, 11, 0.4)',
            transition: 'opacity 0.2s ease, transform 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '0.92';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Enter Dashboard →
        </button>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : modalContent;
}
