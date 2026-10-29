import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  TextField,
  InputAdornment,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { simulateLatency } from 'src/services/api';
import type { LatencyResponse } from 'src/types/monitor';

export function LatencySimulationCard() {
  const [delay, setDelay] = useState('1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LatencyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    const seconds = Number(delay);

    if (
      delay.trim() === '' ||
      !Number.isFinite(seconds) ||
      seconds < 0 ||
      seconds > 10
    ) {
      setError('Enter a delay between 0 and 10 seconds.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await simulateLatency(seconds);
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Unable to simulate latency.'
      );
    } finally {
      setLoading(false);
    }
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
              className="text-xs font-bold tracking-widest text-amber-400 uppercase"
            >
              SLO Testing
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight"
            >
              Latency Simulation
            </Typography>
            <Typography variant="body2" className="text-slate-400 text-sm">
              Introduce an artificial delay to test response time measurements and alert thresholds.
            </Typography>
          </Box>

          <Box>
            <Chip
              label="GET · /simulate/latency"
              size="small"
              className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-amber-950/50 text-amber-300 border border-amber-500/30"
            />
          </Box>
        </Box>

        {/* Input Controls */}
        <Box className="space-y-3">
          <Box>
            <Typography variant="subtitle2" className="text-slate-300 font-medium text-sm">
              Delay Duration
            </Typography>
            <Typography variant="caption" className="text-slate-400">
              Choose a value from 0 to 10 seconds
            </Typography>
          </Box>

          <Box className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <TextField
              id="latency-delay"
              type="number"
              value={delay}
              disabled={loading}
              onChange={(e) => setDelay(e.target.value)}
              slotProps={{
                htmlInput: { min: 0, max: 10, step: 0.5 },
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <TimerOutlinedIcon className="text-slate-400" fontSize="small" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end" className="text-slate-400 text-xs font-mono">
                      sec
                    </InputAdornment>
                  ),
                },
              }}
              size="small"
              className="w-full sm:w-48 bg-slate-800/60 rounded-xl"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '0.75rem',
                  '& fieldset': { borderColor: 'rgba(148, 163, 184, 0.2)' },
                  '&:hover fieldset': { borderColor: 'rgba(148, 163, 184, 0.4)' },
                },
              }}
            />

            <Button
              variant="contained"
              onClick={handleSimulate}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={18} color="inherit" />
                ) : (
                  <SpeedIcon />
                )
              }
              className="px-6 py-2 rounded-xl font-semibold shadow-md bg-amber-600 hover:bg-amber-500 text-slate-950 normal-case"
            >
              {loading ? 'Simulating...' : 'Simulate Latency'}
            </Button>
          </Box>
        </Box>

        {/* Loading status */}
        {loading && (
          <Box className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 text-slate-300">
            <CircularProgress size={18} className="text-amber-400" />
            <Typography variant="body2">
              Waiting for backend response ({delay}s simulation active)...
            </Typography>
          </Box>
        )}

        {/* Result Alert */}
        {result && (
          <Alert
            severity="success"
            variant="outlined"
            icon={<CheckCircleOutlineRoundedIcon className="text-amber-400" />}
            className="border-amber-500/30 bg-amber-950/20 text-slate-200 rounded-xl"
          >
            <AlertTitle className="text-amber-300 font-semibold mb-1">
              Simulation completed · {result.delayed_by} seconds
            </AlertTitle>
            <Typography variant="body2" className="text-slate-300">
              {result.message}
            </Typography>
            <Typography variant="caption" className="block mt-2 text-slate-400">
              Check the Prometheus telemetry viewer for updated latency measurements.
            </Typography>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            className="border-rose-500/30 bg-rose-950/20 text-rose-300 rounded-xl"
          >
            <AlertTitle className="font-semibold mb-1">Latency Simulation Error</AlertTitle>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
