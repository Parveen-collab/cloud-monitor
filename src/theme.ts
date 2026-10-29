import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#38bdf8', // Tailwind sky-400
      light: '#7dd3fc',
      dark: '#0284c7',
      contrastText: '#080d1a',
    },
    secondary: {
      main: '#a78bfa', // Tailwind violet-400
      light: '#c4b5fd',
      dark: '#7c3aed',
    },
    background: {
      default: '#0b0f19',
      paper: '#131b2e',
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#94a3b8',
    },
    success: {
      main: '#34d399', // emerald-400
      light: '#6ee7b7',
      dark: '#059669',
    },
    warning: {
      main: '#fbbf24', // amber-400
      light: '#fcd34d',
      dark: '#d97706',
    },
    error: {
      main: '#f87171', // red-400
      light: '#fca5a5',
      dark: '#dc2626',
    },
    divider: 'rgba(148, 163, 184, 0.12)',
  },
  typography: {
    fontFamily: [
      'Inter',
      'ui-sans-serif',
      'system-ui',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.025em',
    },
    h2: {
      fontWeight: 650,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 600,
    },
    body1: {
      letterSpacing: '-0.01em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: '#131b2e',
          border: '1px solid rgba(148, 163, 184, 0.12)',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.3)',
          transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

