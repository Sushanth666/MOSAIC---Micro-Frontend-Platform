import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  Download,
  Calendar,
  Layers,
  ArrowUpRight,
  PieChart,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  FileCode,
  AlertTriangle
} from 'lucide-react';
import { Button, Card, Badge, CardSkeleton } from '@mfe/shared-ui';
import { mockApi, eventBus, MFE_EVENTS, meshStore } from '@mfe/shared-bus';

export default function AnalyticsApp({ standalone = false }) {
  const [timeframe, setTimeframe] = useState('30D');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [exportNotice, setExportNotice] = useState('');
  const [isGatewayOff, setIsGatewayOff] = useState(meshStore.areAllApisOff());

  const loadData = async (tf) => {
    setLoading(true);
    try {
      const res = await mockApi.getAnalyticsMetrics(tf);
      setData(res);
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    loadData(timeframe);

    const unsubMesh = eventBus.on(MFE_EVENTS.MESH_STATUS_CHANGED, ({ allApisOff }) => {
      const isOff = typeof allApisOff === 'boolean' ? allApisOff : meshStore.areAllApisOff();
      setIsGatewayOff(isOff);
      loadData(timeframe);
    });

    return () => {
      unsubMesh();
    };
  }, [timeframe]);

  const handleExport = (type) => {
    if (!data) return;
    const filename = `mosaic-analytics-${timeframe.toLowerCase()}.${type}`;
    let fileContent = '';
    let mimeType = '';

    if (type === 'json') {
      fileContent = JSON.stringify(data, null, 2);
      mimeType = 'application/json';
    } else {
      // CSV Export
      const headers = 'Month,Revenue($),ActiveUsers,PageViews,ConversionRate(%)\n';
      const rows = data.trends
        .map((p) => `${p.label},${p.revenue},${p.users},${p.pageViews},${p.conversion}`)
        .join('\n');
      fileContent = headers + rows;
      mimeType = 'text/csv';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setExportNotice(`Exported report as ${filename}`);
    setTimeout(() => setExportNotice(''), 4000);

    // Broadcast across micro-frontends
    eventBus.emit(MFE_EVENTS.ACTIVITY_LOGGED, {
      id: `act_${Date.now()}`,
      user: 'Analytics Module',
      action: `exported ${timeframe} report (${type.toUpperCase()})`,
      timestamp: 'Just now',
      type: 'analytics'
    });
  };

  // SVG Chart Geometry Calculations
  const trends = data?.trends || [];
  const maxRevenue = Math.max(...trends.map((t) => t.revenue), 1);
  const chartHeight = 250;
  const chartWidth = 760;
  const paddingLeft = 65;
  const paddingRight = 35;
  const paddingTop = 25;
  const paddingBottom = 35;

  const points = trends.map((t, idx) => {
    const x = paddingLeft + (idx / (trends.length - 1 || 1)) * (chartWidth - paddingLeft - paddingRight);
    const y = paddingTop + (1 - (t.revenue / maxRevenue)) * (chartHeight - paddingTop - paddingBottom);
    return { x, y, data: t };
  });

  // Calculate smooth cubic bezier path
  const getCurvedPath = (pts) => {
    if (pts.length === 0) return '';
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i];
      const p1 = pts[i + 1];
      const cpX = (p0.x + p1.x) / 2;
      d += ` C ${cpX} ${p0.y}, ${cpX} ${p1.y}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const pathD = getCurvedPath(points);
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : '';

  // Dynamic Y-axis scale ticks
  const yTicks = [1, 0.75, 0.5, 0.25, 0].map((ratio) => {
    const val = Math.round(maxRevenue * ratio);
    const label = val >= 1000000
      ? `$${(val / 1000000).toFixed(1)}M`
      : val >= 1000
      ? `$${Math.round(val / 1000)}k`
      : `$${val}`;
    const y = paddingTop + (1 - ratio) * (chartHeight - paddingTop - paddingBottom);
    return { val, label, y };
  });

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
              Analytics & Telemetry
            </h1>
            <Badge variant="primary" dot size="sm">
              MFE Remote: Analytics Engine (:5004)
            </Badge>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--mfe-text-secondary)', marginTop: '4px' }}>
            Multi-metric performance visualization, traffic funnels, and revenue trajectories.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Timeframe Controls */}
          <div
            style={{
              display: 'inline-flex',
              background: 'var(--mfe-bg-surface)',
              border: '1px solid var(--mfe-border)',
              borderRadius: 'var(--mfe-radius-md)',
              padding: '3px'
            }}
          >
            {['7D', '30D', '90D', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--mfe-radius-sm)',
                  border: 'none',
                  background: timeframe === tf ? 'var(--mfe-primary)' : 'transparent',
                  color: timeframe === tf ? '#ffffff' : 'var(--mfe-text-secondary)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  cursor: 'pointer',
                  transition: 'var(--mfe-transition)'
                }}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Export Dropdown / Buttons */}
          <Button
            size="sm"
            variant="outline"
            icon={FileSpreadsheet}
            onClick={() => handleExport('csv')}
          >
            Export CSV
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={FileCode}
            onClick={() => handleExport('json')}
          >
            Export JSON
          </Button>
        </div>
      </div>

      {exportNotice && (
        <div
          style={{
            padding: '12px 18px',
            background: 'var(--mfe-success-bg)',
            color: 'var(--mfe-success)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--mfe-radius-md)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem'
          }}
        >
          <CheckCircle2 size={18} />
          {exportNotice}
        </div>
      )}

      {/* Gateway Offline Alert Banner */}
      {isGatewayOff && (
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.28)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            animation: 'mfeFadeIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
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
              <strong style={{ color: '#ef4444', fontSize: '0.875rem' }}>Mesh Gateway Disconnected (OFF)</strong>
              <div style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-secondary)', marginTop: '2px' }}>
                All telemetry aggregation and live analytics ingestion are severed. Switch the gateway LIVE in the top bar to restore metrics.
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              meshStore.setAllApisOff(false);
              eventBus.emit(MFE_EVENTS.MESH_STATUS_CHANGED, { allApisOff: false });
            }}
          >
            Turn Gateway LIVE
          </Button>
        </div>
      )}

      {/* Dynamic Summary Cards for Selected Timeframe */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
        <div
          className="mfe-card mfe-stagger-1 mfe-card-interactive"
          style={{
            padding: '16px 20px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'var(--mfe-transition)'
          }}
        >
          <div
            className="mfe-icon-spin-hover"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mfe-radius-md)',
              background: isGatewayOff ? 'rgba(239, 68, 68, 0.12)' : 'rgba(56, 189, 248, 0.12)',
              color: isGatewayOff ? '#ef4444' : 'var(--mfe-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            <TrendingUp size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {timeframe} Window Revenue
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isGatewayOff ? 'var(--mfe-text-muted)' : 'var(--mfe-text-primary)' }}>
              {isGatewayOff ? '—' : data?.totals?.revenue ? `$${data.totals.revenue.toLocaleString()}` : '—'}
            </div>
          </div>
        </div>

        <div
          className="mfe-card mfe-stagger-2 mfe-card-interactive"
          style={{
            padding: '16px 20px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'var(--mfe-transition)'
          }}
        >
          <div
            className="mfe-icon-spin-hover"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mfe-radius-md)',
              background: isGatewayOff ? 'rgba(239, 68, 68, 0.12)' : 'rgba(129, 140, 248, 0.12)',
              color: isGatewayOff ? '#ef4444' : '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            <PieChart size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Audience Reach
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isGatewayOff ? 'var(--mfe-text-muted)' : 'var(--mfe-text-primary)' }}>
              {isGatewayOff ? '—' : data?.totals?.activeUsers ? data.totals.activeUsers.toLocaleString() : '—'}
            </div>
          </div>
        </div>

        <div
          className="mfe-card mfe-stagger-3 mfe-card-interactive"
          style={{
            padding: '16px 20px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'var(--mfe-transition)'
          }}
        >
          <div
            className="mfe-icon-spin-hover"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mfe-radius-md)',
              background: isGatewayOff ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)',
              color: isGatewayOff ? '#ef4444' : 'var(--mfe-success)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            <Layers size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avg Conversion
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isGatewayOff ? 'var(--mfe-text-muted)' : 'var(--mfe-text-primary)' }}>
              {isGatewayOff ? '—' : data?.totals?.avgConversionRate ? `${data.totals.avgConversionRate}%` : '—'}
            </div>
          </div>
        </div>

        <div
          className="mfe-card mfe-stagger-4 mfe-card-interactive"
          style={{
            padding: '16px 20px',
            background: 'var(--mfe-bg-card)',
            border: '1px solid var(--mfe-border)',
            borderRadius: 'var(--mfe-radius-lg)',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            transition: 'var(--mfe-transition)'
          }}
        >
          <div
            className="mfe-icon-spin-hover"
            style={{
              width: '42px',
              height: '42px',
              borderRadius: 'var(--mfe-radius-md)',
              background: isGatewayOff ? 'rgba(239, 68, 68, 0.12)' : 'rgba(245, 158, 11, 0.12)',
              color: isGatewayOff ? '#ef4444' : 'var(--mfe-warning)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              cursor: 'pointer'
            }}
          >
            <BarChart3 size={22} />
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--mfe-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Peak Window Spike
            </div>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: isGatewayOff ? 'var(--mfe-text-muted)' : 'var(--mfe-text-primary)' }}>
              {isGatewayOff ? '—' : (data?.totals?.peakWindow || `$${maxRevenue.toLocaleString()}`)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="mfe-stagger-3">
        <Card
          title="Revenue & Performance Trajectory"
          subtitle={`Aggregated financial growth trend across the selected ${timeframe} window`}
          icon={TrendingUp}
          action={
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--mfe-text-muted)' }}>
                Peak In Window: <strong style={{ color: 'var(--mfe-text-primary)' }}>${maxRevenue.toLocaleString()}</strong>
              </span>
            </div>
          }
        >
        {isGatewayOff ? (
          <div style={{ height: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px', textAlign: 'center', padding: '24px' }}>
            <div
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                backgroundColor: 'rgba(239, 68, 68, 0.12)',
                color: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <AlertTriangle size={28} />
            </div>
            <div style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
              Telemetry Feed Disconnected
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--mfe-text-secondary)', maxWidth: '420px', lineHeight: 1.5 }}>
              Aggregated revenue trajectory and historical chart data disappeared because the Mesh Gateway is offline. Turn the gateway LIVE in the top bar to restore incoming streams.
            </p>
          </div>
        ) : loading ? (
          <div style={{ height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="mfe-skeleton" style={{ width: '100%', height: '220px' }} />
          </div>
        ) : (
          <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              style={{ width: '100%', height: 'auto', minWidth: '550px', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="mfeRevenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--mfe-primary)" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="var(--mfe-primary)" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines and Dynamic Y-Axis Labels */}
              {yTicks.map((tick, i) => (
                <g key={i}>
                  <line
                    x1={paddingLeft}
                    y1={tick.y}
                    x2={chartWidth - paddingRight}
                    y2={tick.y}
                    stroke="var(--mfe-border-subtle)"
                    strokeDasharray={i === yTicks.length - 1 ? 'none' : '4 4'}
                    strokeWidth={i === yTicks.length - 1 ? '1.5' : '1'}
                  />
                  <text
                    x={paddingLeft - 10}
                    y={tick.y + 4}
                    textAnchor="end"
                    fill="var(--mfe-text-muted)"
                    fontSize="10"
                    fontFamily="var(--mfe-font-sans)"
                    fontWeight="600"
                  >
                    {tick.label}
                  </text>
                </g>
              ))}

              {/* Area Fill */}
              <path d={areaD} fill="url(#mfeRevenueGrad)" />

              {/* Stroke Path */}
              <path
                d={pathD}
                fill="none"
                stroke="var(--mfe-primary)"
                strokeWidth="3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Data Points */}
              {points.map((p, idx) => {
                const isHovered = hoveredPoint?.data.label === p.data.label;
                return (
                  <g
                    key={`${p.data.label}-${idx}`}
                    onMouseEnter={() => setHoveredPoint(p)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    style={{ cursor: 'pointer' }}
                  >
                    <circle
                      cx={p.x}
                      cy={p.y}
                      r={isHovered ? 7 : 4.5}
                      fill="var(--mfe-bg-surface)"
                      stroke="var(--mfe-primary)"
                      strokeWidth={isHovered ? 3 : 2}
                      style={{ transition: 'all 0.15s ease' }}
                    />
                    <text
                      x={p.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fill={isHovered ? 'var(--mfe-primary)' : 'var(--mfe-text-muted)'}
                      fontSize="11"
                      fontWeight={isHovered ? '700' : '500'}
                      fontFamily="var(--mfe-font-sans)"
                    >
                      {p.data.label}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* Hover Tooltip Overlay */}
            {hoveredPoint && (
              <div
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '16px',
                  padding: '10px 14px',
                  background: 'var(--mfe-bg-popover)',
                  border: '1px solid var(--mfe-primary)',
                  borderRadius: 'var(--mfe-radius-md)',
                  boxShadow: 'var(--mfe-shadow-md)',
                  pointerEvents: 'none',
                  animation: 'mfe-fadeIn 0.15s ease'
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>
                  {timeframe === '7D' ? 'Day' : timeframe === '1Y' ? 'Month' : 'Interval'}: <strong>{hoveredPoint.data.label}</strong>
                </div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--mfe-primary)' }}>
                  ${hoveredPoint.data.revenue.toLocaleString()}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-secondary)' }}>
                  Active Users: {hoveredPoint.data.users.toLocaleString()} • Conv: {hoveredPoint.data.conversion}%
                </div>
              </div>
            )}
          </div>
        )}
      </Card>
      </div>

      {/* Second Row: Traffic Distribution & Conversion Funnel (Equal Height) */}
      <div
        className="mfe-dashboard-matrix-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '20px',
          alignItems: 'stretch'
        }}
      >
        {/* Traffic Sources */}
        <div className="mfe-stagger-4" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Card
            title="Traffic Attribution by Channel"
            subtitle="User volume and engagement share per referral channel"
            icon={PieChart}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {isGatewayOff ? (
              <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--mfe-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={24} color="#ef4444" />
                <div style={{ fontWeight: 600, color: 'var(--mfe-text-primary)', fontSize: '0.875rem' }}>Attribution stream disconnected</div>
                <div style={{ fontSize: '0.8125rem' }}>Channels disappear while gateway is offline.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '16px', padding: '4px 0' }}>
                {data?.trafficSources?.map((ts, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--mfe-text-primary)' }}>
                        {ts.source}
                      </span>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: ts.color }}>
                        {ts.share}% ({ts.visits.toLocaleString()})
                      </span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        width: '100%',
                        backgroundColor: 'var(--mfe-border)',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${ts.share}%`,
                          backgroundColor: ts.color,
                          borderRadius: '9999px',
                          transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Funnel Breakdown */}
        <div className="mfe-stagger-5" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Card
            title="Conversion & Acquisition Funnel"
            subtitle="Stage retention rates from impression to paid subscription"
            icon={Layers}
            style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
          >
            {isGatewayOff ? (
              <div style={{ padding: '48px 16px', textAlign: 'center', color: 'var(--mfe-text-secondary)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={24} color="#ef4444" />
                <div style={{ fontWeight: 600, color: 'var(--mfe-text-primary)', fontSize: '0.875rem' }}>Acquisition funnel offline</div>
                <div style={{ fontSize: '0.8125rem' }}>Pipeline metrics disappear while gateway is offline.</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, gap: '12px' }}>
                {data?.conversionFunnel?.map((step, idx) => (
                  <div
                    key={idx}
                    className="mfe-table-row"
                    style={{
                      padding: '12px 14px',
                      borderRadius: 'var(--mfe-radius-md)',
                      background: 'var(--mfe-bg-surface)',
                      border: '1px solid var(--mfe-border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'default'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--mfe-text-primary)' }}>
                        {step.step}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--mfe-text-muted)' }}>
                        Dropoff: {step.dropoff}
                      </div>
                    </div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--mfe-primary)' }}>
                      {step.value.toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
