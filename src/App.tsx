import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Chip,
  Button,
  Paper,
  Alert,
  AlertTitle,
  FormControl,
  Select,
  MenuItem,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Tooltip,
} from '@mui/material';

// Icons
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// Types & Services
import type { HealthStatus, ProjectInfo, ParsedPrometheusMetrics, ServiceStatus } from 'src/types/monitor';
import { fetchHealth, fetchProjectInfo, fetchParsedMetrics, fetchRawMetrics, fetchStatus } from 'src/services/api';
import { darkTheme } from 'src/theme';
import { STAT_DEFINITIONS } from 'src/data/statDefinitions';
import { StatDetailModal } from 'src/components/StatDetailModal';
import { InteractiveStatCard } from 'src/components/InteractiveStatCard';
import { ErrorSimulationCard } from 'src/components/ErrorSimulationCard';
import { LatencySimulationCard } from 'src/components/LatencySimulationCard';
import { HealthToggleCard } from 'src/components/HealthToggleCard';

const formatUptime = (totalSeconds?: number): string => {
  if (totalSeconds === undefined || totalSeconds === null || isNaN(totalSeconds)) return '--';
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

const formatBytes = (bytes?: number): string => {
  if (!bytes || bytes === 0) return '0 MB';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1024) {
    return `${(mb / 1024).toFixed(2)} GB`;
  }
  return `${mb.toFixed(1)} MB`;
};

