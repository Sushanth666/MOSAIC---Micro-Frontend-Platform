/**
 * Micro-Frontend Shared Bus & State Bridge
 * Provides decoupled event dispatching and cross-module synchronization.
 */

export const MFE_EVENTS = {
  // Auth Events
  AUTH_LOGIN: 'mfe:auth:login',
  AUTH_LOGOUT: 'mfe:auth:logout',
  AUTH_SESSION_EXPIRED: 'mfe:auth:session_expired',
  AUTH_USER_UPDATED: 'mfe:auth:user_updated',

  // Notification Events
  NOTIFICATION_ADD: 'mfe:notification:add',
  NOTIFICATION_READ: 'mfe:notification:read',
  NOTIFICATION_CLEAR_ALL: 'mfe:notification:clear_all',
  NOTIFICATION_COUNT_UPDATE: 'mfe:notification:count_update',

  // User Management Events
  USER_CREATED: 'mfe:user:created',
  USER_UPDATED: 'mfe:user:updated',
  USER_DELETED: 'mfe:user:deleted',

  // Dashboard / Analytics Events
  ACTIVITY_LOGGED: 'mfe:activity:logged',
  METRICS_REFRESH: 'mfe:metrics:refresh',

  // System & Mesh Events
  THEME_CHANGED: 'mfe:system:theme_changed',
  GLOBAL_TOAST: 'mfe:system:toast',
  MESH_STATUS_CHANGED: 'mfe:mesh:status_changed'
};

class MicroEventBus {
  constructor() {
    this.listeners = new Map();
  }

  emit(eventName, detail = {}) {
    const payload = { ...detail, _mfeTimestamp: Date.now() };

    // 1. Dispatch custom DOM event on window for decoupled cross-module communication
    if (typeof window !== 'undefined') {
      try {
        const customEvent = new CustomEvent(eventName, { detail: payload });
        window.dispatchEvent(customEvent);
      } catch (e) {
        console.error('[EventBus DOM Dispatch Error]', e);
      }
    }

    // 2. Direct callback dispatch to local listeners
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).forEach((callback) => {
        try {
          callback(payload);
        } catch (err) {
          console.error(`[EventBus] Error in listener for "${eventName}":`, err);
        }
      });
    }
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(callback);

    // Also listen to DOM events from other micro-frontends
    let domListener = null;
    if (typeof window !== 'undefined') {
      domListener = (e) => {
        try {
          if (e && e.detail) {
            callback(e.detail);
          }
        } catch (err) {
          console.error(`[EventBus DOM Listener Error] "${eventName}":`, err);
        }
      };
      window.addEventListener(eventName, domListener);
    }

    return () => {
      this.off(eventName, callback);
      if (typeof window !== 'undefined' && domListener) {
        window.removeEventListener(eventName, domListener);
      }
    };
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).delete(callback);
    }
  }
}

// Ensure persistent window-wide singleton across all federated micro-frontends
if (typeof window !== 'undefined') {
  if (!window.__MFE_GLOBAL_EVENT_BUS__) {
    window.__MFE_GLOBAL_EVENT_BUS__ = new MicroEventBus();
  }
}

export const eventBus = (typeof window !== 'undefined' && window.__MFE_GLOBAL_EVENT_BUS__)
  ? window.__MFE_GLOBAL_EVENT_BUS__
  : new MicroEventBus();

// Persistent Mock Auth Store
const AUTH_STORAGE_KEY = 'mfe_auth_user_v1';
const TOKEN_STORAGE_KEY = 'mfe_auth_token_v1';

export const DEMO_USERS = [
  {
    id: 'usr_admin_1',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@mosaic.io',
    role: 'Admin',
    avatar: 'initials',
    title: 'VP of Platform Engineering',
    status: 'Active',
    joined: 'Jan 12, 2024'
  },
  {
    id: 'usr_editor_2',
    name: 'Marcus Vance',
    email: 'marcus.vance@mosaic.io',
    role: 'Editor',
    avatar: 'initials',
    title: 'Senior Product Manager',
    status: 'Active',
    joined: 'Mar 24, 2024'
  },
  {
    id: 'usr_viewer_3',
    name: 'Elena Rostova',
    email: 'elena.rostova@mosaic.io',
    role: 'Viewer',
    avatar: 'initials',
    title: 'Data Analyst Intern',
    status: 'Active',
    joined: 'Jun 01, 2024'
  }
];

export const PERMISSIONS = {
  USERS_VIEW: 'users:view',
  USERS_CREATE: 'users:create',
  USERS_EDIT: 'users:edit',
  USERS_DELETE: 'users:delete',
  NOTIFS_VIEW: 'notifs:view',
  NOTIFS_TRIGGER: 'notifs:trigger',
  NOTIFS_CLEAR: 'notifs:clear',
  ANALYTICS_VIEW: 'analytics:view',
  ANALYTICS_EXPORT: 'analytics:export',
  CHAOS_SIMULATE: 'chaos:simulate',
  PROFILE_EDIT: 'profile:edit'
};

export const ROLE_PERMISSIONS = {
  Admin: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.USERS_DELETE,
    PERMISSIONS.NOTIFS_VIEW,
    PERMISSIONS.NOTIFS_TRIGGER,
    PERMISSIONS.NOTIFS_CLEAR,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.CHAOS_SIMULATE,
    PERMISSIONS.PROFILE_EDIT
  ],
  Editor: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.USERS_CREATE,
    PERMISSIONS.USERS_EDIT,
    PERMISSIONS.NOTIFS_VIEW,
    PERMISSIONS.NOTIFS_TRIGGER,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.ANALYTICS_EXPORT,
    PERMISSIONS.PROFILE_EDIT
  ],
  Viewer: [
    PERMISSIONS.USERS_VIEW,
    PERMISSIONS.NOTIFS_VIEW,
    PERMISSIONS.ANALYTICS_VIEW,
    PERMISSIONS.PROFILE_EDIT
  ]
};

