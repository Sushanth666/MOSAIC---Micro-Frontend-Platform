import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  Activity,
  Server,
  Zap,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Cpu,
  Radio,
  CheckCircle2,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Database,
  X
} from 'lucide-react';
import { Card, Button, Badge } from '@mfe/shared-ui';
import { meshStore, eventBus, MFE_EVENTS } from '@mfe/shared-bus';

export function MeshInspector() {
  const navigate = useNavigate();
  const [remotes, setRemotes] = useState(() => meshStore.getRemotes());
  const [pinging, setPinging] = useState(false);
  const [notice, setNotice] = useState('');
  const [chaosState, setChaosState] = useState(() => meshStore.getChaosState());
  const [selectedRemote, setSelectedRemote] = useState(null);
  const [clickedNodes, setClickedNodes] = useState(new Set());

  const syncRemotes = () => {
    const latest = meshStore.getRemotes();
    setRemotes(latest);
    setChaosState(meshStore.getChaosState());
    setSelectedRemote((prev) => {
      if (!prev) return null;
      return latest.find((r) => r.id === prev.id) || prev;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedRemote(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleOpenDrawer = (node) => {
    const remoteId = node.id || node.to;
    const found = remotes.find(
      (r) => r.id === remoteId || r.id === `remote_${remoteId}` || r.route === node.route
    );
    if (found) {
      setSelectedRemote(found);
      setClickedNodes((prev) => new Set([...prev, found.id]));
    } else if (remoteId === 'host') {
      const hostRemote = remotes.find((r) => r.type === 'host') || remotes[0];
      setSelectedRemote(hostRemote);
      setClickedNodes((prev) => new Set([...prev, 'host']));
    }
  };

  useEffect(() => {
    syncRemotes();

    const unsub = eventBus.on(MFE_EVENTS.MESH_STATUS_CHANGED, () => {
      syncRemotes();
    });

    // Slight organic latency fluctuation simulation
    const interval = setInterval(() => {
      setRemotes((prev) =>
        prev.map((r) => {
          if (r.type === 'host') return r;
          const delta = Math.floor(Math.random() * 5) - 2;
          return { ...r, latency: Math.max(8, r.latency + delta) };
        })
      );
    }, 4500);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleToggleChaos = (remoteId, currentChaos) => {
    const nextState = !currentChaos;
    meshStore.setChaosSimulated(remoteId, nextState);
    syncRemotes();

    const targetRemote = remotes.find((r) => r.id === remoteId);
    if (nextState) {
      setNotice(`⚠️ Chaos Mode Activated for "${targetRemote?.name}". Navigate to ${targetRemote?.route} to verify runtime fault isolation.`);
    } else {
      setNotice(`✅ Remote "${targetRemote?.name}" restored to Healthy state.`);
    }
    setTimeout(() => setNotice(''), 5000);
  };

  const handlePingAll = () => {
    setPinging(true);
    setTimeout(() => {
      setRemotes((prev) =>
        prev.map((r) => ({
          ...r,
          latency: r.type === 'host' ? 6 : Math.floor(12 + Math.random() * 16)
        }))
      );
      setPinging(false);
      setNotice('⚡ Synchronous ping dispatched to all federated endpoints. All active nodes responded.');
      setTimeout(() => setNotice(''), 4000);
    }, 450);
  };

  const handleResetAll = () => {
    meshStore.resetAllChaos();
    syncRemotes();
    setNotice('✅ All simulated outages cleared. Every remote returned to 100% Healthy state.');
    setTimeout(() => setNotice(''), 4000);
  };

  const degradedCount = meshStore.getDegradedCount();
  const remoteModules = remotes.filter((r) => r.type === 'remote');
  const healthyCount = remoteModules.length - degradedCount;
  const avgLatency = Math.round(
    remoteModules.reduce((acc, r) => acc + r.latency, 0) / (remoteModules.length || 1)
  );

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
              Micro-Frontend Mesh & Chaos Inspector
            </h1>
            <Badge variant={degradedCount > 0 ? 'warning' : 'success'} dot size="sm">
              {degradedCount > 0 ? `${degradedCount} Degraded (Chaos Mode)` : 'Mesh 100% Operational'}
            </Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', marginTop: '4px' }}>
            Live runtime topology monitoring, module federation latency telemetry, and fault-isolation resilience testing.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button
            size="sm"
            variant="outline"
            icon={Activity}
            onClick={handlePingAll}
            disabled={pinging}
          >
            {pinging ? 'Pinging Mesh...' : 'Ping All Remotes'}
          </Button>
          {degradedCount > 0 && (
            <Button
              size="sm"
              variant="secondary"
              icon={RotateCcw}
              onClick={handleResetAll}
            >
              Reset All Outages
            </Button>
          )}
        </div>
      </div>

      {notice && (
        <div
          style={{
            padding: '14px 18px',
            background: notice.startsWith('⚠️') ? 'rgba(245, 158, 11, 0.12)' : 'var(--mfe-success-bg)',
            color: notice.startsWith('⚠️') ? 'var(--mfe-warning)' : 'var(--mfe-success)',
            border: `1px solid ${notice.startsWith('⚠️') ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
            borderRadius: 'var(--mfe-radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            animation: 'mfe-fadeIn 0.2s ease'
          }}
        >
          {notice.startsWith('⚠️') ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
          <span>{notice}</span>
        </div>
      )}

      {/* Mesh Telemetry KPI Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
        <div
          className="mfe-card mfe-stagger-1"
          style={{
            padding: '16px 20px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mfe-radius-md)',
              background: degradedCount > 0 ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
              color: degradedCount > 0 ? 'var(--mfe-warning)' : 'var(--mfe-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <ShieldCheck size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Mesh Resiliency
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
              {healthyCount} / {remoteModules.length} Healthy
            </div>
          </div>
        </div>

        <div
          className="mfe-card mfe-stagger-2"
          style={{
            padding: '16px 20px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mfe-radius-md)',
              background: 'rgba(56, 189, 248, 0.12)',
              color: 'var(--mfe-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Radio size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Average Ping
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
              {avgLatency} ms
            </div>
          </div>
        </div>

        <div
          className="mfe-card mfe-stagger-3"
          style={{
            padding: '16px 20px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mfe-radius-md)',
              background: 'rgba(129, 140, 248, 0.12)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Federated Footprint
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
              236.2 KB Total
            </div>
          </div>
        </div>

        <div
          className="mfe-card mfe-stagger-4"
          style={{
            padding: '16px 20px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px'
          }}
        >
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mfe-radius-md)',
              background: 'rgba(236, 72, 153, 0.12)',
              color: '#ec4899',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <Zap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Fault Isolation
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
              React Boundaries
            </div>
          </div>
        </div>
      </div>

      {/* Live Animated Interactive Topology Mesh Diagram */}
      <div className="mfe-stagger-3">
        {/* Node Indicator Strip — Shows all 5 clickable nodes */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Clickable Nodes:
          </span>
          {[
            { id: 'host', label: 'Host Shell', port: ':5000', color: 'var(--mfe-primary)' },
            { id: 'remote_auth', label: 'Auth', port: ':5001', color: '#38bdf8' },
            { id: 'remote_users', label: 'Users', port: ':5003', color: '#10b981' },
            { id: 'remote_analytics', label: 'Analytics', port: ':5004', color: '#818cf8' },
            { id: 'remote_notifications', label: 'Notifications', port: ':5005', color: '#f59e0b' },
          ].map((pill) => {
            const isClicked = clickedNodes.has(pill.id);
            const isActive = selectedRemote && (selectedRemote.id === pill.id || (pill.id === 'host' && selectedRemote.type === 'host'));
            return (
              <span
                key={pill.id}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4px 10px',
                  borderRadius: '9999px',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  fontFamily: 'var(--mfe-font-sans)',
                  background: isActive
                    ? `${pill.color}22`
                    : isClicked
                    ? `${pill.color}14`
                    : 'var(--mfe-bg-surface)',
                  border: `1.5px solid ${isActive ? pill.color : isClicked ? `${pill.color}80` : 'var(--mfe-border)'}`,
                  color: isActive ? pill.color : isClicked ? pill.color : 'var(--mfe-text-muted)',
                  transition: 'all 0.2s ease',
                  boxShadow: isActive ? `0 0 10px ${pill.color}44` : 'none',
                }}
              >
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: isActive || isClicked ? pill.color : 'var(--mfe-text-muted)',
                  boxShadow: isActive ? `0 0 6px ${pill.color}` : 'none',
                  flexShrink: 0
                }} />
                {pill.label} <span style={{ opacity: 0.7, fontFamily: 'var(--mfe-font-mono)', fontSize: '0.65rem' }}>{pill.port}</span>
                {isClicked && <span style={{ opacity: 0.6, fontSize: '0.65rem' }}>✓</span>}
              </span>
            );
          })}
        </div>

        <div
          style={{
            padding: '20px 24px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            boxShadow: 'var(--mfe-shadow-sm)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--mfe-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity size={18} color="var(--mfe-primary)" />
                Interactive Module Federation Interconnect Mesh
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', marginTop: '2px' }}>
                Click any remote node to inspect its bundle specs & shared singletons in the slide-over drawer, or toggle <strong>Outage</strong> to simulate faults.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge variant="primary" dot size="sm">
                Event Bus: Live Broadcast
              </Badge>
              <span style={{ fontSize: '0.75rem', color: 'var(--mfe-primary)', fontWeight: 700 }}>
                💡 Click any node to open specs drawer
              </span>
            </div>
          </div>

          {/* SVG Canvas + Inline Side Panel in a Flex Row */}
          <div style={{ display: 'flex', gap: '0', position: 'relative', transition: 'all 0.3s ease' }}>
            <div style={{ flex: '1 1 auto', overflowX: 'auto', padding: '6px 0', minWidth: 0, transition: 'all 0.3s ease' }}>
              <svg viewBox="0 0 840 340" style={{ width: '100%', minWidth: selectedRemote ? '420px' : '680px', height: 'auto', userSelect: 'none' }}>
              <defs>
                <linearGradient id="hostGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="var(--mfe-primary)" stopOpacity="0.9" />
                  <stop offset="100%" stopColor="var(--mfe-accent)" stopOpacity="0.85" />
                </linearGradient>
                <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* Connecting Energy Beams */}
              {[
                { id: 'auth', to: 'auth', route: '/auth', x: 130, y: 90, name: 'Auth (:5001)', color: '#38bdf8' },
                { id: 'users', to: 'users', route: '/users', x: 130, y: 260, name: 'Users (:5003)', color: '#10b981' },
                { id: 'analytics', to: 'analytics', route: '/analytics', x: 710, y: 90, name: 'Analytics (:5004)', color: '#818cf8' },
                { id: 'notifications', to: 'notifications', route: '/notifications', x: 710, y: 260, name: 'Notifications (:5005)', color: '#f59e0b' }
              ].map((node) => {
                const isDegraded = chaosState[node.id] || chaosState[node.to] || chaosState[`remote_${node.id}`];
                const cx1 = node.x < 420 ? 270 : 570;
                const pathD = `M 420 175 C ${cx1} 175, ${cx1} ${node.y}, ${node.x} ${node.y}`;
                return (
                  <g key={node.id}>
                    {/* Background track line */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke="var(--mfe-border)"
                      strokeWidth="2"
                      strokeDasharray="2 4"
                    />
                    {/* Animated Energy Flow Beam */}
                    <path
                      d={pathD}
                      fill="none"
                      stroke={isDegraded ? 'var(--mfe-danger)' : node.color}
                      strokeWidth={isDegraded ? 2 : 3}
                      strokeDasharray={isDegraded ? '4 8' : '8 6'}
                      className={isDegraded ? '' : 'mfe-energy-beam'}
                      style={{ opacity: isDegraded ? 0.35 : 0.9 }}
                    />

                    {/* Remote Node Outer Hit Area & Group */}
                    <g
                      style={{ cursor: 'pointer' }}
                      title={`Click circle to inspect ${node.name} bundle specs`}
                    >
                      {/* Interactive Halo on Hover */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="27"
                        fill="transparent"
                        stroke={isDegraded ? 'rgba(239, 68, 68, 0.3)' : `${node.color}33`}
                        strokeWidth="1.5"
                        strokeDasharray="3 3"
                        className={isDegraded ? '' : 'mfe-energy-beam'}
                        onClick={() => handleOpenDrawer(node)}
                      />

                      {/* Main Node Circle */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="20"
                        fill="var(--mfe-bg-surface)"
                        stroke={isDegraded ? 'var(--mfe-danger)' : node.color}
                        strokeWidth="2.5"
                        onClick={() => handleOpenDrawer(node)}
                        style={{ filter: isDegraded ? 'drop-shadow(0 0 10px rgba(239, 68, 68, 0.4))' : `drop-shadow(0 0 10px ${node.color}44)` }}
                      />
                      {/* Concentric Pulse Dot */}
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r="5.5"
                        fill={isDegraded ? 'var(--mfe-danger)' : node.color}
                        onClick={() => handleOpenDrawer(node)}
                      >
                        {!isDegraded && (
                          <>
                            <animate
                              attributeName="r"
                              values="5;6.5;5"
                              dur="2.4s"
                              repeatCount="indefinite"
                            />
                            <animate
                              attributeName="opacity"
                              values="1;0.7;1"
                              dur="2.4s"
                              repeatCount="indefinite"
                            />
                          </>
                        )}
                      </circle>

                      {/* Node Label (Clickable to open drawer) with clear generous gap above circle */}
                      <text
                        x={node.x}
                        y={node.y - 62}
                        textAnchor="middle"
                        fill="var(--mfe-text-primary)"
                        fontSize="11.5"
                        fontWeight="800"
                        fontFamily="var(--mfe-font-sans)"
                        onClick={() => handleOpenDrawer(node)}
                      >
                        {node.name}
                      </text>

                      {/* Status / Latency indicator with distinct gap above circle */}
                      <text
                        x={node.x}
                        y={node.y - 45}
                        textAnchor="middle"
                        fill={isDegraded ? 'var(--mfe-danger)' : 'var(--mfe-text-muted)'}
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="var(--mfe-font-mono)"
                        onClick={() => handleOpenDrawer(node)}
                      >
                        {isDegraded ? '● OUTAGE SIMULATED' : '● LATENCY: ACTIVE'}
                      </text>

                      {/* Interactive Button 1: [ ↗ Open Page ] with clear gap below circle */}
                      <g
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(node.route);
                        }}
                        style={{ cursor: 'pointer' }}
                        title={`Navigate directly to ${node.name}`}
                      >
                        <rect
                          x={node.x - 52}
                          y={node.y + 36}
                          width="48"
                          height="22"
                          rx="5"
                          fill="var(--mfe-bg-card)"
                          stroke="var(--mfe-border)"
                          strokeWidth="1"
                        />
                        <text
                          x={node.x - 28}
                          y={node.y + 50}
                          textAnchor="middle"
                          fill="var(--mfe-text-primary)"
                          fontSize="9.5"
                          fontWeight="700"
                          fontFamily="var(--mfe-font-sans)"
                        >
                          Open ↗
                        </text>
                      </g>

                      {/* Interactive Button 2: [ Outage Toggle ] with clear gap below circle */}
                      <g
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleChaos(node.id, isDegraded);
                        }}
                        style={{ cursor: 'pointer' }}
                        title="Simulate / Restore network outage"
                      >
                        <rect
                          x={node.x + 2}
                          y={node.y + 36}
                          width="56"
                          height="22"
                          rx="5"
                          fill={isDegraded ? 'rgba(239, 68, 68, 0.2)' : 'var(--mfe-bg-surface)'}
                          stroke={isDegraded ? 'var(--mfe-danger)' : 'var(--mfe-border)'}
                          strokeWidth="1"
                        />
                        <text
                          x={node.x + 30}
                          y={node.y + 50}
                          textAnchor="middle"
                          fill={isDegraded ? 'var(--mfe-danger)' : 'var(--mfe-text-secondary)'}
                          fontSize="9.5"
                          fontWeight="700"
                          fontFamily="var(--mfe-font-sans)"
                        >
                          {isDegraded ? 'Restore' : '⚡ Outage'}
                        </text>
                      </g>
                    </g>
                  </g>
                );
              })}

              {/* Center Host Hub (Clickable to Inspect Host Shell specs) */}
              <g
                onClick={() => handleOpenDrawer({ id: 'host' })}
                style={{ cursor: 'pointer' }}
                title="Host Shell Orchestrator (:5000) - Click to Inspect Specs"
              >
                <circle
                  cx="420"
                  cy="175"
                  r="54"
                  fill="url(#hostGlow)"
                  stroke="var(--mfe-bg-surface)"
                  strokeWidth="4.5"
                  style={{ filter: 'drop-shadow(0 0 24px var(--mfe-primary-glow))' }}
                />
                <circle
                  cx="420"
                  cy="175"
                  r="64"
                  fill="none"
                  stroke="var(--mfe-primary)"
                  strokeWidth="1.5"
                  strokeDasharray="5 5"
                  className="mfe-energy-beam"
                  style={{ opacity: 0.85 }}
                />
                <text
                  x="420"
                  y="168"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="13.5"
                  fontWeight="900"
                  fontFamily="var(--mfe-font-sans)"
                  letterSpacing="0.04em"
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4))' }}
                >
                  HOST SHELL
                </text>
                <text
                  x="420"
                  y="188"
                  textAnchor="middle"
                  fill="#ffffff"
                  fontSize="11"
                  fontWeight="700"
                  fontFamily="var(--mfe-font-mono)"
                  opacity="0.95"
                  letterSpacing="0.02em"
                  style={{ filter: 'drop-shadow(0 1px 3px rgba(0, 0, 0, 0.4))' }}
                >
                  PORT :5000
                </text>

                {/* Open Dashboard Pill with clean spacing below outer circle */}
                <g
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/dashboard');
                  }}
                  style={{ cursor: 'pointer' }}
                  title="Navigate to Executive Dashboard"
                >
                  <rect
                    x="365"
                    y="247"
                    width="110"
                    height="24"
                    rx="12"
                    fill="var(--mfe-bg-surface)"
                    stroke="var(--mfe-primary)"
                    strokeWidth="1.2"
                    style={{ filter: 'drop-shadow(0 2px 8px var(--mfe-primary-glow))' }}
                  />
                  <text
                    x="420"
                    y="263"
                    textAnchor="middle"
                    fill="var(--mfe-primary)"
                    fontSize="10"
                    fontWeight="800"
                    fontFamily="var(--mfe-font-sans)"
                  >
                    Dashboard ↗
                  </text>
                </g>
              </g>
              </svg>
            </div>

            {/* Inline Side Panel — slides in beside the mesh, mesh stays fully visible */}
            {selectedRemote && (
              <div
                style={{
                  width: '340px',
                  flexShrink: 0,
                  backgroundColor: 'var(--mfe-bg-surface)',
                  borderLeft: '2px solid var(--mfe-primary)',
                  boxShadow: '-8px 0 24px rgba(0,0,0,0.2)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '18px',
                  gap: '14px',
                  overflowY: 'auto',
                  maxHeight: '360px',
                  animation: 'mfe-slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  borderRadius: '0 var(--mfe-radius-lg) var(--mfe-radius-lg) 0'
                }}
              >
            {/* Drawer Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: 'var(--mfe-radius-md)',
                    background: chaosState[selectedRemote.id] ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)',
                    color: chaosState[selectedRemote.id] ? 'var(--mfe-danger)' : 'var(--mfe-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {selectedRemote.type === 'host' ? <Server size={22} /> : <Cpu size={22} />}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
                    {selectedRemote.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--mfe-font-mono)', color: 'var(--mfe-text-muted)' }}>
                      Port :{selectedRemote.port}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-muted)' }}>•</span>
                    <span style={{ fontSize: '0.8125rem', fontFamily: 'var(--mfe-font-mono)', color: 'var(--mfe-text-muted)' }}>
                      {selectedRemote.route}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedRemote(null)}
                title="Close drawer (Esc)"
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)',
                  color: 'var(--mfe-text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'var(--mfe-transition)'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Health & Runtime Status Banner */}
            <div
              style={{
                padding: '12px 16px',
                borderRadius: 'var(--mfe-radius-md)',
                background: chaosState[selectedRemote.id] ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
                border: `1px solid ${chaosState[selectedRemote.id] ? 'rgba(239, 68, 68, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: chaosState[selectedRemote.id] ? 'var(--mfe-danger)' : 'var(--mfe-success)',
                    boxShadow: `0 0 8px ${chaosState[selectedRemote.id] ? 'var(--mfe-danger)' : 'var(--mfe-success)'}`
                  }}
                />
                <span
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: chaosState[selectedRemote.id] ? 'var(--mfe-danger)' : 'var(--mfe-success)'
                  }}
                >
                  {chaosState[selectedRemote.id] ? 'Simulated Outage Active (HTTP 503)' : 'Healthy & Linked to Mesh'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.75rem',
                  fontFamily: 'var(--mfe-font-mono)',
                  color: 'var(--mfe-text-muted)'
                }}
              >
                {selectedRemote.type === 'host' ? 'Host Shell' : 'Federated Remote'}
              </span>
            </div>

            {/* Telemetry Metrics 2x2 Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)'
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Bundle Footprint
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--mfe-text-primary)', marginTop: '2px' }}>
                  {selectedRemote.bundleSize}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                  Optimized chunk build
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)'
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Ping Latency
                </div>
                <div
                  style={{
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: chaosState[selectedRemote.id] ? 'var(--mfe-danger)' : 'var(--mfe-primary)',
                    marginTop: '2px'
                  }}
                >
                  {chaosState[selectedRemote.id] ? 'TIMED OUT' : `${selectedRemote.latency} ms`}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                  {chaosState[selectedRemote.id] ? 'Circuit breaker open' : 'Synchronous response'}
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)'
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Port Endpoint
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--mfe-text-primary)', marginTop: '2px', fontFamily: 'var(--mfe-font-mono)' }}>
                  :{selectedRemote.port}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                  Isolated Vite process
                </div>
              </div>

              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: 'var(--mfe-radius-md)',
                  background: 'var(--mfe-bg-surface)',
                  border: '1px solid var(--mfe-border)'
                }}
              >
                <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Federation Spec
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--mfe-text-primary)', marginTop: '2px' }}>
                  v{selectedRemote.version}
                </div>
                <div style={{ fontSize: '0.6875rem', color: 'var(--mfe-text-muted)', marginTop: '2px' }}>
                  Module Federation v2
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                Module Overview
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', lineHeight: 1.6 }}>
                {selectedRemote.description}
              </p>
            </div>

            {/* Shared Singletons Matrix */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Shared Singletons (Zero Duplicate Overhead)
                </div>
                <span style={{ fontSize: '0.6875rem', color: 'var(--mfe-success)', fontWeight: 700 }}>
                  ✓ Strict Match
                </span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)', marginBottom: '10px' }}>
                Loaded once by Host Shell and shared across federated chunks at runtime:
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {selectedRemote.sharedDeps.map((dep, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.75rem',
                      padding: '4px 10px',
                      borderRadius: 'var(--mfe-radius-sm)',
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border)',
                      color: 'var(--mfe-text-primary)',
                      fontFamily: 'var(--mfe-font-mono)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span style={{ color: 'var(--mfe-success)' }}>•</span>
                    {dep}
                  </span>
                ))}
              </div>
            </div>

            {/* Exposes & Contract */}
            {selectedRemote.exposes && (
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                  Exposed Federation Contracts
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {selectedRemote.exposes.map((exp, idx) => (
                    <span
                      key={idx}
                      style={{
                        fontSize: '0.75rem',
                        padding: '4px 10px',
                        borderRadius: 'var(--mfe-radius-sm)',
                        background: 'rgba(129, 140, 248, 0.1)',
                        border: '1px solid rgba(129, 140, 248, 0.25)',
                        color: 'var(--mfe-primary)',
                        fontFamily: 'var(--mfe-font-mono)'
                      }}
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedRemote.type !== 'host' && (
                <button
                  onClick={() => handleToggleChaos(selectedRemote.id, chaosState[selectedRemote.id])}
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    borderRadius: 'var(--mfe-radius-md)',
                    border: chaosState[selectedRemote.id] ? '1px solid var(--mfe-danger)' : '1px solid var(--mfe-border)',
                    background: chaosState[selectedRemote.id] ? 'rgba(239, 68, 68, 0.12)' : 'var(--mfe-bg-surface)',
                    color: chaosState[selectedRemote.id] ? 'var(--mfe-danger)' : 'var(--mfe-text-primary)',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    transition: 'var(--mfe-transition)'
                  }}
                >
                  {chaosState[selectedRemote.id] ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                  {chaosState[selectedRemote.id] ? 'Restore Remote to Healthy' : '⚡ Simulate Outage (Fault Isolation)'}
                </button>
              )}

              <button
                onClick={() => {
                  setSelectedRemote(null);
                  navigate(selectedRemote.route);
                }}
                style={{
                  width: '100%',
                  padding: '10px 16px',
                  borderRadius: 'var(--mfe-radius-md)',
                  border: 'none',
                  background: 'var(--mfe-primary-gradient)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px var(--mfe-primary-glow)',
                  transition: 'var(--mfe-transition)'
                }}
              >
                <span>Open Micro-Frontend Page</span>
                <ExternalLink size={16} />
              </button>
            </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resilience Explanation Callout */}
      <div
        style={{
          padding: '24px',
          background: 'var(--mfe-bg-card)',
          border: '1px solid var(--mfe-border)',
          borderRadius: 'var(--mfe-radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Sparkles size={20} color="var(--mfe-primary)" />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--mfe-text-primary)' }}>
            Why Micro-Frontend Resiliency Matters (Evaluation Proof)
          </h3>
        </div>
        <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', lineHeight: 1.6 }}>
          In traditional monolithic single-page applications (SPAs), an unhandled exception or 503 network failure in an auxiliary module crashes the entire screen into a blank white page.
          In <strong>MOSAIC</strong>, each remote (Auth, Dashboard, Users, Analytics, Notifications) is wrapped with an isolated React Error Boundary and communicated via a decoupled Window Event Bus. When you simulate an outage on <strong>Analytics (:5004)</strong> or <strong>Users (:5003)</strong>, only that specific viewport displays a localized recovery UI while the rest of the navigation shell, top telemetry, and other micro-frontends continue operating uninterrupted.
        </p>
      </div>
    </div>
  );
}
export default MeshInspector;
