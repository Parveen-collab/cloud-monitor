import { useState, useEffect } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Box,
  Typography,
  Chip,
  Button,
  Card,
  CardContent,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import CloudQueueRoundedIcon from '@mui/icons-material/CloudQueueRounded';
import MenuBookRoundedIcon from '@mui/icons-material/MenuBookRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import HubRoundedIcon from '@mui/icons-material/HubRounded';
import type { HealthStatus, ProjectInfo } from 'src/types/monitor';
import { fetchHealth, fetchProjectInfo } from 'src/services/api';
import { HealthCard } from 'src/components/HealthCard';
import { MetricsViewer } from 'src/components/MetricsViewer';
import { ServiceStatusCard } from 'src/components/ServiceStatusCard';
import { ErrorSimulationCard } from 'src/components/ErrorSimulationCard';
import { LatencySimulationCard } from 'src/components/LatencySimulationCard';
import { HealthToggleCard } from 'src/components/HealthToggleCard';
import { darkTheme } from 'src/theme';

export default function App() {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [project, setProject] = useState<ProjectInfo | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [projectLoading, setProjectLoading] = useState<boolean>(true);

  const [error, setError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Fetch project information once when the dashboard loads.
  useEffect(() => {
    let isMounted = true;

    const loadProjectInfo = async () => {
      try {
        const data = await fetchProjectInfo();

        if (isMounted) {
          setProject(data);
          setProjectError(null);
        }
      } catch (err) {
        if (isMounted) {
          setProjectError(
            err instanceof Error
              ? err.message
              : 'Failed to fetch project information'
          );
        }
      } finally {
        if (isMounted) {
          setProjectLoading(false);
        }
      }
    };

    void loadProjectInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  // Fetch health immediately and poll every 3 seconds.
  useEffect(() => {
    let isMounted = true;

    const loadHealth = async () => {
      try {
        const data = await fetchHealth();

        if (isMounted) {
          setHealth(data);
          setError(null);
          setLastUpdated(new Date());
        }
      } catch (err) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Failed to reach /health endpoint'
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadHealth();

    const intervalId = setInterval(() => {
      void loadHealth();
    }, 3000);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  const apiBase =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />

      {/* Main App Container */}
      <Box className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-sky-500/30 selection:text-white">
        <Container maxWidth="xl" className="py-6 sm:py-8 lg:py-10 space-y-6 sm:space-y-8 flex-1">
          {/* Top Hero / Header Section */}
          <Box className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800/80 p-6 sm:p-8 md:p-10 shadow-2xl backdrop-blur-xl">
            {/* Background Ambient Glow */}
            <Box className="absolute -top-24 -right-24 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
            <Box className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <Box className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
              <Box className="space-y-3">
                <Box className="flex items-center gap-3">
                  <Box className="p-2.5 rounded-2xl bg-sky-500/15 border border-sky-500/30 text-sky-400 shadow-inner">
                    <CloudQueueRoundedIcon fontSize="large" />
                  </Box>
                  <Box>
                    <Box className="flex items-center gap-2.5 flex-wrap">
                      <Typography
                        variant="h3"
                        component="h1"
                        className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-100 tracking-tight"
                      >
                        {project?.project ?? 'Cloud Monitor Dashboard'}
                      </Typography>
                      {project && (
                        <Chip
                          label={`v${project.version}`}
                          size="small"
                          className="font-mono text-xs font-semibold bg-sky-950/70 text-sky-300 border border-sky-500/30"
                        />
                      )}
                    </Box>
                    <Typography variant="body1" className="text-slate-400 text-sm sm:text-base mt-1 max-w-2xl">
                      {project?.description ??
                        'Real-time telemetry, SRE controls, and infrastructure health'}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Status Indicator */}
              <Box className="flex items-center gap-2 self-start md:self-center px-4 py-2 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-xs font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <Typography variant="caption" className="font-semibold text-slate-300">
                  MONITORING ACTIVE
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Project Loading / Error Alerts */}
          {projectLoading && (
            <Box className="flex items-center gap-3 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-300">
              <CircularProgress size={20} className="text-sky-400" />
              <Typography variant="body2">Loading project information...</Typography>
            </Box>
          )}

          {projectError && (
            <Alert
              severity="error"
              variant="outlined"
              className="border-rose-500/30 bg-rose-950/20 text-rose-300 rounded-2xl"
            >
              <AlertTitle className="font-semibold mb-0.5">Project Information Unavailable</AlertTitle>
              <Typography variant="body2">{projectError}</Typography>
            </Alert>
          )}

          {/* Backend Endpoints Navigation Bar */}
          {project && (
            <Card
              elevation={0}
              className="bg-slate-900/80 border border-slate-800/80 rounded-2xl backdrop-blur-md shadow-lg"
            >
              <CardContent className="p-5 sm:p-6 space-y-3">
                <Box className="flex items-center gap-2 text-slate-400">
                  <HubRoundedIcon fontSize="small" className="text-sky-400" />
                  <Typography variant="overline" className="text-xs font-bold tracking-wider uppercase text-slate-400">
                    Live Backend Endpoints
                  </Typography>
                </Box>

                <Box className="flex flex-col sm:flex-row gap-3 flex-wrap">
                  <Button
                    variant="outlined"
                    href={`${apiBase}${project.docs_url}`}
                    target="_blank"
                    rel="noreferrer"
                    startIcon={<MenuBookRoundedIcon fontSize="small" />}
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    className="border-slate-700/80 hover:border-sky-400 text-sky-400 bg-slate-800/50 hover:bg-slate-800 normal-case rounded-xl font-medium px-4 py-2"
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
                    className="border-slate-700/80 hover:border-purple-400 text-purple-400 bg-slate-800/50 hover:bg-slate-800 normal-case rounded-xl font-medium px-4 py-2"
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
                    className="border-slate-700/80 hover:border-emerald-400 text-emerald-400 bg-slate-800/50 hover:bg-slate-800 normal-case rounded-xl font-medium px-4 py-2"
                  >
                    Health Endpoint
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Main Dashboard Cards */}
          <Box className="space-y-6 sm:space-y-8">
            <ServiceStatusCard />

            <HealthCard
              health={health}
              loading={loading}
              error={error}
              lastUpdated={lastUpdated}
            />

            {/* SRE Controls Row: Error & Latency simulation side-by-side or stacked on mobile */}
            <Box className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ErrorSimulationCard />
              <LatencySimulationCard />
            </Box>

            <HealthToggleCard />

            <MetricsViewer />
          </Box>
        </Container>

        {/* Global Footer */}
        <Box
          component="footer"
          className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-400 mt-auto"
        >
          <Typography variant="caption" className="text-slate-400">
            Cloud Monitor Dashboard · Powered by MUI v6 &amp; Tailwind CSS v4
          </Typography>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
