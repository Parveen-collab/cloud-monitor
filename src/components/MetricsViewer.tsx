import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart3,
  RefreshCw,
  Copy,
  Check,
  Cpu,
  HardDrive,
  Activity,
  Layers,
  Terminal,
  Zap,
  Radio,
  Clock,
  Search,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import type { ParsedPrometheusMetrics } from 'src/types/monitor';
import { fetchParsedMetrics, fetchRawMetrics } from 'src/services/api';

interface MetricsViewerProps {
  initialRefreshInterval?: number;
}

export const MetricsViewer: React.FC<MetricsViewerProps> = ({
  initialRefreshInterval = 3000,
}) => {
  const [metrics, setMetrics] = useState<ParsedPrometheusMetrics | null>(null);
  const [rawText, setRawText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(initialRefreshInterval);
  const [activeTab, setActiveTab] = useState<'visual' | 'raw'>('visual');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  const loadData = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [parsed, raw] = await Promise.all([
        fetchParsedMetrics(),
        fetchRawMetrics(),
      ]);
      setMetrics(parsed);
      setRawText(raw);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape /metrics');
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setRefreshing(false), 300);
      }
    }
  }, []);

  useEffect(() => {
    loadData();

    if (refreshInterval <= 0) return;

    const timer = setInterval(() => {
      loadData();
    }, refreshInterval);

    return () => clearInterval(timer);
  }, [loadData, refreshInterval]);

  const handleCopyRaw = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredRawLines = useMemo(() => {
    if (!rawText) return [];
    const lines = rawText.split('\n');
    if (!filterQuery.trim()) return lines;
    const q = filterQuery.toLowerCase();
    return lines.filter((l) => l.toLowerCase().includes(q));
  }, [rawText, filterQuery]);

  const formatBytes = (bytes: number): string => {
    if (!bytes || bytes === 0) return '0 MB';
    const mb = bytes / (1024 * 1024);
    if (mb >= 1024) {
      return `${(mb / 1024).toFixed(2)} GB`;
    }
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div
      style={{
        background: '#1a1d24',
        borderRadius: '12px',
        border: '1px solid #2e3440',
        padding: '24px',
        color: '#eceff4',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
        textAlign: 'left',
        maxWidth: '880px',
        margin: '24px auto',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Header */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '20px',
          paddingBottom: '16px',
          borderBottom: '1px solid #2e3440',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              padding: '10px',
              borderRadius: '10px',
              backgroundColor: 'rgba(136, 192, 208, 0.12)',
              border: '1px solid rgba(136, 192, 208, 0.3)',
              color: '#88c0d0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, color: '#eceff4' }}>
                Prometheus Metrics Telemetry
              </h2>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontFamily: 'monospace',
                  background: 'rgba(129, 161, 193, 0.2)',
                  color: '#88c0d0',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid rgba(136, 192, 208, 0.4)',
                }}
              >
                GET /metrics
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#81a1c1' }}>
              Live runtime telemetry scraped directly in Prometheus OpenMetrics format
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Polling Interval Select */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.75rem',
              color: '#81a1c1',
              background: '#242933',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid #3b4252',
            }}
          >
            <Clock size={13} />
            <span>Poll:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#eceff4',
                fontSize: '0.75rem',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value={1000} style={{ background: '#242933' }}>1s</option>
              <option value={3000} style={{ background: '#242933' }}>3s</option>
              <option value={5000} style={{ background: '#242933' }}>5s</option>
              <option value={10000} style={{ background: '#242933' }}>10s</option>
              <option value={0} style={{ background: '#242933' }}>Manual</option>
            </select>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => loadData(true)}
            disabled={refreshing || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#2e3440',
              border: '1px solid #434c5e',
              color: '#d8dee9',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseOver={(e) => (e.currentTarget.style.background = '#3b4252')}
            onMouseOut={(e) => (e.currentTarget.style.background = '#2e3440')}
          >
            <RefreshCw
              size={13}
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none',
              }}
            />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          borderBottom: '1px solid #2e3440',
          paddingBottom: '8px',
        }}
      >
        <button
          onClick={() => setActiveTab('visual')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'visual' ? 'rgba(136, 192, 208, 0.15)' : 'transparent',
            color: activeTab === 'visual' ? '#88c0d0' : '#81a1c1',
            border: activeTab === 'visual' ? '1px solid #88c0d0' : '1px solid transparent',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <BarChart3 size={15} />
          Visual Dashboard
        </button>

        <button
          onClick={() => setActiveTab('raw')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeTab === 'raw' ? 'rgba(136, 192, 208, 0.15)' : 'transparent',
            color: activeTab === 'raw' ? '#88c0d0' : '#81a1c1',
            border: activeTab === 'raw' ? '1px solid #88c0d0' : '1px solid transparent',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <Terminal size={15} />
          Raw Prometheus Stream
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div
          style={{
            background: '#3b1212',
            border: '1px solid #7f1d1d',
            padding: '12px 16px',
            borderRadius: '8px',
            color: '#fca5a5',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem',
          }}
        >
          <ShieldAlert size={18} />
          <div>
            <strong>Error querying /metrics:</strong> {error}
            <div style={{ fontSize: '0.75rem', marginTop: '4px', color: '#f87171' }}>
              Ensure your backend is running on http://localhost:8000 and CORS or Vite proxy is enabled.
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: Visual Telemetry Dashboard */}
      {activeTab === 'visual' && metrics && (
        <div>
          {/* 4 Primary KPI Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
              gap: '12px',
              marginBottom: '20px',
            }}
          >
            {/* KPI 1: Total HTTP Requests */}
            <div
              style={{
                background: '#242933',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #3b4252',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#81a1c1', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <span>Total Requests</span>
                <Activity size={16} color="#88c0d0" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '8px 0 4px', color: '#eceff4' }}>
                {metrics.totalRequestsCount}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#a3be8c' }}>
                {metrics.httpRequests.length} active endpoints tracked
              </div>
            </div>

            {/* KPI 2: Active Requests & Errors */}
            <div
              style={{
                background: '#242933',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #3b4252',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#81a1c1', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <span>Active / In-Flight</span>
                <Zap size={16} color="#ebcb8b" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '8px 0 4px', color: '#eceff4' }}>
                {metrics.process.activeRequests}
              </div>
              <div style={{ fontSize: '0.72rem', color: metrics.process.simulatedErrorsTotal > 0 ? '#f87171' : '#81a1c1' }}>
                Simulated 500 Errors: <strong>{metrics.process.simulatedErrorsTotal}</strong>
              </div>
            </div>

            {/* KPI 3: Resident Memory (RSS) */}
            <div
              style={{
                background: '#242933',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #3b4252',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#81a1c1', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <span>Resident Memory (RSS)</span>
                <HardDrive size={16} color="#b48ead" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '8px 0 4px', color: '#eceff4' }}>
                {formatBytes(metrics.process.residentMemoryBytes)}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#81a1c1' }}>
                Virtual: {formatBytes(metrics.process.virtualMemoryBytes)}
              </div>
            </div>

            {/* KPI 4: CPU & Python Runtime */}
            <div
              style={{
                background: '#242933',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #3b4252',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#81a1c1', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                <span>Process CPU Time</span>
                <Cpu size={16} color="#88c0d0" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, margin: '8px 0 4px', color: '#eceff4' }}>
                {metrics.process.cpuSecondsTotal.toFixed(2)}s
              </div>
              <div style={{ fontSize: '0.72rem', color: '#88c0d0' }}>
                CPython v{metrics.process.pythonVersion}
              </div>
            </div>
          </div>

          {/* Section: Endpoint Traffic & Status Breakdown */}
          <div
            style={{
              background: '#242933',
              borderRadius: '8px',
              border: '1px solid #3b4252',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#d8dee9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={16} color="#88c0d0" />
                Endpoint Request Distribution
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#81a1c1' }}>
                cloudmonitor_http_requests_total
              </span>
            </div>

            {metrics.httpRequests.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#81a1c1', margin: 0 }}>No HTTP request telemetry recorded yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ color: '#81a1c1', textAlign: 'left', borderBottom: '1px solid #3b4252' }}>
                      <th style={{ padding: '8px 10px' }}>Method</th>
                      <th style={{ padding: '8px 10px' }}>Endpoint</th>
                      <th style={{ padding: '8px 10px' }}>Status</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Requests</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right' }}>Share</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.httpRequests.map((req, i) => {
                      const sharePercent = metrics.totalRequestsCount > 0
                        ? Math.round((req.count / metrics.totalRequestsCount) * 100)
                        : 0;
                      return (
                        <tr
                          key={`${req.endpoint}-${req.method}-${req.statusCode}-${i}`}
                          style={{
                            borderBottom: '1px solid #2e3440',
                            backgroundColor: i % 2 === 0 ? 'rgba(0,0,0,0.1)' : 'transparent',
                          }}
                        >
                          <td style={{ padding: '8px 10px' }}>
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                background: req.method === 'GET' ? 'rgba(136, 192, 208, 0.2)' : 'rgba(180, 142, 173, 0.2)',
                                color: req.method === 'GET' ? '#88c0d0' : '#b48ead',
                              }}
                            >
                              {req.method}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', fontFamily: 'monospace', color: '#eceff4' }}>
                            {req.endpoint}
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <span
                              style={{
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: req.statusCode.startsWith('2')
                                  ? 'rgba(163, 190, 140, 0.2)'
                                  : 'rgba(191, 97, 106, 0.2)',
                                color: req.statusCode.startsWith('2') ? '#a3be8c' : '#bf616a',
                              }}
                            >
                              {req.statusCode}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: 600 }}>
                            {req.count}
                          </td>
                          <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
                              <span style={{ fontSize: '0.75rem', color: '#81a1c1' }}>{sharePercent}%</span>
                              <div
                                style={{
                                  width: '45px',
                                  height: '6px',
                                  background: '#3b4252',
                                  borderRadius: '3px',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    width: `${sharePercent}%`,
                                    height: '100%',
                                    background: '#88c0d0',
                                    borderRadius: '3px',
                                  }}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Section: Latency Benchmarks */}
          <div
            style={{
              background: '#242933',
              borderRadius: '8px',
              border: '1px solid #3b4252',
              padding: '16px',
              marginBottom: '20px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#d8dee9', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="#ebcb8b" />
                Response Latency & Duration (Histogram Summary)
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#81a1c1' }}>
                cloudmonitor_http_request_duration_seconds
              </span>
            </div>

            {metrics.latencies.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#81a1c1', margin: 0 }}>No latency histogram data recorded yet.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
                {metrics.latencies.map((lat, i) => (
                  <div
                    key={`${lat.endpoint}-${lat.method}-${i}`}
                    style={{
                      background: '#1a1d24',
                      padding: '12px',
                      borderRadius: '6px',
                      border: '1px solid #3b4252',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.82rem', color: '#eceff4' }}>
                        {lat.endpoint}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          background: '#3b4252',
                          color: '#88c0d0',
                        }}
                      >
                        {lat.method}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', margin: '4px 0' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 700, color: lat.avgMs < 50 ? '#a3be8c' : lat.avgMs < 200 ? '#ebcb8b' : '#bf616a' }}>
                        {lat.avgMs} ms
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#81a1c1' }}>avg latency</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#81a1c1', marginTop: '6px', borderTop: '1px solid #2e3440', paddingTop: '6px' }}>
                      <span>Scrapes: {lat.count}</span>
                      <span>Total Time: {lat.sum.toFixed(3)}s</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: Process & Garbage Collection Internals */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {/* File Descriptors */}
            <div
              style={{
                background: '#242933',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1px solid #3b4252',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#81a1c1', marginBottom: '6px' }}>
                OS File Descriptors (Open / Max)
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>{metrics.process.openFds}</span>
                <span style={{ fontSize: '0.75rem', color: '#6e7786' }}>/ {metrics.process.maxFds.toLocaleString()}</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: '#3b4252', borderRadius: '2px', marginTop: '8px' }}>
                <div
                  style={{
                    width: `${Math.max(1, (metrics.process.openFds / metrics.process.maxFds) * 100)}%`,
                    height: '100%',
                    background: '#a3be8c',
                    borderRadius: '2px',
                  }}
                />
              </div>
            </div>

            {/* Python Garbage Collection */}
            <div
              style={{
                background: '#242933',
                padding: '14px 16px',
                borderRadius: '8px',
                border: '1px solid #3b4252',
              }}
            >
              <div style={{ fontSize: '0.78rem', color: '#81a1c1', marginBottom: '8px' }}>
                Python GC Collections (Generations 0 / 1 / 2)
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1, background: '#1a1d24', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#81a1c1' }}>Gen 0</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#88c0d0' }}>
                    {metrics.process.gcCollections.gen0}
                  </div>
                </div>
                <div style={{ flex: 1, background: '#1a1d24', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#81a1c1' }}>Gen 1</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#81a1c1' }}>
                    {metrics.process.gcCollections.gen1}
                  </div>
                </div>
                <div style={{ flex: 1, background: '#1a1d24', padding: '6px 8px', borderRadius: '4px', textAlign: 'center' }}>
                  <div style={{ fontSize: '0.65rem', color: '#81a1c1' }}>Gen 2</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, color: '#5e81ac' }}>
                    {metrics.process.gcCollections.gen2}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Raw Prometheus Text Inspector */}
      {activeTab === 'raw' && (
        <div>
          {/* Search Bar & Copy Button */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              marginBottom: '12px',
              flexWrap: 'wrap',
            }}
          >
            {/* Search filter input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#242933',
                border: '1px solid #3b4252',
                borderRadius: '6px',
                padding: '6px 12px',
                flex: '1 1 250px',
              }}
            >
              <Search size={14} color="#81a1c1" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter metrics (e.g. cloudmonitor, memory, http)..."
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#eceff4',
                  fontSize: '0.8rem',
                  outline: 'none',
                  width: '100%',
                }}
              />
              {filterQuery && (
                <button
                  onClick={() => setFilterQuery('')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#81a1c1',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                  }}
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Filter Buttons & Copy */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={() => setFilterQuery('cloudmonitor')}
                style={{
                  background: filterQuery === 'cloudmonitor' ? '#434c5e' : '#242933',
                  border: '1px solid #3b4252',
                  color: '#88c0d0',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                }}
              >
                App
              </button>
              <button
                onClick={() => setFilterQuery('process')}
                style={{
                  background: filterQuery === 'process' ? '#434c5e' : '#242933',
                  border: '1px solid #3b4252',
                  color: '#81a1c1',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                }}
              >
                Process
              </button>
              <button
                onClick={() => setFilterQuery('python')}
                style={{
                  background: filterQuery === 'python' ? '#434c5e' : '#242933',
                  border: '1px solid #3b4252',
                  color: '#b48ead',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                }}
              >
                Python
              </button>

              <button
                onClick={handleCopyRaw}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: copied ? '#2e4536' : '#2e3440',
                  border: `1px solid ${copied ? '#a3be8c' : '#434c5e'}`,
                  color: copied ? '#a3be8c' : '#d8dee9',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? 'Copied!' : 'Copy All'}</span>
              </button>

              <a
                href="http://localhost:8000/metrics"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#242933',
                  border: '1px solid #3b4252',
                  color: '#81a1c1',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  textDecoration: 'none',
                }}
              >
                <ExternalLink size={13} />
                Open /metrics
              </a>
            </div>
          </div>

          {/* Raw Text Stream Viewport */}
          <div
            style={{
              background: '#0f1115',
              border: '1px solid #2e3440',
              borderRadius: '8px',
              padding: '14px',
              maxHeight: '440px',
              overflowY: 'auto',
              fontFamily: 'Consolas, Monaco, "Courier New", monospace',
              fontSize: '0.78rem',
              lineHeight: '1.6',
            }}
          >
            {filteredRawLines.length === 0 ? (
              <div style={{ color: '#81a1c1', textAlign: 'center', padding: '20px' }}>
                No metrics match your search query: &quot;{filterQuery}&quot;
              </div>
            ) : (
              filteredRawLines.map((line, idx) => {
                const isComment = line.startsWith('#');
                const isHelp = line.startsWith('# HELP');
                const isType = line.startsWith('# TYPE');

                let lineStyle: React.CSSProperties = { color: '#d8dee9', whiteSpace: 'pre-wrap' };
                if (isHelp) lineStyle = { color: '#81a1c1', fontStyle: 'italic' };
                else if (isType) lineStyle = { color: '#b48ead' };
                else if (isComment) lineStyle = { color: '#6e7786' };
                else if (line.includes('cloudmonitor_')) lineStyle = { color: '#88c0d0' };
                else if (line.includes('process_')) lineStyle = { color: '#ebcb8b' };
                else if (line.includes('python_')) lineStyle = { color: '#a3be8c' };

                return (
                  <div key={idx} style={{ display: 'flex', gap: '12px' }}>
                    <span style={{ color: '#4c566a', userSelect: 'none', minWidth: '32px', textAlign: 'right' }}>
                      {idx + 1}
                    </span>
                    <span style={lineStyle}>{line}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div
        style={{
          marginTop: '16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          color: '#6e7786',
          borderTop: '1px solid #242933',
          paddingTop: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Radio size={12} color="#88c0d0" />
          <span>Scraping http://localhost:8000/metrics</span>
        </div>
        <span>
          {metrics ? `Last scraped: ${metrics.timestamp.toLocaleTimeString()}` : 'Connecting...'}
        </span>
      </div>
    </div>
  );
};
