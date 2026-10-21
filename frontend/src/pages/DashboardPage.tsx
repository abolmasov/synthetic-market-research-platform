import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import AutoGraph from '@mui/icons-material/AutoGraph';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import DeleteSweep from '@mui/icons-material/DeleteSweep';
import ExpandMore from '@mui/icons-material/ExpandMore';
import FactCheck from '@mui/icons-material/FactCheck';
import Groups from '@mui/icons-material/Groups';
import HelpOutline from '@mui/icons-material/HelpOutline';
import History from '@mui/icons-material/History';
import Info from '@mui/icons-material/Info';
import Insights from '@mui/icons-material/Insights';
import OpenInNew from '@mui/icons-material/OpenInNew';
import Psychology from '@mui/icons-material/Psychology';
import Science from '@mui/icons-material/Science';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/useAuth';
import { fetchPersonas } from '../api/personas';
import { fetchHypotheses } from '../api/hypotheses';
import { fetchSimulations, runSimulation } from '../api/simulations';
import { fetchRagStats } from '../api/rag';
import {
  clearAll,
  seedAll,
  seedHypotheses,
  seedPersonas,
  seedSegments,
  seedSimulations,
  type SeedMode,
} from '../api/seed';
import type { Hypothesis, Persona, Simulation, SimulationDecision } from '../types';

const segmentPresets = [
  'Sleepless Optimizers',
  'Anxious Professionals',
  'Budget Guardians',
];

const buildInitials = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

const getLoadErrorMessage = (error: unknown, fallback: string) =>
  error instanceof Error ? error.message : fallback;

