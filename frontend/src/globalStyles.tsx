import { GlobalStyles } from '@mui/material';

export const AppGlobalStyles = () => (
  <GlobalStyles
    styles={{
      ':root': {
        '--page-gradient':
          'radial-gradient(circle at 10% 20%, rgba(242, 159, 5, 0.18), transparent 50%), radial-gradient(circle at 80% 10%, rgba(47, 138, 121, 0.2), transparent 45%), linear-gradient(180deg, #f4f1eb 0%, #f0ebe3 100%)',
        '--page-texture':
          'repeating-linear-gradient(135deg, rgba(14, 35, 32, 0.035) 0px, rgba(14, 35, 32, 0.035) 2px, transparent 2px, transparent 6px)',
      },
      '*, *::before, *::after': {
        boxSizing: 'border-box',
      },
      body: {
        margin: 0,
        minHeight: '100vh',
        backgroundImage: 'var(--page-gradient), var(--page-texture)',
        backgroundAttachment: 'fixed',
        '@media (max-width: 600px)': {
          backgroundAttachment: 'scroll',
        },
      },
      '#root': {
        minHeight: '100vh',
      },
    }}
  />
);
