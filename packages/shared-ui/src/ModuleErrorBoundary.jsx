import React from 'react';
import { AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { Button } from './Button.jsx';

export class ModuleErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[MFE ErrorBoundary] Module "${this.props.moduleName || 'Unknown'}" crashed:`, error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onRetry) {
      this.props.onRetry();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      const moduleName = this.props.moduleName || 'Micro-Frontend Module';
      return (
        <div
          style={{
            padding: '32px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-danger)',
            borderRadius: 'var(--mfe-radius-lg)',
            backdropFilter: 'var(--mfe-backdrop-blur)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.1)',
            margin: '20px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--mfe-radius-md)',
                backgroundColor: 'var(--mfe-danger-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--mfe-danger)'
              }}
            >
              <AlertTriangle size={26} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--mfe-danger)',
                    letterSpacing: '0.05em'
                  }}
                >
                  Remote Boundary Isolated
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>•</span>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontFamily: 'var(--mfe-font-mono)',
                    color: 'var(--mfe-text-secondary)'
                  }}
                >
                  {this.props.remoteUrl || 'Dynamic Remote Entry'}
                </span>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--mfe-text-primary)', marginTop: '2px' }}>
                Failed to load {moduleName}
              </h3>
            </div>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', lineHeight: 1.6 }}>
            An unhandled runtime error or connection issue occurred while executing this micro-frontend remote bundle. The rest of the host dashboard remains operational.
          </p>

          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(0, 0, 0, 0.35)',
              borderRadius: 'var(--mfe-radius-sm)',
              fontFamily: 'var(--mfe-font-mono)',
              fontSize: '0.8125rem',
              color: '#f87171',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              overflowX: 'auto'
            }}
          >
            {this.state.error?.message || 'Remote runtime evaluation error.'}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
            <Button variant="primary" icon={RefreshCw} onClick={this.handleRetry}>
              Retry Remote Connection
            </Button>
            {this.props.onFallback && (
              <Button variant="secondary" icon={Layers} onClick={this.props.onFallback}>
                Load Fallback Local Module
              </Button>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
