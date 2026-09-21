import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Shield,
  Key,
  Laptop,
  Smartphone,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Save,
  X,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  Mail,
  ShieldCheck,
  Globe,
  LogIn,
  ShieldAlert,
  Upload,
  Camera
} from 'lucide-react';
import { Button, Avatar, Badge, Input } from '@mfe/shared-ui';
import { authStore, DEMO_USERS, eventBus, MFE_EVENTS } from '@mfe/shared-bus';



export function ProfileModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'sessions' | 'api'
  const [user, setUser] = useState(authStore.getCurrentUser());
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [avatar, setAvatar] = useState('');
  const [customAvatar, setCustomAvatar] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [notice, setNotice] = useState('');
  const [sessions, setSessions] = useState([]);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      const current = authStore.getCurrentUser();
      setUser(current);
      if (!current) {
        setName('Guest User');
        setTitle('Unauthenticated Session');
        setAvatar('');
        setCustomAvatar('');
        setApiToken('');
        setSessions([]);
      } else {
        setName(current.name || '');
        setTitle(current.title || '');
        setAvatar(current.avatar || 'initials');
        if (current.avatar && current.avatar !== 'initials') {
          setCustomAvatar(current.avatar);
        }
        setApiToken(authStore.getApiToken());
        setSessions(authStore.getSessions());
      }
      setNotice('');
      setShowToken(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setNotice('Please select an image file (PNG, JPG, WebP)');
      setTimeout(() => setNotice(''), 3000);
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setNotice('Image file size must be less than 5MB');
      setTimeout(() => setNotice(''), 3000);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result;
      if (typeof dataUrl === 'string') {
        setCustomAvatar(dataUrl);
        setAvatar(dataUrl);
        setNotice('Custom image loaded! Click "Save Changes" to apply.');
        setTimeout(() => setNotice(''), 3500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSwitchPersona = (demoUser) => {
    authStore.login(demoUser);
    setUser(demoUser);
    setName(demoUser.name || '');
    setTitle(demoUser.title || '');
    setAvatar(demoUser.avatar || 'initials');
    setApiToken(authStore.getApiToken());
    setSessions(authStore.getSessions());
    setNotice(`Signed in as ${demoUser.name} (${demoUser.role})`);
    setTimeout(() => setNotice(''), 3500);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const updated = authStore.updateUserProfile({
      name: name.trim(),
      title: title.trim(),
      avatar
    });
    setUser(updated);
    setNotice('Profile updated successfully across all micro-frontends!');
    setTimeout(() => setNotice(''), 3500);
  };

  const handleCopyToken = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(apiToken);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRegenerateToken = () => {
    const newToken = authStore.regenerateApiToken();
    setApiToken(newToken);
    setNotice('New Personal Access Token generated and active.');
    setTimeout(() => setNotice(''), 3500);
  };

  const handleRevokeSessions = () => {
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    setNotice('Revoked all other active sessions.');
    setTimeout(() => setNotice(''), 3000);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(5, 8, 15, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        animation: 'mfe-fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="mfe-scale-in"
        style={{
          width: '100%',
          maxWidth: '580px',
          background: 'var(--mfe-bg-surface)',
          border: '1px solid var(--mfe-border)',
          borderRadius: '22px',
          boxShadow: 'var(--mfe-shadow-lg), 0 0 35px -5px var(--mfe-primary-glow)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative'
        }}
      >
        {/* Luminous Top Gradient Accent Bar */}
        <div style={{ height: '3px', background: 'var(--mfe-primary-gradient)' }} />

        {/* Hero Identity Banner */}
        <div
          style={{
            padding: '24px 28px 20px',
            background: 'linear-gradient(180deg, var(--mfe-bg-card) 0%, var(--mfe-bg-surface) 100%)',
            borderBottom: '1px solid var(--mfe-border-subtle)',
            position: 'relative'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'var(--mfe-bg-card)',
              border: '1px solid var(--mfe-border)',
              color: 'var(--mfe-text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease'
            }}
            className="modal-close-btn"
          >
            <X size={16} />
          </button>

          {/* User Hero Row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ position: 'relative' }}>
              {user ? (
                <>
                  <div
                    style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2.5px solid var(--mfe-primary)',
                      boxShadow: '0 0 20px -2px var(--mfe-primary-glow)',
                      background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '26px'
                    }}
                  >
                    <span>{(name?.trim().charAt(0) || user?.name?.trim().charAt(0) || 'U').toUpperCase()}</span>
                  </div>
                  <span
                    className="mfe-pulse-dot"
                    style={{
                      position: 'absolute',
                      bottom: '2px',
                      right: '2px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--mfe-success)',
                      border: '2px solid var(--mfe-bg-surface)'
                    }}
                  />
                </>
              ) : (
                <Avatar
                  name="Operator"
                  size={64}
                  status="offline"
                />
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h2
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--mfe-text-primary)',
                    letterSpacing: '-0.02em',
                    lineHeight: 1.2
                  }}
                >
                  {user ? (name || user.name) : 'Guest User'}
                </h2>
                <Badge variant={user?.role === 'Admin' ? 'primary' : user?.role === 'Editor' ? 'warning' : 'neutral'} size="sm">
                  {user ? user.role : 'UNAUTHENTICATED'}
                </Badge>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', marginTop: '3px' }}>
                {user ? (
                  <>
                    {(title || user.title)} • <span style={{ color: 'var(--mfe-text-muted)' }}>{user.email}</span>
                  </>
                ) : (
                  <>
                    Guest Session • <span style={{ color: 'var(--mfe-primary)', fontWeight: 600 }}>Unauthenticated</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Segmented Pill Tabs */}
          <div
            style={{
              display: 'flex',
              background: 'var(--mfe-bg-card)',
              border: '1px solid var(--mfe-border)',
              borderRadius: 'var(--mfe-radius-full)',
              padding: '4px',
              marginTop: '20px',
              gap: '4px'
            }}
          >
            {[
              { id: 'profile', label: user ? 'Profile & Persona' : 'Guest Persona & Sign In', icon: User },
              { id: 'sessions', label: 'Active Sessions', icon: Laptop },
              { id: 'api', label: 'API Security', icon: Key }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: 'var(--mfe-radius-full)',
                    background: isActive ? 'var(--mfe-primary-gradient)' : 'transparent',
                    color: isActive ? '#07090e' : 'var(--mfe-text-secondary)',
                    fontWeight: isActive ? 700 : 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '7px',
                    boxShadow: isActive ? '0 2px 10px -1px var(--mfe-primary-glow)' : 'none',
                    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                  }}
                  className="tab-pill-btn"
                >
                  <Icon size={15} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {notice && (
          <div
            style={{
              margin: '16px 28px 0 28px',
              padding: '10px 16px',
              background: 'var(--mfe-success-bg)',
              color: 'var(--mfe-success)',
              border: '1px solid rgba(16, 185, 129, 0.35)',
              borderRadius: 'var(--mfe-radius-md)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{notice}</span>
          </div>
        )}

        {/* Modal Body */}
        <div style={{ padding: '24px 28px 28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* TAB 1: Profile & Persona / Guest Mode */}
          {activeTab === 'profile' && (
            !user ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {/* Guest State Notice Card */}
                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(99, 102, 241, 0.08) 100%)',
                    border: '1px solid var(--mfe-border-highlight)',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px'
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-card)',
                      border: '1px solid var(--mfe-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--mfe-primary)',
                      flexShrink: 0
                    }}
                  >
                    <Lock size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                      Unauthenticated Guest Mode
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', marginTop: '4px', lineHeight: 1.5 }}>
                      You are browsing in read-only guest mode. Custom avatar editing, personal access tokens, and administrative mutations are locked until authenticated.
                    </p>
                  </div>
                </div>

                {/* Quick Persona Switcher */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', display: 'block', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Choose Persona or Sign In
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {DEMO_USERS.map((demo) => (
                      <div
                        key={demo.id}
                        onClick={() => handleSwitchPersona(demo)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: 'var(--mfe-radius-md)',
                          background: 'var(--mfe-bg-card)',
                          border: '1px solid var(--mfe-border)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        className="persona-switch-card"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <Avatar src={demo.avatar} name={demo.name} size={40} status="online" />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                                {demo.name}
                              </span>
                              <Badge variant={demo.role === 'Admin' ? 'primary' : demo.role === 'Editor' ? 'warning' : 'neutral'} size="sm">
                                {demo.role}
                              </Badge>
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                              {demo.title} • {demo.email}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          icon={LogIn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSwitchPersona(demo);
                          }}
                        >
                          Sign In
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <Button variant="secondary" size="md" onClick={onClose} type="button">
                    Close
                  </Button>
                  <Button
                    variant="primary"
                    size="md"
                    icon={LogIn}
                    type="button"
                    onClick={() => {
                      onClose();
                      window.location.href = '/auth';
                    }}
                  >
                    Go to Auth Portal
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Curated Avatar Grid, First Letter & Image Upload */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                      Choose Avatar Persona
                    </label>
                    <span style={{ fontSize: '0.75rem', color: 'var(--mfe-primary)', fontWeight: 600 }}>
                      First Letter • Custom Upload
                    </span>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {/* OPTION 1: First Letter in Profile Picture */}
                    {(() => {
                      const isFirstLetter = !avatar || avatar === 'initials';
                      const firstLetter = (name?.trim().charAt(0) || user?.name?.trim().charAt(0) || 'U').toUpperCase();
                      return (
                        <div
                          onClick={() => setAvatar('initials')}
                          title={`Use First Letter (${firstLetter}) as profile picture`}
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: isFirstLetter ? '2.5px solid var(--mfe-primary)' : '2px solid var(--mfe-border)',
                            boxShadow: isFirstLetter ? '0 0 14px var(--mfe-primary-glow)' : 'none',
                            transform: isFirstLetter ? 'scale(1.08)' : 'scale(1)',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            background: 'linear-gradient(135deg, #6366f1 0%, #38bdf8 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                            fontWeight: 800,
                            fontSize: '18px'
                          }}
                          className="avatar-choice-item"
                        >
                          <span>{firstLetter}</span>
                          {isFirstLetter && (
                            <div
                              style={{
                                position: 'absolute',
                                inset: 0,
                                background: 'rgba(0, 240, 255, 0.25)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Check size={16} color="#ffffff" strokeWidth={3} />
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* OPTION 2: Upload Custom Image */}
                    {(() => {
                      const isCustomSelected = Boolean(customAvatar && avatar === customAvatar);
                      return (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          title={customAvatar ? "Click to upload another image or select this photo" : "Upload your own profile image"}
                          style={{
                            width: '46px',
                            height: '46px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            cursor: 'pointer',
                            border: isCustomSelected
                              ? '2.5px solid var(--mfe-primary)'
                              : customAvatar
                              ? '2px solid var(--mfe-border)'
                              : '2px dashed var(--mfe-border-highlight)',
                            boxShadow: isCustomSelected ? '0 0 14px var(--mfe-primary-glow)' : 'none',
                            transform: isCustomSelected ? 'scale(1.08)' : 'scale(1)',
                            position: 'relative',
                            transition: 'all 0.2s ease',
                            background: customAvatar ? '#090d16' : 'var(--mfe-bg-card)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--mfe-primary)'
                          }}
                          className="avatar-choice-item"
                        >
                          {customAvatar ? (
                            <>
                              <img src={customAvatar} alt="custom upload" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                              {isCustomSelected ? (
                                <div
                                  style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'rgba(0, 240, 255, 0.25)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                  }}
                                >
                                  <Check size={16} color="#ffffff" strokeWidth={3} />
                                </div>
                              ) : (
                                <div
                                  style={{
                                    position: 'absolute',
                                    bottom: '0',
                                    right: '0',
                                    padding: '2px',
                                    background: 'var(--mfe-bg-surface)',
                                    borderRadius: '50%',
                                    display: 'flex'
                                  }}
                                >
                                  <Camera size={10} color="var(--mfe-primary)" />
                                </div>
                              )}
                            </>
                          ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                              <Upload size={18} />
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  <div style={{ marginTop: '8px', fontSize: '0.75rem', color: 'var(--mfe-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>Select <strong>First Letter</strong> or click <strong>Upload</strong> to use your custom profile photo.</span>
                  </div>
                </div>

                {/* Form Input: Display Name */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Display Name
                  </label>
                  <div style={{ position: 'relative' }}>
                    <User
                      size={16}
                      color="var(--mfe-text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: 'var(--mfe-radius-md)',
                        border: '1px solid var(--mfe-border)',
                        background: 'var(--mfe-bg-card)',
                        color: 'var(--mfe-text-primary)',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--mfe-font-sans)',
                        outline: 'none',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="modal-field-input"
                    />
                  </div>
                </div>

                {/* Form Input: Role & Department Title */}
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Department & Professional Title
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase
                      size={16}
                      color="var(--mfe-text-muted)"
                      style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                    />
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px 10px 38px',
                        borderRadius: 'var(--mfe-radius-md)',
                        border: '1px solid var(--mfe-border)',
                        background: 'var(--mfe-bg-card)',
                        color: 'var(--mfe-text-primary)',
                        fontSize: '0.875rem',
                        fontFamily: 'var(--mfe-font-sans)',
                        outline: 'none',
                        transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                      }}
                      className="modal-field-input"
                    />
                  </div>
                </div>

                {/* Security Clearance & Role Card */}
                <div
                  style={{
                    padding: '14px 18px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.08) 0%, rgba(139, 92, 246, 0.06) 100%)',
                    border: '1px solid var(--mfe-border-highlight)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: 'var(--mfe-radius-md)',
                        background: 'var(--mfe-bg-card)',
                        border: '1px solid var(--mfe-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--mfe-primary)'
                      }}
                    >
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
                        Assigned Role: {user?.role || 'Admin'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)', marginTop: '2px' }}>
                        Cryptographically verified & enforced across all remotes.
                      </div>
                    </div>
                  </div>
                  <Badge variant={user?.role === 'Admin' ? 'primary' : 'warning'} size="sm">
                    {user?.role?.toUpperCase() || 'ADMIN'}
                  </Badge>
                </div>

                {/* Actions Footer */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                  <Button variant="secondary" size="md" onClick={onClose} type="button">
                    Cancel
                  </Button>
                  <Button variant="primary" size="md" icon={Save} type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            )
          )}

          {/* TAB 2: Active Sessions */}
          {activeTab === 'sessions' && (
            !user ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--mfe-bg-card)', border: '1px solid var(--mfe-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mfe-text-muted)' }}>
                  <Laptop size={24} />
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                  No Active Authenticated Sessions
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                  You are currently browsing as a guest without active session tokens. Authenticate with a verified persona to establish encrypted sessions.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={LogIn}
                  onClick={() => {
                    onClose();
                    window.location.href = '/auth';
                  }}
                  style={{ marginTop: '6px' }}
                >
                  Sign In to Establish Session
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', lineHeight: 1.5 }}>
                  Current cryptographically authenticated devices sharing your micro-frontend session token.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sessions.map((sess) => (
                    <div
                      key={sess.id}
                      style={{
                        padding: '14px 18px',
                        background: 'var(--mfe-bg-card)',
                        border: '1px solid var(--mfe-border)',
                        borderRadius: 'var(--mfe-radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: 'var(--mfe-radius-md)',
                            background: 'var(--mfe-bg-surface)',
                            border: '1px solid var(--mfe-border)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--mfe-primary)'
                          }}
                        >
                          {sess.device.includes('Mobile') ? <Smartphone size={20} /> : <Laptop size={20} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                            {sess.device}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Globe size={12} /> {sess.location} • <span style={{ fontFamily: 'var(--mfe-font-mono)' }}>{sess.ip}</span>
                          </div>
                        </div>
                      </div>
                      <div>
                        {sess.isCurrent ? (
                          <Badge variant="success" size="sm" dot>
                            Current Device
                          </Badge>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', fontWeight: 600 }}>
                            {sess.lastActive}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {sessions.length > 1 && (
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="danger" size="sm" onClick={handleRevokeSessions}>
                      Terminate All Other Sessions
                    </Button>
                  </div>
                )}
              </div>
            )
          )}

          {/* TAB 3: API Security */}
          {activeTab === 'api' && (
            !user ? (
              <div style={{ textAlign: 'center', padding: '32px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--mfe-bg-card)', border: '1px solid var(--mfe-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--mfe-text-muted)' }}>
                  <Key size={24} />
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                  API Keys Restricted
                </div>
                <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', maxWidth: '360px', margin: '0 auto', lineHeight: 1.5 }}>
                  Personal Access Tokens (PAT) are disabled for unauthenticated guest sessions. Authenticate with an Admin or Editor account to generate PAT credentials.
                </p>
                <Button
                  variant="primary"
                  size="sm"
                  icon={LogIn}
                  onClick={() => {
                    onClose();
                    window.location.href = '/auth';
                  }}
                  style={{ marginTop: '6px' }}
                >
                  Sign In to Generate PAT
                </Button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', lineHeight: 1.5 }}>
                  Personal Access Tokens (PAT) allow CLI and third-party automated pipelines to interact with the federated service mesh.
                </p>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Personal Access Token (PAT)
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                      <input
                        type={showToken ? 'text' : 'password'}
                        readOnly
                        value={apiToken}
                        style={{
                          width: '100%',
                          padding: '10px 42px 10px 14px',
                          borderRadius: 'var(--mfe-radius-md)',
                          border: '1px solid var(--mfe-border)',
                          background: 'var(--mfe-bg-card)',
                          color: 'var(--mfe-text-primary)',
                          fontFamily: 'var(--mfe-font-mono)',
                          fontSize: '0.8125rem',
                          outline: 'none'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowToken(!showToken)}
                        style={{
                          position: 'absolute',
                          right: '10px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--mfe-text-muted)',
                          cursor: 'pointer',
                          padding: '4px'
                        }}
                        title={showToken ? 'Hide token' : 'Show token'}
                      >
                        {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Button
                      variant="secondary"
                      size="md"
                      icon={copied ? Check : Copy}
                      onClick={handleCopyToken}
                    >
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>

                <div
                  style={{
                    padding: '16px 18px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: 'var(--mfe-bg-card)',
                    border: '1px solid var(--mfe-border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                      Regenerate Security Key
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                      Revokes previous token and creates a fresh cryptographic signature.
                    </div>
                  </div>
                  <Button variant="outline" size="sm" icon={RotateCcw} onClick={handleRegenerateToken}>
                    Regenerate
                  </Button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <style>{`
        .modal-close-btn:hover {
          color: var(--mfe-text-primary) !important;
          border-color: var(--mfe-border-highlight) !important;
          transform: scale(1.08);
        }
        .avatar-choice-item:hover {
          transform: scale(1.12);
        }
        .persona-switch-card:hover {
          border-color: var(--mfe-border-highlight) !important;
          background: var(--mfe-bg-card) !important;
          box-shadow: 0 0 16px -3px var(--mfe-primary-glow) !important;
          transform: translateY(-2px);
        }
        .modal-field-input:focus {
          border-color: var(--mfe-border-highlight) !important;
          box-shadow: 0 0 16px -2px var(--mfe-primary-glow) !important;
        }
        .tab-pill-btn:hover:not(:disabled) {
          filter: brightness(1.08);
        }
      `}</style>
    </div>
  );
}

export default ProfileModal;
