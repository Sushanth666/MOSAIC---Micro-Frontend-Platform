import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  Lock,
  Sun,
  Moon,
  LogOut,
  LogIn,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search,
  Layers,
  Sparkles,
  Shield,
  ExternalLink,
  Network,
  Radio,
  AlertTriangle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { Avatar, Badge, Button, Modal } from '@mfe/shared-ui';
import { authStore, eventBus, MFE_EVENTS, mockApi, meshStore } from '@mfe/shared-bus';
import { CommandPalette } from './CommandPalette.jsx';
import { ProfileModal } from './ProfileModal.jsx';
import { LogoutModal } from './LogoutModal.jsx';

export function HostLayout({ children, theme, onToggleTheme }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [logoutModalStep, setLogoutModalStep] = useState(null); // null | 'confirm' | 'countdown'
  const [logoutCountdown, setLogoutCountdown] = useState(3);
  const [unreadCount, setUnreadCount] = useState(() => {
    if (typeof window !== 'undefined' && mockApi.getUnreadNotificationCountSync) {
      return mockApi.getUnreadNotificationCountSync();
    }
    return 0;
  });
  const [degradedRemotes, setDegradedRemotes] = useState(() => {
    if (typeof window !== 'undefined' && meshStore?.getDegradedCount) {
      return meshStore.getDegradedCount();
    }
    return 0;
  });
  const [allApisOff, setAllApisOff] = useState(() => {
    if (typeof window !== 'undefined' && meshStore?.areAllApisOff) {
      return meshStore.areAllApisOff();
    }
    return false;
  });
  const [currentUser, setCurrentUser] = useState(authStore.getCurrentUser());
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Initial sync of notification count on mount
    if (mockApi.getNotifications) {
      mockApi.getNotifications().then((list) => {
        const unread = list.filter((n) => !n.read).length;
        setUnreadCount(unread);
      }).catch(() => {});
    }

    const unsubLogin = eventBus.on(MFE_EVENTS.AUTH_LOGIN, ({ user }) => {
      setCurrentUser(user);
    });

    const unsubUserUpdated = eventBus.on(MFE_EVENTS.AUTH_USER_UPDATED, ({ user }) => {
      setCurrentUser(user);
    });

    const unsubLogout = eventBus.on(MFE_EVENTS.AUTH_LOGOUT, () => {
      setCurrentUser(null);
      navigate('/login');
    });

    const unsubCount = eventBus.on(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, (data) => {
      if (typeof data === 'number') {
        setUnreadCount(data);
      } else if (data && typeof data.unread === 'number') {
        setUnreadCount(data.unread);
      } else if (mockApi.getUnreadNotificationCountSync) {
        setUnreadCount(mockApi.getUnreadNotificationCountSync());
      }
    });

    const unsubNotifAdd = eventBus.on(MFE_EVENTS.NOTIFICATION_ADD, () => {
      if (mockApi.getUnreadNotificationCountSync) {
        setUnreadCount(mockApi.getUnreadNotificationCountSync());
      } else {
        setUnreadCount((c) => c + 1);
      }
    });

    const unsubClearAll = eventBus.on(MFE_EVENTS.NOTIFICATION_CLEAR_ALL, () => {
      setUnreadCount(0);
    });

    const unsubRead = eventBus.on(MFE_EVENTS.NOTIFICATION_READ, ({ all }) => {
      if (all) {
        setUnreadCount(0);
      } else if (mockApi.getUnreadNotificationCountSync) {
        setUnreadCount(mockApi.getUnreadNotificationCountSync());
      } else if (mockApi.getNotifications) {
        mockApi.getNotifications().then((list) => {
          setUnreadCount(list.filter((n) => !n.read).length);
        });
      }
    });

    const handleStorageChange = (e) => {
      if ((!e.key || e.key === 'mfe_notifs_db_v1') && mockApi.getUnreadNotificationCountSync) {
        setUnreadCount(mockApi.getUnreadNotificationCountSync());
      }
    };
    window.addEventListener('storage', handleStorageChange);

    const unsubMesh = eventBus.on(MFE_EVENTS.MESH_STATUS_CHANGED, () => {
      if (meshStore?.getDegradedCount) {
        setDegradedRemotes(meshStore.getDegradedCount());
      }
      if (meshStore?.areAllApisOff) {
        setAllApisOff(meshStore.areAllApisOff());
      }
    });

    return () => {
      unsubLogin();
      unsubUserUpdated();
      unsubLogout();
      unsubCount();
      unsubNotifAdd();
      unsubClearAll();
      unsubRead();
      unsubMesh();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [navigate]);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Close mobile drawer and re-sync unread count on route change
  useEffect(() => {
    setMobileOpen(false);
    if (mockApi.getUnreadNotificationCountSync) {
      setUnreadCount(mockApi.getUnreadNotificationCountSync());
    } else if (mockApi.getNotifications) {
      mockApi.getNotifications().then((list) => {
        setUnreadCount(list.filter((n) => !n.read).length);
      }).catch(() => {});
    }
    if (meshStore?.getDegradedCount) {
      setDegradedRemotes(meshStore.getDegradedCount());
    }
    if (meshStore?.areAllApisOff) {
      setAllApisOff(meshStore.areAllApisOff());
    }
  }, [location.pathname]);

  const handleToggleAllApis = (e) => {
    e?.stopPropagation();
    const willTurnOff = !allApisOff;
    meshStore.setAllApisOff(willTurnOff);
    setAllApisOff(willTurnOff);
    if (meshStore?.getDegradedCount) {
      setDegradedRemotes(meshStore.getDegradedCount());
    }
    eventBus.emit(MFE_EVENTS.NOTIFICATION_ADD, {
      id: `notif_${Date.now()}`,
      title: willTurnOff ? '⚠️ Mesh Gateway Taken Offline' : '✅ Mesh Gateway Online',
      message: willTurnOff
        ? 'Mesh Gateway and federated micro-frontend APIs turned OFF (chaos outage simulated).'
        : 'Mesh Gateway restored to 100% operational with all federated endpoints active.',
      priority: willTurnOff ? 'warning' : 'success',
      category: 'System',
      timestamp: 'Just now',
      read: false
    });
  };

  const handleInitiateLogout = () => {
    setLogoutModalStep('confirm');
    setLogoutCountdown(3);
  };

  const handleCancelLogout = () => {
    setLogoutModalStep(null);
    setLogoutCountdown(3);
  };

  const handleConfirmLogout = () => {
    setLogoutModalStep('countdown');
    setLogoutCountdown(3);
  };

  useEffect(() => {
    const unsubRequestLogout = eventBus.on('mfe:request:logout', () => {
      setIsProfileModalOpen(false);
      handleInitiateLogout();
    });
    return () => unsubRequestLogout();
  }, []);

  useEffect(() => {
    let timer = null;
    let interval = null;

    if (logoutModalStep === 'countdown') {
      interval = setInterval(() => {
        setLogoutCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      timer = setTimeout(() => {
        authStore.logout();
        setLogoutModalStep(null);
        navigate('/login');
      }, 3000);
    }

    return () => {
      if (interval) clearInterval(interval);
      if (timer) clearTimeout(timer);
    };
  }, [logoutModalStep, navigate]);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, badge: null },
    { name: 'User Management', path: '/users', icon: Users, badge: 'Live' },
    { name: 'Analytics', path: '/analytics', icon: BarChart3, badge: null },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount > 0 ? unreadCount : null },
    { name: 'Mesh Topology', path: '/mesh', icon: Network, badge: degradedRemotes > 0 ? degradedRemotes : null }
  ];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--mfe-bg-base)',
        backgroundImage:
          theme === 'light'
            ? 'radial-gradient(circle at 12% 10%, rgba(245, 158, 11, 0.05) 0%, transparent 45%), radial-gradient(circle at 88% 65%, rgba(234, 88, 12, 0.04) 0%, transparent 45%)'
            : 'radial-gradient(circle at 10% 12%, rgba(245, 158, 11, 0.05) 0%, transparent 40%), radial-gradient(circle at 90% 70%, rgba(249, 115, 22, 0.04) 0%, transparent 45%)',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 998
          }}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        style={{
          width: collapsed ? '80px' : '260px',
          transition: 'width 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          background: 'var(--mfe-bg-surface)',
          borderRight: '1px solid var(--mfe-border)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: 999,
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          height: '100vh',
          transform: mobileOpen ? 'translateX(0)' : undefined
        }}
        className={`mfe-sidebar ${mobileOpen ? 'mfe-sidebar-open' : ''}`}
      >
        {/* Brand Header */}
        <div
          style={{
            height: '70px',
            padding: '0 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            borderBottom: '1px solid var(--mfe-border)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              className="brand-logo-container mfe-float-slow"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: 'var(--mfe-radius-md)',
                overflow: 'hidden',
                boxShadow: '0 0 16px rgba(245, 158, 11, 0.45)',
                border: '1.5px solid rgba(245, 158, 11, 0.55)',
                flexShrink: 0,
                background: '#14110d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src="/mosaic-logo.png"
                alt="MOSAIC Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            {!collapsed && (
              <div>
                <div
                  className="mfe-animated-gradient-text"
                  style={{ fontSize: '1.1875rem', fontWeight: 900, letterSpacing: '0.04em' }}
                >
                  MOSAIC
                </div>
                <div style={{ fontSize: '0.625rem', fontWeight: 800, color: 'var(--mfe-primary)', letterSpacing: '0.08em' }}>
                  MFE PLATFORM
                </div>
              </div>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mfe-text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              className="sidebar-collapse-btn"
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Mobile explicit close button */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{
              display: 'none',
              background: 'transparent',
              border: 'none',
              color: 'var(--mfe-text-muted)',
              cursor: 'pointer',
              padding: '6px'
            }}
            className="mobile-close-btn"
            aria-label="Close Mobile Menu"
          >
            <X size={20} />
          </button>
        </div>

        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0' }}>
            <button
              onClick={() => setCollapsed(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mfe-text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Navigation Items */}
        <div style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto' }}>
          {!collapsed && (
            <div style={{ padding: '4px 12px 8px', fontSize: '0.6875rem', fontWeight: 700, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
              Federated Modules
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: collapsed ? '12px' : '10px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: isActive ? 'var(--mfe-primary)' : 'var(--mfe-text-secondary)',
                  backgroundColor: isActive ? 'var(--mfe-bg-active)' : 'transparent',
                  border: `1px solid ${isActive ? 'var(--mfe-border-highlight)' : 'transparent'}`,
                  boxShadow: isActive ? '0 0 16px -4px var(--mfe-primary-glow)' : 'none',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.875rem',
                  textDecoration: 'none',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                className="nav-link"
                title={collapsed ? item.name : undefined}
              >
                {isActive && (
                  <span
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: '6px',
                      bottom: '6px',
                      width: '3px',
                      borderRadius: '0 4px 4px 0',
                      background: 'var(--mfe-primary-gradient)',
                      boxShadow: '0 0 8px var(--mfe-primary)'
                    }}
                  />
                )}
                <Icon size={18} />
                {!collapsed && <span style={{ flex: 1 }}>{item.name}</span>}
                {!collapsed && item.badge && (
                  <Badge
                    variant={typeof item.badge === 'number' ? 'warning' : 'primary'}
                    size="sm"
                    dot={typeof item.badge === 'number'}
                  >
                    {item.badge}
                  </Badge>
                )}
                {collapsed && typeof item.badge === 'number' && (
                  <span
                    className="mfe-pulse-dot"
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--mfe-warning)'
                    }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Architecture Status Pill & User Card */}
        <div style={{ padding: '16px 14px', borderTop: '1px solid var(--mfe-border)' }}>
          {!collapsed ? (
            <div
              className="sidebar-user-card"
              style={{
                padding: '12px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-bg-card)',
                border: '1px solid var(--mfe-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}
            >
              <div
                onClick={() => setIsProfileModalOpen(true)}
                title={currentUser ? "Manage Account & Security Settings" : "Guest User Session Details"}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0, cursor: 'pointer' }}
              >
                <Avatar
                  name={currentUser?.name || 'Kana'}
                  size={34}
                  status={currentUser ? "online" : "offline"}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--mfe-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {currentUser?.name || 'Guest User'}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: currentUser ? 'var(--mfe-primary)' : 'var(--mfe-primary)', fontWeight: 600 }}>
                    {currentUser ? currentUser.role : 'Unauthenticated'}
                  </div>
                </div>
              </div>
              {currentUser ? (
                <button
                  onClick={handleInitiateLogout}
                  title="Sign out"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--mfe-text-muted)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--mfe-radius-sm)'
                  }}
                  className="logout-icon-btn"
                >
                  <LogOut size={16} />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/auth')}
                  title="Sign in"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--mfe-primary)',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: 'var(--mfe-radius-sm)'
                  }}
                  className="logout-icon-btn"
                >
                  <LogIn size={16} />
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center', cursor: 'pointer' }} onClick={() => setIsProfileModalOpen(true)}>
              <Avatar
                name={currentUser?.name || 'Kana'}
                size={34}
                status={currentUser ? "online" : "offline"}
              />
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div
        className="mfe-main-workspace"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          marginLeft: collapsed ? '80px' : '260px',
          transition: 'margin-left 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
        }}
      >
        {/* Top Navbar */}
        <header
          style={{
            height: '70px',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            background: 'var(--mfe-bg-glass)',
            backdropFilter: 'var(--mfe-backdrop-blur)',
            WebkitBackdropFilter: 'var(--mfe-backdrop-blur)',
            borderBottom: '1px solid var(--mfe-border)',
            position: 'sticky',
            top: 0,
            zIndex: 100
          }}
        >
          {/* Left: Mobile hamburger + Global Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '1 1 auto', maxWidth: '680px' }}>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--mfe-text-primary)',
                cursor: 'pointer',
                display: 'none',
                padding: '6px'
              }}
              className="mfe-mobile-toggle"
            >
              <Menu size={20} />
            </button>

            <div
              onClick={() => setIsCommandPaletteOpen(true)}
              className="topbar-search-wrapper"
              style={{ position: 'relative', width: '100%', cursor: 'pointer' }}
            >
              <Search
                size={18}
                color="var(--mfe-text-muted)"
                style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              />
              <input
                type="text"
                readOnly
                placeholder="Search Mosaic modules, users, actions (Ctrl+K)..."
                className="topbar-search-input"
                style={{
                  width: '100%',
                  padding: '10px 88px 10px 42px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: 'var(--mfe-text-primary)',
                  fontSize: '0.875rem',
                  fontFamily: 'var(--mfe-font-sans)',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)'
                }}
              />
              <span
                className="topbar-search-kbd"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  padding: '3px 8px',
                  borderRadius: 'var(--mfe-radius-sm)',
                  background: 'var(--mfe-bg-card)',
                  border: '1px solid var(--mfe-border)',
                  fontSize: '0.75rem',
                  fontFamily: 'var(--mfe-font-mono)',
                  color: 'var(--mfe-text-muted)',
                  fontWeight: 700,
                  pointerEvents: 'none'
                }}
              >
                Ctrl+K
              </span>
            </div>
          </div>

          {/* Right: Actions, Theme Switch, Notifications, Profile */}
          <div className="topbar-right-actions" style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            {/* Mesh Gateway LIVE / OFF Master Toggle Button */}
            <button
              onClick={handleToggleAllApis}
              title={
                allApisOff
                  ? 'Mesh Gateway is currently OFF (Outage Mode). Click to turn Mesh Gateway LIVE.'
                  : 'Mesh Gateway is currently LIVE (Healthy & Active). Click to take Mesh Gateway OFF.'
              }
              aria-label={allApisOff ? 'Turn Mesh Gateway LIVE' : 'Turn Mesh Gateway OFF'}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '9999px',
                background: allApisOff ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${allApisOff ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
                cursor: 'pointer',
                transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                boxShadow: allApisOff
                  ? '0 0 12px rgba(239, 68, 68, 0.2)'
                  : '0 0 12px rgba(16, 185, 129, 0.15)'
              }}
              className="topbar-btn"
            >
              {/* Status Glowing Dot */}
              <span
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: allApisOff ? 'var(--mfe-danger)' : 'var(--mfe-success)',
                  boxShadow: `0 0 8px ${allApisOff ? 'var(--mfe-danger)' : 'var(--mfe-success)'}`,
                  transition: 'background-color 0.25s ease, box-shadow 0.25s ease'
                }}
              />

              {/* Status Label */}
              <span
                className="mesh-indicator-text"
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  fontFamily: 'var(--mfe-font-sans)',
                  letterSpacing: '0.02em',
                  color: allApisOff ? 'var(--mfe-danger)' : 'var(--mfe-success)',
                  transition: 'color 0.25s ease'
                }}
              >
                {allApisOff ? 'Mesh Gateway OFF' : 'Mesh Gateway LIVE'}
              </span>

              {/* Modern Micro Toggle Switch Track & Thumb */}
              <span
                style={{
                  width: '24px',
                  height: '13px',
                  borderRadius: '7px',
                  background: allApisOff ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)',
                  position: 'relative',
                  display: 'inline-block',
                  marginLeft: '2px',
                  transition: 'background-color 0.25s ease'
                }}
              >
                <span
                  style={{
                    width: '9px',
                    height: '9px',
                    borderRadius: '50%',
                    backgroundColor: allApisOff ? 'var(--mfe-danger)' : 'var(--mfe-success)',
                    position: 'absolute',
                    top: '2px',
                    left: allApisOff ? '2px' : '13px',
                    transition: 'left 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.25)'
                  }}
                />
              </span>
            </button>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-bg-card)',
                border: '1px solid var(--mfe-border)',
                color: 'var(--mfe-text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'var(--mfe-transition)'
              }}
              className="topbar-btn"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notification Bell with Badge */}
            <button
              onClick={() => navigate('/notifications')}
              title="Notifications"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-bg-card)',
                border: '1px solid var(--mfe-border)',
                color: 'var(--mfe-text-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'var(--mfe-transition)'
              }}
              className="topbar-btn"
            >
              <Bell size={18} className={unreadCount > 0 ? "mfe-bell-active" : ""} />
              {unreadCount > 0 && (
                <span
                  className="mfe-ring-pulse"
                  style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    minWidth: '18px',
                    height: '18px',
                    padding: '0 4px',
                    backgroundColor: 'var(--mfe-warning)',
                    color: '#000000',
                    borderRadius: '9999px',
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 8px rgba(245, 158, 11, 0.6)'
                  }}
                >
                  {unreadCount}
                </span>
              )}
            </button>
            {/* User Profile Avatar Button */}
            <button
              onClick={() => setIsProfileModalOpen(true)}
              title={currentUser ? "Account & Security Settings" : "Guest User Session Details"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '3px 10px 3px 3px',
                borderRadius: '9999px',
                background: 'var(--mfe-bg-card)',
                border: '1px solid var(--mfe-border)',
                cursor: 'pointer',
                transition: 'var(--mfe-transition)'
              }}
              className="topbar-btn"
            >
              <Avatar
                name={currentUser?.name || 'Kana'}
                size={28}
                status={currentUser ? "online" : "offline"}
              />
              <span className="topbar-user-name" style={{ fontSize: '0.75rem', fontWeight: 700, color: currentUser ? 'var(--mfe-text-primary)' : 'var(--mfe-primary)' }}>
                {currentUser ? (currentUser.name?.split(' ')[0] || 'Account') : 'Guest'}
              </span>
            </button>
          </div>
        </header>

        {/* Dynamic Micro-Frontend Viewport */}
        <main
          key={location.pathname}
          className="mfe-animate-in mfe-main-content"
          style={{ flex: 1, padding: '28px 32px', maxWidth: '1440px', width: '100%', margin: '0 auto' }}
        >
          {children}
        </main>

        {/* Spotlight Command Palette */}
        <CommandPalette
          isOpen={isCommandPaletteOpen}
          onClose={() => setIsCommandPaletteOpen(false)}
          theme={theme}
          onToggleTheme={onToggleTheme}
        />

        {/* Account & Profile Settings Modal */}
        <ProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
        />

        {/* Redesigned Luxury Logout Confirmation & Countdown Modal */}
        <LogoutModal
          isOpen={Boolean(logoutModalStep)}
          step={logoutModalStep}
          countdown={logoutCountdown}
          user={currentUser}
          onCancel={handleCancelLogout}
          onConfirm={handleConfirmLogout}
          theme={theme}
        />
      </div>

      <style>{`
        .topbar-search-wrapper:hover input {
          border-color: var(--mfe-border-highlight) !important;
          box-shadow: 0 0 16px -2px var(--mfe-primary-glow) !important;
        }
        .topbar-search-input:focus {
          border-color: var(--mfe-primary) !important;
          box-shadow: 0 0 0 3px var(--mfe-primary-glow), 0 0 20px -2px var(--mfe-primary-glow) !important;
        }
        .nav-link {
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .nav-link:hover {
          background-color: var(--mfe-bg-card-hover) !important;
          color: var(--mfe-text-primary) !important;
          transform: translateX(4px);
        }
        .nav-link svg {
          transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .nav-link:hover svg {
          transform: scale(1.18) rotate(3deg);
          color: var(--mfe-primary);
        }
        .sidebar-user-card {
          transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s ease, border-color 0.25s ease !important;
        }
        .sidebar-user-card:hover {
          transform: translateY(-2px);
          border-color: var(--mfe-border-highlight) !important;
          box-shadow: 0 8px 20px -4px rgba(0, 0, 0, 0.3), 0 0 16px -2px var(--mfe-primary-glow);
        }
        .brand-logo-container {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
        }
        .brand-logo-container:hover {
          transform: scale(1.08) rotate(-2deg);
          box-shadow: 0 0 24px rgba(245, 158, 11, 0.7) !important;
        }
        .topbar-btn {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1) !important;
        }
        .topbar-btn:hover {
          border-color: var(--mfe-border-highlight) !important;
          color: var(--mfe-primary) !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 14px -2px var(--mfe-primary-glow);
        }
        .logout-icon-btn:hover {
          color: var(--mfe-danger) !important;
          transform: scale(1.15) rotate(5deg);
        }
        .sidebar-collapse-btn:hover {
          color: var(--mfe-primary) !important;
          transform: scale(1.15);
        }
        @media (max-width: 860px) {
          .mfe-main-workspace {
            margin-left: 0 !important;
          }
          .mfe-sidebar {
            position: fixed !important;
            transform: translateX(-100%) !important;
            width: 270px !important;
            box-shadow: 0 0 35px rgba(0, 0, 0, 0.55) !important;
          }
          .mfe-sidebar.mfe-sidebar-open {
            transform: translateX(0) !important;
          }
          .mfe-mobile-toggle {
            display: flex !important;
            align-items: center;
            justify-content: center;
            min-width: 36px;
            min-height: 36px;
            border-radius: var(--mfe-radius-md);
            background: var(--mfe-bg-card);
            border: 1px solid var(--mfe-border);
          }
          .mobile-close-btn {
            display: flex !important;
          }
          .sidebar-collapse-btn {
            display: none !important;
          }
        }

        @media (max-width: 768px) {
          .mfe-main-content {
            padding: 16px 14px !important;
          }
          .topbar-search-kbd {
            display: none !important;
          }
          .topbar-user-name {
            display: none !important;
          }
          .mesh-indicator-text {
            display: none !important;
          }
        }

        @media (max-width: 520px) {
          header {
            padding: 0 12px !important;
            gap: 8px !important;
          }
          .topbar-right-actions {
            gap: 8px !important;
          }
          .topbar-search-input {
            font-size: 0.8125rem !important;
            padding: 8px 12px 8px 34px !important;
          }
        }
      `}</style>
    </div>
  );
}