export const authStore = {
  getCurrentUser() {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw || raw === 'guest' || raw === 'null') {
        return null;
      }
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  getAuthToken() {
    if (typeof window === 'undefined') return null;
    if (this.getCurrentUser() === null) return null;
    return localStorage.getItem(TOKEN_STORAGE_KEY) || 'mock-mfe-jwt-token-998811';
  },

  hasPermission(perm, customUser = null) {
    const user = customUser !== null && customUser !== undefined ? customUser : this.getCurrentUser();
    if (!user || !user.role) return false;
    const allowed = ROLE_PERMISSIONS[user.role] || [];
    return allowed.includes(perm);
  },

  updateUserProfile(updates) {
    if (typeof window === 'undefined') return null;
    const current = this.getCurrentUser();
    if (!current) return null;
    const updated = { ...current, ...updates };
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updated));
    eventBus.emit(MFE_EVENTS.AUTH_USER_UPDATED, { user: updated });
    eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
      id: `act_${Date.now()}`,
      user: updated.name,
      action: 'updated profile details and preferences',
      timestamp: 'Just now',
      type: 'auth'
    });
    return updated;
  },

  getSessions() {
    if (!this.getCurrentUser()) return [];
    return [
      { id: 'sess_1', device: 'Chrome on Windows 11', location: 'San Francisco, US', ip: '192.168.1.45', isCurrent: true, lastActive: 'Active Now' },
      { id: 'sess_2', device: 'Mobile Safari on iPhone 15 Pro', location: 'San Jose, US', ip: '172.56.21.9', isCurrent: false, lastActive: '2h ago' }
    ];
  },

  getApiToken() {
    if (typeof window === 'undefined' || !this.getCurrentUser()) return '';
    return localStorage.getItem('mfe_pat_token_v1') || 'mfe_pat_prod_89f3a928c0e1b23';
  },

  regenerateApiToken() {
    if (typeof window === 'undefined' || !this.getCurrentUser()) return '';
    const newToken = `mfe_pat_prod_${Math.random().toString(36).substring(2)}${Math.random().toString(36).substring(2)}`;
    localStorage.setItem('mfe_pat_token_v1', newToken);
    return newToken;
  },

  login(user) {
    if (typeof window === 'undefined') return;
    const token = `mfe-jwt-${Date.now()}-${Math.random().toString(36).substring(2)}`;
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    localStorage.removeItem('mfe_is_guest');
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    eventBus.emit(MFE_EVENTS.AUTH_LOGIN, { user, token });
    eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
      id: `act_${Date.now()}`,
      user: user.name,
      action: 'signed into the dashboard',
      timestamp: 'Just now',
      type: 'auth'
    });
  },

  logout() {
    if (typeof window === 'undefined') return;
    const previousUser = this.getCurrentUser();
    localStorage.setItem(AUTH_STORAGE_KEY, 'guest');
    localStorage.setItem('mfe_is_guest', 'true');
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    eventBus.emit(MFE_EVENTS.AUTH_LOGOUT, { previousUser });
    if (previousUser) {
      eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
        id: `act_${Date.now()}`,
        user: previousUser.name,
        action: 'signed out from current session',
        timestamp: 'Just now',
        type: 'auth'
      });
    }
  },

  isAuthenticated() {
    return Boolean(this.getCurrentUser());
  }
};

// Initial Seed Users for User Management
const INITIAL_USERS = [
  ...DEMO_USERS,
  {
    id: 'usr_4',
    name: 'David Chen',
    email: 'david.chen@mosaic.io',
    role: 'Editor',
    avatar: 'initials',
    title: 'Staff Architect',
    status: 'Active',
    joined: 'Feb 15, 2024'
  },
  {
    id: 'usr_5',
    name: 'Amara Okafor',
    email: 'amara.okafor@mosaic.io',
    role: 'Viewer',
    avatar: 'initials',
    title: 'Marketing Specialist',
    status: 'Suspended',
    joined: 'Apr 02, 2024'
  },
  {
    id: 'usr_6',
    name: 'Liam Neeson',
    email: 'liam.neeson@mosaic.io',
    role: 'Editor',
    avatar: 'initials',
    title: 'DevOps Lead',
    status: 'Pending',
    joined: 'Jul 19, 2024'
  },
  {
    id: 'usr_7',
    name: 'Chloe Zhao',
    email: 'chloe.zhao@mosaic.io',
    role: 'Admin',
    avatar: 'initials',
    title: 'Security Operations',
    status: 'Active',
    joined: 'Aug 05, 2024'
  }
];

const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif_1',
    title: 'Module Federation Sync',
    message: 'Analytics remote bundle v2.4.0 successfully compiled and loaded.',
    category: 'System',
    priority: 'info',
    timestamp: '5m ago',
    read: false
  },
  {
    id: 'notif_2',
    title: 'Security Anomaly Mitigated',
    message: 'Automated rate limiting throttled 42 suspicious auth requests.',
    category: 'Security',
    priority: 'warning',
    timestamp: '22m ago',
    read: false
  },
  {
    id: 'notif_3',
    title: 'New Member Onboarded',
    message: 'David Chen was assigned the Editor role in team workspace.',
    category: 'Team',
    priority: 'success',
    timestamp: '1h ago',
    read: true
  },
  {
    id: 'notif_4',
    title: 'Database Shard Re-index',
    message: 'Quarterly analytics index optimization completed with 0 downtime.',
    category: 'System',
    priority: 'info',
    timestamp: '3h ago',
    read: true
  }
];