export default function DashboardPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [simulations, setSimulations] = useState<Simulation[]>([]);
  const [latestSimulation, setLatestSimulation] = useState<Simulation | null>(null);
  const [hypothesis, setHypothesis] = useState('');
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [ragChunks, setRagChunks] = useState(0);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationRunError, setSimulationRunError] = useState<string | null>(null);
  const [loadErrors, setLoadErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [workspaceSeedOpen, setWorkspaceSeedOpen] = useState(false);
  const [workspaceClearOpen, setWorkspaceClearOpen] = useState(false);
  const [workspaceWorking, setWorkspaceWorking] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<SeedMode>('demo');
  const [workspaceCounts, setWorkspaceCounts] = useState({
    segments: 6,
    personas: 12,
    hypotheses: 5,
  });
  const [workspaceMessage, setWorkspaceMessage] = useState<{
    severity: 'success' | 'error' | 'info';
    text: string;
  } | null>(null);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (simulationLoading) {
      setProgress(0);
      interval = setInterval(() => setProgress((p) => Math.min(p + 2, 95)), 500);
    } else {
      setProgress(0);
    }
    return () => clearInterval(interval);
  }, [simulationLoading]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadErrors([]);

    const addLoadError = (error: unknown, fallback: string) => {
      if (cancelled) return;
      setLoadErrors((prev) => [...new Set([...prev, getLoadErrorMessage(error, fallback)])]);
    };

    // Fire requests independently so UI updates as soon as data arrives
    fetchPersonas(1, 100)
      .then((result) => {
        if (!cancelled) setPersonas(result.data);
      })
      .catch((error) => addLoadError(error, 'Failed to load personas.'));

    fetchHypotheses(undefined, 1, 100)
      .then((result) => {
        if (!cancelled) setHypotheses(result.data);
      })
      .catch((error) => addLoadError(error, 'Failed to load hypotheses.'));

    fetchSimulations(1, 100)
      .then((result) => {
        if (!cancelled) {
          setSimulations(result.data);
          setLatestSimulation(result.data[0] ?? null);
        }
      })
      .catch((error) => addLoadError(error, 'Failed to load simulation history.'));

    fetchRagStats()
      .then((result) => {
        if (!cancelled) setRagChunks(result.totalChunks);
      })
      .catch((error) => addLoadError(error, 'Failed to load RAG stats.'))
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const refreshWorkspace = useCallback(async () => {
    const [p, h, s, r] = await Promise.all([
      fetchPersonas(1, 100),
      fetchHypotheses(undefined, 1, 100),
      fetchSimulations(1, 100),
      fetchRagStats(),
    ]);
    setPersonas(p.data);
    setHypotheses(h.data);
    setSimulations(s.data);
    setLatestSimulation(s.data[0] ?? null);
    setRagChunks(r.totalChunks);
  }, []);

  const handleSeedWorkspace = useCallback(async () => {
    if (!isAdmin) {
      setWorkspaceMessage({
        severity: 'error',
        text: 'Only admin users can seed workspace data.',
      });
      return;
    }

    setWorkspaceWorking(true);
    setWorkspaceMessage(null);
    setLoadErrors([]);
    try {
      // Always clear first so the seed behaves like an overwrite.
      await clearAll();

      if (workspaceMode === 'demo') {
        const result = await seedAll();
        await refreshWorkspace();
        setWorkspaceMessage({
          severity: 'success',
          text: `Workspace seeded (demo). Personas ${result.personas.created}, segments ${result.segments.created}, hypotheses ${result.hypotheses.created}, simulations ${result.simulations.created}.`,
        });
        return;
      }

      const [segments, personasSeed, hypothesesSeed] = await Promise.all([
        seedSegments({
          mode: 'random',
          overwrite: false,
          count: workspaceCounts.segments,
        }),
        seedPersonas({
          mode: 'random',
          overwrite: false,
          count: workspaceCounts.personas,
        }),
        seedHypotheses({
          mode: 'random',
          overwrite: false,
          count: workspaceCounts.hypotheses,
        }),
      ]);
      const simulationsSeed = await seedSimulations({
        mode: 'random',
        overwrite: false,
      });

      await refreshWorkspace();
      setWorkspaceMessage({
        severity: 'success',
        text: `Workspace seeded (generated). Personas ${personasSeed.created}, segments ${segments.created}, hypotheses ${hypothesesSeed.created}, simulations ${simulationsSeed.created}.`,
      });
    } catch (error) {
      setWorkspaceMessage({
        severity: 'error',
        text: error instanceof Error ? error.message : 'Failed to seed workspace.',
      });
    } finally {
      setWorkspaceWorking(false);
    }
  }, [
    isAdmin,
    refreshWorkspace,
    workspaceCounts.hypotheses,
    workspaceCounts.personas,
    workspaceCounts.segments,
    workspaceMode,
  ]);

  const handleClearWorkspace = useCallback(async () => {
    if (!isAdmin) {
      setWorkspaceMessage({
        severity: 'error',
        text: 'Only admin users can clear workspace data.',
      });
      return;
    }

    setWorkspaceWorking(true);
    setWorkspaceMessage(null);
    setLoadErrors([]);
    try {
      await clearAll();
      await refreshWorkspace();
      setWorkspaceMessage({
        severity: 'success',
        text: 'Workspace cleared. You can now start from scratch.',
      });
    } catch (error) {
      setWorkspaceMessage({
        severity: 'error',
        text: error instanceof Error ? error.message : 'Failed to clear workspace.',
      });
    } finally {
      setWorkspaceWorking(false);
    }
  }, [isAdmin, refreshWorkspace]);

  const readiness = Math.min(100, 35 + personas.length * 3);

  const summaryItems = useMemo(() => {
    if (!latestSimulation) return [{ label: 'Acceptance', value: 'n/a', hint: '' }, { label: 'Confidence', value: 'n/a', hint: '' }, { label: 'Loop depth', value: 'n/a', hint: '' }];
    const { summary } = latestSimulation;
    return [
      { label: 'Acceptance', value: `${Math.round(summary.acceptanceRate * 100)}%`, hint: 'Percentage of personas that accepted the hypothesis.' },
      { label: 'Confidence', value: `${Math.round(summary.averageConfidence * 100)}%`, hint: 'Average model confidence across all decisions.' },
      { label: 'Loop depth', value: summary.avgLoopDepth?.toFixed(1) ?? 'n/a', hint: 'Average reasoning cycles taken before reaching a decision.' },
    ];
  }, [latestSimulation]);

  const metrics = useMemo(() => [
    { label: 'Total Personas', value: personas.length.toString(), icon: <Groups fontSize="small" />, hint: 'Total available AI personas in your panel' },
    { label: 'Last Acceptance', value: latestSimulation ? `${Math.round(latestSimulation.summary.acceptanceRate * 100)}%` : 'n/a', icon: <CheckCircle fontSize="small" />, hint: 'Acceptance rate of the most recent simulation' },
    { label: 'Avg Confidence', value: latestSimulation ? `${Math.round(latestSimulation.summary.averageConfidence * 100)}%` : 'n/a', icon: <Psychology fontSize="small" />, hint: 'Model confidence in predicting persona behavior' },
    { label: 'Avg Depth', value: latestSimulation ? (latestSimulation.summary.avgLoopDepth?.toFixed(1) ?? 'n/a') : 'n/a', icon: <AutoGraph fontSize="small" />, hint: 'Average reasoning steps taken per decision' },
  ], [latestSimulation, personas.length]);

  const onboardingSteps = useMemo(
    () => [
      {
        label: 'Create a segment',
        done:
          personas.length > 0 || hypotheses.length > 0 || simulations.length > 0,
        hint: 'Define target demographics and psychographics.',
        href: '/segments',
      },
      {
        label: 'Build your persona panel',
        done: personas.length > 0,
        hint: 'Add manual personas or generate from segments.',
        href: '/personas',
      },
      {
        label: 'Draft a hypothesis',
        done: hypotheses.length > 0,
        hint: 'Write the statement you want to validate.',
        href: '/hypotheses',
      },
      {
        label: 'Seed context documents',
        done: ragChunks > 0,
        hint: 'Upload market reports for better grounding.',
        href: '/documents',
      },
      {
        label: 'Run simulation and review insights',
        done: simulations.length > 0,
        hint: 'Open detail view for charts and persona traces.',
        href: '/simulations',
      },
    ],
    [hypotheses.length, personas.length, ragChunks, simulations.length],
  );

  const completedOnboardingCount = onboardingSteps.filter(
    (step) => step.done,
  ).length;

  const handleRunSimulation = async () => {
    if (!hypothesis.trim()) return;
    setSimulationRunError(null);
    setSimulationLoading(true);
    try {
      const input: { hypothesis: string; hypothesisId?: string } = {
        hypothesis: hypothesis.trim(),
      };
      if (selectedHypothesis) {
        input.hypothesisId = selectedHypothesis.id;
      }
      const result = await runSimulation(input);
      setLatestSimulation(result);
      setSimulations((prev) => [result, ...prev]);
    } catch (err) {
      setSimulationRunError(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setSimulationLoading(false);
    }
  };

  const decisionIcon = (d: SimulationDecision['decision']) => {
    if (d === 'accept') return <CheckCircle fontSize="small" />;
    if (d === 'reject') return <Cancel fontSize="small" />;
    return <HelpOutline fontSize="small" />;
  };

  const sectionSx = {
    borderRadius: '12px !important',
    border: '1px solid',
    borderColor: 'divider',
    boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
    '&:before': { display: 'none' },
    overflow: 'hidden',
    mb: 3,
    transition: 'box-shadow 0.3s ease',
    '&:hover': {
      boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
    },
  };

  const summarySx = {
    px: 2.5,
    py: 1,
    bgcolor: 'background.paper',
    borderBottom: '1px solid',
    borderColor: 'transparent',
    '&.Mui-expanded': {
      borderColor: 'divider',
      minHeight: 64,
    },
    '& .MuiAccordionSummary-content': {
      m: '12px 0 !important',
      '&.Mui-expanded': { m: '12px 0 !important' },
    },
  };

  return (
    <Box sx={{ pb: 8 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }} spacing={2} sx={{ mb: { xs: 2, md: 4 }, mt: 1 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{
            background: 'linear-gradient(45deg, #1a237e 30%, #0d47a1 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            Research Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
            Analyze synthetic customer behavior and validate your marketing assumptions with high-fidelity simulations.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} flexWrap="wrap" justifyContent={{ xs: 'flex-start', sm: 'flex-end' }} useFlexGap sx={{ rowGap: 1 }}>
          {isAdmin && (
            <>
              <Button
                variant="outlined"
                startIcon={<AutoAwesome />}
                onClick={() => setWorkspaceSeedOpen(true)}
                disabled={workspaceWorking}
                size="small"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Seed
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteSweep />}
                onClick={() => setWorkspaceClearOpen(true)}
                disabled={workspaceWorking}
                size="small"
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
              >
                Clear
              </Button>
            </>
          )}
          <Button
            component={Link}
            to="/create-test"
            variant="contained"
            startIcon={<Science />}
            sx={{
              borderRadius: 2,
              px: { xs: 2, md: 4 },
              py: { xs: 1, md: 1.5 },
              boxShadow: '0 4px 14px 0 rgba(0,118,255,0.39)',
              textTransform: 'none',
              fontWeight: 700,
            }}
          >
            Start New Test
          </Button>
        </Stack>
      </Stack>

      {workspaceMessage && (
        <Alert severity={workspaceMessage.severity} sx={{ mb: 3, borderRadius: 2 }}>
          {workspaceMessage.text}
        </Alert>
      )}

      {loadErrors.length > 0 && (
        <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>
          {loadErrors.join(' ')}
        </Alert>
      )}

      <Grid container spacing={{ xs: 2, md: 4 }}>
        {/* Left Column: Actions & Results */}
        <Grid size={{ xs: 12, lg: 7 }}>
          <Stack spacing={0}>
            {/* Hypothesis Console */}
            <Accordion defaultExpanded sx={sectionSx}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <AutoAwesome color="primary" />
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight={700}>Hypothesis Console</Typography>
                    <Tooltip title="The core of your research. Enter a marketing hypothesis to test how your synthetic personas will react. This creates the primary data for your study.">
                      <Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}>
                        <Info fontSize="small" />
                      </Box>
                    </Tooltip>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                <Stack spacing={2.5}>
                  <Autocomplete
                    freeSolo
                    options={hypotheses}
                    getOptionLabel={(option) =>
                      typeof option === 'string' ? option : `${option.title}: ${option.statement}`
                    }
                    value={selectedHypothesis}
                    inputValue={hypothesis}
                    onInputChange={(_e, value) => setHypothesis(value)}
                    onChange={(_e, value) => {
                      if (typeof value === 'string' || value === null) {
                        setSelectedHypothesis(null);
                      } else {
                        setSelectedHypothesis(value);
                        setHypothesis(value.statement);
                      }
                    }}
                    renderOption={(props, option) => (
                      <li {...props} key={typeof option === 'string' ? option : option.id}>
                        <Stack>
                          <Typography variant="body2" fontWeight={600}>{typeof option === 'string' ? option : option.title}</Typography>
                          {typeof option !== 'string' && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                              {option.statement}
                            </Typography>
                          )}
                        </Stack>
                      </li>
                    )}
                    renderInput={(params) => (
                      <TextField {...params} placeholder="Select a hypothesis or type a custom one..." variant="outlined" size="small" />
                    )}
                    fullWidth
                  />
                  {selectedHypothesis && (
                    <Chip
                      label={`Linked: ${selectedHypothesis.title} (${selectedHypothesis.stage})`}
                      size="small"
                      color="primary"
                      variant="outlined"
                      onDelete={() => setSelectedHypothesis(null)}
                      sx={{ alignSelf: 'flex-start' }}
                    />
                  )}
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: 'block' }}>Quick Targeting:</Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {segmentPresets.map((s) => (
                        <Chip key={s} label={s} size="small" onClick={() => { setSelectedHypothesis(null); setHypothesis((p) => p ? p + ' for ' + s : 'Targeting ' + s); }} />
                      ))}
                    </Box>
                  </Box>
                  <Button variant="contained" disabled={!hypothesis.trim() || simulationLoading} onClick={handleRunSimulation} fullWidth sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600 }}>
                    {simulationLoading ? 'Running AI Simulation... (approx 30s)' : 'Run Simulation'}
                  </Button>
                  {simulationLoading && <LinearProgress variant="determinate" value={progress} sx={{ mt: 1, borderRadius: 1, height: 6 }} />}
                  {simulationRunError && <Alert severity="error" sx={{ mt: 2 }}>{simulationRunError}</Alert>}
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Latest Results */}
            <Accordion defaultExpanded sx={sectionSx}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', mr: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Science color={latestSimulation ? 'primary' : 'disabled'} />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>Latest Results</Typography>
                      <Tooltip title="Instant snapshot of your most recent simulation. Use 'Detail' to deep-dive into charts and individual persona traces.">
                        <Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}>
                          <Info fontSize="small" />
                        </Box>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  {latestSimulation && (
                    <Button
                      component={Link}
                      to={`/simulations/${latestSimulation.id}`}
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        px: 1,
                        py: 0.5,
                        minWidth: 0,
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': { bgcolor: 'primary.main', color: 'white' }
                      }}
                    >
                      View Report <OpenInNew fontSize="inherit" sx={{ ml: 0.5 }} />
                    </Button>
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 3 }}>
                {latestSimulation ? (
                  <Stack spacing={3}>
                    <Box sx={{ p: 2, bgcolor: 'action.hover', borderRadius: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                      <Typography variant="body2" sx={{ fontStyle: 'italic', fontWeight: 500 }}>"{latestSimulation.hypothesis}"</Typography>
                    </Box>
                  <Grid container spacing={2}>
                    {summaryItems.map((item) => (
                      <Grid size={{ xs: 4 }} key={item.label}>
                        <Tooltip title={item.hint} placement="top" arrow>
                          <Box sx={{ textAlign: 'center', cursor: 'help' }}>
                            <Typography variant="caption" color="text.secondary" display="block">{item.label}</Typography>
                            <Typography variant="h6" fontWeight={700} color="primary.main">{item.value}</Typography>
                          </Box>
                        </Tooltip>
                      </Grid>
                    ))}
                    </Grid>
                    <Box>
                      <Typography variant="subtitle2" gutterBottom fontWeight={700}>Dominant Signals:</Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                        {latestSimulation.topSignals.map((s) => <Chip key={s} label={s} size="small" color="primary" variant="outlined" />)}
                      </Stack>
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>No simulation run yet. Use the console above to start.</Typography>
                )}
              </AccordionDetails>
            </Accordion>

            {/* Reasoning Traces */}
            {latestSimulation && (
              <Accordion sx={sectionSx}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Psychology color="primary" />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>Reasoning Traces</Typography>
                      <Tooltip title="AI thinking patterns for each decision. Reviewing these reveals the 'Why' behind customer reactions and market barriers.">
                        <Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}>
                          <Info fontSize="small" />
                        </Box>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 0 }}>
                  <Box sx={{ maxHeight: 600, overflow: 'auto' }}>
                    {latestSimulation.decisions.map((d) => (
                      <Accordion key={d.personaId} disableGutters elevation={0} sx={{ '&:before': { display: 'none' }, borderBottom: '1px solid #eee' }}>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                          <ListItemAvatar sx={{ minWidth: 48 }}><Avatar sx={{ width: 32, height: 32, fontSize: '0.8rem' }}>{buildInitials(d.name)}</Avatar></ListItemAvatar>
                          <ListItemText primary={d.name} secondary={<Stack direction="row" alignItems="center" spacing={0.5}>{decisionIcon(d.decision)}<Typography variant="caption" sx={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{d.decision} ({Math.round(d.confidence * 100)}%)</Typography></Stack>} secondaryTypographyProps={{ component: 'div' }} />
                        </AccordionSummary>
                        <AccordionDetails sx={{ pt: 0, pb: 2, px: 3 }}>
                          <Stack spacing={2}>
                            <Box>
                              <Typography variant="caption" color="secondary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}><Insights fontSize="inherit" /> SYSTEM 1 (Impulse)</Typography>
                              <Typography variant="body2" sx={{ fontStyle: 'italic', pl: 1.5, borderLeft: '3px solid', borderColor: 'secondary.light', py: 0.5 }}>"{d.system1}"</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" color="primary" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}><Science fontSize="inherit" /> SYSTEM 2 (Rational)</Typography>
                              <Typography variant="body2" sx={{ pl: 1.5, borderLeft: '3px solid', borderColor: 'primary.light', py: 0.5 }}>{d.system2}</Typography>
                            </Box>
                            <Box>
                              <Typography variant="caption" fontWeight="bold">Key Drivers:</Typography>
                              <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5 }}>
                                {d.reasons.map((r, i) => <Chip key={i} label={r} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem' }} />)}
                              </Stack>
                            </Box>
                          </Stack>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Run History */}
            <Accordion sx={sectionSx}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', mr: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <History color="action" />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>Run History</Typography>
                      <Tooltip title="Chronological log of past experiments. Use this to track the evolution of your hypothesis testing over time.">
                        <Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}>
                          <Info fontSize="small" />
                        </Box>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Button
                    component={Link}
                    to="/simulations"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ color: 'primary.main', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none', minWidth: 0, p: 0, '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' } }}
                  >
                    View All
                  </Button>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List dense disablePadding>
                  {simulations.slice(0, 5).map((sim, i) => (
                    <ListItem key={sim.id} divider={i < Math.min(simulations.length, 5) - 1} disablePadding>
                      <ListItemButton component={Link} to={`/simulations/${sim.id}`}>
                        <ListItemText
                          primary={sim.hypothesis}
                          primaryTypographyProps={{ noWrap: true, variant: 'body2', fontWeight: 500 }}
                          secondary={`${new Date(sim.createdAt).toLocaleDateString()} | ${Math.round(sim.summary.acceptanceRate * 100)}% Accepted`}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                  {simulations.length === 0 && <ListItem sx={{ py: 3 }}><ListItemText secondary="No history available." sx={{ textAlign: 'center' }} /></ListItem>}
                </List>
              </AccordionDetails>
            </Accordion>
          </Stack>
        </Grid>

        {/* Right Column: Context & Metrics */}
        <Grid size={{ xs: 12, lg: 5 }}>
          <Stack spacing={0}>
            {/* Getting Started / Onboarding */}
            {completedOnboardingCount < onboardingSteps.length && (
              <Accordion defaultExpanded sx={sectionSx}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <AutoAwesome color="primary" />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>Getting Started</Typography>
                      <Tooltip title="Step-by-step guide to prepare your environment. Each completed step increases the fidelity of your market simulations.">
                        <Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}>
                          <Info fontSize="small" />
                        </Box>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Complete the research workflow to unlock better simulation signal quality.
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" fontWeight={700}>{completedOnboardingCount} of {onboardingSteps.length} steps</Typography>
                      <Typography variant="caption" color="primary" fontWeight={700}>{Math.round((completedOnboardingCount / onboardingSteps.length) * 100)}%</Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={(completedOnboardingCount / onboardingSteps.length) * 100} sx={{ height: 6, borderRadius: 3, mb: 1 }} />
                    <Stack spacing={1}>
                      {onboardingSteps.map((step) => (
                        <Stack
                          key={step.label}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                          spacing={1}
                          sx={{
                            p: 1.25,
                            borderRadius: 2,
                            bgcolor: step.done ? 'rgba(46,125,50,0.06)' : 'action.hover',
                            border: '1px solid',
                            borderColor: step.done ? 'rgba(46,125,50,0.1)' : 'transparent',
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="subtitle2" noWrap sx={{ color: step.done ? 'success.main' : 'text.primary' }}>
                              {step.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {step.hint}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant={step.done ? 'text' : 'outlined'}
                            component={Link}
                            to={step.href}
                            sx={{ minWidth: 70 }}
                          >
                            {step.done ? 'Review' : 'Open'}
                          </Button>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}

            {/* Metrics & Readiness */}
            <Accordion defaultExpanded sx={sectionSx}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Insights color="action" />
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="h6" fontWeight={700}>Platform Health</Typography>
                    <Tooltip title="Overview of your simulation environment readiness and aggregated KPIs.">
                      <Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}>
                        <Info fontSize="small" />
                      </Box>
                    </Tooltip>
                  </Stack>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 2.5 }}>
                <Stack spacing={3}>
                  <Box>
                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" fontWeight={700}>Cohort Strength</Typography>
                      <Typography variant="subtitle2" color="primary.main" fontWeight={800}>{readiness}%</Typography>
                    </Stack>
                    <LinearProgress variant="determinate" value={readiness} sx={{ height: 10, borderRadius: 5 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {readiness < 50 ? 'Add more personas to improve signal quality.' : 'Ready for high-fidelity testing.'}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom fontWeight={700}>Key Indicators</Typography>
                    <Grid container spacing={2}>
                      {metrics.map((m) => (
                        <Grid size={{ xs: 6 }} key={m.label}>
                          <Tooltip title={m.hint} placement="top" arrow>
                            <Box sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2, cursor: 'help' }}>
                              <Typography variant="caption" color="text.secondary" display="block" noWrap>{m.label}</Typography>
                              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                <Box sx={{ color: 'primary.main', display: 'flex' }}>{m.icon}</Box>
                                <Typography variant="subtitle1" fontWeight={700}>{m.value}</Typography>
                              </Stack>
                            </Box>
                          </Tooltip>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Persona Roster */}
            <Accordion defaultExpanded sx={sectionSx}>
              <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ width: '100%', mr: 1 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Groups color="action" />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>Persona Roster</Typography>
                      <Tooltip title="Active synthetic agents for your study. A diverse roster ensures your hypothesis is tested against multiple market perspectives.">
                        <Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}>
                          <Info fontSize="small" />
                        </Box>
                      </Tooltip>
                    </Stack>
                  </Stack>
                  <Button
                    component={Link}
                    to="/personas"
                    onClick={(e) => e.stopPropagation()}
                    sx={{ color: 'primary.main', fontSize: '0.8125rem', fontWeight: 600, textTransform: 'none', minWidth: 0, p: 0, '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' } }}
                  >
                    Manage
                  </Button>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                {loading ? (
                  <Box sx={{ p: 4, display: 'flex', justifyContent: 'center' }}><CircularProgress size={30} /></Box>
                ) : (
                  <List dense disablePadding>
                    {personas.slice(0, 5).map((p, i) => (
                      <ListItem key={p.id} divider={i < Math.min(personas.length, 5) - 1}>
                        <ListItemAvatar>
                          <Avatar sx={{ width: 36, height: 36, fontSize: '0.85rem', bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                            {buildInitials(p.name)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={p.name}
                          secondary={p.segment}
                          primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                        />
                      </ListItem>
                    ))}
                    {personas.length === 0 && <ListItem sx={{ py: 3 }}><ListItemText secondary="No personas yet." sx={{ textAlign: 'center' }} /></ListItem>}
                    {personas.length > 5 && (
                      <Box sx={{ p: 1, textAlign: 'center' }}>
                        <Button size="small" color="primary" component={Link} to="/personas">
                          View All {personas.length} Personas
                        </Button>
                      </Box>
                    )}
                  </List>
                )}
              </AccordionDetails>
            </Accordion>

            {/* RAG Context */}
            {latestSimulation && (
              <Accordion sx={sectionSx}>
                <AccordionSummary expandIcon={<ExpandMore />} sx={summarySx}>
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <FactCheck color="action" />
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Typography variant="h6" fontWeight={700}>RAG Grounding</Typography>
                      <Tooltip title="Grounding data from your documents. This ensures AI decisions are based on real-world facts rather than pure prediction.">
                        <Box component="span" sx={{ display: 'flex', color: 'text.secondary' }}>
                          <Info fontSize="small" />
                        </Box>
                      </Tooltip>
                    </Stack>
                  </Stack>
                </AccordionSummary>
                <AccordionDetails sx={{ p: 2.5 }}>
                  <Stack spacing={2}>
                    <Typography variant="subtitle2" fontWeight={700}>Relevant Sources:</Typography>
                    {latestSimulation.ragSources.slice(0, 3).map((src, i) => (
                      <Box key={i} sx={{ p: 1.5, bgcolor: 'action.hover', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" noWrap color="primary.main" gutterBottom>{src.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontStyle: 'italic' }}>
                          "{src.snippet}"
                        </Typography>
                      </Box>
                    ))}
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom fontWeight={700}>Detected Objections:</Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {latestSimulation.objections.map((o) => (
                          <Chip key={o} label={o} size="small" variant="outlined" color="secondary" />
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </AccordionDetails>
              </Accordion>
            )}
          </Stack>
        </Grid>
      </Grid>

      {/* Seed Workspace Dialog */}
      {isAdmin && (
      <Dialog open={workspaceSeedOpen} onClose={() => setWorkspaceSeedOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Seed Workspace</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will delete and replace your personas, segments, hypotheses, simulations, and (if enabled) the RAG knowledge base. This cannot be undone.
            </Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Seed type</InputLabel>
              <Select
                value={workspaceMode}
                label="Seed type"
                onChange={(e) => setWorkspaceMode(e.target.value as SeedMode)}
              >
                <MenuItem value="demo">Predefined demo dataset</MenuItem>
                <MenuItem value="random">Generate new test dataset</MenuItem>
              </Select>
            </FormControl>

            {workspaceMode === 'random' && (
              <Stack spacing={1.5}>
                <TextField
                  label="Segments"
                  type="number"
                  size="small"
                  value={workspaceCounts.segments}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (!Number.isFinite(next)) return;
                    setWorkspaceCounts((p) => ({
                      ...p,
                      segments: Math.max(1, Math.min(30, next)),
                    }));
                  }}
                  inputProps={{ min: 1, max: 30 }}
                />
                <TextField
                  label="Personas"
                  type="number"
                  size="small"
                  value={workspaceCounts.personas}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (!Number.isFinite(next)) return;
                    setWorkspaceCounts((p) => ({
                      ...p,
                      personas: Math.max(1, Math.min(50, next)),
                    }));
                  }}
                  inputProps={{ min: 1, max: 50 }}
                />
                <TextField
                  label="Hypotheses"
                  type="number"
                  size="small"
                  value={workspaceCounts.hypotheses}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    if (!Number.isFinite(next)) return;
                    setWorkspaceCounts((p) => ({
                      ...p,
                      hypotheses: Math.max(1, Math.min(30, next)),
                    }));
                  }}
                  inputProps={{ min: 1, max: 30 }}
                />
              </Stack>
            )}

            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setWorkspaceSeedOpen(false)} color="inherit" disabled={workspaceWorking}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={async () => { setWorkspaceSeedOpen(false); await handleSeedWorkspace(); }}
                disabled={workspaceWorking}
              >
                {workspaceWorking ? 'Working...' : 'Seed & Overwrite'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
      )}

      {/* Clear Workspace Dialog */}
      {isAdmin && (
      <Dialog open={workspaceClearOpen} onClose={() => setWorkspaceClearOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Clear Workspace</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will permanently delete all personas, segments, hypotheses, simulations, and (if enabled) the RAG knowledge base. This cannot be undone.
            </Alert>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setWorkspaceClearOpen(false)} color="inherit" disabled={workspaceWorking}>
                Cancel
              </Button>
              <Button
                color="error"
                variant="contained"
                onClick={async () => { setWorkspaceClearOpen(false); await handleClearWorkspace(); }}
                disabled={workspaceWorking}
              >
                {workspaceWorking ? 'Working...' : 'Delete Everything'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>
      )}
    </Box>
  );
}
