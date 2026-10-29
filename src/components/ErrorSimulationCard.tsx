import { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Box,
  Alert,
  AlertTitle,
  CircularProgress,
} from '@mui/material';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import { simulateError } from 'src/services/api';

type SimulationResult = {
  status: number;
  detail: string;
};

export function ErrorSimulationCard() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulateError = async () => {
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await simulateError();
      setResult(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to trigger error simulation.'
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
              className="text-xs font-bold tracking-widest text-rose-400 uppercase"
            >
              SRE Testing
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              className="text-xl md:text-2xl font-bold text-slate-100 tracking-tight"
            >
              Error Simulation
            </Typography>
            <Typography variant="body2" className="text-slate-400 text-sm">
              Generate a simulated HTTP 500 response to test error monitoring and alerting.
            </Typography>
          </Box>

          <Box>
            <Chip
              label="POST · 500"
              size="small"
              className="font-mono text-xs font-semibold px-2 py-0.5 rounded-lg bg-rose-950/50 text-rose-300 border border-rose-500/30"
            />
          </Box>
        </Box>

        {/* Action Trigger Button */}
        <Box>
          <Button
            variant="contained"
            color="error"
            onClick={handleSimulateError}
            disabled={loading}
            startIcon={
              loading ? (
                <CircularProgress size={18} color="inherit" />
              ) : (
                <ReportProblemOutlinedIcon />
              )
            }
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl font-semibold shadow-md bg-rose-600 hover:bg-rose-500 transition-all text-white normal-case"
          >
            {loading ? 'Triggering simulation...' : 'Simulate Server Error'}
          </Button>
        </Box>

        {/* Success Alert */}
        {result && (
          <Alert
            severity="success"
            variant="outlined"
            icon={<CheckCircleOutlineRoundedIcon className="text-emerald-400" />}
            className="border-emerald-500/30 bg-emerald-950/20 text-slate-200 rounded-xl"
          >
            <AlertTitle className="text-emerald-300 font-semibold mb-1">
              Simulation triggered · HTTP {result.status}
            </AlertTitle>
            <Typography variant="body2" className="text-slate-300">
              {result.detail}
            </Typography>
            <Typography variant="caption" className="block mt-2 text-slate-400">
              Check your Prometheus metrics and alerting rules to verify that the error was recorded.
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
            <AlertTitle className="font-semibold mb-1">
              Simulation could not be verified
            </AlertTitle>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