const INITIAL_ACTIVITIES = [
  {
    id: 'act_1',
    user: 'Sarah Jenkins',
    action: 'promoted Liam Neeson to DevOps Lead',
    timestamp: '12m ago',
    type: 'team'
  },
  {
    id: 'act_2',
    user: 'System Bot',
    action: 'backed up micro-frontend state store',
    timestamp: '45m ago',
    type: 'system'
  },
  {
    id: 'act_3',
    user: 'Marcus Vance',
    action: 'exported Q3 Revenue & Traffic Report (CSV)',
    timestamp: '2h ago',
    type: 'analytics'
  },
  {
    id: 'act_4',
    user: 'Elena Rostova',
    action: 'updated notification alert preferences',
    timestamp: '4h ago',
    type: 'settings'
  },
  {
    id: 'act_5',
    user: 'David Chen',
    action: 'compiled and hot-reloaded Analytics Remote v2.4.0',
    timestamp: '5h ago',
    type: 'system'
  },
  {
    id: 'act_6',
    user: 'Sarah Jenkins',
    action: 'enforced Zero-Trust RBAC access policy on Shell Gateway',
    timestamp: '7h ago',
    type: 'security'
  },
  {
    id: 'act_7',
    user: 'System Bot',
    action: 'auto-scaled User Management MFE replica to 4 instances',
    timestamp: '9h ago',
    type: 'system'
  },
  {
    id: 'act_8',
    user: 'Marcus Vance',
    action: 'synchronized Cross-App PubSub Event Bus cache',
    timestamp: '12h ago',
    type: 'analytics'
  },
  {
    id: 'act_9',
    user: 'Elena Rostova',
    action: 'configured Prometheus latency alert on Port :5004',
    timestamp: '14h ago',
    type: 'analytics'
  },
  {
    id: 'act_10',
    user: 'System Bot',
    action: 'rotated mutual TLS certificates across federated domain mesh',
    timestamp: '16h ago',
    type: 'security'
  },
  {
    id: 'act_11',
    user: 'Sarah Jenkins',
    action: 'dispatched global PubSub schema v2.4 handshake payload',
    timestamp: '18h ago',
    type: 'team'
  },
  {
    id: 'act_12',
    user: 'Alex Mercer',
    action: 'registered GraphQL Federation query gateway endpoint',
    timestamp: '1d ago',
    type: 'system'
  },
  {
    id: 'act_13',
    user: 'System Bot',
    action: 'automated memory garbage collection on Host shell runtime',
    timestamp: '1d ago',
    type: 'system'
  },
  {
    id: 'act_14',
    user: 'Marcus Vance',
    action: 'validated SOC-2 Type II audit trail compliance log',
    timestamp: '2d ago',
    type: 'security'
  }
];

// Persistent state cache in localStorage
const USERS_STORAGE_KEY = 'mfe_users_db_v1';
const NOTIFS_STORAGE_KEY = 'mfe_notifs_db_v1';
const ACTIVITIES_STORAGE_KEY = 'mfe_activities_db_v2';

function getStored(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const data = localStorage.getItem(key);
    if (!data) return fallback;
    let parsed = JSON.parse(data);

    const purgedNames = ['kenji sato', 'ingrid bergman', 'sophia loren', 'alex rivera', 'zara phillips'];

    if (key === USERS_STORAGE_KEY && Array.isArray(parsed)) {
      const filtered = parsed.filter((u) => {
        const email = (u.email || '').toLowerCase().trim();
        const name = (u.name || '').toLowerCase().trim();
        return !email.endsWith('@hyperion.io') && !purgedNames.includes(name);
      });
      const seenEmails = new Set();
      const seenNames = new Set();
      const deduped = [];
      for (const u of filtered) {
        const email = (u.email || '').toLowerCase().trim();
        const name = (u.name || '').toLowerCase().trim();
        if (email && seenEmails.has(email)) continue;
        if (name && seenNames.has(name)) continue;
        if (email) seenEmails.add(email);
        if (name) seenNames.add(name);
        deduped.push(u);
      }
      parsed = deduped;
      localStorage.setItem(key, JSON.stringify(parsed));
    }

    if (key === ACTIVITIES_STORAGE_KEY && Array.isArray(parsed)) {
      const filtered = parsed.filter((a) => {
        const text = `${a.user || ''} ${a.action || ''}`.toLowerCase();
        return !purgedNames.some((n) => text.includes(n)) && !text.includes('@hyperion.io');
      });
      const seenActs = new Set();
      const deduped = [];
      for (const a of filtered) {
        const sig = `${(a.user || '').trim().toLowerCase()}::${(a.action || '').trim().toLowerCase()}`;
        if (!seenActs.has(sig)) {
          seenActs.add(sig);
          deduped.push(a);
        }
      }
      parsed = deduped;
      localStorage.setItem(key, JSON.stringify(parsed));
    }

    if (key === NOTIFS_STORAGE_KEY && Array.isArray(parsed)) {
      const filtered = parsed.filter((n) => {
        const text = `${n.title || ''} ${n.message || ''}`.toLowerCase();
        return !purgedNames.some((n) => text.includes(n)) && !text.includes('@hyperion.io');
      });
      const seenNotifs = new Set();
      const deduped = [];
      for (const n of filtered) {
        const sig = `${(n.title || '').trim().toLowerCase()}::${(n.message || '').trim().toLowerCase()}`;
        if (!seenNotifs.has(sig)) {
          seenNotifs.add(sig);
          deduped.push(n);
        }
      }
      parsed = deduped;
      localStorage.setItem(key, JSON.stringify(parsed));
    }

    return parsed;
  } catch {
    return fallback;
  }
}

