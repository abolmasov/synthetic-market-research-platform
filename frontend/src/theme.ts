import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#0F6B5B',
      light: '#2F8A79',
      dark: '#0A4F44',
    },
    secondary: {
      main: '#F29F05',
      light: '#F7B94A',
      dark: '#C98202',
    },
    background: {
      default: '#F4F1EB',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#0E2320',
      secondary: '#3C4F4B',
    },
  },
  typography: {
    fontFamily:
      '"Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", Ubuntu, Cantarell, sans-serif',
    h1: {
      fontFamily:
        '"Space Grotesk", "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", Ubuntu, Cantarell, sans-serif',
      fontWeight: 700,
      fontSize: '3.1rem',
      letterSpacing: '-0.03em',
    },
    h2: {
      fontFamily:
        '"Space Grotesk", "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", Ubuntu, Cantarell, sans-serif',
      fontWeight: 700,
      fontSize: '2.25rem',
      letterSpacing: '-0.02em',
    },
    h3: {
      fontFamily:
        '"Space Grotesk", "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", Ubuntu, Cantarell, sans-serif',
      fontWeight: 600,
      fontSize: '1.6rem',
    },
    h6: {
      fontFamily:
        '"Space Grotesk", "Manrope", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", Ubuntu, Cantarell, sans-serif',
      fontWeight: 600,
      fontSize: '1.05rem',
      letterSpacing: '0.01em',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.65,
    },
    body2: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 18,
  },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          border: '1px solid rgba(15, 107, 91, 0.14)',
          backdropFilter: 'blur(12px)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          paddingInline: '1.4rem',
          borderRadius: 999,
          '@media (max-width: 600px)': {
            paddingInline: '1rem',
            fontSize: '0.8125rem',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: 999,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          '@media (max-width: 600px)': {
            margin: 16,
            width: 'calc(100% - 32px)',
            maxHeight: 'calc(100% - 32px)',
          },
        },
      },
    },
    MuiTablePagination: {
      styleOverrides: {
        toolbar: {
          '@media (max-width: 600px)': {
            flexWrap: 'wrap',
            justifyContent: 'center',
            paddingLeft: 8,
            paddingRight: 8,
          },
        },
        selectLabel: {
          '@media (max-width: 600px)': {
            display: 'none',
          },
        },
        displayedRows: {
          '@media (max-width: 600px)': {
            fontSize: '0.75rem',
          },
        },
      },
    },
  },
});

export const theme = responsiveFontSizes(baseTheme);
