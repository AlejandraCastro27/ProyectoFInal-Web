import { createTheme } from '@mui/material/styles';
import '@fontsource/baloo-2';
import '@fontsource/comic-neue';

const theme = createTheme({
  palette: {
    primary: {
      main: '#58CC02', 
      light: '#7FE030',
      dark: '#46A302',
    },
    secondary: {
      main: '#FF4B4B', 
      light: '#FF6B6B',
      dark: '#CC3B3B',
    },
    background: {
      default: '#F7F7F7',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Baloo 2", "Comic Neue", sans-serif',
    h1: {
      fontFamily: '"Baloo 2", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h2: {
      fontFamily: '"Baloo 2", sans-serif',
      fontWeight: 600,
      fontSize: '2rem',
    },
    h3: {
      fontFamily: '"Baloo 2", sans-serif',
      fontWeight: 600,
      fontSize: '1.75rem',
    },
    body1: {
      fontFamily: '"Comic Neue", sans-serif',
      fontSize: '1.1rem',
    },
    button: {
      fontFamily: '"Baloo 2", sans-serif',
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          boxShadow: '0 4px 0 #46A302',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 6px 0 #46A302',
          },
          '&:active': {
            transform: 'translateY(2px)',
            boxShadow: '0 2px 0 #46A302',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          transition: 'transform 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
          },
        },
      },
    },
  },
});

export default theme; 