function setStored(key, val) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('Storage quota exceeded or error:', e);
  }
}

// Immediate browser storage sanitization on module execution (removes all duplicates)
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const rawUsers = localStorage.getItem(USERS_STORAGE_KEY);
    if (rawUsers) {
      const parsed = JSON.parse(rawUsers);
      if (Array.isArray(parsed)) {
        const purged = ['kenji sato', 'ingrid bergman', 'sophia loren', 'alex rivera', 'zara phillips'];
        const seenEmails = new Set();
        const seenNames = new Set();
        const cleaned = [];
        for (const u of parsed) {
          const email = (u.email || '').toLowerCase().trim();
          const name = (u.name || '').toLowerCase().trim();
          if (email.endsWith('@hyperion.io') || purged.includes(name)) continue;
          if (email && seenEmails.has(email)) continue;
          if (name && seenNames.has(name)) continue;
          if (email) seenEmails.add(email);
          if (name) seenNames.add(name);
          cleaned.push(u);
        }
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(cleaned));
      }
    }

    const rawActs = localStorage.getItem(ACTIVITIES_STORAGE_KEY);
    if (rawActs) {
      const parsed = JSON.parse(rawActs);
      if (Array.isArray(parsed)) {
        const seen = new Set();
        const cleaned = [];
        for (const a of parsed) {
          const sig = `${(a.user || '').trim().toLowerCase()}::${(a.action || '').trim().toLowerCase()}`;
          if (!seen.has(sig)) {
            seen.add(sig);
            cleaned.push(a);
          }
        }
        localStorage.setItem(ACTIVITIES_STORAGE_KEY, JSON.stringify(cleaned));
      }
    }

    const rawNotifs = localStorage.getItem(NOTIFS_STORAGE_KEY);
    if (rawNotifs) {
      const parsed = JSON.parse(rawNotifs);
      if (Array.isArray(parsed)) {
        const seen = new Set();
        const cleaned = [];
        for (const n of parsed) {
          const sig = `${(n.title || '').trim().toLowerCase()}::${(n.message || '').trim().toLowerCase()}`;
          if (!seen.has(sig)) {
            seen.add(sig);
            cleaned.push(n);
          }
        }
        localStorage.setItem(NOTIFS_STORAGE_KEY, JSON.stringify(cleaned));
      }
    }
  } catch {}
}

