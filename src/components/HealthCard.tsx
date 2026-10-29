import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Paper,
  Alert,
  Divider,
} from '@mui/material';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import HighlightOffRoundedIcon from '@mui/icons-material/HighlightOffRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import DnsRoundedIcon from '@mui/icons-material/DnsRounded';
import MemoryRoundedIcon from '@mui/icons-material/MemoryRounded';
import SensorsRoundedIcon from '@mui/icons-material/SensorsRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import NumbersRoundedIcon from '@mui/icons-material/NumbersRounded';
import CloudDoneOutlinedIcon from '@mui/icons-material/CloudDoneOutlined';
import type { HealthStatus } from 'src/types/monitor';

interface HealthCardProps {
  health: HealthStatus | null;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

const formatUptime = (totalSeconds: number): string => {
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

export const HealthCard: React.FC<HealthCardProps> = ({
  health,
  loading,
  error,
  lastUpdated,
}) => {
  const getStatusConfig = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'ok':
      case 'up':
        return {
          chipClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
          dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]',
          icon: <CheckCircleOutlineRoundedIcon fontSize="small" className="text-emerald-400" />,
          cardBorder: 'border-emerald-500/30',
        };
      case 'degraded':
        return {
          chipClass: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
          dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]',
          icon: <WarningAmberRoundedIcon fontSize="small" className="text-amber-400" />,
          cardBorder: 'border-amber-500/30',
        };
      default:
        return {
          chipClass: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
          dotClass: 'bg-rose-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]',
          icon: <HighlightOffRoundedIcon fontSize="small" className="text-rose-400" />,
          cardBorder: 'border-rose-500/30',
        };
    }
  };

  const statusConfig = getStatusConfig(health?.status);
  const displayStatus = error
    ? 'UNREACHABLE'
    : health?.status?.toUpperCase() || (loading ? 'CONNECTING...' : 'UNKNOWN');

  return (
    <Card
      elevation={0}
      className={`bg-slate-900/90 border rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 ${
        health ? statusConfig.cardBorder : 'border-slate-800/80'
      }`}
    >
      <CardContent className="p-6 md:p-7 space-y-6">
        {/* Header Bar */}
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <Box className="flex items-center gap-3">
            <Box className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <HealthAndSafetyOutlinedIcon />
            </Box>
            <Box>
              <Typography
                variant="h5"
                component="h2"
                className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight"
              >
                System Health Status
              </Typography>
              <Typography variant="body2" className="text-slate-400 text-sm">
                Continuous telemetry and sub-service readiness checks
              </Typography>
            </Box>
          </Box>

          <Box>
            <Chip
              icon={
                <span
                  className={`w-2.5 h-2.5 rounded-full mr-1 ${
                    error ? 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : statusConfig.dotClass
                  }`}
                />
              }
              label={displayStatus}
              className={`font-mono text-xs font-bold tracking-wider px-2.5 py-1 border rounded-full ${
                error
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/40'
                  : statusConfig.chipClass
              }`}
            />
          </Box>
        </Box>

        {/* Error Notification */}
        {error ? (
          <Alert
            severity="error"
            variant="outlined"
            className="border-rose-500/30 bg-rose-950/20 text-rose-300 rounded-xl"
          >
            {error}
          </Alert>
        ) : (
          <Box className="space-y-6">
            {/* Metadata 4-Column Grid */}
            <Box className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Service */}
              <Paper
                elevation={0}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between"
              >
                <Box className="flex items-center gap-1.5 text-slate-400 text-xs uppercase font-medium">
                  <CloudDoneOutlinedIcon sx={{ fontSize: 14 }} className="text-sky-400" />
                  <span>Service</span>
                </Box>
                <Typography variant="body1" className="font-semibold text-slate-100 mt-1 truncate">
                  {health?.service || 'cloud-monitor'}
                </Typography>
              </Paper>

              {/* Environment */}
              <Paper
                elevation={0}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between"
              >
                <Box className="flex items-center gap-1.5 text-slate-400 text-xs uppercase font-medium">
                  <PublicRoundedIcon sx={{ fontSize: 14 }} className="text-emerald-400" />
                  <span>Environment</span>
                </Box>
                <Typography variant="body1" className="font-semibold text-slate-100 mt-1 capitalize truncate">
                  {health?.environment || 'production'}
                </Typography>
              </Paper>

              {/* Version */}
              <Paper
                elevation={0}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between"
              >
                <Box className="flex items-center gap-1.5 text-slate-400 text-xs uppercase font-medium">
                  <NumbersRoundedIcon sx={{ fontSize: 14 }} className="text-purple-400" />
                  <span>Version</span>
                </Box>
                <Typography variant="body1" className="font-semibold text-slate-100 mt-1 font-mono">
                  v{health?.version || '1.0.0'}
                </Typography>
              </Paper>

              {/* Uptime */}
              <Paper
                elevation={0}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/50 flex flex-col justify-between"
              >
                <Box className="flex items-center gap-1.5 text-slate-400 text-xs uppercase font-medium">
                  <AccessTimeRoundedIcon sx={{ fontSize: 14 }} className="text-cyan-400" />
                  <span>Live Uptime</span>
                </Box>
                <Typography variant="body1" className="font-bold text-cyan-300 mt-1 font-mono">
                  {health?.uptime_seconds !== undefined ? formatUptime(health.uptime_seconds) : '--'}
                </Typography>
              </Paper>
            </Box>

            {/* Component Health Section */}
            <Box className="space-y-3">
              <Typography
                variant="overline"
                className="text-xs font-bold tracking-wider text-slate-400 uppercase"
              >
                Component Health
              </Typography>

              <Box className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <ComponentBadge
                  name="API Gateway"
                  status={health?.components?.api}
                  icon={<DnsRoundedIcon fontSize="small" className="text-sky-400" />}
                />
                <ComponentBadge
                  name="Metrics Exporter"
                  status={health?.components?.metrics_exporter}
                  icon={<SensorsRoundedIcon fontSize="small" className="text-purple-400" />}
                />
                <ComponentBadge
                  name="Engine Worker"
                  status={health?.components?.engine}
                  icon={<MemoryRoundedIcon fontSize="small" className="text-emerald-400" />}
                />
              </Box>
            </Box>
          </Box>
        )}

        <Divider className="border-slate-800" />

        {/* Polling Footer */}
        <Box className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-slate-400 gap-2">
          <Box className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <Typography variant="caption" className="text-slate-400">
              Polling interval: 3s
            </Typography>
          </Box>

          <Typography variant="caption" className="text-slate-400">
            {lastUpdated
              ? `Last updated: ${lastUpdated.toLocaleTimeString()}`
              : 'Waiting for telemetry...'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

interface ComponentBadgeProps {
  name: string;
  status?: string;
  icon: React.ReactNode;
}

const ComponentBadge: React.FC<ComponentBadgeProps> = ({ name, status, icon }) => {
  const isHealthy =
    status?.toLowerCase() === 'healthy' ||
    status?.toLowerCase() === 'ok' ||
    status?.toLowerCase() === 'up';

  return (
    <Paper
      elevation={0}
      className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 flex items-center justify-between hover:border-slate-600 transition-colors"
    >
      <Box className="flex items-center gap-2.5">
        {icon}
        <Typography variant="body2" className="font-semibold text-slate-200 text-sm">
          {name}
        </Typography>
      </Box>

      <Chip
        size="small"
        label={status || 'Unknown'}
        className={`font-semibold text-xs px-1.5 py-0.5 border rounded-lg ${
          isHealthy
            ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-950/50 text-rose-300 border-rose-500/30'
        }`}
      />
    </Paper>
  );
};
