import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Stack,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import HelpOutlineRoundedIcon from '@mui/icons-material/HelpOutlineRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { toggleHealth } from 'src/services/api';

export function HealthToggleCard() {
  const [loading, setLoading] = useState(false);
  const [isHealthy, setIsHealthy] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleToggle = async (status: boolean) => {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const response = await toggleHealth(status);
      setIsHealthy(response.is_healthy);
      setMessage(
        `Application marked as ${response.is_healthy ? 'healthy' : 'unhealthy'}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to update application health.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusChip = () => {
    if (isHealthy === null) {
      return (
        <Chip
          icon={<HelpOutlineRoundedIcon className="text-slate-400" />}
          label="Awaiting Action"
          size="small"
          className="bg-slate-800 text-slate-300 border border-slate-700 font-semibold text-xs px-2"
        />
      );
    }
    if (isHealthy) {
      return (
        <Chip
          icon={<CheckCircleRoundedIcon className="text-emerald-400" />}
          label="Healthy"
          size="small"
          className="bg-emerald-950/50 text-emerald-300 border border-emerald-500/30 font-semibold text-xs px-2"
        />
      );
    }
    return (
      <Chip
        icon={<CancelRoundedIcon className="text-rose-400" />}
        label="Unhealthy"
        size="small"
        className="bg-rose-950/50 text-rose-300 border border-rose-500/30 font-semibold text-xs px-2"
      />
    );
  };

  return (
    <Card
      elevation={0}
      className="bg-slate-900/90 border border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-sm transition-all duration-300 hover:border-slate-700/80"
    >
      <CardContent className="p-6 md:p-7 space-y-6">
        {/* Header Bar */}
        <Box className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-800/80">
          <Box className="space-y-1">
            <Typography
              variant="overline"
              className="text-xs font-bold tracking-widest text-indigo-400 uppercase"
            >
              Fault Injection
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight"
            >
              Health Status Control
            </Typography>
            <Typography variant="body2" className="text-slate-400 text-sm">
              Simulate healthy or unhealthy application states to test monitoring and alert detection.
            </Typography>
          </Box>

          <Box>{getStatusChip()}</Box>
        </Box>

        {/* Action Buttons */}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <Button
            variant="contained"
            color="success"
            onClick={() => handleToggle(true)}
            disabled={loading || isHealthy === true}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CheckCircleRoundedIcon />
              )
            }
            className="px-6 py-2.5 rounded-xl font-semibold shadow-md bg-emerald-600 hover:bg-emerald-500 text-white normal-case"
          >
            {loading ? 'Updating...' : 'Set Healthy'}
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={() => handleToggle(false)}
            disabled={loading || isHealthy === false}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <CancelRoundedIcon />
              )
            }
            className="px-6 py-2.5 rounded-xl font-semibold shadow-md bg-rose-600 hover:bg-rose-500 text-white normal-case"
          >
            {loading ? 'Updating...' : 'Set Unhealthy'}
          </Button>
        </Stack>

        {/* Feedback message */}
        {message && (
          <Alert
            severity="success"
            variant="outlined"
            className="border-emerald-500/30 bg-emerald-950/20 text-emerald-200 rounded-xl"
          >
            <AlertTitle className="font-semibold mb-0.5">Health State Updated</AlertTitle>
            <Typography variant="body2">{message}</Typography>
          </Alert>
        )}

        {/* Error message */}
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            className="border-rose-500/30 bg-rose-950/20 text-rose-300 rounded-xl"
          >
            <AlertTitle className="font-semibold mb-0.5">Toggle Failed</AlertTitle>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}

        {/* Information note */}
        <Box className="flex items-start gap-2 p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/40 text-slate-400">
          <InfoOutlinedIcon fontSize="small" className="text-sky-400 mt-0.5 shrink-0" />
          <Typography variant="caption" className="text-slate-400 leading-relaxed">
            The displayed status reflects the last successful toggle response. Your health polling
            component will fetch <code className="px-1.5 py-0.5 rounded bg-slate-800 text-sky-300 font-mono text-xs">/health</code> again to reflect the backend&apos;s current state in telemetry.
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