// Enterprise Simulated API Service
export const mockApi = {
  // Users API
  async getUsers({ search = '', role = 'ALL', status = 'ALL', page = 1, limit = 5, forceError = false } = {}) {
    await new Promise((r) => setTimeout(r, 400)); // simulated latency
    if (meshStore?.areAllApisOff && meshStore.areAllApisOff()) {
      return { data: [], total: 0, page: 1, totalPages: 1 };
    }
    if (forceError) {
      throw new Error('500 Internal Server Error: Failed to fetch users database.');
    }
    let users = getStored(USERS_STORAGE_KEY, INITIAL_USERS);

    const purged = ['kenji sato', 'ingrid bergman', 'sophia loren', 'alex rivera', 'zara phillips'];
    users = users.filter((u) => {
      const email = (u.email || '').toLowerCase().trim();
      const name = (u.name || '').toLowerCase().trim();
      return !email.endsWith('@hyperion.io') && !purged.includes(name);
    });

    // Deduplicate existing users by email to clean up any past test artifacts and ensure avatar is initials
    const uniqueMap = new Map();
    for (const u of users) {
      const key = (u.email || u.id || '').toLowerCase().trim();
      if (!uniqueMap.has(key)) {
        uniqueMap.set(key, { ...u, avatar: 'initials' });
      }
    }
    users = Array.from(uniqueMap.values());
    setStored(USERS_STORAGE_KEY, users);

    if (search) {
      const q = search.toLowerCase();
      users = users.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.title.toLowerCase().includes(q));
    }
    if (role !== 'ALL') {
      users = users.filter((u) => u.role.toLowerCase() === role.toLowerCase());
    }
    if (status !== 'ALL') {
      users = users.filter((u) => u.status.toLowerCase() === status.toLowerCase());
    }
    const total = users.length;
    const startIndex = (page - 1) * limit;
    const paginated = users.slice(startIndex, startIndex + limit);
    return { data: paginated, total, page, totalPages: Math.ceil(total / limit) || 1 };
  },

  async createUser(userData) {
    await new Promise((r) => setTimeout(r, 350));
    let users = getStored(USERS_STORAGE_KEY, INITIAL_USERS);

    // Guarantee unique name and email without collision
    let finalEmail = (userData.email || `user.${Date.now()}@mosaic.io`).toLowerCase().trim();
    let finalName = userData.name || 'New Contributor';

    const emailTaken = users.some((u) => (u.email || '').toLowerCase().trim() === finalEmail);
    if (emailTaken) {
      const randSuffix = Math.floor(100 + Math.random() * 900);
      finalEmail = finalEmail.replace('@', `.${randSuffix}@`);
      finalName = `${finalName} (${randSuffix})`;
    }

    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      joined: 'Just now',
      avatar: 'initials',
      ...userData,
      name: finalName,
      email: finalEmail
    };

    users.unshift(newUser);
    setStored(USERS_STORAGE_KEY, users);

    // Broadcast across micro-frontends
    eventBus.emit(MFE_EVENTS.USER_CREATED, newUser);
    eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      user: authStore.getCurrentUser()?.name || 'Admin',
      action: `created user account for "${newUser.name}" (${newUser.role})`,
      timestamp: 'Just now',
      type: 'user'
    });
    eventBus.emit(MFE_EVENTS.NOTIFICATION_ADD, {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      title: 'New Team Member',
      message: `${newUser.name} (${newUser.title || newUser.role}) joined the team.`,
      category: 'Team',
      priority: 'success',
      timestamp: 'Just now',
      read: false
    });

    return newUser;
  },

  async updateUser(id, updates) {
    await new Promise((r) => setTimeout(r, 450));
    let users = getStored(USERS_STORAGE_KEY, INITIAL_USERS);
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');
    users[index] = { ...users[index], ...updates };
    setStored(USERS_STORAGE_KEY, users);

    eventBus.emit(MFE_EVENTS.USER_UPDATED, users[index]);
    eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
      id: `act_${Date.now()}`,
      user: authStore.getCurrentUser()?.name || 'Admin',
      action: `updated profile details for "${users[index].name}"`,
      timestamp: 'Just now',
      type: 'user'
    });
    return users[index];
  },

  async deleteUser(id) {
    await new Promise((r) => setTimeout(r, 400));
    let users = getStored(USERS_STORAGE_KEY, INITIAL_USERS);
    const target = users.find((u) => u.id === id);
    users = users.filter((u) => u.id !== id);
    setStored(USERS_STORAGE_KEY, users);

    if (target) {
      eventBus.emit(MFE_EVENTS.USER_DELETED, { id, user: target });
      eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
        id: `act_${Date.now()}`,
        user: authStore.getCurrentUser()?.name || 'Admin',
        action: `removed account of "${target.name}"`,
        timestamp: 'Just now',
        type: 'user'
      });
    }
    return { success: true, id };
  },

  async bulkDeleteUsers(ids = []) {
    await new Promise((r) => setTimeout(r, 450));
    let users = getStored(USERS_STORAGE_KEY, INITIAL_USERS);
    const idSet = new Set(ids);
    const deletedTargets = users.filter((u) => idSet.has(u.id));
    users = users.filter((u) => !idSet.has(u.id));
    setStored(USERS_STORAGE_KEY, users);

    deletedTargets.forEach((target) => {
      eventBus.emit(MFE_EVENTS.USER_DELETED, { id: target.id, user: target });
    });

    if (deletedTargets.length > 0) {
      eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
        id: `act_${Date.now()}`,
        user: authStore.getCurrentUser()?.name || 'Admin',
        action: `bulk removed ${deletedTargets.length} member accounts`,
        timestamp: 'Just now',
        type: 'user'
      });
      eventBus.emit(MFE_EVENTS.NOTIFICATION_ADD, {
        id: `notif_${Date.now()}`,
        title: 'Batch Members Removed',
        message: `Successfully deleted ${deletedTargets.length} members from workspace.`,
        category: 'Team',
        priority: 'warning',
        timestamp: 'Just now',
        read: false
      });
    }
    return { success: true, count: deletedTargets.length };
  },

  async bulkUpdateUsers(ids = [], updates = {}) {
    await new Promise((r) => setTimeout(r, 400));
    let users = getStored(USERS_STORAGE_KEY, INITIAL_USERS);
    const idSet = new Set(ids);
    let updatedCount = 0;
    users = users.map((u) => {
      if (idSet.has(u.id)) {
        updatedCount++;
        const updated = { ...u, ...updates };
        eventBus.emit(MFE_EVENTS.USER_UPDATED, updated);
        return updated;
      }
      return u;
    });
    setStored(USERS_STORAGE_KEY, users);

    if (updatedCount > 0) {
      const fieldDesc = Object.entries(updates)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ');
      eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
        id: `act_${Date.now()}`,
        user: authStore.getCurrentUser()?.name || 'Admin',
        action: `bulk updated ${updatedCount} members (${fieldDesc})`,
        timestamp: 'Just now',
        type: 'user'
      });
      eventBus.emit(MFE_EVENTS.NOTIFICATION_ADD, {
        id: `notif_${Date.now()}`,
        title: 'Batch Update Completed',
        message: `Updated ${updatedCount} members to ${fieldDesc}.`,
        category: 'Team',
        priority: 'info',
        timestamp: 'Just now',
        read: false
      });
    }
    return { success: true, count: updatedCount };
  },

  // Notifications API
  getUnreadNotificationCountSync() {
    if (meshStore?.areAllApisOff && meshStore.areAllApisOff()) {
      return 0;
    }
    const list = getStored(NOTIFS_STORAGE_KEY, INITIAL_NOTIFICATIONS);
    return list.filter((n) => !n.read).length;
  },

  async getNotifications() {
    await new Promise((r) => setTimeout(r, 300));
    if (meshStore?.areAllApisOff && meshStore.areAllApisOff()) {
      return [];
    }
    return getStored(NOTIFS_STORAGE_KEY, INITIAL_NOTIFICATIONS);
  },

  async addNotification(notif) {
    const list = getStored(NOTIFS_STORAGE_KEY, INITIAL_NOTIFICATIONS);
    const newItem = {
      id: `notif_${Date.now()}`,
      timestamp: 'Just now',
      read: false,
      ...notif
    };
    list.unshift(newItem);
    setStored(NOTIFS_STORAGE_KEY, list);
    eventBus.emit(MFE_EVENTS.NOTIFICATION_ADD, newItem);
    eventBus.emit(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, {
      unread: list.filter((n) => !n.read).length
    });
    return newItem;
  },

  async markNotificationRead(id) {
    const list = getStored(NOTIFS_STORAGE_KEY, INITIAL_NOTIFICATIONS);
    const updated = list.map((n) => (n.id === id ? { ...n, read: true } : n));
    setStored(NOTIFS_STORAGE_KEY, updated);
    eventBus.emit(MFE_EVENTS.NOTIFICATION_READ, { id });
    eventBus.emit(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, {
      unread: updated.filter((n) => !n.read).length
    });
    return updated;
  },

  async markAllNotificationsRead() {
    const list = getStored(NOTIFS_STORAGE_KEY, INITIAL_NOTIFICATIONS);
    const updated = list.map((n) => ({ ...n, read: true }));
    setStored(NOTIFS_STORAGE_KEY, updated);
    eventBus.emit(MFE_EVENTS.NOTIFICATION_READ, { all: true });
    eventBus.emit(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, { unread: 0 });
    return updated;
  },

  async clearAllNotifications() {
    setStored(NOTIFS_STORAGE_KEY, []);
    eventBus.emit(MFE_EVENTS.NOTIFICATION_CLEAR_ALL, {});
    eventBus.emit(MFE_EVENTS.NOTIFICATION_COUNT_UPDATE, { unread: 0 });
    return [];
  },

  // Activities API
  async getActivities() {
    await new Promise((r) => setTimeout(r, 250));
    if (meshStore?.areAllApisOff && meshStore.areAllApisOff()) {
      return [];
    }
    const list = getStored(ACTIVITIES_STORAGE_KEY, INITIAL_ACTIVITIES);
    if (list.length < INITIAL_ACTIVITIES.length) {
      const existingIds = new Set(list.map((a) => a.id));
      const merged = [...list, ...INITIAL_ACTIVITIES.filter((a) => !existingIds.has(a.id))];
      setStored(ACTIVITIES_STORAGE_KEY, merged);
      return merged;
    }
    return list;
  },

  async logActivity(item) {
    const list = getStored(ACTIVITIES_STORAGE_KEY, INITIAL_ACTIVITIES);
    const newAct = {
      id: `act_${Date.now()}`,
      timestamp: 'Just now',
      ...item
    };
    list.unshift(newAct);
    if (list.length > 50) list.pop();
    setStored(ACTIVITIES_STORAGE_KEY, list);
    eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, newAct);
    return newAct;
  },

  // Analytics API
  async getAnalyticsMetrics(timeframe = '30D') {
    await new Promise((r) => setTimeout(r, 200));
    if (meshStore?.areAllApisOff && meshStore.areAllApisOff()) {
      return {
        trends: [],
        totals: {
          revenue: 0,
          activeUsers: 0,
          avgConversionRate: 0,
          systemUptime: '0.00%',
          peakWindow: '$0'
        },
        trafficSources: [],
        conversionFunnel: []
      };
    }

    let trends = [];
    let totals = {};
    let trafficSources = [];
    let conversionFunnel = [];

    if (timeframe === '7D') {
      trends = [
        { label: 'Mon', revenue: 14200, users: 1420, pageViews: 68000, conversion: 4.1 },
        { label: 'Tue', revenue: 19800, users: 1980, pageViews: 92000, conversion: 4.6 },
        { label: 'Wed', revenue: 17400, users: 1720, pageViews: 81000, conversion: 4.3 },
        { label: 'Thu', revenue: 22100, users: 2180, pageViews: 104000, conversion: 4.8 },
        { label: 'Fri', revenue: 26500, users: 2540, pageViews: 122000, conversion: 5.2 },
        { label: 'Sat', revenue: 12800, users: 1190, pageViews: 58000, conversion: 3.6 },
        { label: 'Sun', revenue: 10600, users: 1020, pageViews: 49000, conversion: 3.4 }
      ];
      totals = {
        revenue: 123400,
        activeUsers: 12050,
        avgConversionRate: 4.3,
        systemUptime: '99.99%',
        peakWindow: '$26,500'
      };
      trafficSources = [
        { source: 'Direct Search', share: 48, visits: 42600, color: '#38bdf8' },
        { source: 'Organic Referral', share: 24, visits: 21300, color: '#818cf8' },
        { source: 'Social Campaigns', share: 18, visits: 16000, color: '#a855f7' },
        { source: 'Email Broadcasts', share: 10, visits: 8900, color: '#10b981' }
      ];
      conversionFunnel = [
        { step: 'Page Impressions', value: 98000, dropoff: '0%' },
        { step: 'Product Views', value: 46500, dropoff: '52.5%' },
        { step: 'Added to Cart / Trial', value: 16200, dropoff: '65.1%' },
        { step: 'Checkout / Active Sub', value: 5900, dropoff: '63.6%' }
      ];
    } else if (timeframe === '90D') {
      trends = [
        { label: 'Wk 1-2', revenue: 142000, users: 11200, pageViews: 580000, conversion: 3.9 },
        { label: 'Wk 3-4', revenue: 168000, users: 13400, pageViews: 670000, conversion: 4.1 },
        { label: 'Wk 5-6', revenue: 154000, users: 12100, pageViews: 610000, conversion: 4.0 },
        { label: 'Wk 7-8', revenue: 198000, users: 15800, pageViews: 790000, conversion: 4.5 },
        { label: 'Wk 9-10', revenue: 235000, users: 18600, pageViews: 920000, conversion: 4.8 },
        { label: 'Wk 11-12', revenue: 278000, users: 21900, pageViews: 1080000, conversion: 5.1 }
      ];
      totals = {
        revenue: 1175000,
        activeUsers: 93000,
        avgConversionRate: 4.4,
        systemUptime: '99.97%',
        peakWindow: '$278,000'
      };
      trafficSources = [
        { source: 'Direct Search', share: 42, visits: 482000, color: '#38bdf8' },
        { source: 'Organic Referral', share: 28, visits: 321000, color: '#818cf8' },
        { source: 'Social Campaigns', share: 19, visits: 218000, color: '#a855f7' },
        { source: 'Email Broadcasts', share: 11, visits: 126000, color: '#10b981' }
      ];
      conversionFunnel = [
        { step: 'Page Impressions', value: 1150000, dropoff: '0%' },
        { step: 'Product Views', value: 546000, dropoff: '52.5%' },
        { step: 'Added to Cart / Trial', value: 190000, dropoff: '65.2%' },
        { step: 'Checkout / Active Sub', value: 69400, dropoff: '63.5%' }
      ];
    } else if (timeframe === '1Y') {
      trends = [
        { label: 'Jan', revenue: 118000, users: 9500, pageViews: 480000, conversion: 3.4 },
        { label: 'Feb', revenue: 132000, users: 10800, pageViews: 540000, conversion: 3.6 },
        { label: 'Mar', revenue: 154000, users: 12400, pageViews: 620000, conversion: 3.9 },
        { label: 'Apr', revenue: 148000, users: 11700, pageViews: 590000, conversion: 3.7 },
        { label: 'May', revenue: 182000, users: 14200, pageViews: 710000, conversion: 4.1 },
        { label: 'Jun', revenue: 210000, users: 16500, pageViews: 830000, conversion: 4.3 },
        { label: 'Jul', revenue: 238000, users: 18900, pageViews: 940000, conversion: 4.5 },
        { label: 'Aug', revenue: 224000, users: 17800, pageViews: 890000, conversion: 4.4 },
        { label: 'Sep', revenue: 272000, users: 21500, pageViews: 1080000, conversion: 4.8 },
        { label: 'Oct', revenue: 298000, users: 23400, pageViews: 1180000, conversion: 4.9 },
        { label: 'Nov', revenue: 342000, users: 27100, pageViews: 1360000, conversion: 5.2 },
        { label: 'Dec', revenue: 388000, users: 30500, pageViews: 1540000, conversion: 5.5 }
      ];
      totals = {
        revenue: 2706000,
        activeUsers: 214300,
        avgConversionRate: 4.4,
        systemUptime: '99.98%',
        peakWindow: '$388,000'
      };
      trafficSources = [
        { source: 'Direct Search', share: 45, visits: 2074000, color: '#38bdf8' },
        { source: 'Organic Referral', share: 27, visits: 1244000, color: '#818cf8' },
        { source: 'Social Campaigns', share: 17, visits: 783000, color: '#a855f7' },
        { source: 'Email Broadcasts', share: 11, visits: 507000, color: '#10b981' }
      ];
      conversionFunnel = [
        { step: 'Page Impressions', value: 4610000, dropoff: '0%' },
        { step: 'Product Views', value: 2190000, dropoff: '52.5%' },
        { step: 'Added to Cart / Trial', value: 764000, dropoff: '65.1%' },
        { step: 'Checkout / Active Sub', value: 279000, dropoff: '63.5%' }
      ];
    } else {
      // 30D (Default)
      trends = [
        { label: 'Day 1-5', revenue: 68400, users: 4800, pageViews: 240000, conversion: 3.9 },
        { label: 'Day 6-10', revenue: 82100, users: 5600, pageViews: 290000, conversion: 4.2 },
        { label: 'Day 11-15', revenue: 74500, users: 5100, pageViews: 265000, conversion: 4.0 },
        { label: 'Day 16-20', revenue: 93800, users: 6400, pageViews: 330000, conversion: 4.5 },
        { label: 'Day 21-25', revenue: 106200, users: 7200, pageViews: 380000, conversion: 4.7 },
        { label: 'Day 26-30', revenue: 118500, users: 8100, pageViews: 420000, conversion: 5.0 }
      ];
      totals = {
        revenue: 543500,
        activeUsers: 37200,
        avgConversionRate: 4.4,
        systemUptime: '99.98%',
        peakWindow: '$118,500'
      };
      trafficSources = [
        { source: 'Direct Search', share: 44, visits: 180400, color: '#38bdf8' },
        { source: 'Organic Referral', share: 26, visits: 106600, color: '#818cf8' },
        { source: 'Social Campaigns', share: 18, visits: 73800, color: '#a855f7' },
        { source: 'Email Broadcasts', share: 12, visits: 49200, color: '#10b981' }
      ];
      conversionFunnel = [
        { step: 'Page Impressions', value: 410000, dropoff: '0%' },
        { step: 'Product Views', value: 195000, dropoff: '52.4%' },
        { step: 'Added to Cart / Trial', value: 68000, dropoff: '65.1%' },
        { step: 'Checkout / Active Sub', value: 24800, dropoff: '63.5%' }
      ];
    }

    return {
      timeframe,
      totals,
      trends,
      trafficSources,
      conversionFunnel
    };
  }
};

