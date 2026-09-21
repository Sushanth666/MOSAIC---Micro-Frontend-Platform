import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  PlusCircle,
  BellRing,
  RefreshCw,
  Clock,
  Server,
  Cpu,
  Database,
  Network,
  Search,
  Filter,
  CheckCircle2,
  Radio,
  Globe,
  Layers,
  Shield,
  Lock,
  ExternalLink,
  Play,
  Share2,
  Download,
  HardDrive,
  Gauge,
  Terminal,
  UserPlus,
  Trash2,
  Send,
  Check,
  Sparkles,
  Code,
  AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge, CardSkeleton, Modal, Input } from '@mfe/shared-ui';
import { mockApi, eventBus, MFE_EVENTS, authStore, meshStore } from '@mfe/shared-bus';

// Semantic telemetry color mapper: GREEN = Safe/Optimal, YELLOW/AMBER = Warning, RED = Danger/Critical
const getTelemetryMetricState = (type, val, isGatewayOff = false) => {
  if (isGatewayOff) {
    return {
      status: 'danger',
      label: 'Gateway Offline (Danger)',
      color: '#ef4444',
      barGradient: 'linear-gradient(90deg, #f43f5e 0%, #ef4444 100%)',
      barWidth: '0%',
      dotColor: '#ef4444'
    };
  }
  if (type === 'latency') {
    if (val <= 70) {
      return {
        status: 'safe',
        label: 'Optimal response (Safe)',
        color: '#10b981',
        barGradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
        barWidth: `${Math.min(100, Math.max(15, val * 1.5))}%`,
        dotColor: '#10b981'
      };
    }
    if (val <= 150) {
      return {
        status: 'warning',
        label: 'Elevated latency (Warning)',
        color: '#f59e0b',
        barGradient: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
        barWidth: `${Math.min(100, Math.max(15, val * 0.7))}%`,
        dotColor: '#f59e0b'
      };
    }
    return {
      status: 'danger',
      label: 'High latency (Danger)',
      color: '#ef4444',
      barGradient: 'linear-gradient(90deg, #f43f5e 0%, #ef4444 100%)',
      barWidth: `${Math.min(100, Math.max(15, val * 0.35))}%`,
      dotColor: '#ef4444'
    };
  }

  if (type === 'cpu') {
    if (val <= 60) {
      return {
        status: 'safe',
        label: 'Healthy load (Safe)',
        color: '#10b981',
        barGradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
        barWidth: `${Math.min(100, Math.max(10, val))}%`,
        dotColor: '#10b981'
      };
    }
    if (val <= 80) {
      return {
        status: 'warning',
        label: 'Elevated compute (Warning)',
        color: '#f59e0b',
        barGradient: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
        barWidth: `${Math.min(100, Math.max(10, val))}%`,
        dotColor: '#f59e0b'
      };
    }
    return {
      status: 'danger',
      label: 'Critical load (Danger)',
      color: '#ef4444',
      barGradient: 'linear-gradient(90deg, #f43f5e 0%, #ef4444 100%)',
      barWidth: `${Math.min(100, Math.max(10, val))}%`,
      dotColor: '#ef4444'
    };
  }

  if (type === 'memory') {
    const gbText = (8 * (val / 100)).toFixed(1);
    if (val <= 65) {
      return {
        status: 'safe',
        label: `${gbText} GB / 8 GB (Safe)`,
        color: '#10b981',
        barGradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
        barWidth: `${Math.min(100, Math.max(10, val))}%`,
        dotColor: '#10b981'
      };
    }
    if (val <= 85) {
      return {
        status: 'warning',
        label: `${gbText} GB / 8 GB (Elevated)`,
        color: '#f59e0b',
        barGradient: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
        barWidth: `${Math.min(100, Math.max(10, val))}%`,
        dotColor: '#f59e0b'
      };
    }
    return {
      status: 'danger',
      label: 'Near memory exhaustion (Danger)',
      color: '#ef4444',
      barGradient: 'linear-gradient(90deg, #f43f5e 0%, #ef4444 100%)',
      barWidth: `${Math.min(100, Math.max(10, val))}%`,
      dotColor: '#ef4444'
    };
  }

  if (type === 'sockets') {
    if (val >= 50) {
      return {
        status: 'safe',
        label: 'PubSub connected (Safe)',
        color: '#10b981',
        barGradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
        barWidth: '85%',
        dotColor: '#10b981'
      };
    }
    if (val >= 10) {
      return {
        status: 'warning',
        label: 'Degraded pool (Warning)',
        color: '#f59e0b',
        barGradient: 'linear-gradient(90deg, #f59e0b 0%, #d97706 100%)',
        barWidth: '40%',
        dotColor: '#f59e0b'
      };
    }
    return {
      status: 'danger',
      label: 'Disconnected (Danger)',
      color: '#ef4444',
      barGradient: 'linear-gradient(90deg, #f43f5e 0%, #ef4444 100%)',
      barWidth: '10%',
      dotColor: '#ef4444'
    };
  }

  return {
    status: 'safe',
    label: 'Optimal (Safe)',
    color: '#10b981',
    barGradient: 'linear-gradient(90deg, #10b981 0%, #059669 100%)',
    barWidth: '50%',
    dotColor: '#10b981'
  };
};