export default function App() {
  // Telemetry State
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [metrics, setMetrics] = useState<ParsedPrometheusMetrics | null>(null);
  const [rawText, setRawText] = useState<string>('');

  // UI & Loading State
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshInterval, setRefreshInterval] = useState<number>(3000);
  const [activeTab, setActiveTab] = useState<'endpoints' | 'sre' | 'runtime' | 'raw'>('endpoints');
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [copiedRaw, setCopiedRaw] = useState<boolean>(false);

  // Click-to-inspect Modal State
  const [selectedStatId, setSelectedStatId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  // Load project metadata once on mount
  useEffect(() => {
    let isMounted = true;
    const loadProject = async () => {
      try {
        const data = await fetchProjectInfo();
        if (isMounted) setProject(data);
      } catch {
        // Fallback or retry silently
      }
    };
    void loadProject();
    return () => {
      isMounted = false;
    };
  }, []);

  // Main telemetry poll function
  const refreshAllTelemetry = useCallback(async () => {
    try {
      const [healthData, statusData, parsedMetrics, rawMetrics] = await Promise.all([
        fetchHealth().catch(() => null),
        fetchStatus().catch(() => null),
        fetchParsedMetrics().catch(() => null),
        fetchRawMetrics().catch(() => ''),
      ]);

      if (healthData) setHealth(healthData);
      if (statusData) setStatus(statusData);
      if (parsedMetrics) setMetrics(parsedMetrics);
      if (rawMetrics) setRawText(rawMetrics);

      if (!healthData && !parsedMetrics) {
        setError('Backend is currently unreachable at ' + apiBase);
      } else {
        setError(null);
      }
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Telemetry sync failed');
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  // Initial load and interval timer
  useEffect(() => {
    let isMounted = true;

    const runPoll = async () => {
      if (isMounted) {
        await refreshAllTelemetry();
      }
    };

    void runPoll();

    if (refreshInterval <= 0) return;

    const timer = setInterval(() => {
      void runPoll();
    }, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [refreshInterval, refreshAllTelemetry]);

  // Manual refresh button click
  const handleManualRefresh = async () => {
    setRefreshing(true);
    await refreshAllTelemetry();
    setTimeout(() => setRefreshing(false), 350);
  };

  // Click-to-Inspect handler
  const handleStatCardClick = (statId: string) => {
    setSelectedStatId(statId);
    setModalOpen(true);
  };

  // Compute overall average latency across all routes
  const overallAvgMs = useMemo(() => {
    if (!metrics || metrics.latencies.length === 0) return 0;
    const totalSum = metrics.latencies.reduce((acc, curr) => acc + curr.sum, 0);
    const totalCount = metrics.latencies.reduce((acc, curr) => acc + curr.count, 0);
    if (totalCount === 0) return 0;
    return Math.round((totalSum / totalCount) * 1000 * 100) / 100;
  }, [metrics]);

  // Modal payload computation
  const modalProps = useMemo(() => {
    if (!selectedStatId || !STAT_DEFINITIONS[selectedStatId]) {
      return { stat: null, value: undefined, status: 'healthy' as const };
    }

    const stat = STAT_DEFINITIONS[selectedStatId];
    let value: React.ReactNode = '--';
    let statusLevel: 'healthy' | 'warning' | 'critical' | 'neutral' = 'healthy';

    switch (selectedStatId) {
      case 'health':
        value = health?.status ? health.status.toUpperCase() : (error ? 'UNREACHABLE' : 'CONNECTING...');
        statusLevel = health?.status === 'healthy' ? 'healthy' : health?.status === 'degraded' ? 'warning' : 'critical';
        break;
      case 'uptime':
        value = health?.uptime_seconds !== undefined ? formatUptime(health.uptime_seconds) : '--';
        statusLevel = health && health.uptime_seconds > 60 ? 'healthy' : 'warning';
        break;
      case 'totalRequests':
        value = metrics ? `${metrics.totalRequestsCount.toLocaleString()} requests` : '--';
        statusLevel = 'healthy';
        break;
      case 'activeRequests':
        value = metrics ? `${metrics.process.activeRequests} in-flight` : '0 in-flight';
        statusLevel = (metrics?.process.activeRequests ?? 0) > 10 ? 'warning' : 'healthy';
        break;
      case 'latency':
        value = `${overallAvgMs} ms avg`;
        statusLevel = overallAvgMs < 50 ? 'healthy' : overallAvgMs < 200 ? 'warning' : 'critical';
        break;
      case 'residentMemory':
        value = metrics ? formatBytes(metrics.process.residentMemoryBytes) : '--';
        statusLevel = 'healthy';
        break;
      case 'cpuSeconds':
        value = metrics ? `${metrics.process.cpuSecondsTotal.toFixed(2)}s CPU time` : '--';
        statusLevel = 'healthy';
        break;
      case 'fileDescriptors':
        value = metrics ? `${metrics.process.openFds} / ${metrics.process.maxFds.toLocaleString()} FDs` : '--';
        statusLevel = (metrics && (metrics.process.openFds / metrics.process.maxFds) > 0.75) ? 'warning' : 'healthy';
        break;
      case 'simulatedErrors':
        value = metrics ? `${metrics.process.simulatedErrorsTotal} error(s)` : '0 errors';
        statusLevel = (metrics?.process.simulatedErrorsTotal ?? 0) > 0 ? 'warning' : 'healthy';
        break;
      case 'gcCollections':
        value = metrics ? `Gen0: ${metrics.process.gcCollections.gen0} | Gen1: ${metrics.process.gcCollections.gen1} | Gen2: ${metrics.process.gcCollections.gen2}` : '--';
        statusLevel = 'healthy';
        break;
    }

    return { stat, value, status: statusLevel };
  }, [selectedStatId, health, metrics, error, overallAvgMs]);

  // Raw lines filtering
  const filteredRawLines = useMemo(() => {
    if (!rawText) return [];
    const lines = rawText.split('\n');
    if (!filterQuery.trim()) return lines;
    const q = filterQuery.toLowerCase();
    return lines.filter((l) => l.toLowerCase().includes(q));
  }, [rawText, filterQuery]);

  const handleCopyRaw = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopiedRaw(true);
    setTimeout(() => setCopiedRaw(false), 2000);
  };

  // Health status config
  const isHealthy = health?.status === 'healthy';
  const isDegraded = health?.status === 'degraded';
  const healthBadgeStatus = error
    ? 'critical'
    : isHealthy
    ? 'healthy'
    : isDegraded
    ? 'warning'
    : 'critical';

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/* Main Single-Page Command Center Wrapper */}
      <Box className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
        <Container maxWidth="xl" className="py-4 sm:py-6 space-y-5 flex-1 flex flex-col">
          {/* Top Compact Command Center Bar */}
          <Paper
            elevation={0}
            className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-xl relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <Box className="absolute -top-20 -right-20 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <Box className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <Box className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
              {/* Left: Branding & Status */}
              <Box className="flex items-center gap-3.5">
                <Box className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-inner">
                  <CloudQueueRoundedIcon fontSize="large" />
                </Box>
                <Box>
                  <Box className="flex items-center gap-2 flex-wrap">
                    <Typography variant="h5" component="h1" className="font-extrabold text-xl sm:text-2xl text-slate-100 tracking-tight">
                      {project?.project ?? 'CloudMonitor'}
                    </Typography>
                    <Chip
                      label={project?.version ? `v${project.version}` : 'v1.0.0'}
                      size="small"
                      className="font-mono text-xs font-semibold bg-sky-950/70 text-sky-300 border border-sky-500/30"
                    />
                    <Chip
                      icon={<span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />}
                      label={error ? 'OFFLINE' : 'SINGLE-PAGE OBSERVABILITY'}
                      size="small"
                      className="font-mono text-[11px] font-bold bg-slate-800 text-slate-300 border border-slate-700"
                    />
                  </Box>
                  <Typography variant="body2" className="text-slate-400 text-xs sm:text-sm mt-0.5">
                    {project?.description ?? 'Production-grade real-time telemetry, SRE controls, and Golden Signals'}
                  </Typography>
                </Box>
              </Box>

              {/* Right: Controls & Live Endpoint Links */}
              <Box className="flex items-center gap-2.5 flex-wrap self-start lg:self-center">
                {/* Polling Interval Select */}
                <FormControl size="small" className="min-w-28">
                  <Select
                    value={refreshInterval}
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    startAdornment={<TimerRoundedIcon sx={{ fontSize: 15 }} className="text-slate-400 mr-1" />}
                    className="bg-slate-800/80 text-slate-200 text-xs rounded-xl"
                    sx={{
                      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                      '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                    }}
                  >
                    <MenuItem value={1000} className="text-xs">Poll: 1s</MenuItem>
                    <MenuItem value={3000} className="text-xs">Poll: 3s (default)</MenuItem>
                    <MenuItem value={5000} className="text-xs">Poll: 5s</MenuItem>
                    <MenuItem value={10000} className="text-xs">Poll: 10s</MenuItem>
                    <MenuItem value={0} className="text-xs">Manual</MenuItem>
                  </Select>
                </FormControl>

                {/* Manual Refresh Button */}
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleManualRefresh}
                  disabled={refreshing || loading}
                  startIcon={
                    <RefreshRoundedIcon className={refreshing ? 'animate-spin' : ''} fontSize="small" />
                  }
                  className="px-3.5 py-1.5 rounded-xl border-slate-700 hover:border-sky-400 bg-slate-800/80 text-slate-200 hover:text-sky-300 normal-case font-medium text-xs transition-colors"
                >
                  Refresh
                </Button>

                {/* Direct Live Links */}
                <Box className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-800">
                  <Tooltip title="Open FastAPI Interactive Swagger Documentation">
                    <Button
                      size="small"
                      href={`${apiBase}${project?.docs_url ?? '/docs'}`}
                      target="_blank"
                      rel="noreferrer"
                      startIcon={<MenuBookRoundedIcon fontSize="small" />}
                      className="text-xs text-sky-400 hover:bg-sky-950/40 normal-case rounded-lg px-2.5 py-1 font-mono"
                    >
                      /docs
                    </Button>
                  </Tooltip>

                  <Tooltip title="View live Prometheus exposition metrics stream">
                    <Button
                      size="small"
                      href={`${apiBase}${project?.metrics_url ?? '/metrics'}`}
                      target="_blank"
                      rel="noreferrer"
                      startIcon={<BarChartRoundedIcon fontSize="small" />}
                      className="text-xs text-purple-400 hover:bg-purple-950/40 normal-case rounded-lg px-2.5 py-1 font-mono"
                    >
                      /metrics
                    </Button>
                  </Tooltip>

                  <Tooltip title="View raw JSON healthcheck endpoint">
                    <Button
                      size="small"
                      href={`${apiBase}${project?.health_url ?? '/health'}`}
                      target="_blank"
                      rel="noreferrer"
                      startIcon={<FavoriteBorderRoundedIcon fontSize="small" />}
                      className="text-xs text-emerald-400 hover:bg-emerald-950/40 normal-case rounded-lg px-2.5 py-1 font-mono"
                    >
                      /health
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Paper>

          {/* Error Banner if Backend is down */}
          {error && (
            <Alert
              severity="error"
              variant="outlined"
              className="border-rose-500/30 bg-rose-950/20 text-rose-300 rounded-2xl"
            >
              <AlertTitle className="font-semibold text-sm">Telemetry Connection Warning</AlertTitle>
              <Typography variant="body2" className="text-xs">
                {error}. Ensure your backend container is running (`docker start cloudmonitor-backend`) on {apiBase}.
              </Typography>
            </Alert>
          )}

          {/* MASTER KPI GRID: 8 Interactive Stat Cards (Hover Lift, Glow & Click-to-Inspect) */}
          <Box className="space-y-2">
            <Box className="flex items-center justify-between px-1">
              <Typography variant="overline" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
                Real-Time KPI Telemetry (Click any card to inspect full SRE impact &amp; thresholds)
              </Typography>
              <Typography variant="caption" className="text-slate-400 font-mono text-[11px]">
                {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Connecting...'}
              </Typography>
            </Box>

            <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* STAT 1: System Health Status */}
              <InteractiveStatCard
                id="health"
                title="System Health"
                value={
                  error
                    ? 'UNREACHABLE'
                    : health?.status
                    ? health.status.toUpperCase()
                    : loading
                    ? 'CHECKING...'
                    : 'UNKNOWN'
                }
                subtitle="Readiness of core API, exporter & workers"
                icon={<HealthAndSafetyOutlinedIcon fontSize="small" />}
                tooltipText="Composite health indicator from /health endpoint. Used by Kubernetes/ALB probes to route traffic."
                accentColor={healthBadgeStatus === 'healthy' ? 'emerald' : healthBadgeStatus === 'warning' ? 'amber' : 'rose'}
                statusLevel={healthBadgeStatus}
                badgeText={error ? 'OFFLINE' : isHealthy ? 'ALL SYSTEMS OK' : 'DEGRADED'}
                onClick={() => handleStatCardClick('health')}
              />

              {/* STAT 2: Live Uptime */}
              <InteractiveStatCard
                id="uptime"
                title="Process Uptime"
                value={health?.uptime_seconds !== undefined ? formatUptime(health.uptime_seconds) : '--'}
                subtitle="Continuous runtime without crashes"
                icon={<AccessTimeRoundedIcon fontSize="small" />}
                tooltipText="Continuous elapsed time since backend boot. Resetting signals crashes, restarts, or OOM-kills."
                accentColor="cyan"
                statusLevel="healthy"
                badgeText="STABILITY"
                onClick={() => handleStatCardClick('uptime')}
              />

              {/* STAT 3: Total Requests */}
              <InteractiveStatCard
                id="totalRequests"
                title="Total Requests"
                value={metrics ? metrics.totalRequestsCount.toLocaleString() : (loading ? '...' : '0')}
                subtitle={`${metrics?.httpRequests.length ?? 0} active endpoints tracked`}
                icon={<ShowChartRoundedIcon fontSize="small" />}
                tooltipText="Total HTTP traffic processed by CloudMonitor. Fundamental Golden Signal for computing traffic and error rates."
                accentColor="sky"
                statusLevel="healthy"
                badgeText="TRAFFIC SIGNAL"
                onClick={() => handleStatCardClick('totalRequests')}
              />

              {/* STAT 4: Active / In-Flight Requests */}
              <InteractiveStatCard
                id="activeRequests"
                title="Active / In-Flight"
                value={metrics?.process.activeRequests ?? 0}
                subtitle={
                  <span>
                    Simulated 500s: <strong className="text-rose-400">{metrics?.process.simulatedErrorsTotal ?? 0}</strong>
                  </span>
                }
                icon={<FlashOnRoundedIcon fontSize="small" />}
                tooltipText="Concurrent requests currently processing inside FastAPI. Spikes indicate thread starvation or slow DB locks."
                accentColor={(metrics?.process.activeRequests ?? 0) > 10 ? 'amber' : 'purple'}
                statusLevel={(metrics?.process.activeRequests ?? 0) > 10 ? 'warning' : 'healthy'}
                badgeText="SATURATION"
                onClick={() => handleStatCardClick('activeRequests')}
              />

              {/* STAT 5: Average Latency */}
              <InteractiveStatCard
                id="latency"
                title="Avg Response Latency"
                value={`${overallAvgMs} ms`}
                subtitle="Calculated across all routes & methods"
                icon={<SpeedRoundedIcon fontSize="small" />}
                tooltipText="Average round-trip response duration. Directly determines user satisfaction and SLO compliance."
                accentColor={overallAvgMs < 50 ? 'emerald' : overallAvgMs < 200 ? 'amber' : 'rose'}
                statusLevel={overallAvgMs < 50 ? 'healthy' : overallAvgMs < 200 ? 'warning' : 'critical'}
                badgeText={overallAvgMs < 50 ? '< 50ms FAST' : overallAvgMs < 200 ? 'NOMINAL' : 'SLOW'}
                onClick={() => handleStatCardClick('latency')}
              />

              {/* STAT 6: Resident Memory (RSS) */}
              <InteractiveStatCard
                id="residentMemory"
                title="Resident Memory"
                value={metrics ? formatBytes(metrics.process.residentMemoryBytes) : '--'}
                subtitle={`Virtual: ${metrics ? formatBytes(metrics.process.virtualMemoryBytes) : '--'}`}
                icon={<StorageRoundedIcon fontSize="small" />}
                tooltipText="Exact physical RAM pages held by Python. Steady climb without leveling off indicates memory leaks."
                accentColor="purple"
                statusLevel="healthy"
                badgeText="RAM PAGES"
                onClick={() => handleStatCardClick('residentMemory')}
              />

              {/* STAT 7: Process CPU Time */}
              <InteractiveStatCard
                id="cpuSeconds"
                title="Process CPU Time"
                value={`${metrics?.process.cpuSecondsTotal.toFixed(2) ?? '0.00'}s`}
                subtitle={`CPython v${metrics?.process.pythonVersion ?? '3.12'}`}
                icon={<MemoryRoundedIcon fontSize="small" />}
                tooltipText="Cumulative CPU compute seconds consumed. High slope indicates CPU throttling or hot computational loops."
                accentColor="emerald"
                statusLevel="healthy"
                badgeText="CPU SECONDS"
                onClick={() => handleStatCardClick('cpuSeconds')}
              />

              {/* STAT 8: OS File Descriptors */}
              <InteractiveStatCard
                id="fileDescriptors"
                title="File Descriptors"
                value={metrics?.process.openFds ?? '--'}
                subtitle={`Limit: ${metrics ? metrics.process.maxFds.toLocaleString() : '1,048,576'}`}
                icon={<SensorsRoundedIcon fontSize="small" />}
                tooltipText="Open sockets and file handles. Approaching limit triggers 'Too many open files' and rejects connections."
                accentColor="cyan"
                statusLevel="healthy"
                badgeText="SOCKET CAPACITY"
                extraVisual={
                  metrics ? (
                    <LinearProgress
                      variant="determinate"
                      value={Math.max(2, Math.min(100, (metrics.process.openFds / metrics.process.maxFds) * 100))}
                      className="h-1.5 rounded-full bg-slate-800"
                      sx={{
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#22d3ee',
                          borderRadius: '999px',
                        },
                      }}
                    />
                  ) : null
                }
                onClick={() => handleStatCardClick('fileDescriptors')}
              />
            </Box>
          </Box>

          {/* SINGLE-PAGE TABBED WORKSPACE: Fits neatly on one screen without endless scrolling */}
          <Paper
            elevation={0}
            className="p-5 sm:p-6 rounded-3xl bg-slate-900/90 border border-slate-800/90 shadow-xl backdrop-blur-xl flex-1 flex flex-col space-y-5"
          >
            {/* Tabs Header */}
            <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-2">
              <Tabs
                value={activeTab}
                onChange={(_, val) => setActiveTab(val)}
                textColor="primary"
                indicatorColor="primary"
                className="min-h-10"
                sx={{
                  '& .MuiTab-root': {
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    minHeight: '40px',
                    padding: '8px 16px',
                  },
                }}
              >
                <Tab
                  value="endpoints"
                  icon={<LayersRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="Traffic & Latency Distribution"
                  className="text-slate-400 data-[selected=true]:text-sky-400"
                />
                <Tab
                  value="sre"
                  icon={<BuildRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="SRE Chaos & Testing Lab"
                  className="text-slate-400 data-[selected=true]:text-amber-400"
                />
                <Tab
                  value="runtime"
                  icon={<MemoryRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="Runtime & Subsystems"
                  className="text-slate-400 data-[selected=true]:text-emerald-400"
                />
                <Tab
                  value="raw"
                  icon={<TerminalRoundedIcon fontSize="small" />}
                  iconPosition="start"
                  label="Prometheus Raw Stream"
                  className="text-slate-400 data-[selected=true]:text-purple-400"
                />
              </Tabs>

              <Typography variant="caption" className="text-slate-400 font-mono text-xs hidden sm:block">
                Single-Page Console · Click tabs to toggle views
              </Typography>
            </Box>

            {/* TAB 1: Traffic & Latency Distribution */}
            {activeTab === 'endpoints' && (
              <Box className="space-y-6">
                <Box className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left: Endpoint Request Table (7 Cols) */}
                  <Box className="lg:col-span-7 space-y-3">
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-2">
                        <LayersRoundedIcon fontSize="small" className="text-sky-400" />
                        <Typography variant="subtitle1" className="font-bold text-slate-100 text-sm">
                          Endpoint Request Distribution
                        </Typography>
                      </Box>
                      <Typography variant="caption" className="font-mono text-slate-400 text-xs">
                        cloudmonitor_http_requests_total
                      </Typography>
                    </Box>

                    {metrics && metrics.httpRequests.length > 0 ? (
                      <TableContainer className="rounded-2xl border border-slate-800 bg-slate-950/40 overflow-hidden">
                        <Table size="small">
                          <TableHead className="bg-slate-900/90">
                            <TableRow>
                              <TableCell className="text-slate-400 font-semibold text-xs border-slate-800">Method</TableCell>
                              <TableCell className="text-slate-400 font-semibold text-xs border-slate-800">Endpoint</TableCell>
                              <TableCell className="text-slate-400 font-semibold text-xs border-slate-800">Status</TableCell>
                              <TableCell align="right" className="text-slate-400 font-semibold text-xs border-slate-800">Requests</TableCell>
                              <TableCell align="right" className="text-slate-400 font-semibold text-xs border-slate-800">Share</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {metrics.httpRequests.map((req, i) => {
                              const sharePercent =
                                metrics.totalRequestsCount > 0
                                  ? Math.round((req.count / metrics.totalRequestsCount) * 100)
                                  : 0;
                              const is2xx = req.statusCode.startsWith('2');

                              return (
                                <TableRow
                                  key={`${req.endpoint}-${req.method}-${req.statusCode}-${i}`}
                                  className="hover:bg-slate-800/40 transition-colors cursor-pointer"
                                  onClick={() => handleStatCardClick('totalRequests')}
                                >
                                  <TableCell className="border-slate-800/60">
                                    <Chip
                                      label={req.method}
                                      size="small"
                                      className={`font-mono text-[11px] font-bold rounded ${
                                        req.method === 'GET'
                                          ? 'bg-sky-950/60 text-sky-300 border border-sky-500/30'
                                          : 'bg-purple-950/60 text-purple-300 border border-purple-500/30'
                                      }`}
                                    />
                                  </TableCell>
                                  <TableCell className="font-mono text-slate-200 text-xs border-slate-800/60">
                                    {req.endpoint}
                                  </TableCell>
                                  <TableCell className="border-slate-800/60">
                                    <Chip
                                      label={req.statusCode}
                                      size="small"
                                      className={`font-mono text-[11px] font-semibold rounded ${
                                        is2xx
                                          ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                                          : 'bg-rose-950/60 text-rose-300 border border-rose-500/30'
                                      }`}
                                    />
                                  </TableCell>
                                  <TableCell align="right" className="font-semibold text-slate-100 border-slate-800/60 text-xs">
                                    {req.count}
                                  </TableCell>
                                  <TableCell align="right" className="border-slate-800/60">
                                    <Box className="flex items-center justify-end gap-2">
                                      <Typography variant="caption" className="font-mono text-slate-400 text-xs">
                                        {sharePercent}%
                                      </Typography>
                                      <Box className="w-14">
                                        <LinearProgress
                                          variant="determinate"
                                          value={sharePercent}
                                          className="h-1.5 rounded-full bg-slate-800"
                                          sx={{
                                            '& .MuiLinearProgress-bar': {
                                              backgroundColor: '#38bdf8',
                                              borderRadius: '999px',
                                            },
                                          }}
                                        />
                                      </Box>
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <Paper elevation={0} className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center">
                        <Typography variant="body2" className="text-slate-400 text-xs">
                          No HTTP traffic recorded yet. Send requests or use the SRE testing tab to exercise endpoints.
                        </Typography>
                      </Paper>
                    )}
                  </Box>

                  {/* Right: Latency Benchmarks (5 Cols) */}
                  <Box className="lg:col-span-5 space-y-3">
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-2">
                        <SpeedRoundedIcon fontSize="small" className="text-amber-400" />
                        <Typography variant="subtitle1" className="font-bold text-slate-100 text-sm">
                          Response Latency Benchmarks
                        </Typography>
                      </Box>
                      <Typography variant="caption" className="font-mono text-slate-400 text-xs">
                        duration_seconds
                      </Typography>
                    </Box>

                    {metrics && metrics.latencies.length > 0 ? (
                      <Box className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                        {metrics.latencies.map((lat, idx) => {
                          const latencyColor =
                            lat.avgMs < 50
                              ? 'text-emerald-400'
                              : lat.avgMs < 200
                              ? 'text-amber-400'
                              : 'text-rose-400';

                          return (
                            <Paper
                              key={`${lat.endpoint}-${lat.method}-${idx}`}
                              elevation={0}
                              onClick={() => handleStatCardClick('latency')}
                              className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/80 hover:border-amber-400/50 cursor-pointer transition-all space-y-1.5"
                            >
                              <Box className="flex items-center justify-between">
                                <Typography variant="caption" className="font-mono text-slate-300 text-xs truncate max-w-[180px]">
                                  {lat.endpoint}
                                </Typography>
                                <Chip
                                  label={lat.method}
                                  size="small"
                                  className="font-mono text-[10px] font-semibold bg-slate-800 text-sky-300 h-5"
                                />
                              </Box>

                              <Box className="flex items-baseline justify-between pt-1">
                                <Box className="flex items-baseline gap-1.5">
                                  <Typography variant="h6" className={`font-bold font-mono text-base ${latencyColor}`}>
                                    {lat.avgMs} ms
                                  </Typography>
                                  <Typography variant="caption" className="text-slate-400 text-[11px]">
                                    avg latency
                                  </Typography>
                                </Box>

                                <Typography variant="caption" className="text-slate-400 font-mono text-[11px]">
                                  {lat.count} calls · {lat.sum.toFixed(3)}s tot
                                </Typography>
                              </Box>
                            </Paper>
                          );
                        })}
                      </Box>
                    ) : (
                      <Paper elevation={0} className="p-6 rounded-2xl bg-slate-950/40 border border-slate-800 text-center">
                        <Typography variant="body2" className="text-slate-400 text-xs">
                          No latency histogram recorded yet.
                        </Typography>
                      </Paper>
                    )}
                  </Box>
                </Box>
              </Box>
            )}

            {/* TAB 2: SRE Chaos & Simulation Lab */}
            {activeTab === 'sre' && (
              <Box className="space-y-4">
                <Box className="flex items-center justify-between pb-2 border-b border-slate-800/60">
                  <Box>
                    <Typography variant="subtitle1" className="font-bold text-slate-100 text-sm">
                      SRE Fault-Injection &amp; Chaos Engineering Lab
                    </Typography>
                    <Typography variant="caption" className="text-slate-400 text-xs">
                      Simulate 500 errors, response latency, and health failure states to verify alerts and see telemetry update live.
                    </Typography>
                  </Box>
                  <Chip
                    label="DEV ENVIRONMENT ACTIVE"
                    size="small"
                    className="bg-amber-950/60 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold"
                  />
                </Box>

                {/* 3-Column Grid for SRE Cards */}
                <Box className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                  <ErrorSimulationCard />
                  <LatencySimulationCard />
                  <HealthToggleCard />
                </Box>
              </Box>
            )}

            {/* TAB 3: Runtime & Subsystems */}
            {activeTab === 'runtime' && (
              <Box className="space-y-5">
                <Box className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Subsystems Breakdown */}
                  <Paper
                    elevation={0}
                    className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4"
                  >
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-2">
                        <HubRoundedIcon fontSize="small" className="text-sky-400" />
                        <Typography variant="subtitle1" className="font-bold text-slate-100 text-sm">
                          Core Architecture Subsystems
                        </Typography>
                      </Box>
                      <Chip
                        label={status?.status ?? 'operational'}
                        size="small"
                        className="font-mono text-xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                      />
                    </Box>

                    <Box className="space-y-2.5">
                      <Paper
                        elevation={0}
                        onClick={() => handleStatCardClick('health')}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <Box className="flex items-center gap-2.5">
                          <DnsRoundedIcon fontSize="small" className="text-sky-400" />
                          <Typography variant="body2" className="text-slate-200 text-xs font-semibold">
                            FastAPI Router &amp; Endpoints
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={health?.components.api ?? 'healthy'}
                          className="bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
                        />
                      </Paper>

                      <Paper
                        elevation={0}
                        onClick={() => handleStatCardClick('health')}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <Box className="flex items-center gap-2.5">
                          <SensorsRoundedIcon fontSize="small" className="text-purple-400" />
                          <Typography variant="body2" className="text-slate-200 text-xs font-semibold">
                            Prometheus OpenMetrics Exporter
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={health?.components.metrics_exporter ?? 'healthy'}
                          className="bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
                        />
                      </Paper>

                      <Paper
                        elevation={0}
                        onClick={() => handleStatCardClick('health')}
                        className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between cursor-pointer hover:border-slate-700 transition-colors"
                      >
                        <Box className="flex items-center gap-2.5">
                          <MemoryRoundedIcon fontSize="small" className="text-emerald-400" />
                          <Typography variant="body2" className="text-slate-200 text-xs font-semibold">
                            Worker Engine &amp; Background Tasks
                          </Typography>
                        </Box>
                        <Chip
                          size="small"
                          label={health?.components.engine ?? 'active'}
                          className="bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 text-[11px] font-semibold"
                        />
                      </Paper>
                    </Box>
                  </Paper>

                  {/* Python Garbage Collection & Memory Internals */}
                  <Paper
                    elevation={0}
                    className="p-5 rounded-2xl bg-slate-950/40 border border-slate-800 space-y-4"
                  >
                    <Box className="flex items-center justify-between">
                      <Box className="flex items-center gap-2">
                        <MemoryRoundedIcon fontSize="small" className="text-indigo-400" />
                        <Typography variant="subtitle1" className="font-bold text-slate-100 text-sm">
                          Python GC Collections &amp; Memory Pages
                        </Typography>
                      </Box>
                      <Typography variant="caption" className="font-mono text-slate-400 text-xs">
                        python_gc_collections_total
                      </Typography>
                    </Box>

                    <Box className="grid grid-cols-3 gap-2 text-center">
                      <Paper
                        elevation={0}
                        onClick={() => handleStatCardClick('gcCollections')}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 cursor-pointer transition-colors"
                      >
                        <Typography variant="caption" className="text-slate-400 text-xs block">Gen 0 (Short)</Typography>
                        <Typography variant="h6" className="font-bold text-sky-400 font-mono mt-1 text-base">
                          {metrics?.process.gcCollections.gen0 ?? 0}
                        </Typography>
                      </Paper>

                      <Paper
                        elevation={0}
                        onClick={() => handleStatCardClick('gcCollections')}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors"
                      >
                        <Typography variant="caption" className="text-slate-400 text-xs block">Gen 1 (Medium)</Typography>
                        <Typography variant="h6" className="font-bold text-indigo-400 font-mono mt-1 text-base">
                          {metrics?.process.gcCollections.gen1 ?? 0}
                        </Typography>
                      </Paper>

                      <Paper
                        elevation={0}
                        onClick={() => handleStatCardClick('gcCollections')}
                        className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/50 cursor-pointer transition-colors"
                      >
                        <Typography variant="caption" className="text-slate-400 text-xs block">Gen 2 (Full Heap)</Typography>
                        <Typography variant="h6" className="font-bold text-purple-400 font-mono mt-1 text-base">
                          {metrics?.process.gcCollections.gen2 ?? 0}
                        </Typography>
                      </Paper>
                    </Box>

                    <Box className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-400 leading-relaxed">
                      <Box className="flex items-center gap-1.5 font-semibold text-slate-300 mb-1">
                        <InfoOutlinedIcon sx={{ fontSize: 14 }} className="text-sky-400" />
                        <span>SRE Memory Note:</span>
                      </Box>
                      RSS reflects physical RAM mapped into the Docker container. Gen 2 collections trigger Stop-the-World garbage collection passes across the Python heap.
                    </Box>
                  </Paper>
                </Box>
              </Box>
            )}

            {/* TAB 4: Raw Prometheus Stream */}
            {activeTab === 'raw' && (
              <Box className="space-y-4">
                <Box className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-wrap">
                  <TextField
                    size="small"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Filter metrics (e.g. cloudmonitor, memory, http)..."
                    className="w-full sm:w-80 bg-slate-950/60 rounded-xl"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchRoundedIcon fontSize="small" className="text-slate-400" />
                          </InputAdornment>
                        ),
                        endAdornment: filterQuery ? (
                          <InputAdornment position="end">
                            <IconButton size="small" onClick={() => setFilterQuery('')}>
                              <ClearRoundedIcon fontSize="small" className="text-slate-400" />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '0.75rem',
                        '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                        '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                      },
                    }}
                  />

                  <Box className="flex items-center gap-2 flex-wrap">
                    <Button
                      size="small"
                      variant={filterQuery === 'cloudmonitor' ? 'contained' : 'outlined'}
                      onClick={() => setFilterQuery('cloudmonitor')}
                      className="rounded-lg text-xs font-mono font-medium border-slate-700 normal-case"
                    >
                      App
                    </Button>
                    <Button
                      size="small"
                      variant={filterQuery === 'process' ? 'contained' : 'outlined'}
                      onClick={() => setFilterQuery('process')}
                      className="rounded-lg text-xs font-mono font-medium border-slate-700 normal-case"
                    >
                      Process
                    </Button>
                    <Button
                      size="small"
                      variant={filterQuery === 'python' ? 'contained' : 'outlined'}
                      onClick={() => setFilterQuery('python')}
                      className="rounded-lg text-xs font-mono font-medium border-slate-700 normal-case"
                    >
                      Python
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleCopyRaw}
                      startIcon={copiedRaw ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                      className={`rounded-lg text-xs font-medium normal-case transition-all ${
                        copiedRaw
                          ? 'border-emerald-500 text-emerald-300 bg-emerald-950/40'
                          : 'border-slate-700 text-slate-200 bg-slate-800/40 hover:bg-slate-800'
                      }`}
                    >
                      {copiedRaw ? 'Copied!' : 'Copy All'}
                    </Button>

                    <Button
                      size="small"
                      variant="outlined"
                      href={`${apiBase}/metrics`}
                      target="_blank"
                      rel="noreferrer"
                      startIcon={<OpenInNewRoundedIcon fontSize="small" />}
                      className="rounded-lg text-xs font-medium border-slate-700 text-sky-400 bg-slate-800/40 hover:bg-slate-800 normal-case"
                    >
                      /metrics
                    </Button>
                  </Box>
                </Box>

                {/* Raw Stream Viewport */}
                <Paper
                  elevation={0}
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed max-h-[420px] overflow-y-auto"
                >
                  {filteredRawLines.length === 0 ? (
                    <Typography variant="body2" className="text-slate-400 text-center py-8">
                      No metrics match your search query: &quot;{filterQuery}&quot;
                    </Typography>
                  ) : (
                    filteredRawLines.map((line, idx) => {
                      const isComment = line.startsWith('#');
                      const isHelp = line.startsWith('# HELP');
                      const isType = line.startsWith('# TYPE');

                      let textColor = 'text-slate-300';
                      if (isHelp) textColor = 'text-slate-400 italic';
                      else if (isType) textColor = 'text-purple-400 font-semibold';
                      else if (isComment) textColor = 'text-slate-400';
                      else if (line.includes('cloudmonitor_')) textColor = 'text-sky-300 font-semibold';
                      else if (line.includes('process_')) textColor = 'text-amber-300';
                      else if (line.includes('python_')) textColor = 'text-emerald-300';

                      return (
                        <Box key={idx} className="flex gap-3 hover:bg-slate-900/60 px-1 py-0.5 rounded">
                          <Typography
                            variant="caption"
                            className="text-slate-400 select-none min-w-8 text-right font-mono"
                          >
                            {idx + 1}
                          </Typography>
                          <Typography variant="caption" className={`font-mono whitespace-pre-wrap ${textColor}`}>
                            {line}
                          </Typography>
                        </Box>
                      );
                    })
                  )}
                </Paper>
              </Box>
            )}
          </Paper>
        </Container>

        {/* Global Footer */}
        <Box
          component="footer"
          className="border-t border-slate-800/80 bg-slate-950/90 py-3 text-center text-xs text-slate-400 mt-auto"
        >
          <Typography variant="caption" className="text-slate-400 font-mono">
            CloudMonitor Single-Page Dashboard · Real-time OpenMetrics &amp; SRE Telemetry
          </Typography>
        </Box>

        {/* Click-to-Inspect Deep Dive Stat Modal */}
        <StatDetailModal
          stat={modalProps.stat}
          currentValue={modalProps.value}
          currentStatus={modalProps.status}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
        />
      </Box>
    </ThemeProvider>
  );
}
