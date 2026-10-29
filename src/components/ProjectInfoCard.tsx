import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Alert,
  CircularProgress,
} from '@mui/material';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import type { ProjectInfo } from 'src/types/monitor';
import { fetchProjectInfo } from 'src/services/api';

export default function ProjectInfoCard() {
  const [project, setProject] = useState<ProjectInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjectInfo = async () => {
      try {
        const data = await fetchProjectInfo();
        setProject(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load project information'
        );
      } finally {
        setLoading(false);
      }
    };

    void loadProjectInfo();
  }, []);

  if (loading) {
    return (
      <Card elevation={0} className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6">
        <Box className="flex items-center gap-3 text-slate-400">
          <CircularProgress size={20} className="text-sky-400" />
          <Typography variant="body2">Loading project information...</Typography>
        </Box>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert severity="error" variant="outlined" className="border-rose-500/30 bg-rose-950/20 text-rose-300 rounded-xl">
        {error}
      </Alert>
    );
  }

  if (!project) return null;

  const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <Card
      elevation={0}
      className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/80"
    >
      <CardContent className="p-6 md:p-7 space-y-6">
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800/80">
          <Box className="space-y-1">
            <Typography variant="h5" component="h2" className="text-xl md:text-2xl font-bold text-slate-100">
              {project.project}
            </Typography>
            <Typography variant="body2" className="text-slate-400">
              {project.description}
            </Typography>
          </Box>
          <Chip
            label={`v${project.version}`}
            size="small"
            className="font-mono bg-sky-950/60 text-sky-300 border border-sky-500/30 font-semibold"
          />
        </Box>

        <Box className="space-y-3">
          <Typography variant="overline" className="text-xs font-bold tracking-widest text-slate-400 uppercase">
            Backend Endpoints
          </Typography>

          <Box className="flex flex-col sm:flex-row gap-3 flex-wrap">
            <Button
              variant="outlined"
              href={`${apiBase}${project.docs_url}`}
              target="_blank"
              rel="noreferrer"
              startIcon={<MenuBookRoundedIcon fontSize="small" />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              className="border-slate-700 hover:border-sky-400 text-sky-400 bg-slate-800/50 normal-case rounded-xl font-medium"
            >
              API Documentation
            </Button>
            <Button
              variant="outlined"
              href={`${apiBase}${project.metrics_url}`}
              target="_blank"
              rel="noreferrer"
              startIcon={<BarChartRoundedIcon fontSize="small" />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              className="border-slate-700 hover:border-purple-400 text-purple-400 bg-slate-800/50 normal-case rounded-xl font-medium"
            >
              Prometheus Metrics
            </Button>
            <Button
              variant="outlined"
              href={`${apiBase}${project.health_url}`}
              target="_blank"
              rel="noreferrer"
              startIcon={<FavoriteBorderRoundedIcon fontSize="small" />}
              endIcon={<OpenInNewRoundedIcon fontSize="small" />}
              className="border-slate-700 hover:border-emerald-400 text-emerald-400 bg-slate-800/50 normal-case rounded-xl font-medium"
            >
              Health Endpoint
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