export default function DashboardApp({ standalone = false, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [activeUserCount, setActiveUserCount] = useState(26300);
  const [currentUser, setCurrentUser] = useState(authStore.getCurrentUser());
  const [activityFilter, setActivityFilter] = useState('all'); // 'all' | 'team' | 'system' | 'analytics' | 'security'
  const [activitySearch, setActivitySearch] = useState('');
  const [isPinging, setIsPinging] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [healthCheckNotice, setHealthCheckNotice] = useState('');
  const [isSimulatingUser, setIsSimulatingUser] = useState(false);
  const [isSyncingTelemetry, setIsSyncingTelemetry] = useState(false);
  const [isPurgingNotifs, setIsPurgingNotifs] = useState(false);
  const [isDispatcherOpen, setIsDispatcherOpen] = useState(false);
  const [dispatcherChannel, setDispatcherChannel] = useState('mfe:notification:add');
  const [dispatcherTitle, setDispatcherTitle] = useState('');
  const [dispatcherMessage, setDispatcherMessage] = useState('');
  const [dispatcherCategory, setDispatcherCategory] = useState('System');
  const [dispatcherPriority, setDispatcherPriority] = useState('info');
  const [dispatchReceipt, setDispatchReceipt] = useState(null);
  const [actionNotice, setActionNotice] = useState('');
  const [ledgerActionNotice, setLedgerActionNotice] = useState('');

  const [remotePings, setRemotePings] = useState({
    host: 1.2,
    users: 2.4,
    analytics: 3.1,
    notifications: 0.9,
    auth: 1.5
  });

  const [healthStats, setHealthStats] = useState({
    apiLatency: 38,
    cpuUsage: 27,
    memHeap: 43,
    activeSockets: 142
  });
  const [isSimulatedDanger, setIsSimulatedDanger] = useState(false);
  const [isGatewayOff, setIsGatewayOff] = useState(() => {
    return typeof window !== 'undefined' && meshStore?.areAllApisOff ? meshStore.areAllApisOff() : false;
  });

  const fetchDashboardData = async () => {
    if (meshStore?.areAllApisOff && meshStore.areAllApisOff()) {
      setActivities([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const act = await mockApi.getActivities();
      setActivities(act);
    } catch (err) {
      console.error('Failed to load dashboard activities:', err);
    } finally {
      setTimeout(() => setLoading(false), 350);
    }
  };

  useEffect(() => {
    fetchDashboardData();

    // Cross-module event subscriptions
    const unsubActivity = eventBus.on(MFE_EVENTS.ACTIVITY_LOGGED, (newAct) => {
      setActivities((prev) => [newAct, ...prev.slice(0, 24)]);
    });

    const unsubUserCreated = eventBus.on(MFE_EVENTS.USER_CREATED, () => {
      setActiveUserCount((prev) => prev + 1);
    });

    const unsubUserDeleted = eventBus.on(MFE_EVENTS.USER_DELETED, () => {
      setActiveUserCount((prev) => Math.max(0, prev - 1));
    });

    const unsubAuthLogin = eventBus.on(MFE_EVENTS.AUTH_LOGIN, ({ user }) => {
      setCurrentUser(user);
    });

    const unsubMesh = eventBus.on(MFE_EVENTS.MESH_STATUS_CHANGED, (data) => {
      const isOff = typeof data?.allApisOff === 'boolean'
        ? data.allApisOff
        : (meshStore?.areAllApisOff ? meshStore.areAllApisOff() : false);
      setIsGatewayOff(isOff);
      if (isOff) {
        setActivities([]);
        setHealthStats({
          apiLatency: 0,
          cpuUsage: 0,
          memHeap: 0,
          activeSockets: 0
        });
      } else {
        fetchDashboardData();
        setHealthStats({
          apiLatency: 36,
          cpuUsage: 28,
          memHeap: 44,
          activeSockets: 146
        });
      }
    });

    // Periodic telemetry fluctuation simulation
    const timer = setInterval(() => {
      if (meshStore?.areAllApisOff && meshStore.areAllApisOff()) return;
      setHealthStats((prev) => {
        if (isSimulatedDanger) {
          return {
            apiLatency: Math.floor(290 + Math.random() * 60),
            cpuUsage: Math.floor(88 + Math.random() * 10),
            memHeap: Math.floor(89 + Math.random() * 8),
            activeSockets: Math.floor(2 + Math.random() * 5)
          };
        }
        return {
          apiLatency: Math.floor(32 + Math.random() * 14),
          cpuUsage: Math.floor(22 + Math.random() * 12),
          memHeap: Math.floor(40 + Math.random() * 8),
          activeSockets: Math.floor(138 + Math.random() * 10)
        };
      });
    }, 4000);

    return () => {
      unsubActivity();
      unsubUserCreated();
      unsubUserDeleted();
      unsubAuthLogin();
      unsubMesh();
      clearInterval(timer);
    };
  }, []);

  const handleSimulateQuickAlert = () => {
    mockApi.addNotification({
      title: 'Real-Time Alert Emitted',
      message: `Triggered from Dashboard Quick Actions by ${currentUser?.name || 'Operator'}.`,
      category: 'System',
      priority: 'warning'
    });
    setActionNotice('Broadcast alert emitted to Notifications (:5005)');
    setLedgerActionNotice('Global alert broadcasted across Mesh!');
    setTimeout(() => {
      setActionNotice('');
      setLedgerActionNotice('');
    }, 3500);
  };

  const handleSimulateFastUser = async () => {
    if (isSimulatingUser) return;
    setIsSimulatingUser(true);
    try {
      const FIRST_NAMES = [
        'Aria', 'Kaelen', 'Mateo', 'Soraya', 'Dante', 'Leila', 'Tariq', 'Siddharth',
        'Freja', 'Zane', 'Nia', 'Nikolai', 'Camila', 'Kenzo', 'Astrid', 'Julian',
        'Eleni', 'Malik', 'Cassidy', 'Hiroshi', 'Zara', 'Thorne', 'Maya', 'Gideon',
        'Rowan', 'Selene', 'Kiran', 'Dominic', 'Amira', 'Felix', 'Valentina', 'Orion',
        'Beatrix', 'Cassian', 'Mei', 'Lucian', 'Ananya', 'Evander', 'Seraphina', 'Javier',
        'Ingrid', 'Darius', 'Zuri', 'Rhys', 'Clara', 'Nico', 'Sariyah', 'Tobias'
      ];

      const LAST_NAMES = [
        'Vanguard', 'Montgomery', 'Kowalski', 'Al-Mansoor', 'Takahashi', 'Lindqvist',
        'Osei', 'Castillo', 'Novak', 'Chakraborty', 'Sterling', 'Mercer', 'Fontaine',
        'Sinclair', 'Hayashi', 'Dubois', 'Hawthorne', 'Bhandari', 'Kaufman', 'Moreno',
        'Petrov', 'Solano', 'Rousseau', 'Ashford', 'Valtchev', 'Khatri',
        'Winslow', 'Kruger', 'Navarro', 'Holt', 'DeVries', 'Venkatesh', 'Abebe',
        'Cross', 'Lombardi', 'Winter', 'Stark', 'Mercado', 'Ibrahim', 'Fairchild'
      ];

      const ROLES = ['Admin', 'Editor', 'Viewer', 'Architect', 'DevOps Lead', 'Security Officer'];

      const TITLES = [
        'Staff Platform Architect',
        'Lead Distributed Systems Engineer',
        'Senior Cloud Security Analyst',
        'Principal SRE Specialist',
        'Director of Micro-Frontend Systems',
        'Core Protocol Engineer',
        'Senior Machine Learning Scientist',
        'Zero-Trust Governance Officer',
        'Lead Frontend Infrastructure Engineer',
        'Fullstack Solutions Architect',
        'Autonomous CI/CD Systems Lead',
        'Real-Time Telemetry Specialist'
      ];

      const AVATAR_PHOTOS = [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
      ];

      // Retrieve existing users to prevent duplicate names and emails
      const res = await mockApi.getUsers({ limit: 1000 });
      const currentUsers = res?.data || [];
      const existingNames = new Set(currentUsers.map((u) => (u.name || '').toLowerCase().trim()));
      const existingEmails = new Set(currentUsers.map((u) => (u.email || '').toLowerCase().trim()));

      let candidateName = '';
      let candidateEmail = '';
      let first = '';
      let last = '';
      let attempts = 0;

      while (attempts < 100) {
        attempts++;
        first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
        last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
        candidateName = `${first} ${last}`;
        const cleanFirst = first.toLowerCase().replace(/[^a-z0-9]/g, '');
        const cleanLast = last.toLowerCase().replace(/[^a-z0-9]/g, '');
        candidateEmail = `${cleanFirst}.${cleanLast}@mosaic.io`;

        if (!existingNames.has(candidateName.toLowerCase()) && !existingEmails.has(candidateEmail.toLowerCase())) {
          break;
        }
      }

      // Guarantee absolute uniqueness with numeric discriminator if ever exhausted
      if (existingNames.has(candidateName.toLowerCase()) || existingEmails.has(candidateEmail.toLowerCase())) {
        const uniqueSuffix = Math.floor(100 + Math.random() * 900);
        candidateName = `${first} ${last} ${uniqueSuffix}`;
        candidateEmail = `${first.toLowerCase()}.${last.toLowerCase()}.${uniqueSuffix}@mosaic.io`;
      }

      const randomRole = ROLES[Math.floor(Math.random() * ROLES.length)];
      const randomTitle = TITLES[Math.floor(Math.random() * TITLES.length)];
      const randomAvatar = AVATAR_PHOTOS[Math.floor(Math.random() * AVATAR_PHOTOS.length)];

      await mockApi.createUser({
        name: candidateName,
        email: candidateEmail,
        role: randomRole,
        title: randomTitle,
        avatar: 'initials',
        status: 'Active'
      });
      setActionNotice(`Provisioned "${candidateName}" to User Management (:5003)`);
      setTimeout(() => setActionNotice(''), 3500);
    } catch (err) {
      console.error('Failed to simulate unique user:', err);
    } finally {
      setIsSimulatingUser(false);
    }
  };

  const handleSyncTelemetry = () => {
    setIsSyncingTelemetry(true);
    eventBus.emit(MFE_EVENTS.METRICS_REFRESH, { source: 'dashboard-quick-actions', timestamp: Date.now() });
    mockApi.logActivity({
      user: currentUser?.name || 'Platform Admin',
      action: 'synchronized live telemetry & revenue stream across all remotes',
      type: 'analytics'
    });
    mockApi.addNotification({
      title: 'Telemetry Synced Across Mesh',
      message: 'Real-time telemetry and KPI channels resynchronized with 0ms latency.',
      category: 'System',
      priority: 'success'
    });
    setActionNotice('Telemetry streams synchronized across all 5 remotes');
    setTimeout(() => {
      setIsSyncingTelemetry(false);
      setTimeout(() => setActionNotice(''), 3500);
    }, 600);
  };

  const handlePurgeNotifications = async () => {
    setIsPurgingNotifs(true);
    try {
      await mockApi.clearAllNotifications();
      mockApi.logActivity({
        user: currentUser?.name || 'Platform Admin',
        action: 'cleared all system alerts & incident queue across mesh',
        type: 'security'
      });
      setActionNotice('Cleared all incidents & notification backlog');
      setTimeout(() => setActionNotice(''), 3500);
    } catch (e) {
      console.error('Failed to clear notifications:', e);
    } finally {
      setTimeout(() => setIsPurgingNotifs(false), 500);
    }
  };

  const handleDispatchCustomEvent = (e) => {
    e.preventDefault();
    const startTime = performance.now();
    const detail = {
      title: dispatcherTitle.trim() || 'Custom Mesh Signal',
      message: dispatcherMessage.trim() || `Asynchronous broadcast via ${dispatcherChannel}.`,
      category: dispatcherCategory,
      priority: dispatcherPriority,
      source: 'Cross-Module Action Triggers Console',
      timestamp: 'Just now'
    };

    if (dispatcherChannel === 'mfe:notification:add') {
      mockApi.addNotification(detail);
    } else if (dispatcherChannel === 'mfe:activity:logged') {
      mockApi.logActivity({
        user: currentUser?.name || 'Platform Admin',
        action: dispatcherTitle.trim() || 'dispatched custom payload into pubsub bus',
        type: dispatcherCategory.toLowerCase()
      });
    } else if (dispatcherChannel === 'mfe:metrics:refresh') {
      eventBus.emit(MFE_EVENTS.METRICS_REFRESH, detail);
    } else {
      eventBus.emit(dispatcherChannel, detail);
    }

    const elapsed = +(performance.now() - startTime + Math.random() * 0.4).toFixed(2);
    setDispatchReceipt({
      channel: dispatcherChannel,
      time: new Date().toLocaleTimeString(),
      latency: `${elapsed}ms`,
      subscribers: 5
    });
    setActionNotice(`Dispatched event to [${dispatcherChannel}] channel`);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const handleSimulateCustomActivity = () => {
    const mockActions = [
      { action: 'triggered automated cross-MFE integration test suite', type: 'system' },
      { action: 'synchronized real-time revenue telemetry stream', type: 'analytics' },
      { action: 'rotated Personal Access Token (PAT) for CI/CD deploy runner', type: 'security' },
      { action: 'updated distributed cache policy for User Management MFE', type: 'system' },
      { action: 'approved new workspace member provisioning', type: 'team' }
    ];
    const picked = mockActions[Math.floor(Math.random() * mockActions.length)];
    mockApi.logActivity({
      user: currentUser?.name || 'Platform Admin',
      action: picked.action,
      type: picked.type
    });
  };

  const handlePingRemotes = () => {
    setIsPinging(true);
    setTimeout(() => {
      setRemotePings({
        host: +(1.0 + Math.random() * 0.5).toFixed(1),
        users: +(2.0 + Math.random() * 0.8).toFixed(1),
        analytics: +(2.8 + Math.random() * 0.9).toFixed(1),
        notifications: +(0.7 + Math.random() * 0.4).toFixed(1),
        auth: +(1.3 + Math.random() * 0.5).toFixed(1)
      });
      setIsPinging(false);
    }, 600);
  };

  const handleGlobalHealthCheck = () => {
    setIsHealthChecking(true);
    setHealthCheckNotice('Scanning all 5 federated micro-frontends and verifying CORS/COOP boundaries...');
    setTimeout(() => {
      setIsHealthChecking(false);
      setHealthCheckNotice('All 5 micro-frontend clusters verified: 100% operational with 0 degraded boundaries.');
      mockApi.addNotification({
        title: 'Global Health Check Passed',
        message: 'All 5 micro-frontend remotes verified with 0 memory leaks.',
        category: 'System',
        priority: 'success'
      });
      setTimeout(() => setHealthCheckNotice(''), 5000);
    }, 900);
  };

  const handleExportAuditLog = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activities, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `mfe-audit-ledger-${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      mockApi.addNotification({
        title: 'Audit Ledger Exported',
        message: `Successfully downloaded ${activities.length} audit records in JSON format.`,
        category: 'System',
        priority: 'info'
      });
      setLedgerActionNotice(`Exported ${activities.length} audit records as JSON!`);
      setTimeout(() => setLedgerActionNotice(''), 3500);
    } catch (e) {
      console.error('Export failed:', e);
    }
  };

  const filteredActivities = activities.filter((act) => {
    const matchesCategory =
      activityFilter === 'all' ? true : (act.type || 'system').toLowerCase() === activityFilter.toLowerCase();
    const query = activitySearch.toLowerCase().trim();
    const matchesSearch =
      !query ||
      act.user?.toLowerCase().includes(query) ||
      act.action?.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const categoryCounts = {
    system: activities.filter((a) => (a.type || 'system').toLowerCase() === 'system').length,
    team: activities.filter((a) => (a.type || '').toLowerCase() === 'team').length,
    analytics: activities.filter((a) => (a.type || '').toLowerCase() === 'analytics').length,
    security: activities.filter((a) => (a.type || '').toLowerCase() === 'security').length
  };
  const totalActCount = Math.max(1, activities.length);
  const catPcts = {
    system: Math.round(((categoryCounts.system || 0) / totalActCount) * 100),
    team: Math.round(((categoryCounts.team || 0) / totalActCount) * 100),
    analytics: Math.round(((categoryCounts.analytics || 0) / totalActCount) * 100),
    security: Math.round(((categoryCounts.security || 0) / totalActCount) * 100)
  };

  const kpis = [
    {
      title: 'Total Platform Revenue',
      value: isGatewayOff ? '—' : '$434,250',
      delta: isGatewayOff ? '0.0%' : '+14.2%',
      deltaType: isGatewayOff ? 'neutral' : 'up',
      subtitle: isGatewayOff ? 'Gateway disconnected' : 'vs. $380,200 last month',
      icon: DollarSign,
      glow: isGatewayOff ? 'transparent' : 'rgba(56, 189, 248, 0.3)'
    },
    {
      title: 'Active Platform Users',
      value: isGatewayOff ? '—' : activeUserCount.toLocaleString(),
      delta: isGatewayOff ? '0.0%' : '+8.6%',
      deltaType: isGatewayOff ? 'neutral' : 'up',
      subtitle: isGatewayOff ? 'Gateway disconnected' : 'Synchronized across remotes',
      icon: Users,
      glow: isGatewayOff ? 'transparent' : 'rgba(99, 102, 241, 0.3)'
    },
    {
      title: 'Platform Uptime',
      value: isGatewayOff ? '0.00%' : '99.98%',
      delta: isGatewayOff ? '-100%' : '+0.03%',
      deltaType: isGatewayOff ? 'down' : 'up',
      subtitle: isGatewayOff ? 'Mesh Gateway OFFLINE' : 'Operational across 5 regions',
      icon: ShieldCheck,
      glow: isGatewayOff ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'
    },
    {
      title: 'System Conversion Rate',
      value: isGatewayOff ? '—' : '4.18%',
      delta: isGatewayOff ? '0.0%' : '+1.1%',
      deltaType: isGatewayOff ? 'neutral' : 'up',
      subtitle: isGatewayOff ? 'Gateway disconnected' : 'Consistent across funnels',
      icon: TrendingUp,
      glow: isGatewayOff ? 'transparent' : 'rgba(245, 158, 11, 0.3)'
    }
  ];

  const remoteNodes = [
    { name: 'Host Shell Gateway', port: '5000', version: 'v2.1.0', ping: remotePings.host, role: 'Orchestrator', status: 'Optimal' },
    { name: 'User Management MFE', port: '5001', version: 'v1.8.4', ping: remotePings.users, role: 'RBAC & Identity', status: 'Synced' },
    { name: 'Analytics Engine MFE', port: '5002', version: 'v3.0.2', ping: remotePings.analytics, role: 'Metrics Engine', status: 'Streaming' },
    { name: 'Notifications MFE', port: '5003', version: 'v1.5.0', ping: remotePings.notifications, role: 'PubSub & Toast', status: 'Connected' },
    { name: 'Auth & Session Guard', port: '5004', version: 'v2.0.1', ping: remotePings.auth, role: 'Token Verification', status: 'Guarded' }
  ];

  return (
    <div className="mfe-page-enter" style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '100%' }}>
      {/* Top Banner & Module Badge */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          paddingBottom: '4px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
              Executive Overview
            </h1>
            <Badge variant="primary" dot size="sm">
              MFE Remote: Dashboard (:5002)
            </Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', marginTop: '4px' }}>
            Welcome back, <strong style={{ color: 'var(--mfe-primary)' }}>{currentUser?.name || 'Operator'}</strong>. Real-time metrics aggregated across federated modules.
          </p>
        </div>

        <div className="mfe-page-header-actions" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            size="sm"
            variant="secondary"
            icon={RefreshCw}
            isLoading={loading}
            onClick={fetchDashboardData}
          >
            Refresh Telemetry
          </Button>
          <Button
            size="sm"
            variant="primary"
            icon={PlusCircle}
            isLoading={isSimulatingUser}
            onClick={handleSimulateFastUser}
          >
            Simulate New User
          </Button>
        </div>
      </div>

      {/* Mesh Gateway Offline Alert Banner */}
      {isGatewayOff && (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 'var(--mfe-radius-md)',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.08) 100%)',
            border: '1.5px solid rgba(239, 68, 68, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            animation: 'mfe-fadeIn 0.25s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1.5px solid #ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ef4444',
                flexShrink: 0
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#ef4444' }}>
                Mesh Gateway Taken Offline — Data Pipelines Severed
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--mfe-text-secondary)', marginTop: '2px' }}>
                Reverse proxy gateway disconnected. Remote modules are operating in isolated zero-trust sandbox.
              </div>
            </div>
          </div>
          <button
            onClick={() => meshStore?.restoreAllApis && meshStore.restoreAllApis()}
            style={{
              padding: '6px 14px',
              borderRadius: 'var(--mfe-radius-sm)',
              background: '#ef4444',
              color: '#ffffff',
              border: 'none',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            Turn Gateway LIVE
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      {loading ? (
        <div className="mfe-dashboard-kpi-grid">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="mfe-dashboard-kpi-grid">
          {kpis.map((kpi, idx) => {
            const IconComponent = kpi.icon;
            return (
              <Card
                key={idx}
                className={`mfe-stagger-${idx + 1} mfe-card-interactive`}
                style={{
                  boxShadow: `0 10px 30px -10px ${kpi.glow}`,
                  position: 'relative'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)' }}>
                    {kpi.title}
                  </span>
                  <div
                    className="mfe-icon-spin-hover"
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-surface)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--mfe-primary)',
                      border: '1px solid var(--mfe-border)',
                      cursor: 'pointer'
                    }}
                  >
                    <IconComponent size={18} />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--mfe-text-primary)', letterSpacing: '-0.02em' }}>
                    {kpi.value}
                  </span>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '2px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: 'var(--mfe-success)',
                      backgroundColor: 'var(--mfe-success-bg)',
                      padding: '2px 6px',
                      borderRadius: 'var(--mfe-radius-sm)'
                    }}
                  >
                    <ArrowUpRight size={12} />
                    {kpi.delta}
                  </span>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>
                  {kpi.subtitle}
                </p>
              </Card>
            );
          })}
        </div>
      )}

      {/* Main Grid: Row 1 (Activity Stream vs Telemetry+Triggers+Security) & Row 2 (Remote Nodes vs Event Bus & Cache) */}
      <div className="mfe-dashboard-matrix-grid">
        {/* ========================================================================= */}
        {/* ROW 1 LEFT: Activity Stream                                               */}
        {/* ========================================================================= */}
        <Card
          title="Federated Audit & Activity Stream"
          className="mfe-stagger-2"
          subtitle="Live decoupled events received across independent micro-frontends"
          icon={Activity}
          style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          action={
            <Badge variant="success" dot size="sm">
              Live PubSub Active
            </Badge>
          }
        >
          {/* Search & Category Filter Bar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', color: 'var(--mfe-text-muted)' }} />
                <input
                  type="text"
                  value={activitySearch}
                  onChange={(e) => setActivitySearch(e.target.value)}
                  placeholder="Search events or user names..."
                  style={{
                    width: '100%',
                    padding: '6px 10px 6px 30px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: 'var(--mfe-bg-surface)',
                    border: '1px solid var(--mfe-border)',
                    color: 'var(--mfe-text-primary)',
                    fontSize: '0.8125rem',
                    outline: 'none'
                  }}
                  className="mfe-input-focus"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: 'All Events' },
                { id: 'team', label: 'Team' },
                { id: 'system', label: 'System' },
                { id: 'analytics', label: 'Analytics' },
                { id: 'security', label: 'Security' }
              ].map((tab) => {
                const isActive = activityFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivityFilter(tab.id)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '9999px',
                      background: isActive ? 'var(--mfe-primary-gradient)' : 'var(--mfe-bg-surface)',
                      color: isActive ? '#07090e' : 'var(--mfe-text-secondary)',
                      fontWeight: isActive ? 800 : 600,
                      fontSize: '0.75rem',
                      border: isActive ? 'none' : '1px solid var(--mfe-border-subtle)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Expanded Event List (No scrollbar, fully expanded) */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              overflow: 'visible'
            }}
          >
            {filteredActivities.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--mfe-text-muted)' }}>
                <p style={{ fontSize: '0.875rem', margin: 0, fontWeight: isGatewayOff ? 600 : 400, color: isGatewayOff ? '#ef4444' : 'var(--mfe-text-muted)' }}>
                  {isGatewayOff ? '⚠️ Mesh Gateway Offline — Activity stream disconnected.' : 'No matching audit events found.'}
                </p>
                {!isGatewayOff && (
                  <Button variant="outline" size="sm" style={{ marginTop: '8px' }} onClick={() => { setActivityFilter('all'); setActivitySearch(''); }}>
                    Reset Filters
                  </Button>
                )}
              </div>
            ) : (
              filteredActivities.map((act) => {
                const typeColors = {
                  team: 'var(--mfe-primary)',
                  system: 'var(--mfe-accent)',
                  analytics: 'var(--mfe-warning)',
                  security: 'var(--mfe-danger)',
                  settings: 'var(--mfe-info)'
                };
                const color = typeColors[act.type] || 'var(--mfe-primary)';

                return (
                  <div
                    key={act.id}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border-subtle)',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      transition: 'var(--mfe-transition)'
                    }}
                    className="mfe-table-row mfe-activity-item"
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: `1px solid ${color}40`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: color,
                        flexShrink: 0,
                        marginTop: '2px'
                      }}
                    >
                      <Zap size={14} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-primary)', lineHeight: 1.4, margin: 0 }}>
                          <strong style={{ color: 'var(--mfe-text-primary)' }}>{act.user}</strong> {act.action}
                        </p>
                        <span
                          style={{
                            fontSize: '0.625rem',
                            textTransform: 'uppercase',
                            fontWeight: 800,
                            color: color,
                            background: `${color}18`,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            letterSpacing: '0.04em',
                            flexShrink: 0
                          }}
                        >
                          {act.type || 'system'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                        <Clock size={10} /> {act.timestamp}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* ========================================================= */}
          {/* SUITABLE WIDGET 1: Live Event Velocity & Stream Telemetry */}
          {/* ========================================================= */}
          <div
            style={{
              marginTop: '16px',
              padding: '12px 14px',
              borderRadius: 'var(--mfe-radius-md)',
              background: 'var(--mfe-bg-surface)',
              border: '1px solid var(--mfe-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mfe-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: isGatewayOff ? '#ef4444' : 'var(--mfe-success)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                  Stream Velocity & Health
                </span>
              </div>
              <Badge variant={isGatewayOff ? 'danger' : 'success'} size="sm">
                {isGatewayOff ? 'Offline' : 'Zero Loss (100%)'}
              </Badge>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
              <div style={{ padding: '8px 10px', borderRadius: 'var(--mfe-radius-sm)', background: 'var(--mfe-bg-card)', border: '1px solid var(--mfe-border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', fontWeight: 600 }}>Throughput</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: isGatewayOff ? 'var(--mfe-text-muted)' : 'var(--mfe-primary)' }}>
                  {isGatewayOff ? '0 msg/s' : '18.4 msg/s'}
                </div>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 'var(--mfe-radius-sm)', background: 'var(--mfe-bg-card)', border: '1px solid var(--mfe-border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', fontWeight: 600 }}>Avg Transit</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: isGatewayOff ? 'var(--mfe-text-muted)' : 'var(--mfe-success)' }}>
                  {isGatewayOff ? '—' : '< 1.2ms'}
                </div>
              </div>
              <div style={{ padding: '8px 10px', borderRadius: 'var(--mfe-radius-sm)', background: 'var(--mfe-bg-card)', border: '1px solid var(--mfe-border-subtle)' }}>
                <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', fontWeight: 600 }}>Buffer Cap</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 800, color: isGatewayOff ? 'var(--mfe-text-muted)' : 'var(--mfe-text-primary)' }}>
                  {activities.length} / 500
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SUITABLE WIDGET 2: Category Distribution Breakdown       */}
          {/* ========================================================= */}
          <div
            style={{
              marginTop: '12px',
              padding: '12px 14px',
              borderRadius: 'var(--mfe-radius-md)',
              background: 'var(--mfe-bg-surface)',
              border: '1px solid var(--mfe-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                Event Category Volume
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)' }}>
                {activities.length} total events indexed
              </span>
            </div>

            {/* Segmented Distribution Bar */}
            <div style={{ height: '6px', width: '100%', borderRadius: '9999px', overflow: 'hidden', display: 'flex', background: 'var(--mfe-border)' }}>
              <div style={{ width: `${catPcts.system}%`, background: 'var(--mfe-accent)', transition: 'width 0.3s ease' }} title={`System: ${catPcts.system}%`} />
              <div style={{ width: `${catPcts.team}%`, background: 'var(--mfe-primary)', transition: 'width 0.3s ease' }} title={`Team: ${catPcts.team}%`} />
              <div style={{ width: `${catPcts.analytics}%`, background: 'var(--mfe-warning)', transition: 'width 0.3s ease' }} title={`Analytics: ${catPcts.analytics}%`} />
              <div style={{ width: `${catPcts.security}%`, background: 'var(--mfe-danger)', transition: 'width 0.3s ease' }} title={`Security: ${catPcts.security}%`} />
            </div>

            {/* Legend & Filter Shortcuts */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px', flexWrap: 'wrap', paddingTop: '2px' }}>
              {[
                { key: 'system', label: 'System', color: 'var(--mfe-accent)' },
                { key: 'team', label: 'Team', color: 'var(--mfe-primary)' },
                { key: 'analytics', label: 'Analytics', color: 'var(--mfe-warning)' },
                { key: 'security', label: 'Security', color: 'var(--mfe-danger)' }
              ].map((c) => (
                <button
                  key={c.key}
                  onClick={() => setActivityFilter(activityFilter === c.key ? 'all' : c.key)}
                  style={{
                    background: activityFilter === c.key ? `${c.color}22` : 'transparent',
                    border: `1px solid ${activityFilter === c.key ? c.color : 'transparent'}`,
                    borderRadius: '6px',
                    padding: '2px 6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: c.color }} />
                  <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--mfe-text-secondary)' }}>
                    {c.label} ({categoryCounts[c.key] || 0})
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Stream Action Bar */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '14px',
              borderTop: '1px solid var(--mfe-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mfe-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--mfe-success)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>
                PubSub Transit <strong style={{ color: 'var(--mfe-success)' }}>&lt;1.2ms</strong> • 100% Delivery
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              icon={PlusCircle}
              onClick={handleSimulateCustomActivity}
              title="Emit a mock event into the live pubsub bus"
            >
              + Broadcast Event
            </Button>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* ROW 1 RIGHT: Telemetry + Action Triggers + Security Governance             */}
        {/* ========================================================================= */}
        <div className="mfe-stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          {/* Cluster Telemetry */}
          <Card
            title="Cluster Health & Telemetry"
            subtitle="Virtual gateway and service health"
            icon={Server}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            action={
              <button
                onClick={() => {
                  setIsSimulatedDanger((prev) => {
                    const next = !prev;
                    if (next) {
                      setHealthStats({
                        apiLatency: 318,
                        cpuUsage: 92,
                        memHeap: 89,
                        activeSockets: 3
                      });
                    } else {
                      setHealthStats({
                        apiLatency: 36,
                        cpuUsage: 28,
                        memHeap: 44,
                        activeSockets: 146
                      });
                    }
                    return next;
                  });
                }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '3px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: isSimulatedDanger ? '1px solid #ef4444' : '1px solid #10b981',
                  background: isSimulatedDanger ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                  color: isSimulatedDanger ? '#ef4444' : '#10b981',
                  transition: 'all 0.2s ease'
                }}
                title="Click to toggle between Safe Mode (Green bars) and Simulated Danger Load (Red bars)"
              >
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: isSimulatedDanger ? '#ef4444' : '#10b981' }} />
                <span>{isSimulatedDanger ? 'Simulated Danger (Red)' : 'Safe Mode (Green)'}</span>
              </button>
            }
          >
            <div className="mfe-telemetry-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {/* API Gateway Telemetry */}
              {(() => {
                const s = getTelemetryMetricState('latency', isGatewayOff ? 0 : healthStats.apiLatency, isGatewayOff);
                return (
                  <div style={{ padding: '18px 16px', borderRadius: 'var(--mfe-radius-md)', background: 'var(--mfe-bg-surface)', border: '1px solid var(--mfe-border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Zap size={16} color={s.color} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>API Gateway</span>
                      </div>
                      <span className="mfe-pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dotColor }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--mfe-text-primary)', letterSpacing: '-0.02em', margin: '4px 0' }}>
                      {isGatewayOff ? 0 : healthStats.apiLatency} <span style={{ fontSize: '0.8125rem', fontWeight: 500, color: 'var(--mfe-text-muted)' }}>ms</span>
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'var(--mfe-border)', borderRadius: '9999px', marginTop: '10px', overflow: 'hidden' }}>
                      <div style={{ width: isGatewayOff ? '0%' : s.barWidth, height: '100%', background: s.barGradient, borderRadius: '9999px', transition: 'width 0.5s ease, background 0.3s ease', boxShadow: s.status === 'danger' ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 6px rgba(16, 185, 129, 0.3)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: s.color, marginTop: '6px', fontWeight: 700 }}>{s.label}</div>
                  </div>
                );
              })()}

              {/* CPU Compute Telemetry */}
              {(() => {
                const s = getTelemetryMetricState('cpu', isGatewayOff ? 0 : healthStats.cpuUsage, isGatewayOff);
                return (
                  <div style={{ padding: '18px 16px', borderRadius: 'var(--mfe-radius-md)', background: 'var(--mfe-bg-surface)', border: '1px solid var(--mfe-border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Cpu size={16} color={s.color} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>CPU Compute</span>
                      </div>
                      <span className="mfe-pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dotColor }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--mfe-text-primary)', letterSpacing: '-0.02em', margin: '4px 0' }}>
                      {isGatewayOff ? 0 : healthStats.cpuUsage}%
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'var(--mfe-border)', borderRadius: '9999px', marginTop: '10px', overflow: 'hidden' }}>
                      <div style={{ width: isGatewayOff ? '0%' : s.barWidth, height: '100%', background: s.barGradient, borderRadius: '9999px', transition: 'width 0.5s ease, background 0.3s ease', boxShadow: s.status === 'danger' ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 6px rgba(16, 185, 129, 0.3)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: s.color, marginTop: '6px', fontWeight: 700 }}>{s.label}</div>
                  </div>
                );
              })()}

              {/* Memory Heap Telemetry */}
              {(() => {
                const s = getTelemetryMetricState('memory', isGatewayOff ? 0 : healthStats.memHeap, isGatewayOff);
                return (
                  <div style={{ padding: '18px 16px', borderRadius: 'var(--mfe-radius-md)', background: 'var(--mfe-bg-surface)', border: '1px solid var(--mfe-border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Database size={16} color={s.color} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Memory Heap</span>
                      </div>
                      <span className="mfe-pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dotColor }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--mfe-text-primary)', letterSpacing: '-0.02em', margin: '4px 0' }}>
                      {isGatewayOff ? 0 : healthStats.memHeap}%
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'var(--mfe-border)', borderRadius: '9999px', marginTop: '10px', overflow: 'hidden' }}>
                      <div style={{ width: isGatewayOff ? '0%' : s.barWidth, height: '100%', background: s.barGradient, borderRadius: '9999px', transition: 'width 0.5s ease, background 0.3s ease', boxShadow: s.status === 'danger' ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 6px rgba(16, 185, 129, 0.3)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: s.color, marginTop: '6px', fontWeight: 700 }}>{s.label}</div>
                  </div>
                );
              })()}

              {/* Active Sockets Telemetry */}
              {(() => {
                const s = getTelemetryMetricState('sockets', isGatewayOff ? 0 : healthStats.activeSockets, isGatewayOff);
                return (
                  <div style={{ padding: '18px 16px', borderRadius: 'var(--mfe-radius-md)', background: 'var(--mfe-bg-surface)', border: '1px solid var(--mfe-border)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Activity size={16} color={s.color} />
                        <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Sockets</span>
                      </div>
                      <span className="mfe-pulse-dot" style={{ width: '7px', height: '7px', borderRadius: '50%', background: s.dotColor }} />
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--mfe-text-primary)', letterSpacing: '-0.02em', margin: '4px 0' }}>
                      {isGatewayOff ? 0 : healthStats.activeSockets}
                    </div>
                    <div style={{ width: '100%', height: '7px', background: 'var(--mfe-border)', borderRadius: '9999px', marginTop: '10px', overflow: 'hidden' }}>
                      <div style={{ width: isGatewayOff ? '0%' : s.barWidth, height: '100%', background: s.barGradient, borderRadius: '9999px', transition: 'width 0.5s ease, background 0.3s ease', boxShadow: s.status === 'danger' ? '0 0 8px rgba(239, 68, 68, 0.6)' : '0 0 6px rgba(16, 185, 129, 0.3)' }} />
                    </div>
                    <div style={{ fontSize: '0.75rem', color: s.color, marginTop: '6px', fontWeight: 700 }}>{s.label}</div>
                  </div>
                );
              })()}
            </div>

            {/* Downside Telemetry Expansion Strip */}
            <div
              style={{
                marginTop: '16px',
                padding: '14px 16px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-bg-surface)',
                border: '1px solid var(--mfe-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mfe-pulse-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: isGatewayOff ? '#ef4444' : 'var(--mfe-success)' }} />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                  Cluster Telemetry: <strong style={{ color: isGatewayOff ? '#ef4444' : 'var(--mfe-success)' }}>{isGatewayOff ? 'Degraded • Gateway Offline' : 'All 5 Nodes Nominal'}</strong>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>
                <span>Throughput: <strong style={{ color: isGatewayOff ? '#ef4444' : 'var(--mfe-primary)' }}>{isGatewayOff ? '0 MB/s' : '48.6 MB/s'}</strong></span>
                <span>Jitter: <strong style={{ color: 'var(--mfe-text-primary)' }}>&lt;0.3ms</strong></span>
                <span>Packet Drop: <strong style={{ color: 'var(--mfe-success)' }}>0.00%</strong></span>
              </div>
            </div>
          </Card>

          {/* Expanded Cross-Module Action Triggers */}
          <Card
            title="Cross-Module Action Triggers"
            subtitle="Emit asynchronous events directly into other micro-frontend components"
            icon={Zap}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            action={
              <Badge variant="primary" size="sm">
                EventBus v2.4 • Active
              </Badge>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Quick Feedback Toast if active */}
              {actionNotice && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 'var(--mfe-radius-sm)',
                    background: 'var(--mfe-success-bg, rgba(16, 185, 129, 0.12))',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: 'var(--mfe-success, #10b981)',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    animation: 'mfe-fadeIn 0.2s ease-out'
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>{actionNotice}</span>
                </div>
              )}

              {/* Cluster 1: Asynchronous Event Broadcasters */}
              <div>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--mfe-text-muted)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Radio size={12} color="var(--mfe-accent)" />
                  <span>PubSub Event Broadcasters</span>
                </div>

                <div className="mfe-action-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={BellRing}
                    onClick={handleSimulateQuickAlert}
                    title="Broadcast incident notification to Notifications MFE (:5005)"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  >
                    Broadcast Alert
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={RefreshCw}
                    onClick={handleSyncTelemetry}
                    disabled={isSyncingTelemetry}
                    title="Sync telemetry streams and refresh KPIs across mesh"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  >
                    {isSyncingTelemetry ? 'Syncing...' : 'Sync Telemetry'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={UserPlus}
                    onClick={handleSimulateFastUser}
                    disabled={isSimulatingUser}
                    title="Provision a new federated team member into User Management (:5003)"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  >
                    {isSimulatingUser ? 'Provisioning...' : 'Provision User'}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    icon={Trash2}
                    onClick={handlePurgeNotifications}
                    disabled={isPurgingNotifs}
                    title="Clear notification queue across the mesh"
                    style={{ width: '100%', justifyContent: 'flex-start', padding: '8px 12px' }}
                  >
                    {isPurgingNotifs ? 'Purging...' : 'Purge Alerts'}
                  </Button>
                </div>
              </div>

              {/* Cluster 2: Cross-Remote Navigators */}
              <div style={{ paddingTop: '10px', borderTop: '1px solid var(--mfe-border-subtle)' }}>
                <div
                  style={{
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    color: 'var(--mfe-text-muted)',
                    marginBottom: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Globe size={12} color="var(--mfe-primary)" />
                  <span>Federated Remote Navigators</span>
                </div>

                <div className="mfe-action-grid-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => (onNavigate ? onNavigate('/users') : (window.location.pathname = '/users'))}
                    className="mfe-table-row"
                    style={{
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border)',
                      borderRadius: 'var(--mfe-radius-md)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      cursor: 'pointer',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Users size={14} color="var(--mfe-primary)" />
                      <span>User Management</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', background: 'var(--mfe-bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--mfe-border)' }}>
                      :5003
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => (onNavigate ? onNavigate('/analytics') : (window.location.pathname = '/analytics'))}
                    className="mfe-table-row"
                    style={{
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border)',
                      borderRadius: 'var(--mfe-radius-md)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      cursor: 'pointer',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <TrendingUp size={14} color="var(--mfe-accent)" />
                      <span>Analytics Engine</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', background: 'var(--mfe-bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--mfe-border)' }}>
                      :5004
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => (onNavigate ? onNavigate('/notifications') : (window.location.pathname = '/notifications'))}
                    className="mfe-table-row"
                    style={{
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border)',
                      borderRadius: 'var(--mfe-radius-md)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      cursor: 'pointer',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <BellRing size={14} color="var(--mfe-warning)" />
                      <span>Incident Center</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', background: 'var(--mfe-bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--mfe-border)' }}>
                      :5005
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => (onNavigate ? onNavigate('/mesh') : (window.location.pathname = '/mesh'))}
                    className="mfe-table-row"
                    style={{
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border)',
                      borderRadius: 'var(--mfe-radius-md)',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      cursor: 'pointer',
                      color: 'var(--mfe-text-primary)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Network size={14} color="var(--mfe-success)" />
                      <span>Mesh Topology</span>
                    </div>
                    <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', background: 'var(--mfe-bg-card)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--mfe-border)' }}>
                      :5000
                    </span>
                  </button>
                </div>
              </div>

              {/* Cluster 3: Interactive Custom Event Dispatcher Console Trigger */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.07) 0%, rgba(56, 189, 248, 0.07) 100%)',
                  border: '1px solid var(--mfe-border-highlight)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--mfe-radius-sm)',
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--mfe-primary)',
                      flexShrink: 0
                    }}
                  >
                    <Terminal size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78125rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                      Custom Event Dispatcher
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)' }}>
                      Inject custom JSON payloads into live PubSub channels
                    </div>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  icon={Send}
                  className="mfe-btn-pulse"
                  onClick={() => {
                    setIsDispatcherOpen(true);
                    setDispatchReceipt(null);
                  }}
                >
                  Open Console
                </Button>
              </div>

              {/* Cluster 4: Live Event Bus Telemetry Footer */}
              <div
                style={{
                  paddingTop: '8px',
                  borderTop: '1px solid var(--mfe-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.6875rem',
                  color: 'var(--mfe-text-muted)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="mfe-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--mfe-success)' }} />
                  <span>
                    Mesh Bus: <strong style={{ color: 'var(--mfe-success)' }}>12 Active Channels</strong>
                  </span>
                </div>
                <span>
                  Avg Transit: <strong style={{ color: 'var(--mfe-text-primary)' }}>&lt;1.1ms</strong>
                </span>
              </div>
            </div>
          </Card>

          {/* Zero-Trust Architecture & Governance Card */}
          <Card
            title="Zero-Trust Architecture & Governance"
            subtitle="Active compliance policies across federated boundaries"
            icon={Shield}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            action={
              <Badge variant="primary" size="sm">
                SOC-2 Type II
              </Badge>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Upside Governance & Compliance Metric Banner */}
              <div
                style={{
                  padding: '14px 16px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(245, 158, 11, 0.08) 100%)',
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
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--mfe-success)',
                      flexShrink: 0
                    }}
                  >
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
                      Continuous Governance Active
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                      100% Policy Compliance • Zero Perimeter Violations
                    </div>
                  </div>
                </div>
                <Badge variant="success" size="sm">
                  Verified Safe
                </Badge>
              </div>

              {[
                { title: 'Cross-Origin Isolation', status: 'COOP / COEP Enforced across all origins', tag: 'Protected', icon: Shield },
                { title: 'Identity & JWT Cryptography', status: 'RSA-256 Validated Tokens & Session Claims', tag: 'Active', icon: Lock },
                { title: 'Federation Boundary Guard', status: 'Zero Shared Memory Contamination & Safe Scoping', tag: 'Compliant', icon: ShieldCheck },
                { title: 'Encrypted Bus Interconnect', status: 'Strict-Dynamic CSP & Signed Event Payloads', tag: 'Enforced', icon: Zap }
              ].map((pol, i) => {
                const IconComponent = pol.icon;
                return (
                  <div
                    key={i}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px'
                    }}
                    className="mfe-table-row"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '30px',
                          height: '30px',
                          borderRadius: '8px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--mfe-primary)',
                          flexShrink: 0
                        }}
                      >
                        <IconComponent size={15} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                          {pol.title}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                          {pol.status}
                        </div>
                      </div>
                    </div>
                    <Badge variant="success" size="sm">
                      {pol.tag}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* ========================================================================= */}
        {/* ROW 2 LEFT: Federated Micro-Frontend Remote Nodes                          */}
        {/* ========================================================================= */}
        <Card
          title="Federated Micro-Frontend Remote Nodes"
          className="mfe-stagger-4"
          subtitle="Runtime container matrix, live latency, and module federation status"
          icon={Network}
          style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                isLoading={isPinging}
                onClick={handlePingRemotes}
              >
                Ping Remotes
              </Button>
            </div>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {remoteNodes.map((node, i) => (
              <div
                key={i}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  minHeight: '56px',
                  boxSizing: 'border-box'
                }}
                className="mfe-table-row"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--mfe-radius-sm)',
                      background: 'rgba(0, 240, 255, 0.08)',
                      border: '1px solid var(--mfe-border-highlight)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--mfe-primary)',
                      flexShrink: 0
                    }}
                  >
                    <Globe size={16} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                        {node.name}
                      </span>
                      <span style={{ fontSize: '0.6875rem', fontFamily: 'var(--mfe-font-mono)', color: 'var(--mfe-primary)' }}>
                        :{node.port}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                      {node.role} • {node.version}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-success)', fontFamily: 'var(--mfe-font-mono)' }}>
                      {node.ping}ms
                    </div>
                    <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)' }}>
                      latency
                    </div>
                  </div>
                  <Badge variant="success" size="sm" dot>
                    {node.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Link to Mesh Topology */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '14px',
              borderTop: '1px solid var(--mfe-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              minHeight: '44px',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)' }}>
              Decoupled architecture with unified global event bus
            </span>
            <Button
              variant="outline"
              size="sm"
              icon={ExternalLink}
              onClick={() => {
                if (onNavigate) onNavigate('/mesh');
                else window.location.pathname = '/mesh';
              }}
            >
              Inspect Mesh Topology
            </Button>
          </div>
        </Card>

        {/* ========================================================================= */}
        {/* ROW 2 RIGHT: Global Event Bus & Shared State Cache                         */}
        {/* ========================================================================= */}
        <Card
          title="Global Event Bus & Shared Cache"
          className="mfe-stagger-5"
          subtitle="Live inspectable cross-app pubsub events and memory cache"
          icon={Layers}
          style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
          action={
            <Badge variant="success" size="sm" dot>
              PubSub Active
            </Badge>
          }
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            {[
              { key: 'auth.currentUser', value: `${currentUser?.name || 'Sarah Jenkins'} (${currentUser?.role || 'Admin'})`, note: 'Reactive JWT Session' },
              { key: 'users.activeMembers', value: `${activeUserCount.toLocaleString()} synced records`, note: 'Cross-MFE State' },
              { key: 'mesh.topologyCluster', value: '5 connected modules (:5000-:5004)', note: 'Module Federation 2.0' },
              { key: 'notifs.pubsubChannel', value: '100% deliverability rate', note: 'Global DOM & EventBus' },
              { key: 'security.zeroTrustBoundary', value: 'COOP / COEP Enforced • RSA-256 Validated', note: 'Isolated Boundary Guard' }
            ].map((item, idx) => (
              <div
                key={idx}
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border-subtle)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px',
                  minHeight: '56px',
                  boxSizing: 'border-box'
                }}
                className="mfe-table-row"
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--mfe-font-mono)', color: 'var(--mfe-primary)' }}>
                    {item.key}
                  </div>
                  <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                    {item.note}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-primary)' }}>
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Bus Utility Bar */}
          <div
            style={{
              marginTop: 'auto',
              paddingTop: '14px',
              borderTop: '1px solid var(--mfe-border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px',
              minHeight: '44px',
              boxSizing: 'border-box'
            }}
          >
            <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span className="mfe-pulse-dot" style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--mfe-success)' }} />
              Singleton Bus Registered
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button
                variant="outline"
                size="sm"
                icon={RefreshCw}
                onClick={() => {
                  mockApi.addNotification({
                    title: 'Shared State Refreshed',
                    message: 'Global Event Bus cache re-synchronized with 0 dropped events.',
                    category: 'System',
                    priority: 'info'
                  });
                }}
              >
                Re-Sync Bus
              </Button>
            </div>
          </div>
        </Card>
      </div>


      {/* ========================================================================= */}
      {/* BOTTOM SECTION 2: 90-Day SLA & Runtime Telemetry Card                     */}
      {/* ========================================================================= */}
      <Card
        title="Federated System Reliability & 90-Day SLA"
        className="mfe-stagger-6"
        subtitle="Continuous health monitoring, cache optimization, and zero-downtime rolling updates"
        icon={ShieldCheck}
        action={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Badge variant="success" size="sm" dot>
              100% Operational
            </Badge>
            <Button
              variant="secondary"
              size="sm"
              icon={RefreshCw}
              isLoading={isHealthChecking}
              onClick={handleGlobalHealthCheck}
            >
              Run Global Diagnostics
            </Button>
          </div>
        }
      >
        {healthCheckNotice && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 'var(--mfe-radius-md)',
              background: 'var(--mfe-success-bg)',
              color: 'var(--mfe-success)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '16px'
            }}
          >
            <CheckCircle2 size={16} />
            <span>{healthCheckNotice}</span>
          </div>
        )}

        {/* 90-Day Uptime Bar Graph */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              90-Day Service Availability
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--mfe-success)', fontWeight: 700 }}>
              99.98% Uptime • 0 Critical Incidents
            </span>
          </div>
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center', width: '100%', height: '24px' }}>
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                title={`Day ${i + 1}: 100% operational, 0 anomalies`}
                style={{
                  flex: 1,
                  height: '100%',
                  borderRadius: '3px',
                  background: i === 31 ? 'var(--mfe-warning)' : 'var(--mfe-success)',
                  opacity: i === 31 ? 0.9 : 0.85,
                  cursor: 'pointer',
                  transition: 'transform 0.15s ease, opacity 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scaleY(1.2)'; e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scaleY(1)'; e.currentTarget.style.opacity = '0.85'; }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.6875rem', color: 'var(--mfe-text-muted)' }}>
            <span>90 days ago</span>
            <span>Today (100% Operational)</span>
          </div>
        </div>

        {/* 4 Performance Gauges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '12px 14px', borderRadius: 'var(--mfe-radius-md)', background: 'var(--mfe-bg-surface)', border: '1px solid var(--mfe-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Global Cache Hit</span>
              <Badge variant="primary" size="sm">L1/L2</Badge>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>97.8%</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-success)', marginTop: '2px' }}>0.4ms cache retrieval</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--mfe-radius-md)', background: 'var(--mfe-bg-surface)', border: '1px solid var(--mfe-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Avg Time to Interactive</span>
              <Badge variant="success" size="sm">TTI</Badge>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>142ms</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-success)', marginTop: '2px' }}>Sub-millisecond chunks</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--mfe-radius-md)', background: 'var(--mfe-bg-surface)', border: '1px solid var(--mfe-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>PubSub Event Volume</span>
              <Badge variant="warning" size="sm">Bus</Badge>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>1.42M</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>Zero dropped packets</div>
          </div>

          <div style={{ padding: '12px 14px', borderRadius: 'var(--mfe-radius-md)', background: 'var(--mfe-bg-surface)', border: '1px solid var(--mfe-border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)', fontWeight: 600 }}>Isolated Memory</span>
              <Badge variant="neutral" size="sm">V8</Badge>
            </div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>48.2 MB</div>
            <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-success)', marginTop: '2px' }}>Independent heaps</div>
          </div>
        </div>
      </Card>

      {/* ========================================================================= */}
      {/* BOTTOM SECTION 3: Governance & Audit Export Bar                            */}
      {/* ========================================================================= */}
      <div
        style={{
          padding: '16px 20px',
          borderRadius: 'var(--mfe-radius-lg)',
          background: 'var(--mfe-bg-card)',
          border: '1px solid var(--mfe-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px',
          boxShadow: 'var(--mfe-shadow-sm)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'rgba(245, 158, 11, 0.12)',
              border: '1px solid rgba(245, 158, 11, 0.28)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--mfe-primary)'
            }}
          >
            <Terminal size={18} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
              Architecture Governance & Audit Ledger
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
              Cryptographically signed activity stream preserved in global cross-app memory
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {ledgerActionNotice && (
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--mfe-success)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                background: 'var(--mfe-success-bg)',
                borderRadius: 'var(--mfe-radius-full)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                animation: 'mfe-fadeIn 0.2s ease-out'
              }}
            >
              <CheckCircle2 size={13} />
              {ledgerActionNotice}
            </span>
          )}
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportAuditLog}
            title="Download the current session's activities in JSON format"
          >
            Export Ledger (JSON)
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={Share2}
            onClick={handleSimulateQuickAlert}
            title="Broadcast a cross-app notification"
          >
            Emit Global Alert
          </Button>
        </div>
      </div>

      {/* Interactive Custom Event Dispatcher Modal */}
      <Modal
        isOpen={isDispatcherOpen}
        onClose={() => setIsDispatcherOpen(false)}
        title="Interactive Custom Event Dispatcher"
        subtitle="Broadcast custom PubSub payloads directly across federated micro-frontend boundaries"
        maxWidth="580px"
        footer={
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Radio size={12} color="var(--mfe-success)" />
              5 Remotes Listening
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              <Button variant="outline" size="sm" onClick={() => setIsDispatcherOpen(false)}>
                Close
              </Button>
              <Button variant="primary" size="sm" icon={Send} onClick={handleDispatchCustomEvent}>
                Dispatch into Mesh
              </Button>
            </div>
          </div>
        }
      >
        <form onSubmit={handleDispatchCustomEvent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Dispatch Receipt Banner if present */}
          {dispatchReceipt && (
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.12) 100%)',
                border: '1px solid rgba(16, 185, 129, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                animation: 'mfe-fadeIn 0.2s ease-out'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} color="var(--mfe-success)" />
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                  Dispatched to [{dispatchReceipt.channel}]
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>
                <span>
                  Latency: <strong style={{ color: 'var(--mfe-success)' }}>{dispatchReceipt.latency}</strong>
                </span>
                <span>•</span>
                <span>{dispatchReceipt.time}</span>
              </div>
            </div>
          )}

          {/* Event Channel Selector */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Target PubSub Channel
            </label>
            <select
              value={dispatcherChannel}
              onChange={(e) => setDispatcherChannel(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--mfe-bg-surface)',
                border: '1px solid var(--mfe-border)',
                borderRadius: 'var(--mfe-radius-md)',
                color: 'var(--mfe-text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              <option value="mfe:notification:add">mfe:notification:add (Cross-App Incident Alert)</option>
              <option value="mfe:activity:logged">mfe:activity:logged (Federated Audit Stream Entry)</option>
              <option value="mfe:metrics:refresh">mfe:metrics:refresh (Recalculate Telemetry & KPIs)</option>
              <option value="mfe:system:toast">mfe:system:toast (Global Flash Toast Banner)</option>
            </select>
          </div>

          {/* Event Title */}
          <Input
            label="Signal Title / Action"
            placeholder={
              dispatcherChannel === 'mfe:notification:add'
                ? 'e.g. Rate Limit Warning on Gateway 04'
                : dispatcherChannel === 'mfe:activity:logged'
                ? 'e.g. rotated cluster cryptographic credentials'
                : 'e.g. Scheduled sync pulse'
            }
            value={dispatcherTitle}
            onChange={(e) => setDispatcherTitle(e.target.value)}
          />

          {/* Event Message */}
          <div>
            <label style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
              Payload Detail / Description
            </label>
            <textarea
              rows={2}
              placeholder="Enter message details or context to transmit across remotes..."
              value={dispatcherMessage}
              onChange={(e) => setDispatcherMessage(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                background: 'var(--mfe-bg-surface)',
                border: '1px solid var(--mfe-border)',
                borderRadius: 'var(--mfe-radius-md)',
                color: 'var(--mfe-text-primary)',
                fontSize: '0.8125rem',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit'
              }}
            />
          </div>

          {/* Priority & Category Selectors */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Priority Level
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['info', 'warning', 'critical', 'success'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setDispatcherPriority(p)}
                    style={{
                      flex: 1,
                      padding: '6px 4px',
                      borderRadius: 'var(--mfe-radius-sm)',
                      border: dispatcherPriority === p ? '1.5px solid var(--mfe-primary)' : '1px solid var(--mfe-border)',
                      background: dispatcherPriority === p ? 'rgba(99, 102, 241, 0.15)' : 'var(--mfe-bg-surface)',
                      color: dispatcherPriority === p ? 'var(--mfe-primary)' : 'var(--mfe-text-muted)',
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      cursor: 'pointer'
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-secondary)', display: 'block', marginBottom: '6px' }}>
                Category Domain
              </label>
              <select
                value={dispatcherCategory}
                onChange={(e) => setDispatcherCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 10px',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  borderRadius: 'var(--mfe-radius-md)',
                  color: 'var(--mfe-text-primary)',
                  fontSize: '0.75rem',
                  outline: 'none'
                }}
              >
                <option value="System">System</option>
                <option value="Security">Security</option>
                <option value="Analytics">Analytics</option>
                <option value="Team">Team</option>
              </select>
            </div>
          </div>

          {/* Live JSON Payload Inspector */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.6875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--mfe-text-muted)' }}>
                Live Transmission Payload (JSON)
              </span>
              <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-success)' }}>UTF-8 Validated</span>
            </div>
            <pre
              style={{
                margin: 0,
                padding: '10px 12px',
                borderRadius: 'var(--mfe-radius-md)',
                background: 'var(--mfe-bg-card)',
                border: '1px solid var(--mfe-border)',
                color: 'var(--mfe-accent, #38bdf8)',
                fontSize: '0.6875rem',
                fontFamily: 'monospace',
                overflowX: 'auto'
              }}
            >
              {JSON.stringify(
                {
                  event: dispatcherChannel,
                  payload: {
                    title: dispatcherTitle.trim() || 'Custom Mesh Signal',
                    message: dispatcherMessage.trim() || `Asynchronous broadcast via ${dispatcherChannel}.`,
                    category: dispatcherCategory,
                    priority: dispatcherPriority,
                    timestamp: 'Just now'
                  }
                },
                null,
                2
              )}
            </pre>
          </div>
        </form>
      </Modal>
    </div>
  );
}
