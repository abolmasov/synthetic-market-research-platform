import { useCallback, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  Grid,
  IconButton,
  Link,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CategoryIcon from '@mui/icons-material/Category';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import GroupsIcon from '@mui/icons-material/Groups';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import MenuIcon from '@mui/icons-material/Menu';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ScienceIcon from '@mui/icons-material/Science';
import { useAuth } from '../contexts/useAuth';

const NAV_ITEMS = [
  { label: 'Dashboard', path: '/', Icon: AutoAwesomeIcon },
  { label: 'Studies', path: '/studies', Icon: FolderOpenIcon },
  { label: 'Personas', path: '/personas', Icon: GroupsIcon },
  { label: 'Segments', path: '/segments', Icon: CategoryIcon },
  { label: 'Hypotheses', path: '/hypotheses', Icon: ScienceIcon },
  { label: 'Simulations', path: '/simulations', Icon: HistoryIcon },
  { label: 'Documents', path: '/documents', Icon: DescriptionIcon },
  { label: 'Guides', path: '/guides', Icon: MenuBookIcon },
];

export default function Layout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleDrawerOpen = useCallback(() => setDrawerOpen(true), []);
  const handleDrawerClose = useCallback(() => setDrawerOpen(false), []);
  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const isNavItemActive = (path: string) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname === path || location.pathname.startsWith(`${path}/`);

  const drawerContent = (
    <Box sx={{ width: 250, pt: 2 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 2, pb: 2 }}>
        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
          <PsychologyIcon fontSize="small" />
        </Avatar>
        <Typography variant="h6" fontSize="1rem" fontWeight="bold">SMR Platform</Typography>
      </Stack>
      <Divider />
      <List>
        {NAV_ITEMS.map((item) => {
          const Icon = item.Icon;

          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={isNavItemActive(item.path)}
              onClick={handleDrawerClose}
            >
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Icon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }} />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header */}
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ gap: 2 }}>
            {isMobile && (
              <IconButton onClick={handleDrawerOpen} edge="start" aria-label="Open navigation menu">
                <MenuIcon />
              </IconButton>
            )}

            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mr: { xs: 1, md: 4 } }}>
              <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>
                <PsychologyIcon fontSize="small" />
              </Avatar>
              <Typography variant="h6" fontSize="1rem" fontWeight="bold" noWrap sx={{ display: { xs: isMobile ? 'none' : 'block', sm: 'block' } }}>
                Synthetic Market Research
              </Typography>
            </Stack>

            {!isMobile && (
              <Stack direction="row" spacing={0.5} sx={{ flex: 1 }}>
                {NAV_ITEMS.map((item) => {
                  const Icon = item.Icon;
                  const isActive = isNavItemActive(item.path);

                  return (
                    <Button
                      key={item.path}
                      startIcon={<Icon fontSize="small" />}
                      component={RouterLink}
                      to={item.path}
                      size="small"
                      sx={{
                        color: isActive ? 'primary.main' : 'text.secondary',
                        fontWeight: isActive ? 700 : 500,
                        bgcolor: isActive ? 'rgba(15,107,91,0.08)' : 'transparent',
                        '&:hover': { bgcolor: 'rgba(15,107,91,0.08)' },
                      }}
                    >
                      {item.label}
                    </Button>
                  );
                })}
              </Stack>
            )}

            {user && (
              <Stack direction="row" spacing={1} alignItems="center">
                <Chip
                  label={user.name ?? user.email}
                  size="small"
                  variant="outlined"
                  sx={{ maxWidth: 160 }}
                />
                <IconButton
                  size="small"
                  onClick={handleLogout}
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer open={drawerOpen} onClose={handleDrawerClose}>
        {drawerContent}
      </Drawer>

      {/* Main Content */}
      <Box component="main" sx={{ flex: 1, py: { xs: 1.5, sm: 2, md: 3 } }}>
        <Container maxWidth="xl">
          <Outlet />
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          borderTop: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          pt: { xs: 4, md: 8 },
          pb: { xs: 3, md: 6 },
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Grid container spacing={{ xs: 3, md: 4 }} sx={{ mb: { xs: 4, md: 8 } }}>
            {/* Branding Column */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                    <PsychologyIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" fontSize="1.1rem" fontWeight={800} letterSpacing="-0.5px">
                    Synthetic Market Research
                  </Typography>
                </Stack>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 300, lineHeight: 1.7 }}>
                  Unlock high-fidelity market signals using advanced synthetic persona simulation and RAG-grounded AI analysis.
                </Typography>
              </Stack>
            </Grid>

            {/* Product Links */}
            <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                Platform
              </Typography>
              <Stack spacing={1.5}>
                <Link component={RouterLink} to="/" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Dashboard</Link>
                <Link component={RouterLink} to="/studies" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Studies</Link>
                <Link component={RouterLink} to="/simulations" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Simulations</Link>
                <Link component={RouterLink} to="/hypotheses" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Hypotheses</Link>
                <Link component={RouterLink} to="/create-test" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Launch Wizard</Link>
              </Stack>
            </Grid>

            {/* Resources Links */}
            <Grid size={{ xs: 6, sm: 4, md: 2.5 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                Resources
              </Typography>
              <Stack spacing={1.5}>
                <Link component={RouterLink} to="/guides" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>User Guides</Link>
                <Link component={RouterLink} to="/personas" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Persona Panel</Link>
                <Link component={RouterLink} to="/segments" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Market Segments</Link>
                <Link component={RouterLink} to="/documents" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Knowledge Base</Link>
              </Stack>
            </Grid>

            {/* Legal Column */}
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2, textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.75rem' }}>
                Legal & Privacy
              </Typography>
              <Stack spacing={1.5}>
                <Link component={RouterLink} to="/terms" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Terms of Service</Link>
                <Link component={RouterLink} to="/privacy" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>Privacy Policy</Link>
                <Link component={RouterLink} to="/disclaimer" variant="body2" color="text.secondary" underline="none" sx={{ '&:hover': { color: 'primary.main' } }}>AI Governance</Link>
              </Stack>
            </Grid>
          </Grid>

          <Divider sx={{ mb: 4, opacity: 0.6 }} />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
          >
            <Typography variant="caption" color="text.secondary" fontWeight={500}>
              &copy; {new Date().getFullYear()} Synthetic Market Research Platform. Engineered for high-stakes decision making.
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="span" sx={{ width: 8, height: 8, bgcolor: 'success.main', borderRadius: '50%' }} />
              System Status: Operational
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