// Mesh Topology & Chaos Engineering State Store
const MESH_STORAGE_KEY = 'mfe_mesh_chaos_state_v1';

export const INITIAL_MESH_REMOTES = [
  {
    id: 'host',
    name: 'MOSAIC Host Shell',
    type: 'host',
    port: 5000,
    route: '/',
    entry: 'http://localhost:5000',
    bundleSize: '95.5 KB',
    latency: 6,
    version: '1.0.0',
    description: 'Root orchestration container, global routing, state bridge & telemetry layout',
    sharedDeps: ['react@18.3.1', 'react-dom@18.3.1', 'react-router-dom@6.28.0', '@mfe/shared-bus', '@mfe/shared-ui'],
    exposes: ['RootLayout', 'EventBridge']
  },
  {
    id: 'auth',
    name: 'Auth & RBAC Remote',
    type: 'remote',
    port: 5001,
    route: '/auth',
    entry: 'http://localhost:5001/assets/remoteEntry.js',
    bundleSize: '49.6 KB',
    latency: 14,
    version: '1.0.0',
    description: 'Secure JWT persona switching, role authorization, session tokens & audit guard',
    sharedDeps: ['react@18.3.1', 'react-dom@18.3.1', '@mfe/shared-bus', '@mfe/shared-ui'],
    exposes: ['./AuthApp']
  },
  {
    id: 'dashboard',
    name: 'Executive Dashboard Remote',
    type: 'remote',
    port: 5002,
    route: '/dashboard',
    entry: 'http://localhost:5002/assets/remoteEntry.js',
    bundleSize: '22.5 KB',
    latency: 18,
    version: '1.0.0',
    description: 'Live platform KPIs, socket pulse simulation, infrastructure health & activity feed',
    sharedDeps: ['react@18.3.1', 'react-dom@18.3.1', '@mfe/shared-bus', '@mfe/shared-ui'],
    exposes: ['./DashboardApp']
  },
  {
    id: 'users',
    name: 'User Management Remote',
    type: 'remote',
    port: 5003,
    route: '/users',
    entry: 'http://localhost:5003/assets/remoteEntry.js',
    bundleSize: '36.3 KB',
    latency: 22,
    version: '1.0.0',
    description: 'Full live CRUD operations, role filtering, search debounce & team mutation broadcasts',
    sharedDeps: ['react@18.3.1', 'react-dom@18.3.1', '@mfe/shared-bus', '@mfe/shared-ui'],
    exposes: ['./UsersApp']
  },
  {
    id: 'analytics',
    name: 'Analytics Engine Remote',
    type: 'remote',
    port: 5004,
    route: '/analytics',
    entry: 'http://localhost:5004/assets/remoteEntry.js',
    bundleSize: '70.2 KB',
    latency: 26,
    version: '1.0.0',
    description: 'Multi-metric telemetry visualizations, dynamic 7D-1Y trajectories & CSV/JSON export',
    sharedDeps: ['react@18.3.1', 'react-dom@18.3.1', '@mfe/shared-bus', '@mfe/shared-ui'],
    exposes: ['./AnalyticsApp']
  },
  {
    id: 'notifications',
    name: 'Notifications Center Remote',
    type: 'remote',
    port: 5005,
    route: '/notifications',
    entry: 'http://localhost:5005/assets/remoteEntry.js',
    bundleSize: '57.7 KB',
    latency: 16,
    version: '1.0.0',
    description: 'Real-time alert dispatcher, live unread counter synchronization & auto-simulator',
    sharedDeps: ['react@18.3.1', 'react-dom@18.3.1', '@mfe/shared-bus', '@mfe/shared-ui'],
    exposes: ['./NotificationsApp']
  }
];

