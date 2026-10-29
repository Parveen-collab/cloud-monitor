import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import HubOutlinedIcon from '@mui/icons-material/HubOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import SyncIcon from '@mui/icons-material/Sync';
import type { ServiceStatus } from 'src/types/monitor';
import { fetchStatus } from 'src/services/api';

export function ServiceStatusCard() {
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadStatus = async () => {
      try {
        const data = await fetchStatus();
        if (isMounted) {
          setStatus(data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : 'Unable to fetch service status'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadStatus();

    const intervalId = window.setInterval(() => {
      void loadStatus();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, []);

  const isOperational = status?.status.toLowerCase() === 'operational';
  const updatedAt = status
    ? new Date(status.timestamp * 1000).toLocaleTimeString()
    : null;

  return (
    <Card
      elevation={0}
      className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/80"
    >
      <CardContent className="p-6 md:p-7 space-y-6">
        {/* Header Section */}
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <Box className="space-y-1">
            <Typography
              variant="overline"
              className="text-xs font-bold tracking-widest text-sky-400 uppercase"
            >
              Backend Overview
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight"
            >
              Service Status
            </Typography>
            <Typography variant="body2" className="text-slate-400 text-sm">
              API availability and monitoring configuration
            </Typography>
          </Box>

          {status && (
            <Box>
              <Chip
                icon={
                  isOperational ? (
                    <CheckCircleOutlineRoundedIcon className="text-emerald-400" />
                  ) : (
                    <ErrorOutlineRoundedIcon className="text-rose-400" />
                  )
                }
                label={status.status.toUpperCase()}
                className={`font-semibold px-2 py-1 text-xs tracking-wider border rounded-full ${
                  isOperational
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                    : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                }`}
              />
            </Box>
          )}
        </Box>

        {/* Loading Indicator */}
        {loading && (
          <Box className="flex items-center justify-center gap-3 py-6 text-slate-400">
            <CircularProgress size={24} className="text-sky-400" />
            <Typography variant="body2">Loading service status...</Typography>
          </Box>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            className="border-rose-500/30 bg-rose-950/20 text-rose-300 rounded-xl"
          >
            {error}
          </Alert>
        )}

        {/* Content Grid */}
        {status && (
          <Box className="space-y-5">
            <Box className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Service Item */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-slate-600 transition-colors"
              >
                <Box className="flex items-center justify-between text-slate-400">
                  <Typography variant="caption" className="font-medium uppercase text-xs text-slate-400">
                    Service
                  </Typography>
                  <HubOutlinedIcon fontSize="small" className="text-sky-400 opacity-80" />
                </Box>
                <Typography variant="h6" className="text-base font-semibold text-slate-100 truncate">
                  {status.service}
                </Typography>
              </Paper>

              {/* Metrics Item */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-slate-600 transition-colors"
              >
                <Box className="flex items-center justify-between text-slate-400">
                  <Typography variant="caption" className="font-medium uppercase text-xs text-slate-400">
                    Metrics
                  </Typography>
                  <InsightsOutlinedIcon fontSize="small" className="text-purple-400 opacity-80" />
                </Box>
                <Box className="flex items-center gap-2">
                  <Box
                    className={`w-2.5 h-2.5 rounded-full ${
                      status.monitoring.metrics_enabled ? 'bg-emerald-400' : 'bg-slate-500'
                    }`}
                  />
                  <Typography variant="h6" className="text-base font-semibold text-slate-100">
                    {status.monitoring.metrics_enabled ? 'Enabled' : 'Disabled'}
                  </Typography>
                </Box>
              </Paper>

              {/* Target Item */}
              <Paper
                elevation={0}
                className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 flex flex-col justify-between space-y-2 hover:border-slate-600 transition-colors"
              >
                <Box className="flex items-center justify-between text-slate-400">
                  <Typography variant="caption" className="font-medium uppercase text-xs text-slate-400">
                    Target
                  </Typography>
                  <DnsOutlinedIcon fontSize="small" className="text-amber-400 opacity-80" />
                </Box>
                <Typography variant="h6" className="text-base font-semibold font-mono text-slate-100 truncate">
                  {status.monitoring.target}
                </Typography>
              </Paper>
            </Box>

            <Divider className="border-slate-800" />

            {/* Footer */}
            <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 gap-2 pt-1">
              <Box className="flex items-center gap-1.5">
                <AccessTimeIcon sx={{ fontSize: 14 }} className="text-slate-400" />
                <Typography variant="caption" className="text-slate-400">
                  Last reported: {updatedAt}
                </Typography>
              </Box>

              <Box className="flex items-center gap-1.5">
                <SyncIcon sx={{ fontSize: 14 }} className="text-slate-400" />
                <Typography variant="caption" className="text-slate-400">
                  Auto-refresh: 5s
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
