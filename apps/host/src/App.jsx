import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { HostLayout } from './components/HostLayout.jsx';
import { LoginPage } from './components/LoginPage.jsx';
import { MeshInspector } from './components/MeshInspector.jsx';
import {
  DashboardRemote,
  UsersRemote,
  AnalyticsRemote,
  NotificationsRemote
} from './remotes.js';
import { authStore, eventBus, MFE_EVENTS } from '@mfe/shared-bus';

/**
 * Shell-level Authentication Guard:
 * If user is not authenticated in the Shell, immediately redirects to /login.
 * Ensures micro-frontends are NEVER loaded or rendered for unauthenticated sessions.
 */
function RequireAuth({ children, currentUser }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

/**
 * Public Route Guard:
 * If the user is already authenticated, redirects them straight to /dashboard.
 */
function PublicOnlyRoute({ children, currentUser }) {
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

function HostRoutes({ theme, toggleTheme }) {
  const [currentUser, setCurrentUser] = useState(authStore.getCurrentUser());
  const [authToken, setAuthToken] = useState(authStore.getAuthToken());
  const navigate = useNavigate();

  useEffect(() => {
    const unsubLogin = eventBus.on(MFE_EVENTS.AUTH_LOGIN, ({ user, token }) => {
      setCurrentUser(user);
      setAuthToken(token || authStore.getAuthToken());
    });

    const unsubUserUpdated = eventBus.on(MFE_EVENTS.AUTH_USER_UPDATED, ({ user }) => {
      setCurrentUser(user);
    });

    const unsubLogout = eventBus.on(MFE_EVENTS.AUTH_LOGOUT, () => {
      setCurrentUser(null);
      setAuthToken(null);
      navigate('/login');
    });

    return () => {
      unsubLogin();
      unsubUserUpdated();
      unsubLogout();
    };
  }, [navigate]);

  const handleLoginSuccess = (user, token) => {
    setCurrentUser(user);
    setAuthToken(token);
    navigate('/dashboard');
  };

  return (
    <Routes>
      {/* 1. Public Shell Login Route - Loads NO micro-frontends */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute currentUser={currentUser}>
            <LoginPage
              initialMode="signin"
              onLoginSuccess={handleLoginSuccess}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </PublicOnlyRoute>
        }
      />

      {/* Public Shell Signup Route */}
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute currentUser={currentUser}>
            <LoginPage
              initialMode="signup"
              onLoginSuccess={handleLoginSuccess}
              theme={theme}
              onToggleTheme={toggleTheme}
            />
          </PublicOnlyRoute>
        }
      />

      {/* Legacy /auth path redirects to Shell /login */}
      <Route path="/auth" element={<Navigate to="/login" replace />} />

      {/* 2. Protected Micro-Frontend Routes - Mounted ONLY after login */}
      <Route
        path="/*"
        element={
          <RequireAuth currentUser={currentUser}>
            <HostLayout theme={theme} onToggleTheme={toggleTheme}>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />

                {/* Dashboard Micro-Frontend (Passed token & user) */}
                <Route
                  path="/dashboard"
                  element={
                    <DashboardRemote
                      user={currentUser}
                      token={authToken}
                      onNavigate={navigate}
                    />
                  }
                />

                {/* User Management Micro-Frontend (Passed token & user) */}
                <Route
                  path="/users"
                  element={
                    <UsersRemote
                      user={currentUser}
                      token={authToken}
                    />
                  }
                />

                {/* Analytics Micro-Frontend (Passed token & user) */}
                <Route
                  path="/analytics"
                  element={
                    <AnalyticsRemote
                      user={currentUser}
                      token={authToken}
                    />
                  }
                />

                {/* Notifications Micro-Frontend (Passed token & user) */}
                <Route
                  path="/notifications"
                  element={
                    <NotificationsRemote
                      user={currentUser}
                      token={authToken}
                    />
                  }
                />

                {/* Mesh & Chaos Architecture Inspector */}
                <Route
                  path="/mesh"
                  element={
                    <MeshInspector
                      user={currentUser}
                      token={authToken}
                    />
                  }
                />

                {/* Catch-all */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </HostLayout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default function App() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mfe_theme') || 'dark';
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mfe_theme', theme);
    eventBus.emit(MFE_EVENTS.THEME_CHANGED, { theme });
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <BrowserRouter>
      <HostRoutes theme={theme} toggleTheme={toggleTheme} />
    </BrowserRouter>
  );
}
