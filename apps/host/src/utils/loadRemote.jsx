import React, { lazy, Suspense } from 'react';
import { ModuleErrorBoundary, CardSkeleton } from '@mfe/shared-ui';
import { meshStore } from '@mfe/shared-bus';

function ChaosGuard({ remoteId, moduleName, children }) {
  if (remoteId && meshStore.isChaosSimulated(remoteId)) {
    throw new Error(
      `[CHAOS_ENGINEERING] Remote "${moduleName}" (:500${remoteId === 'auth' ? 1 : remoteId === 'dashboard' ? 2 : remoteId === 'users' ? 3 : remoteId === 'analytics' ? 4 : 5}) is experiencing a simulated network partition / HTTP 503. The host platform isolated this failure gracefully.`
    );
  }
  return children;
}

/**
 * Higher-Order Component to load federated micro-frontends with fallback and Error Boundary.
 */
export function createFederatedComponent({
  remoteId,
  remoteLoader,
  fallbackLoader,
  moduleName,
  remoteUrl
}) {
  const LazyComponent = lazy(async () => {
    try {
      // First attempt to load via Vite Module Federation
      return await remoteLoader();
    } catch (federationError) {
      console.warn(
        `[MFE Host] Module Federation remote "${moduleName}" at ${remoteUrl} could not be loaded directly. Attempting local package fallback...`,
        federationError
      );

      if (fallbackLoader) {
        try {
          return await fallbackLoader();
        } catch (fallbackError) {
          console.error(`[MFE Host] Both remote and local fallback failed for "${moduleName}":`, fallbackError);
          throw fallbackError;
        }
      }

      throw federationError;
    }
  });

  return function FederatedWrapper(props) {
    return (
      <ModuleErrorBoundary
        moduleName={moduleName}
        remoteUrl={remoteUrl}
        onRetry={() => {
          if (remoteId && meshStore.isChaosSimulated(remoteId)) {
            meshStore.setChaosSimulated(remoteId, false);
          }
          window.location.reload();
        }}
      >
        <ChaosGuard remoteId={remoteId} moduleName={moduleName}>
          <Suspense
            fallback={
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div className="mfe-skeleton" style={{ width: '220px', height: '28px' }} />
                  <div className="mfe-skeleton" style={{ width: '120px', height: '36px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                  <CardSkeleton />
                  <CardSkeleton />
                  <CardSkeleton />
                </div>
              </div>
            }
          >
            <LazyComponent {...props} />
          </Suspense>
        </ChaosGuard>
      </ModuleErrorBoundary>
    );
  };
}
