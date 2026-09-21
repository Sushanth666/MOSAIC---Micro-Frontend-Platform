import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  ShieldAlert,
  Info,
  CheckCircle,
  Clock,
  Sparkles,
  Zap,
  Play,
  Square,
  AlertCircle,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { Button, Card, Badge, CardSkeleton } from '@mfe/shared-ui';
import { mockApi, eventBus, MFE_EVENTS, authStore, PERMISSIONS, meshStore } from '@mfe/shared-bus';

export default function NotificationsApp({ standalone = false }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [isSimulating, setIsSimulating] = useState(false);
  const [currentUser, setCurrentUser] = useState(authStore.getCurrentUser());
  const canClear = authStore.hasPermission(PERMISSIONS.NOTIFS_CLEAR, currentUser);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const data = await mockApi.getNotifications();
      setNotifications(data);
      const unread = data.filter((n) => !n.read).length;
      eventBus.emit(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, { unread });
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  };

  useEffect(() => {
    fetchNotifs();

    const unsubAdd = eventBus.on(MFE_EVENTS.NOTIFICATION_ADD, (newNotif) => {
      setNotifications((prev) => [newNotif, ...prev]);
    });

    const unsubRead = eventBus.on(MFE_EVENTS.NOTIFICATION_READ, () => {
      fetchNotifs();
    });

    const unsubLogin = eventBus.on(MFE_EVENTS.AUTH_LOGIN, ({ user }) => {
      setCurrentUser(user);
    });

    const unsubUserUpdated = eventBus.on(MFE_EVENTS.AUTH_USER_UPDATED, ({ user }) => {
      setCurrentUser(user);
    });

    const unsubMesh = eventBus.on(MFE_EVENTS.MESH_STATUS_CHANGED, () => {
      fetchNotifs();
    });

    return () => {
      unsubAdd();
      unsubRead();
      unsubLogin();
      unsubUserUpdated();
      unsubMesh();
    };
  }, []);

  // Background real-time simulation interval
  useEffect(() => {
    let interval = null;
    if (isSimulating) {
      interval = setInterval(() => {
        const samples = [
          {
            title: 'High Ingress Traffic Detected',
            message: `Load balancer autoscaled +2 pods to absorb 14,000 req/s spike.`,
            category: 'System',
            priority: 'info'
          },
          {
            title: 'Suspicious IP Blocked',
            message: `Firewall blacklisted IP 192.168.4.11 for repeated unauthorized handshake.`,
            category: 'Security',
            priority: 'warning'
          },
          {
            title: 'CI/CD Pipeline Succeeded',
            message: `Remote bundle "users_app" passed 48 integration tests and deployed.`,
            category: 'System',
            priority: 'success'
          },
          {
            title: 'New Workspace Member',
            message: `Guest analyst joined the Enterprise Audit channel.`,
            category: 'Team',
            priority: 'info'
          }
        ];
        const randomItem = samples[Math.floor(Math.random() * samples.length)];
        mockApi.addNotification(randomItem);
      }, 7000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSimulating]);

  const handleMarkRead = async (id) => {
    const updated = await mockApi.markNotificationRead(id);
    setNotifications(updated);
    eventBus.emit(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, {
      unread: updated.filter((n) => !n.read).length
    });
  };

  const handleMarkAllRead = async () => {
    const updated = await mockApi.markAllNotificationsRead();
    setNotifications(updated);
    eventBus.emit(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, { unread: 0 });
  };

  const handleClearAll = async () => {
    await mockApi.clearAllNotifications();
    setNotifications([]);
    eventBus.emit(MFE_EVENTS.NOTIFICATION_CLEAR_ALL, {});
    eventBus.emit(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, { unread: 0 });
  };

  const handleTriggerInstantAlert = () => {
    mockApi.addNotification({
      title: 'Manual Incident Simulation',
      message: 'Triggered manually by user from the Notifications Micro-Frontend control panel.',
      category: 'Security',
      priority: 'warning'
    });
  };

  const filtered = notifications.filter((n) => {
    if (categoryFilter === 'ALL') return true;
    return n.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getPriorityIcon = (p) => {
    switch (p) {
      case 'warning':
        return <ShieldAlert size={18} color="var(--mfe-warning)" />;
      case 'danger':
        return <AlertCircle size={18} color="var(--mfe-danger)" />;
      case 'success':
        return <CheckCircle size={18} color="var(--mfe-success)" />;
      default:
        return <Info size={18} color="var(--mfe-info)" />;
    }
  };

  return (
    <div className="mfe-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Top Banner */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
              Notification Center
            </h1>
            <Badge variant="primary" dot size="sm">
              MFE Remote: Notifications (:5005)
            </Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', marginTop: '4px' }}>
            Real-time event aggregator broadcasting live incident, deployment, and security feeds.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Live Simulator Toggle */}
          <Button
            size="sm"
            variant={isSimulating ? 'danger' : 'secondary'}
            icon={isSimulating ? Square : Play}
            onClick={() => setIsSimulating(!isSimulating)}
          >
            {isSimulating ? 'Stop Simulator' : 'Auto Simulate Alerts'}
          </Button>

          <Button
            size="sm"
            variant="outline"
            icon={Zap}
            onClick={handleTriggerInstantAlert}
          >
            Trigger Fast Alert
          </Button>

          {unreadCount > 0 && (
            <Button
              size="sm"
              variant="primary"
              icon={CheckCheck}
              onClick={handleMarkAllRead}
            >
              Mark All Read
            </Button>
          )}

          {notifications.length > 0 && (
            <Button
              size="sm"
              variant="ghost"
              icon={canClear ? Trash2 : Lock}
              disabled={!canClear}
              title={canClear ? 'Clear all notifications' : 'Clearing alert feed is restricted to Admin role'}
              onClick={canClear ? handleClearAll : undefined}
              style={!canClear ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {canClear ? 'Clear All' : 'Clear (Admin Only)'}
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mfe-stagger-1">
        <Card hoverable={false} style={{ padding: '12px 18px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {['ALL', 'System', 'Security', 'Team'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 'var(--mfe-radius-md)',
                    border: '1px solid',
                    borderColor: categoryFilter === cat ? 'var(--mfe-primary)' : 'var(--mfe-border)',
                    background: categoryFilter === cat ? 'var(--mfe-bg-active)' : 'transparent',
                    color: categoryFilter === cat ? 'var(--mfe-primary)' : 'var(--mfe-text-secondary)',
                    fontWeight: 600,
                    fontSize: '0.8125rem',
                    cursor: 'pointer',
                    transition: 'var(--mfe-transition)'
                  }}
                >
                  {cat === 'ALL' ? 'All Alerts' : cat}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant={unreadCount > 0 ? 'warning' : 'neutral'} dot size="sm">
                {unreadCount} Unread Notifications
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="mfe-stagger-2">
        <Card hoverable={false} style={{ padding: '8px 0', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '24px' }}>
              <CardSkeleton />
              <div style={{ height: '12px' }} />
              <CardSkeleton />
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: '56px 24px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  backgroundColor: meshStore.areAllApisOff() ? 'rgba(239, 68, 68, 0.12)' : 'var(--mfe-bg-active)',
                  color: meshStore.areAllApisOff() ? '#ef4444' : 'var(--mfe-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {meshStore.areAllApisOff() ? <AlertTriangle size={28} /> : <Bell size={28} />}
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                {meshStore.areAllApisOff() ? 'Mesh Gateway Offline' : 'No notifications to display'}
              </h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
                {meshStore.areAllApisOff()
                  ? 'All event ingestion and notification streams have been disconnected because the Mesh Gateway is offline. Turn the gateway LIVE in the top bar to reconnect.'
                  : "You're completely caught up. Use the \"Trigger Fast Alert\" button above to test real-time event distribution."}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    padding: '16px 24px',
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: '16px',
                    borderBottom: '1px solid var(--mfe-border)',
                    backgroundColor: item.read ? 'transparent' : 'rgba(56, 189, 248, 0.04)',
                    animationDelay: `${i * 0.04}s`
                  }}
                  className="notif-row mfe-animate-in"
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--mfe-radius-md)',
                        backgroundColor: 'var(--mfe-bg-surface)',
                        border: '1px solid var(--mfe-border)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      {getPriorityIcon(item.priority)}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                          {item.title}
                        </h4>
                        <Badge variant="neutral" size="sm">
                          {item.category}
                        </Badge>
                        {!item.read && (
                          <span
                            className="mfe-pulse-dot"
                            style={{
                              width: '8px',
                              height: '8px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--mfe-primary)',
                              boxShadow: 'var(--mfe-shadow-glow)'
                            }}
                          />
                        )}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', marginTop: '4px', lineHeight: 1.4 }}>
                        {item.message}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '6px', fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>
                        <Clock size={12} /> {item.timestamp}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {!item.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={CheckCheck}
                        onClick={() => handleMarkRead(item.id)}
                      >
                        Mark read
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <style>{`
        .notif-row {
          transition: background-color 0.2s ease, transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .notif-row:hover {
          background-color: var(--mfe-bg-card-hover) !important;
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
}
