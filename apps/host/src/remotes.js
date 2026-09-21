import { createFederatedComponent } from './utils/loadRemote.jsx';

export const AuthRemote = createFederatedComponent({
  remoteId: 'auth',
  remoteLoader: () => import('auth_app/AuthApp'),
  fallbackLoader: () => import('../../auth/src/AuthApp.jsx'),
  moduleName: 'Authentication Micro-Frontend',
  remoteUrl: 'http://localhost:5001/assets/remoteEntry.js'
});

export const DashboardRemote = createFederatedComponent({
  remoteId: 'dashboard',
  remoteLoader: () => import('dashboard_app/DashboardApp'),
  fallbackLoader: () => import('../../dashboard/src/DashboardApp.jsx'),
  moduleName: 'Dashboard Micro-Frontend',
  remoteUrl: 'http://localhost:5002/assets/remoteEntry.js'
});

export const UsersRemote = createFederatedComponent({
  remoteId: 'users',
  remoteLoader: () => import('users_app/UsersApp'),
  fallbackLoader: () => import('../../users/src/UsersApp.jsx'),
  moduleName: 'Users Micro-Frontend',
  remoteUrl: 'http://localhost:5003/assets/remoteEntry.js'
});

export const AnalyticsRemote = createFederatedComponent({
  remoteId: 'analytics',
  remoteLoader: () => import('analytics_app/AnalyticsApp'),
  fallbackLoader: () => import('../../analytics/src/AnalyticsApp.jsx'),
  moduleName: 'Analytics Micro-Frontend',
  remoteUrl: 'http://localhost:5004/assets/remoteEntry.js'
});

export const NotificationsRemote = createFederatedComponent({
  remoteId: 'notifications',
  remoteLoader: () => import('notifications_app/NotificationsApp'),
  fallbackLoader: () => import('../../notifications/src/NotificationsApp.jsx'),
  moduleName: 'Notifications Micro-Frontend',
  remoteUrl: 'http://localhost:5005/assets/remoteEntry.js'
});