export const meshStore = {
  getChaosState() {
    if (typeof window === 'undefined') return {};
    try {
      const raw = localStorage.getItem(MESH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  },

  areAllApisOff() {
    const state = this.getChaosState();
    if (state.ALL_APIS_OFF) return true;
    const remotes = ['auth', 'users', 'analytics', 'notifications'];
    return remotes.every((id) => state[id] || state[`remote_${id}`]);
  },

  setAllApisOff(off) {
    if (typeof window === 'undefined') return;
    const state = this.getChaosState();
    const remotes = ['auth', 'users', 'analytics', 'notifications', 'dashboard', 'remote_auth', 'remote_users', 'remote_analytics', 'remote_notifications', 'remote_dashboard'];
    if (off) {
      state.ALL_APIS_OFF = true;
      remotes.forEach((id) => {
        state[id] = true;
      });
      localStorage.setItem(MESH_STORAGE_KEY, JSON.stringify(state));
      eventBus.emit(MFE_EVENTS.MESH_STATUS_CHANGED, { state, allApisOff: true, reset: false });
    } else {
      localStorage.removeItem(MESH_STORAGE_KEY);
      eventBus.emit(MFE_EVENTS.MESH_STATUS_CHANGED, { state: {}, allApisOff: false, reset: true });
    }
  },

  isChaosSimulated(remoteId) {
    const state = this.getChaosState();
    if (state.ALL_APIS_OFF) return true;
    return Boolean(state[remoteId] || state[`remote_${remoteId}`]);
  },

  setChaosSimulated(remoteId, simulated) {
    if (typeof window === 'undefined') return;
    const state = this.getChaosState();
    if (simulated) {
      state[remoteId] = true;
      state[`remote_${remoteId}`] = true;
    } else {
      delete state[remoteId];
      delete state[`remote_${remoteId}`];
      delete state.ALL_APIS_OFF;
    }
    localStorage.setItem(MESH_STORAGE_KEY, JSON.stringify(state));
    eventBus.emit(MFE_EVENTS.MESH_STATUS_CHANGED, { remoteId, simulated, state });
  },

  getDegradedCount() {
    const state = this.getChaosState();
    if (state.ALL_APIS_OFF) return 4;
    const remotes = ['auth', 'users', 'analytics', 'notifications'];
    return remotes.filter((id) => state[id] || state[`remote_${id}`]).length;
  },

  resetAllChaos() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(MESH_STORAGE_KEY);
    eventBus.emit(MFE_EVENTS.MESH_STATUS_CHANGED, { state: {}, reset: true, allApisOff: false });
  },

  getRemotes() {
    const chaos = this.getChaosState();
    const allOff = Boolean(chaos.ALL_APIS_OFF);
    return INITIAL_MESH_REMOTES.map((r) => ({
      ...r,
      status: allOff || chaos[r.id] || chaos[`remote_${r.id}`] ? 'CHAOS_OFFLINE' : 'HEALTHY'
    }));
  }
};

