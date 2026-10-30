import React from 'react';
import { Paper, Box, Typography, Tooltip, Chip } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TouchAppOutlinedIcon from '@mui/icons-material/TouchAppOutlined';

export interface InteractiveStatCardProps {
  id: string;
  title: string;
  value: React.ReactNode;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  tooltipText: string;
  accentColor?: 'sky' | 'emerald' | 'amber' | 'purple' | 'cyan' | 'rose';
  statusLevel?: 'healthy' | 'warning' | 'critical' | 'neutral';
  badgeText?: string;
  onClick: () => void;
  extraVisual?: React.ReactNode;
}

export const InteractiveStatCard: React.FC<InteractiveStatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  tooltipText,
  accentColor = 'sky',
  statusLevel = 'neutral',
  badgeText,
  onClick,
  extraVisual,
}) => {
  // Accent color styles
  const colorMap = {
    sky: {
      borderHover: 'hover:border-sky-400/60',
      glowHover: 'hover:shadow-[0_8px_25px_-4px_rgba(56,189,248,0.25)]',
      iconBg: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
      pillBg: 'group-hover:bg-sky-500/20 group-hover:text-sky-300',
    },
    emerald: {
      borderHover: 'hover:border-emerald-400/60',
      glowHover: 'hover:shadow-[0_8px_25px_-4px_rgba(52,211,153,0.25)]',
      iconBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400',
      pillBg: 'group-hover:bg-emerald-500/20 group-hover:text-emerald-300',
    },
    amber: {
      borderHover: 'hover:border-amber-400/60',
      glowHover: 'hover:shadow-[0_8px_25px_-4px_rgba(251,191,36,0.25)]',
      iconBg: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
      pillBg: 'group-hover:bg-amber-500/20 group-hover:text-amber-300',
    },
    purple: {
      borderHover: 'hover:border-purple-400/60',
      glowHover: 'hover:shadow-[0_8px_25px_-4px_rgba(168,85,247,0.25)]',
      iconBg: 'bg-purple-500/15 border-purple-500/30 text-purple-400',
      pillBg: 'group-hover:bg-purple-500/20 group-hover:text-purple-300',
    },
    cyan: {
      borderHover: 'hover:border-cyan-400/60',
      glowHover: 'hover:shadow-[0_8px_25px_-4px_rgba(34,211,238,0.25)]',
      iconBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-400',
      pillBg: 'group-hover:bg-cyan-500/20 group-hover:text-cyan-300',
    },
    rose: {
      borderHover: 'hover:border-rose-400/60',
      glowHover: 'hover:shadow-[0_8px_25px_-4px_rgba(244,63,94,0.25)]',
      iconBg: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
      pillBg: 'group-hover:bg-rose-500/20 group-hover:text-rose-300',
    },
  };

  const currentTheme = colorMap[accentColor] || colorMap.sky;

  return (
    <Tooltip
      title={
        <Box className="p-1 space-y-1">
          <Typography variant="caption" className="font-bold text-slate-100 block">
            {title}
          </Typography>
          <Typography variant="caption" className="text-slate-300 block text-xs leading-tight">
            {tooltipText}
          </Typography>
          <Typography variant="caption" className="text-sky-300 font-semibold block text-[11px] pt-0.5">
            👆 Click to inspect full health meaning &amp; playbook
          </Typography>
        </Box>
      }
      arrow
      placement="top"
    >
      <Paper
        elevation={0}
        onClick={onClick}
        tabIndex={0}
        role="button"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick();
          }
        }}
        className={`group relative p-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 flex flex-col justify-between 
          cursor-pointer transition-all duration-300 ease-out 
          hover:-translate-y-1.5 hover:scale-[1.01] ${currentTheme.borderHover} ${currentTheme.glowHover} 
          focus:outline-none focus:ring-2 focus:ring-sky-500/50 backdrop-blur-sm shadow-md overflow-hidden`}
      >
        {/* Top ambient highlight gradient */}
        <Box className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-slate-700/40 to-transparent group-hover:via-sky-400/60 transition-all duration-300" />

        {/* Top Row: Title + Icon */}
        <Box className="flex items-center justify-between gap-2">
          <Box className="flex items-center gap-1.5 flex-1 min-w-0">
            <Typography
              variant="caption"
              className="text-slate-400 text-xs font-semibold uppercase tracking-wider truncate group-hover:text-slate-200 transition-colors"
            >
              {title}
            </Typography>
            <InfoOutlinedIcon
              sx={{ fontSize: 13 }}
              className="text-slate-400 opacity-60 group-hover:opacity-100 group-hover:text-sky-400 transition-all"
            />
          </Box>

          <Box className={`p-2 rounded-xl border transition-transform duration-300 group-hover:scale-110 ${currentTheme.iconBg}`}>
            {icon}
          </Box>
        </Box>

        {/* Middle Row: Big Metric Value */}
        <Box className="my-2.5">
          <Typography
            variant="h4"
            className="text-2xl sm:text-3xl font-extrabold text-slate-100 font-mono tracking-tight group-hover:text-white transition-colors"
          >
            {value}
          </Typography>

          {subtitle && (
            <Box className="text-xs text-slate-400 mt-1 font-sans">
              {subtitle}
            </Box>
          )}

          {extraVisual && <Box className="mt-2">{extraVisual}</Box>}
        </Box>

        {/* Bottom Row: Inspection Cue & Status Badge */}
        <Box className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
          {badgeText ? (
            <Chip
              label={badgeText}
              size="small"
              className={`h-5 text-[10px] font-mono font-bold px-1 rounded-md border ${
                statusLevel === 'healthy'
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/30'
                  : statusLevel === 'warning'
                  ? 'bg-amber-950/60 text-amber-300 border-amber-500/30'
                  : statusLevel === 'critical'
                  ? 'bg-rose-950/60 text-rose-300 border-rose-500/30'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
              }`}
            />
          ) : (
            <span className="font-mono text-slate-400">telemetry live</span>
          )}

          <Box className={`flex items-center gap-1 font-medium transition-all text-slate-400 group-hover:text-sky-300`}>
            <TouchAppOutlinedIcon sx={{ fontSize: 13 }} className="animate-bounce" />
            <span className="text-[10px] font-semibold">Inspect</span>
          </Box>
        </Box>
      </Paper>
    </Tooltip>
  );
};

