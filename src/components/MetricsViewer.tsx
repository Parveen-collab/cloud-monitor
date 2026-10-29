import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Paper,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import StorageRoundedIcon from '@mui/icons-material/StorageRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import ReportProblemRoundedIcon from '@mui/icons-material/ReportProblemRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
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

  useEffect(() => {
    let isMounted = true;

    const executeFetch = async () => {
      try {
        const [parsed, raw] = await Promise.all([
          fetchParsedMetrics(),
          fetchRawMetrics(),
        ]);
        if (isMounted) {
          setMetrics(parsed);
          setRawText(raw);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to scrape /metrics');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void executeFetch();

    if (refreshInterval <= 0) {
      return () => {
        isMounted = false;
      };
    }

    const timer = setInterval(() => {
      void executeFetch();
    }, refreshInterval);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [refreshInterval]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
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
      setTimeout(() => setRefreshing(false), 300);
    }
  };

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
    <Card
      elevation={0}
      className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/80"
    >
      <CardContent className="p-6 md:p-7 space-y-6">
        {/* Header Section */}
        <Box className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <Box className="flex items-center gap-3">
            <Box className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <BarChartRoundedIcon />
            </Box>
            <Box>
              <Box className="flex items-center gap-2 flex-wrap">
                <Typography
                  variant="h5"
                  component="h2"
                  className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight"
                >
                  Prometheus Metrics Telemetry
                </Typography>
                <Chip
                  label="GET /metrics"
                  size="small"
                  className="font-mono text-xs font-semibold bg-purple-950/50 text-purple-300 border border-purple-500/30"
                />
              </Box>
              <Typography variant="body2" className="text-slate-400 text-sm mt-0.5">
                Live runtime telemetry scraped directly in Prometheus OpenMetrics format
              </Typography>
            </Box>
          </Box>

          {/* Controls: Poll interval + Refresh */}
          <Box className="flex items-center gap-2.5 flex-wrap">
            <FormControl size="small" className="min-w-28">
              <Select
                value={refreshInterval}
                onChange={(e) => setRefreshInterval(Number(e.target.value))}
                startAdornment={<TimerRoundedIcon sx={{ fontSize: 16 }} className="text-slate-400 mr-1.5" />}
                className="bg-slate-800/60 text-slate-200 text-xs rounded-xl"
                sx={{
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(148, 163, 184, 0.2)',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: 'rgba(148, 163, 184, 0.4)',
                  },
                }}
              >
                <MenuItem value={1000} className="text-xs">Poll: 1s</MenuItem>
                <MenuItem value={3000} className="text-xs">Poll: 3s</MenuItem>
                <MenuItem value={5000} className="text-xs">Poll: 5s</MenuItem>
                <MenuItem value={10000} className="text-xs">Poll: 10s</MenuItem>
                <MenuItem value={0} className="text-xs">Poll: Manual</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              size="small"
              onClick={handleManualRefresh}
              disabled={refreshing || loading}
              startIcon={
                <RefreshRoundedIcon
                  className={refreshing ? 'animate-spin' : ''}
                  fontSize="small"
                />
              }
              className="px-3.5 py-1.5 rounded-xl border-slate-700 hover:border-slate-600 bg-slate-800/60 text-slate-200 normal-case font-medium text-xs"
            >
              Refresh
            </Button>
          </Box>
        </Box>

        {/* Tab Selection */}
        <Box className="border-b border-slate-800">
          <Tabs
            value={activeTab}
            onChange={(_, val: 'visual' | 'raw') => setActiveTab(val)}
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
              value="visual"
              icon={<ShowChartRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Visual Dashboard"
              className="text-slate-400 data-[selected=true]:text-sky-400"
            />
            <Tab
              value="raw"
              icon={<TerminalRoundedIcon fontSize="small" />}
              iconPosition="start"
              label="Raw Prometheus Stream"
              className="text-slate-400 data-[selected=true]:text-purple-400"
            />
          </Tabs>
        </Box>

        {/* Error Notification */}
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            icon={<ReportProblemRoundedIcon className="text-rose-400" />}
            className="border-rose-500/30 bg-rose-950/20 text-rose-300 rounded-xl"
          >
            <AlertTitle className="font-semibold mb-0.5">Error querying /metrics</AlertTitle>
            <Typography variant="body2">{error}</Typography>
            <Typography variant="caption" className="text-rose-400/80 block mt-1">
              Ensure your backend is running on http://localhost:8000 and CORS or Vite proxy is enabled.
            </Typography>
          </Alert>
        )}

        {/* TAB 1: Visual Telemetry Dashboard */}
        {activeTab === 'visual' && metrics && (
          <Box className="space-y-6">
            {/* 4 Primary KPI Cards */}
            <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* KPI 1: Total HTTP Requests */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <Box className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Total Requests</span>
                  <ShowChartRoundedIcon fontSize="small" className="text-sky-400" />
                </Box>
                <Typography variant="h4" className="text-2xl md:text-3xl font-extrabold text-slate-100 my-2">
                  {metrics.totalRequestsCount}
                </Typography>
                <Typography variant="caption" className="text-emerald-400 font-medium">
                  {metrics.httpRequests.length} active endpoints tracked
                </Typography>
              </Paper>

              {/* KPI 2: Active Requests & Errors */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <Box className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Active / In-Flight</span>
                  <FlashOnRoundedIcon fontSize="small" className="text-amber-400" />
                </Box>
                <Typography variant="h4" className="text-2xl md:text-3xl font-extrabold text-slate-100 my-2">
                  {metrics.process.activeRequests}
                </Typography>
                <Typography
                  variant="caption"
                  className={metrics.process.simulatedErrorsTotal > 0 ? 'text-rose-400 font-semibold' : 'text-slate-400'}
                >
                  Simulated 500 Errors: <strong>{metrics.process.simulatedErrorsTotal}</strong>
                </Typography>
              </Paper>

              {/* KPI 3: Resident Memory (RSS) */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <Box className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Resident Memory</span>
                  <StorageRoundedIcon fontSize="small" className="text-purple-400" />
                </Box>
                <Typography variant="h4" className="text-2xl md:text-3xl font-extrabold text-slate-100 my-2 font-mono">
                  {formatBytes(metrics.process.residentMemoryBytes)}
                </Typography>
                <Typography variant="caption" className="text-slate-400">
                  Virtual: {formatBytes(metrics.process.virtualMemoryBytes)}
                </Typography>
              </Paper>

              {/* KPI 4: CPU & Runtime */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <Box className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <span>Process CPU Time</span>
                  <MemoryRoundedIcon fontSize="small" className="text-emerald-400" />
                </Box>
                <Typography variant="h4" className="text-2xl md:text-3xl font-extrabold text-slate-100 my-2 font-mono">
                  {metrics.process.cpuSecondsTotal.toFixed(2)}s
                </Typography>
                <Typography variant="caption" className="text-sky-400 font-mono">
                  CPython v{metrics.process.pythonVersion}
                </Typography>
              </Paper>
            </Box>

            {/* Section: Endpoint Traffic & Status Breakdown */}
            <Paper
              elevation={0}
              className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-4"
            >
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-2">
                  <LayersRoundedIcon fontSize="small" className="text-sky-400" />
                  <Typography variant="subtitle1" className="font-bold text-slate-100">
                    Endpoint Request Distribution
                  </Typography>
                </Box>
                <Typography variant="caption" className="font-mono text-slate-400 text-xs">
                  cloudmonitor_http_requests_total
                </Typography>
              </Box>

              {metrics.httpRequests.length === 0 ? (
                <Typography variant="body2" className="text-slate-400 py-3">
                  No HTTP request telemetry recorded yet.
                </Typography>
              ) : (
                <TableContainer className="rounded-xl border border-slate-700/40 overflow-hidden">
                  <Table size="small">
                    <TableHead className="bg-slate-800/80">
                      <TableRow>
                        <TableCell className="text-slate-400 font-semibold text-xs border-slate-700/50">Method</TableCell>
                        <TableCell className="text-slate-400 font-semibold text-xs border-slate-700/50">Endpoint</TableCell>
                        <TableCell className="text-slate-400 font-semibold text-xs border-slate-700/50">Status</TableCell>
                        <TableCell align="right" className="text-slate-400 font-semibold text-xs border-slate-700/50">Requests</TableCell>
                        <TableCell align="right" className="text-slate-400 font-semibold text-xs border-slate-700/50">Share</TableCell>
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
                            className="hover:bg-slate-800/30 transition-colors"
                          >
                            <TableCell className="border-slate-800/60">
                              <Chip
                                label={req.method}
                                size="small"
                                className={`font-mono text-xs font-bold rounded ${
                                  req.method === 'GET'
                                    ? 'bg-sky-950/50 text-sky-300 border border-sky-500/30'
                                    : 'bg-purple-950/50 text-purple-300 border border-purple-500/30'
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
                                className={`font-mono text-xs font-semibold rounded ${
                                  is2xx
                                    ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/30'
                                    : 'bg-rose-950/50 text-rose-300 border border-rose-500/30'
                                }`}
                              />
                            </TableCell>
                            <TableCell align="right" className="font-semibold text-slate-100 border-slate-800/60">
                              {req.count}
                            </TableCell>
                            <TableCell align="right" className="border-slate-800/60">
                              <Box className="flex items-center justify-end gap-2">
                                <Typography variant="caption" className="font-mono text-slate-400 text-xs">
                                  {sharePercent}%
                                </Typography>
                                <Box className="w-16">
                                  <LinearProgress
                                    variant="determinate"
                                    value={sharePercent}
                                    className="h-1.5 rounded-full bg-slate-700"
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
              )}
            </Paper>

            {/* Section: Latency Benchmarks */}
            <Paper
              elevation={0}
              className="p-5 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-4"
            >
              <Box className="flex items-center justify-between">
                <Box className="flex items-center gap-2">
                  <SpeedRoundedIcon fontSize="small" className="text-amber-400" />
                  <Typography variant="subtitle1" className="font-bold text-slate-100">
                    Response Latency & Duration (Histogram Summary)
                  </Typography>
                </Box>
                <Typography variant="caption" className="font-mono text-slate-400 text-xs">
                  cloudmonitor_http_request_duration_seconds
                </Typography>
              </Box>

              {metrics.latencies.length === 0 ? (
                <Typography variant="body2" className="text-slate-400 py-3">
                  No latency histogram data recorded yet.
                </Typography>
              ) : (
                <Box className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {metrics.latencies.map((lat, i) => {
                    const latencyColor =
                      lat.avgMs < 50
                        ? 'text-emerald-400'
                        : lat.avgMs < 200
                        ? 'text-amber-400'
                        : 'text-rose-400';

                    return (
                      <Paper
                        key={`${lat.endpoint}-${lat.method}-${i}`}
                        elevation={0}
                        className="p-4 rounded-xl bg-slate-900/60 border border-slate-700/50 space-y-2 hover:border-slate-600 transition-colors"
                      >
                        <Box className="flex items-center justify-between">
                          <Typography variant="body2" className="font-mono text-xs text-slate-200 truncate">
                            {lat.endpoint}
                          </Typography>
                          <Chip
                            label={lat.method}
                            size="small"
                            className="font-mono text-xs font-semibold bg-slate-800 text-sky-300"
                          />
                        </Box>

                        <Box className="flex items-baseline gap-2">
                          <Typography variant="h5" className={`font-bold font-mono ${latencyColor}`}>
                            {lat.avgMs} ms
                          </Typography>
                          <Typography variant="caption" className="text-slate-400 text-xs">
                            avg latency
                          </Typography>
                        </Box>

                        <Divider className="border-slate-800" />

                        <Box className="flex items-center justify-between text-xs text-slate-400 pt-1 font-mono">
                          <span>Scrapes: {lat.count}</span>
                          <span>Total: {lat.sum.toFixed(3)}s</span>
                        </Box>
                      </Paper>
                    );
                  })}
                </Box>
              )}
            </Paper>

            {/* Section: Process & GC Internals */}
            <Box className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Descriptors */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3"
              >
                <Typography variant="caption" className="font-semibold text-slate-400 uppercase tracking-wider block">
                  OS File Descriptors (Open / Max)
                </Typography>
                <Box className="flex items-baseline gap-2 font-mono">
                  <Typography variant="h5" className="font-bold text-slate-100">
                    {metrics.process.openFds}
                  </Typography>
                  <Typography variant="caption" className="text-slate-400">
                    / {metrics.process.maxFds.toLocaleString()}
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={Math.max(1, (metrics.process.openFds / metrics.process.maxFds) * 100)}
                  className="h-2 rounded-full bg-slate-700"
                  sx={{
                    '& .MuiLinearProgress-bar': {
                      backgroundColor: '#34d399',
                      borderRadius: '999px',
                    },
                  }}
                />
              </Paper>

              {/* Python Garbage Collection */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 space-y-3"
              >
                <Typography variant="caption" className="font-semibold text-slate-400 uppercase tracking-wider block">
                  Python GC Collections (Generations 0 / 1 / 2)
                </Typography>
                <Box className="grid grid-cols-3 gap-2 text-center">
                  <Box className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <Typography variant="caption" className="text-slate-400 text-xs">Gen 0</Typography>
                    <Typography variant="h6" className="font-bold text-sky-400 font-mono">
                      {metrics.process.gcCollections.gen0}
                    </Typography>
                  </Box>
                  <Box className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <Typography variant="caption" className="text-slate-400 text-xs">Gen 1</Typography>
                    <Typography variant="h6" className="font-bold text-indigo-400 font-mono">
                      {metrics.process.gcCollections.gen1}
                    </Typography>
                  </Box>
                  <Box className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
                    <Typography variant="caption" className="text-slate-400 text-xs">Gen 2</Typography>
                    <Typography variant="h6" className="font-bold text-purple-400 font-mono">
                      {metrics.process.gcCollections.gen2}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Box>
          </Box>
        )}

        {/* TAB 2: Raw Prometheus Text Inspector */}
        {activeTab === 'raw' && (
          <Box className="space-y-4">
            {/* Search Bar & Quick Buttons */}
            <Box className="flex flex-col md:flex-row md:items-center justify-between gap-3 flex-wrap">
              <TextField
                size="small"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filter metrics (e.g. cloudmonitor, memory, http)..."
                className="w-full md:w-80 bg-slate-800/60 rounded-xl"
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
                  startIcon={copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                  className={`rounded-lg text-xs font-medium normal-case transition-all ${
                    copied
                      ? 'border-emerald-500 text-emerald-300 bg-emerald-950/40'
                      : 'border-slate-700 text-slate-200 bg-slate-800/40 hover:bg-slate-800'
                  }`}
                >
                  {copied ? 'Copied!' : 'Copy All'}
                </Button>

                <Button
                  size="small"
                  variant="outlined"
                  href="http://localhost:8000/metrics"
                  target="_blank"
                  rel="noreferrer"
                  startIcon={<OpenInNewRoundedIcon fontSize="small" />}
                  className="rounded-lg text-xs font-medium border-slate-700 text-sky-400 bg-slate-800/40 hover:bg-slate-800 normal-case"
                >
                  /metrics
                </Button>
              </Box>
            </Box>

            {/* Raw Text Stream Viewport */}
            <Paper
              elevation={0}
              className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs leading-relaxed max-h-[480px] overflow-y-auto"
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

        <Divider className="border-slate-800" />

        {/* Footer Info */}
        <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 gap-2">
          <Box className="flex items-center gap-1.5">
            <SensorsRoundedIcon sx={{ fontSize: 14 }} className="text-sky-400" />
            <Typography variant="caption" className="text-slate-400">
              Scraping http://localhost:8000/metrics
            </Typography>
          </Box>

          <Typography variant="caption" className="text-slate-400">
            {metrics
              ? `Last scraped: ${metrics.timestamp.toLocaleTimeString()}`
              : 'Connecting to Prometheus exporter...'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
