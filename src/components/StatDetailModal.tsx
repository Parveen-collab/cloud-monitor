import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import HealthAndSafetyOutlinedIcon from '@mui/icons-material/HealthAndSafetyOutlined';
import TerminalRoundedIcon from '@mui/icons-material/TerminalRounded';
import InsightsRoundedIcon from '@mui/icons-material/InsightsRounded';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import type { StatDefinition } from '../data/statDefinitions';

interface StatDetailModalProps {
  stat: StatDefinition | null;
  currentValue?: string | number | React.ReactNode;
  currentStatus?: 'healthy' | 'warning' | 'critical' | 'neutral';
  open: boolean;
  onClose: () => void;
}

export const StatDetailModal: React.FC<StatDetailModalProps> = ({
  stat,
  currentValue,
  currentStatus = 'healthy',
  open,
  onClose,
}) => {
  const [copiedQuery, setCopiedQuery] = useState(false);

  if (!stat) return null;

  const handleCopyPromQL = () => {
    if (!stat.samplePromQL) return;
    navigator.clipboard.writeText(stat.samplePromQL);
    setCopiedQuery(true);
    setTimeout(() => setCopiedQuery(false), 2000);
  };

  const getStatusBadge = () => {
    switch (currentStatus) {
      case 'healthy':
        return {
          label: 'NOMINAL / HEALTHY',
          color: 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40',
          dot: 'bg-emerald-400',
        };
      case 'warning':
        return {
          label: 'ATTENTION / ELEVATED',
          color: 'bg-amber-950/60 text-amber-300 border-amber-500/40',
          dot: 'bg-amber-400',
        };
      case 'critical':
        return {
          label: 'CRITICAL / ACTION NEEDED',
          color: 'bg-rose-950/60 text-rose-300 border-rose-500/40',
          dot: 'bg-rose-400',
        };
      default:
        return {
          label: 'ACTIVE TELEMETRY',
          color: 'bg-sky-950/60 text-sky-300 border-sky-500/40',
          dot: 'bg-sky-400',
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      slotProps={{
        paper: {
          className:
            'bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl backdrop-blur-2xl text-slate-100 overflow-hidden',
          sx: {
            backgroundImage: 'none',
          },
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle className="p-6 pb-4 border-b border-slate-800/80 flex items-start justify-between gap-4">
        <Box className="space-y-1.5 flex-1">
          <Box className="flex items-center gap-2 flex-wrap">
            <Chip
              size="small"
              label={stat.category}
              className="bg-sky-950/60 text-sky-300 border border-sky-500/30 text-xs font-semibold"
            />
            <Chip
              size="small"
              label={`SRE Signal: ${stat.goldenSignal}`}
              className="bg-purple-950/60 text-purple-300 border border-purple-500/30 text-xs font-semibold"
            />
            <Chip
              size="small"
              label={stat.metricType}
              className="bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono"
            />
          </Box>

          <Typography variant="h5" className="font-extrabold text-xl md:text-2xl text-slate-100 tracking-tight pt-1">
            {stat.title}
          </Typography>

          <Typography variant="caption" className="font-mono text-slate-400 text-xs block">
            Metric key: <code className="text-sky-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">{stat.prometheusKey}</code>
          </Typography>
        </Box>

        <IconButton
          onClick={onClose}
          size="small"
          className="text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
        >
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Body */}
      <DialogContent className="p-6 space-y-6">
        {/* Real-Time Snapshot Banner */}
        <Paper
          elevation={0}
          className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
        >
          <Box>
            <Typography variant="caption" className="text-slate-400 uppercase font-bold tracking-wider block text-xs">
              Current Live Value
            </Typography>
            <Typography variant="h4" className="text-2xl md:text-3xl font-extrabold text-slate-100 font-mono mt-0.5">
              {currentValue ?? '--'}
            </Typography>
            <Typography variant="caption" className="text-slate-400 text-xs">
              Update cadence: {stat.updateInterval}
            </Typography>
          </Box>

          <Box className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${badge.dot} animate-pulse`} />
            <Chip
              label={badge.label}
              size="small"
              className={`font-mono text-xs font-bold border ${badge.color}`}
            />
          </Box>
        </Paper>

        {/* What This Metric Means */}
        <Box className="space-y-2">
          <Box className="flex items-center gap-2 text-sky-400">
            <InsightsRoundedIcon fontSize="small" />
            <Typography variant="subtitle1" className="font-bold text-slate-100 text-base">
              What This Stat Measures
            </Typography>
          </Box>
          <Typography variant="body2" className="text-slate-300 leading-relaxed text-sm bg-slate-800/40 p-4 rounded-xl border border-slate-800/80">
            {stat.detailedMeaning}
          </Typography>
        </Box>

        {/* Why It Helps Monitor System Health */}
        <Box className="space-y-2">
          <Box className="flex items-center gap-2 text-emerald-400">
            <HealthAndSafetyOutlinedIcon fontSize="small" />
            <Typography variant="subtitle1" className="font-bold text-slate-100 text-base">
              How It Helps Us Monitor Health & Prevent Outages
            </Typography>
          </Box>
          <Typography variant="body2" className="text-slate-300 leading-relaxed text-sm bg-slate-800/40 p-4 rounded-xl border border-slate-800/80">
            {stat.healthSignificance}
          </Typography>
        </Box>

        {/* Thresholds & SRE Health Benchmarks */}
        <Box className="space-y-2.5">
          <Box className="flex items-center gap-2 text-amber-400">
            <SpeedRoundedIcon fontSize="small" />
            <Typography variant="subtitle1" className="font-bold text-slate-100 text-base">
              Health Thresholds & Benchmarks
            </Typography>
          </Box>

          <Box className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {stat.thresholds.map((th, index) => {
              const borderClass =
                th.level === 'healthy'
                  ? 'border-emerald-500/30 bg-emerald-950/20'
                  : th.level === 'warning'
                  ? 'border-amber-500/30 bg-amber-950/20'
                  : 'border-rose-500/30 bg-rose-950/20';

              const titleColor =
                th.level === 'healthy'
                  ? 'text-emerald-400'
                  : th.level === 'warning'
                  ? 'text-amber-400'
                  : 'text-rose-400';

              return (
                <Paper
                  key={index}
                  elevation={0}
                  className={`p-3.5 rounded-xl border ${borderClass} space-y-1.5`}
                >
                  <Typography variant="caption" className={`font-bold uppercase tracking-wider block text-xs ${titleColor}`}>
                    {th.level}
                  </Typography>
                  <Typography variant="body2" className="font-semibold text-slate-200 text-xs font-mono">
                    {th.range}
                  </Typography>
                  <Typography variant="caption" className="text-slate-400 text-xs block leading-normal">
                    {th.description}
                  </Typography>
                </Paper>
              );
            })}
          </Box>
        </Box>

        {/* Actionable SRE Remediation Playbook */}
        <Box className="space-y-2.5">
          <Box className="flex items-center gap-2 text-rose-400">
            <BuildRoundedIcon fontSize="small" />
            <Typography variant="subtitle1" className="font-bold text-slate-100 text-base">
              Troubleshooting & Remediation Playbook
            </Typography>
          </Box>

          <Paper elevation={0} className="p-4 rounded-xl bg-slate-800/40 border border-slate-800/80">
            <Typography variant="caption" className="text-slate-400 block mb-2 font-medium">
              If this metric crosses into Warning or Critical levels, take the following steps:
            </Typography>
            <Box component="ol" className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 font-sans leading-relaxed">
              {stat.remediationSteps.map((step, idx) => (
                <li key={idx} className="pl-1">
                  <span>{step}</span>
                </li>
              ))}
            </Box>
          </Paper>
        </Box>

        {/* PromQL Query Box */}
        {stat.samplePromQL && (
          <Box className="space-y-2">
            <Box className="flex items-center justify-between">
              <Box className="flex items-center gap-2 text-purple-400">
                <TerminalRoundedIcon fontSize="small" />
                <Typography variant="subtitle2" className="font-bold text-slate-200 text-xs uppercase tracking-wider">
                  Sample Prometheus Query (PromQL)
                </Typography>
              </Box>

              <Tooltip title={copiedQuery ? 'Copied!' : 'Copy PromQL'}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={handleCopyPromQL}
                  startIcon={copiedQuery ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                  className="text-xs normal-case border-slate-700 text-purple-300 hover:border-purple-400 py-0.5 px-2.5 rounded-lg"
                >
                  {copiedQuery ? 'Copied' : 'Copy'}
                </Button>
              </Tooltip>
            </Box>

            <Paper elevation={0} className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-sky-300 overflow-x-auto">
              <code>{stat.samplePromQL}</code>
            </Paper>
          </Box>
        )}
      </DialogContent>

      {/* Dialog Footer */}
      <Divider className="border-slate-800" />
      <DialogActions className="p-4 bg-slate-950/60 justify-between">
        <Typography variant="caption" className="text-slate-400 text-xs px-2">
          Click outside or press <kbd className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 text-slate-300">Esc</kbd> to close
        </Typography>
        <Button
          onClick={onClose}
          variant="contained"
          className="bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold px-5 py-1.5 rounded-xl normal-case"
        >
          Close Inspector
        </Button>
      </DialogActions>
    </Dialog>
  );
};

