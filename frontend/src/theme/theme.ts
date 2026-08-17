import { createTheme } from '@mui/material/styles';

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#047857', 
      dark: '#064E3B', 
      light: '#10B981',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0F172A', 
    },
    background: {
      default: '#F1F5F9', 
      paper: '#FFFFFF',  
    },
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
    },
    error: {
      main: '#DC2626',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 10,
  },
});