import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  LayoutDashboard,
  Users,
  BarChart3,
  Bell,
  Network,
  Lock,
  Sun,
  Moon,
  Zap,
  Trash2,
  FileSpreadsheet,
  RotateCcw,
  UserCheck,
  ArrowRight,
  Sparkles,
  Command
} from 'lucide-react';
import { authStore, DEMO_USERS, eventBus, MFE_EVENTS, mockApi, meshStore } from '@mfe/shared-bus';

export function CommandPalette({ isOpen, onClose, theme, onToggleTheme }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const actions = [
    // Navigation
    { id: 'nav_dash', category: 'Navigation', title: 'Go to Executive Dashboard', subtitle: 'View real-time telemetry, platform KPIs & activity', icon: LayoutDashboard, action: () => navigate('/dashboard') },
    { id: 'nav_users', category: 'Navigation', title: 'Go to User Management', subtitle: 'Live CRUD operations, role filtering & permissions', icon: Users, action: () => navigate('/users') },
    { id: 'nav_analytics', category: 'Navigation', title: 'Go to Analytics & Telemetry', subtitle: 'Multi-metric trajectories & financial growth funnels', icon: BarChart3, action: () => navigate('/analytics') },
    { id: 'nav_notifs', category: 'Navigation', title: 'Go to Notification Center', subtitle: 'Real-time incident feed & alert dispatching', icon: Bell, action: () => navigate('/notifications') },
    { id: 'nav_mesh', category: 'Navigation', title: 'Go to Mesh & Chaos Inspector', subtitle: 'Federated topology map, ping monitors & outage simulator', icon: Network, action: () => navigate('/mesh') },
    { id: 'nav_auth', category: 'Navigation', title: 'Go to Auth & Roles', subtitle: 'Switch personas, JWT tokens & security permissions', icon: Lock, action: () => navigate('/auth') },

    // Actions
    {
      id: 'act_theme',
      category: 'Actions',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      subtitle: 'Toggle platform color contrast and theme styling',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => onToggleTheme()
    },
    {
      id: 'act_alert',
      category: 'Actions',
      title: 'Trigger Fast Alert',
      subtitle: 'Simulate high priority security incident across micro-frontends',
      icon: Zap,
      action: () => {
        mockApi.addNotification({
          title: 'Command Palette Fast Incident',
          message: 'Triggered from Spotlight Quick Action (Ctrl+K).',
          category: 'Security',
          priority: 'warning'
        });
      }
    },
    {
      id: 'act_export',
      category: 'Actions',
      title: 'Export Analytics Report (CSV)',
      subtitle: 'Download aggregated metric trajectories and revenue breakdown',
      icon: FileSpreadsheet,
      action: () => navigate('/analytics')
    },
    {
      id: 'act_clear_notifs',
      category: 'Actions',
      title: 'Clear All Notifications',
      subtitle: 'Purge alert feed and reset top-bar bell badge to 0',
      icon: Trash2,
      action: () => mockApi.clearAllNotifications()
    },
    {
      id: 'act_reset_chaos',
      category: 'Actions',
      title: 'Reset All Chaos Outages',
      subtitle: 'Restore all 5 federated remotes to 100% Healthy state',
      icon: RotateCcw,
      action: () => meshStore.resetAllChaos()
    },

    // Persona Switchers
    {
      id: 'persona_admin',
      category: 'Switch Persona',
      title: 'Login as Sarah Jenkins (Admin)',
      subtitle: 'Full administrative access across all modules & chaos tools',
      icon: UserCheck,
      action: () => authStore.login(DEMO_USERS[0])
    },
    {
      id: 'persona_editor',
      category: 'Switch Persona',
      title: 'Login as Marcus Vance (Editor)',
      subtitle: 'Can create and edit users, but cannot delete accounts',
      icon: UserCheck,
      action: () => authStore.login(DEMO_USERS[1])
    },
    {
      id: 'persona_viewer',
      category: 'Switch Persona',
      title: 'Login as Elena Rostova (Viewer)',
      subtitle: 'Read-only access mode, restricted from destructive actions',
      icon: UserCheck,
      action: () => authStore.login(DEMO_USERS[2])
    }
  ];

  const filtered = actions.filter((item) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filtered.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % (filtered.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh',
        paddingLeft: '16px',
        paddingRight: '16px',
        animation: 'mfe-fadeIn 0.15s ease'
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          background: 'var(--mfe-bg-surface)',
          border: '1px solid var(--mfe-border)',
          borderRadius: 'var(--mfe-radius-lg)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.4)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Search Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--mfe-border)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'var(--mfe-bg-card)'
          }}
        >
          <Search size={20} color="var(--mfe-primary)" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search (e.g. Analytics, Export, Alert, Sarah)..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--mfe-text-primary)',
              fontSize: '0.9375rem',
              fontFamily: 'var(--mfe-font-sans)'
            }}
          />
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 'var(--mfe-radius-sm)',
              background: 'var(--mfe-bg-surface)',
              border: '1px solid var(--mfe-border)',
              fontSize: '0.6875rem',
              fontFamily: 'var(--mfe-font-mono)',
              color: 'var(--mfe-text-muted)',
              fontWeight: 700
            }}
          >
            ESC
          </span>
        </div>

        {/* Results List */}
        <div
          ref={listRef}
          style={{
            maxHeight: '380px',
            overflowY: 'auto',
            padding: '8px'
          }}
        >
          {filtered.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: 'var(--mfe-text-secondary)', fontSize: '0.875rem' }}>
              No commands matching "<strong>{query}</strong>"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: isSelected ? 'var(--mfe-bg-active)' : 'transparent',
                    border: isSelected ? '1px solid var(--mfe-primary)' : '1px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--mfe-radius-sm)',
                        background: isSelected ? 'var(--mfe-primary)' : 'var(--mfe-bg-card)',
                        color: isSelected ? '#ffffff' : 'var(--mfe-text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.6875rem',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        background: 'var(--mfe-bg-card)',
                        color: 'var(--mfe-text-muted)',
                        border: '1px solid var(--mfe-border-subtle)',
                        fontWeight: 600
                      }}
                    >
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={14} color="var(--mfe-primary)" />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div
          style={{
            padding: '10px 18px',
            borderTop: '1px solid var(--mfe-border)',
            background: 'var(--mfe-bg-card)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.6875rem',
            color: 'var(--mfe-text-muted)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span><strong style={{ color: 'var(--mfe-text-primary)' }}>↑↓</strong> to navigate</span>
            <span><strong style={{ color: 'var(--mfe-text-primary)' }}>↵</strong> to select</span>
            <span><strong style={{ color: 'var(--mfe-text-primary)' }}>esc</strong> to close</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={12} color="var(--mfe-primary)" />
            <span>Mosaic Spotlight</span>
          </div>
        </div>
      </div>
    </div>
  );
}
export default CommandPalette;
