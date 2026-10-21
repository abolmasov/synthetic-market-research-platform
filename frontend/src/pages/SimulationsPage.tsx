import { useEffect, useState } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Avatar, Box, Card, CardContent,
  Button, CardHeader, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, FormControl, InputLabel, List, ListItem, ListItemAvatar,
  ListItemText, MenuItem, Select, Stack, TablePagination, Typography,
} from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Download from '@mui/icons-material/Download';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Insights from '@mui/icons-material/Insights';
import OpenInNew from '@mui/icons-material/OpenInNew';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import Science from '@mui/icons-material/Science';
import { useNavigate } from 'react-router-dom';
import {
  downloadSimulationCsv,
  downloadSimulationPdf,
  fetchSimulations,
} from '../api/simulations';
import { clearSimulations, seedSimulations, type SeedMode } from '../api/seed';
import type { Simulation, SimulationDecision } from '../types';

const buildInitials = (n: string) => n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const decisionIcon = (d: SimulationDecision['decision']) => {
  if (d === 'accept') return <CheckCircle fontSize="small" color="success" />;
  if (d === 'reject') return <Cancel fontSize="small" color="error" />;
  return <HelpOutline fontSize="small" color="warning" />;
};

export default function SimulationsPage() {
  const navigate = useNavigate();
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const [seedMode, setSeedMode] = useState<SeedMode>('demo');
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    severity: 'success' | 'error';
    text: string;
  } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const loadPage = (p: number, limit: number) => {
    setLoading(true);
    setLoadError(null);
    fetchSimulations(p + 1, limit)
      .then((res) => { setSimulations(res.data); setTotal(res.total); })
      .catch((error) => {
        setLoadError(
          error instanceof Error ? error.message : 'Failed to load simulations.',
        );
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPage(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const result = await seedSimulations({
        mode: seedMode,
        overwrite: true,
      });
      const refreshed = await fetchSimulations(page + 1, rowsPerPage);
      setSimulations(refreshed.data);
      setTotal(refreshed.total);
      setSeedMessage(
        `${seedMode === 'demo' ? 'Demo' : 'Generated'} simulations ready: created ${result.created}, skipped ${result.skipped}.`,
      );
      setLoadError(null);
    } catch (err) {
      setSeedMessage(
        err instanceof Error ? err.message : 'Failed to seed simulations.',
      );
    } finally {
      setSeeding(false);
    }
  };

  const handleClearAll = async () => {
    setClearing(true);
    setActionMessage(null);
    setSeedMessage(null);
    try {
      const result = await clearSimulations();
      const refreshed = await fetchSimulations(page + 1, rowsPerPage);
      setSimulations(refreshed.data);
      setTotal(refreshed.total);
      setActionMessage({
        severity: 'success',
        text: `Cleared ${result.deleted} simulations.`,
      });
      setLoadError(null);
    } catch (error) {
      setActionMessage({
        severity: 'error',
        text: error instanceof Error ? error.message : 'Failed to clear simulations.',
      });
    } finally {
      setClearing(false);
      setClearDialogOpen(false);
    }
  };

  const handleExportCsv = async (simulationId: string) => {
    setActionMessage(null);
    try {
      const metadata = await downloadSimulationCsv(simulationId);
      setActionMessage({
        severity: 'success',
        text: metadata
          ? `CSV exported. Report ${metadata.reportId} (${metadata.templateVersion})`
          : 'CSV exported successfully.',
      });
    } catch (error) {
      setActionMessage({
        severity: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to download simulation CSV.',
      });
    }
  };

  const handleExportPdf = async (simulationId: string) => {
    setActionMessage(null);
    try {
      const metadata = await downloadSimulationPdf(simulationId);
      setActionMessage({
        severity: 'success',
        text: metadata
          ? `PDF exported. Report ${metadata.reportId} (${metadata.templateVersion})`
          : 'PDF exported successfully.',
      });
    } catch (error) {
      setActionMessage({
        severity: 'error',
        text:
          error instanceof Error
            ? error.message
            : 'Failed to download simulation PDF report.',
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
        <Typography variant="h5" fontWeight="bold">Simulation History</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
          <Button
            variant="outlined"
            startIcon={seeding ? <CircularProgress size={16} /> : <AutoAwesome />}
            onClick={() => setSeedDialogOpen(true)}
            disabled={seeding || clearing}
            size="small"
          >
            {seeding ? 'Seeding...' : 'Seed'}
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={clearing ? <CircularProgress size={16} /> : <Cancel />}
            onClick={() => setClearDialogOpen(true)}
            disabled={seeding || clearing || total === 0}
            size="small"
          >
            Clear
          </Button>
        </Stack>
      </Stack>
      {seedMessage && (
        <Alert severity="info">{seedMessage}</Alert>
      )}
      {actionMessage && (
        <Alert severity={actionMessage.severity}>{actionMessage.text}</Alert>
      )}
      {loadError && <Alert severity="error">{loadError}</Alert>}
      {loading && <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>}
      {!loading && simulations.length === 0 && <Typography color="text.secondary" textAlign="center" py={4}>No simulations run yet. Go to the Dashboard to test a hypothesis.</Typography>}
      {!loading && simulations.map((sim) => (
        <Card key={sim.id}>
          <CardHeader
            title={<Typography variant="body1" fontWeight={600} sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>"{sim.hypothesis}"</Typography>}
            subheader={<Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 0.5, rowGap: 0.5 }}>
              <Chip size="small" label={sim.status} color={sim.status === 'completed' ? 'success' : 'default'} />
              <Typography variant="caption" color="text.secondary">{new Date(sim.createdAt).toLocaleString()}</Typography>
            </Stack>}
            sx={{ '& .MuiCardHeader-action': { display: { xs: 'none', md: 'block' } } }}
            action={
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end" sx={{ rowGap: 1 }}>
                <Chip label={`${Math.round(sim.summary.acceptanceRate * 100)}% Accept`} size="small" color="primary" />
                <Chip label={`${sim.summary.totalPersonas} personas`} size="small" variant="outlined" />
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Download fontSize="small" />}
                  onClick={() => void handleExportCsv(sim.id)}
                >
                  CSV
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<PictureAsPdf fontSize="small" />}
                  onClick={() => void handleExportPdf(sim.id)}
                >
                  PDF
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNew fontSize="small" />}
                  onClick={() => navigate(`/simulations/${sim.id}`)}
                >
                  Detail
                </Button>
              </Stack>
            }
          />
          {/* Mobile action row */}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ display: { xs: 'flex', md: 'none' }, px: 2, pb: 1, rowGap: 1 }}>
            <Chip label={`${Math.round(sim.summary.acceptanceRate * 100)}% Accept`} size="small" color="primary" />
            <Chip label={`${sim.summary.totalPersonas} personas`} size="small" variant="outlined" />
            <Button size="small" variant="outlined" startIcon={<Download fontSize="small" />} onClick={() => void handleExportCsv(sim.id)}>CSV</Button>
            <Button size="small" variant="outlined" startIcon={<PictureAsPdf fontSize="small" />} onClick={() => void handleExportPdf(sim.id)}>PDF</Button>
            <Button size="small" variant="outlined" endIcon={<OpenInNew fontSize="small" />} onClick={() => navigate(`/simulations/${sim.id}`)}>Detail</Button>
          </Stack>
          <Divider />
          <CardContent sx={{ py: 1 }}>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
              <Typography variant="caption"><strong>Confidence:</strong> {Math.round(sim.summary.averageConfidence * 100)}%</Typography>
              <Typography variant="caption"><strong>Rejection:</strong> {Math.round(sim.summary.rejectionRate * 100)}%</Typography>
              <Typography variant="caption"><strong>Maybe:</strong> {Math.round(sim.summary.maybeRate * 100)}%</Typography>
            </Stack>
            {sim.objections.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" fontWeight="bold">Top Objections: </Typography>
                {sim.objections.map((o) => <Chip key={o} label={o} size="small" variant="outlined" sx={{ mr: 0.5, mb: 0.5 }} />)}
              </Box>
            )}
          </CardContent>

          {/* Expandable decisions */}
          <Accordion expanded={expanded === sim.id} onChange={() => setExpanded(expanded === sim.id ? null : sim.id)} disableGutters elevation={0}>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography variant="subtitle2" color="primary">View {sim.decisions.length} Agent Decisions</Typography>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <List dense disablePadding>
                {sim.decisions.map((d) => (
                  <ListItem key={d.personaId} divider>
                    <ListItemAvatar><Avatar sx={{ width: 32, height: 32, fontSize: '0.75rem' }}>{buildInitials(d.name)}</Avatar></ListItemAvatar>
                    <ListItemText
                      primaryTypographyProps={{ component: 'div' }}
                      secondaryTypographyProps={{ component: 'div' }}
                      primary={<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}>{decisionIcon(d.decision)}<Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: { xs: 120, sm: 'none' } }}>{d.name}</Typography><Chip label={d.decision} size="small" sx={{ textTransform: 'capitalize' }} /><Typography variant="caption">({Math.round(d.confidence * 100)}%)</Typography></Stack>}
                      secondary={
                        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Insights fontSize="inherit" color="secondary" /> <em>"{d.system1}"</em></Typography>
                          <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}><Science fontSize="inherit" color="primary" /> {d.system2}</Typography>
                          {d.reasons.length > 0 && <Stack direction="row" spacing={0.5} flexWrap="wrap">{d.reasons.map((r, i) => <Chip key={i} label={r} size="small" variant="outlined" sx={{ height: 18, fontSize: '0.6rem' }} />)}</Stack>}
                        </Stack>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>
        </Card>
      ))}
      {total > 0 && (
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      )}

      {/* Seed Dialog */}
      <Dialog open={seedDialogOpen} onClose={() => setSeedDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Seed Simulations</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Seeding will delete and replace your existing simulation history. This cannot be undone.
            </Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Seed type</InputLabel>
              <Select
                value={seedMode}
                label="Seed type"
                onChange={(e) => setSeedMode(e.target.value as SeedMode)}
              >
                <MenuItem value="demo">Predefined demo simulations</MenuItem>
                <MenuItem value="random">Generate new test simulations</MenuItem>
              </Select>
            </FormControl>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setSeedDialogOpen(false)} color="inherit">Cancel</Button>
              <Button
                variant="contained"
                onClick={async () => { setSeedDialogOpen(false); await handleSeed(); }}
                disabled={seeding || clearing}
              >
                Seed & Overwrite
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Clear All Dialog */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Clear Simulations</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will permanently delete all simulations. Personas and hypotheses are not deleted.
            </Alert>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setClearDialogOpen(false)} color="inherit">Cancel</Button>
              <Button
                onClick={handleClearAll}
                color="error"
                variant="contained"
                disabled={seeding || clearing}
              >
                Delete All
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
