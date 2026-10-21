import { useState, useEffect } from 'react';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Card,
  CardContent,
  TextField,
  Stack,
  Autocomplete,
  Chip,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  CircularProgress,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  MobileStepper,
  Paper,
  Divider,
  useMediaQuery,
  useTheme,
  Alert,
} from '@mui/material';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Groups from '@mui/icons-material/Groups';
import Lightbulb from '@mui/icons-material/Lightbulb';
import NavigateBefore from '@mui/icons-material/NavigateBefore';
import NavigateNext from '@mui/icons-material/NavigateNext';
import Science from '@mui/icons-material/Science';
import { useNavigate } from 'react-router-dom';
import { fetchSegments, generatePersonasFromSegment } from '../api/segments';
import { createHypothesis } from '../api/hypotheses';
import { fetchPersonas } from '../api/personas';
import { runSimulation } from '../api/simulations';
import { createVariant } from '../api/variants';
import { createRun, updateRun } from '../api/runs';
import type {
  CreateHypothesisInput,
  HypothesisMetric,
  Persona,
  Segment,
  VerificationDirection,
  Variant,
} from '../types';

const steps = ['Draft Hypothesis', 'Target Segment', 'Refine Persona Panel', 'Launch Simulation'];

type VariantDraft = {
  name: string;
  changeSummary: string;
  content: string;
};

const PRIMARY_METRICS: HypothesisMetric[] = [
  'acceptanceRate',
  'rejectionRate',
  'maybeRate',
  'averageConfidence',
  'priceAnchorHitRate',
];

const metricLabel = (metric: HypothesisMetric): string => {
  if (metric === 'acceptanceRate') return 'Acceptance Rate';
  if (metric === 'rejectionRate') return 'Rejection Rate';
  if (metric === 'maybeRate') return 'Maybe Rate';
  if (metric === 'averageConfidence') return 'Average Confidence';
  return 'Price Anchor Hit Rate';
};

const buildInitials = (name: string) =>
  name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();

export default function HypothesisWizardPage() {
  const navigate = useNavigate();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('sm'));
  const [activeStep, setActiveStep] = useState(0);

  // Step 1: Hypothesis Data
  const [hypothesisTitle, setHypothesisTitle] = useState('');
  const [hypothesisStatement, setHypothesisStatement] = useState('');
  const [primaryMetric, setPrimaryMetric] =
    useState<HypothesisMetric>('acceptanceRate');
  const [primaryMetricDirection, setPrimaryMetricDirection] =
    useState<VerificationDirection>('at_least');
  const [primaryMetricThreshold, setPrimaryMetricThreshold] = useState(0.6);
  const [falsificationRule, setFalsificationRule] = useState('');
  const [variantDrafts, setVariantDrafts] = useState<VariantDraft[]>([]);

  // Step 2: Segment Data
  const [segments, setSegments] = useState<Segment[]>([]);
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);
  const [loadingSegments, setLoadingSegments] = useState(false);

  // Step 3: Persona Data
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [generatingPersonas, setGeneratingPersonas] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);

  // Launch Results
  const [isLaunching, setIsLaunching] = useState(false);
  const [launchError, setLaunchError] = useState<string | null>(null);

  useEffect(() => {
    if (activeStep === 1 && segments.length === 0) {
      setLoadingSegments(true);
      fetchSegments(1, 100)
        .then((res) => {
          setSegments(res.data);
          if (res.data.length > 0 && !selectedSegment) {
            setSelectedSegment(res.data[0]);
          }
        })
        .finally(() => setLoadingSegments(false));
    }
  }, [activeStep, segments.length, selectedSegment]);

  useEffect(() => {
    if (activeStep === 2 && selectedSegment) {
      setLoadingPersonas(true);
      // We fetch all personas and filter by segment name for now, or just fetch all
      // The API doesn't have a direct filter by segmentId yet in the frontend api client
      // But we can filter locally or update the API. Let's filter locally for simplicity.
      fetchPersonas(1, 100)
        .then((res) => {
          const filtered = res.data.filter(p => p.segment === selectedSegment.name);
          setPersonas(filtered);
        })
        .finally(() => setLoadingPersonas(false));
    }
  }, [activeStep, selectedSegment]);

  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleGeneratePersonas = async () => {
    if (!selectedSegment) return;
    setGeneratingPersonas(true);
    setGenerateError(null);
    try {
      const res = await generatePersonasFromSegment(selectedSegment.id, { count: 3, diversityLevel: 'medium' });
      setPersonas((prev) => [...res.personas, ...prev]);
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate personas.');
    } finally {
      setGeneratingPersonas(false);
    }
  };

  const addVariantDraft = () => {
    setVariantDrafts((prev) => [
      ...prev,
      {
        name: `Variant ${prev.length + 1}`,
        changeSummary: '',
        content: hypothesisStatement,
      },
    ]);
  };

  const updateVariantDraft = (
    index: number,
    patch: Partial<VariantDraft>,
  ) => {
    setVariantDrafts((prev) =>
      prev.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...patch } : variant,
      ),
    );
  };

  const removeVariantDraft = (index: number) => {
    setVariantDrafts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleLaunch = async () => {
    setIsLaunching(true);
    setLaunchError(null);
    try {
      const hypInput: CreateHypothesisInput = {
        title: hypothesisTitle,
        statement: hypothesisStatement,
        stage: 'H1',
        status: 'ready',
        primaryMetric,
        primaryMetricDirection,
        primaryMetricThreshold,
        sampleSize: Math.max(personas.length, 1),
        falsificationRule: falsificationRule.trim() || undefined,
      };
      const hyp = await createHypothesis(hypInput);

      const controlVariant = await createVariant(hyp.id, {
        name: 'Control',
        changeSummary: 'Baseline hypothesis statement',
        content: hyp.statement,
        status: 'tested',
      });

      const createdVariants = await Promise.all(
        variantDrafts
          .filter(
            (draft) => draft.name.trim() && draft.changeSummary.trim() && draft.content.trim(),
          )
          .map((draft) =>
            createVariant(hyp.id, {
              name: draft.name.trim(),
              changeSummary: draft.changeSummary.trim(),
              content: draft.content.trim(),
              status: 'tested',
            }),
          ),
      );

      const allVariants = [controlVariant, ...createdVariants];
      const run = await createRun({
        hypothesisId: hyp.id,
        variantIds: allVariants.map((variant) => variant.id),
        stage: 'H1',
        status: 'running',
        config: {
          primaryMetric,
          primaryMetricDirection,
          primaryMetricThreshold,
          personaCount: personas.length,
        },
      });

      const simulationResults = await Promise.all(
        allVariants.map((variant) =>
          runSimulation({
            hypothesis: variant.content,
            hypothesisId: hyp.id,
            personaIds: personas.map((p) => p.id),
          }).then((simulation) => ({ variant, simulation })),
        ),
      );

      const simulationMap: Record<string, string> = {};
      const outcomes: Array<{ variant: Variant; score: number }> = [];
      for (const { variant, simulation } of simulationResults) {
        simulationMap[variant.id] = simulation.id;
        outcomes.push({
          variant,
          score: simulation.summary[primaryMetric] ?? 0,
        });
      }

      const orderedOutcomes = [...outcomes].sort((a, b) =>
        primaryMetricDirection === 'at_most'
          ? a.score - b.score
          : b.score - a.score,
      );
      const winner = orderedOutcomes[0]?.variant ?? controlVariant;

      await updateRun(run.id, {
        status: 'completed',
        startedAt: new Date(run.createdAt).toISOString(),
        completedAt: new Date().toISOString(),
        config: {
          ...run.config,
          simulationMap,
          winnerVariantId: winner.id,
        },
      });

      navigate(`/runs/${run.id}/comparison`);
    } catch (err) {
      setLaunchError(err instanceof Error ? err.message : 'Failed to launch simulation');
    } finally {
      setIsLaunching(false);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>What is your core assumption?</Typography>
              <Typography variant="body2" color="text.secondary">Define the hypothesis you want to test against your market segments.</Typography>
            </Box>
            <TextField
              label="Hypothesis Title"
              placeholder="e.g. Premium Subscription Tier Adoption"
              fullWidth
              value={hypothesisTitle}
              onChange={(e) => setHypothesisTitle(e.target.value)}
              required
            />
            <TextField
              label="Hypothesis Statement"
              placeholder="e.g. Professionals earning >$100k will pay $29/mo for automated research tools if it saves them 5+ hours per week."
              fullWidth
              multiline
              rows={4}
              value={hypothesisStatement}
              onChange={(e) => setHypothesisStatement(e.target.value)}
              required
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Primary Metric</InputLabel>
                  <Select
                    value={primaryMetric}
                    label="Primary Metric"
                    onChange={(e) =>
                      setPrimaryMetric(e.target.value as HypothesisMetric)
                    }
                  >
                    {PRIMARY_METRICS.map((metric) => (
                      <MenuItem key={metric} value={metric}>
                        {metricLabel(metric)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 3 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Direction</InputLabel>
                  <Select
                    value={primaryMetricDirection}
                    label="Direction"
                    onChange={(e) =>
                      setPrimaryMetricDirection(
                        e.target.value as VerificationDirection,
                      )
                    }
                  >
                    <MenuItem value="at_least">At least</MenuItem>
                    <MenuItem value="at_most">At most</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Threshold (0-1)"
                  type="number"
                  value={primaryMetricThreshold}
                  onChange={(e) => setPrimaryMetricThreshold(Number(e.target.value))}
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Falsification Rule"
              helperText="Optional: metric operator threshold (e.g., rejectionRate>=0.6)"
              fullWidth
              value={falsificationRule}
              onChange={(e) => setFalsificationRule(e.target.value)}
              size="small"
            />
          </Stack>
        );
      case 1:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>Who are we testing this with?</Typography>
              <Typography variant="body2" color="text.secondary">Select the market segment that corresponds to your hypothesis targeting.</Typography>
            </Box>
            {loadingSegments ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <Autocomplete
                options={segments}
                getOptionLabel={(option) => option.name}
                value={selectedSegment}
                onChange={(_, newValue) => setSelectedSegment(newValue)}
                renderInput={(params) => <TextField {...params} label="Select Target Segment" />}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Box>
                      <Typography variant="subtitle2">{option.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{option.description}</Typography>
                    </Box>
                  </li>
                )}
                fullWidth
              />
            )}
            {selectedSegment && (
              <Paper variant="outlined" sx={{ p: 2, bgcolor: 'action.hover' }}>
                <Typography variant="subtitle2" fontWeight={700} gutterBottom>Segment Summary</Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>{selectedSegment.description}</Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                   <Chip size="small" label={`Age: ${selectedSegment.demographicCriteria.ageRange.min}-${selectedSegment.demographicCriteria.ageRange.max}`} />
                   <Chip size="small" label={`Income: $${selectedSegment.demographicCriteria.incomeRange.min}k+`} />
                   {selectedSegment.psychographicTraits.values.slice(0, 3).map(v => <Chip key={v} size="small" variant="outlined" label={v} />)}
                </Stack>
              </Paper>
            )}
            <Button startIcon={<NavigateNext />} color="primary" onClick={() => navigate('/segments')}>
              Create new segment instead
            </Button>
          </Stack>
        );
      case 2:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>Review your Persona Panel</Typography>
              <Typography variant="body2" color="text.secondary">These synthetic agents will process your hypothesis and provide reasoning traces.</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="subtitle2" color="primary">{personas.length} Personas matched</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={generatingPersonas ? <CircularProgress size={16} /> : <AutoAwesome />}
                disabled={generatingPersonas || !selectedSegment}
                onClick={handleGeneratePersonas}
              >
                Boost Panel (+3 AI agents)
              </Button>
            </Box>
            {loadingPersonas ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
            ) : (
              <List sx={{ maxHeight: 300, overflow: 'auto', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                {personas.map((p, i) => (
                  <ListItem key={p.id} divider={i < personas.length - 1}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, fontSize: '0.8rem' }}>
                        {buildInitials(p.name)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText 
                      primary={p.name} 
                      secondary={p.occupation || p.segment} 
                      primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                    />
                  </ListItem>
                ))}
                {personas.length === 0 && (
                  <ListItem>
                    <ListItemText secondary="No personas found for this segment yet. Try boosting the panel." />
                  </ListItem>
                )}
              </List>
            )}
            {generateError && (
              <Alert severity="error" onClose={() => setGenerateError(null)}>
                {generateError}
              </Alert>
            )}
          </Stack>
        );
      case 3:
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>Ready to Launch?</Typography>
              <Typography variant="body2" color="text.secondary">Confirm your test configuration before starting the AI simulation loop.</Typography>
            </Box>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <Card variant="outlined" sx={{ bgcolor: 'rgba(25, 118, 210, 0.04)' }}>
                  <CardContent>
                    <Stack spacing={2}>
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Lightbulb color="primary" fontSize="small" />
                          <Typography variant="subtitle2" fontWeight={700}>Hypothesis</Typography>
                        </Stack>
                        <Typography variant="body2" fontWeight={600}>{hypothesisTitle}</Typography>
                        <Typography variant="body2" sx={{ fontStyle: 'italic', mt: 0.5 }}>"{hypothesisStatement}"</Typography>
                      </Box>
                      <Divider />
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Groups color="primary" fontSize="small" />
                          <Typography variant="subtitle2" fontWeight={700}>Target & Scope</Typography>
                        </Stack>
                        <Typography variant="body2">{selectedSegment?.name} — {personas.length} Personas</Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Card variant="outlined">
              <CardContent>
                <Stack spacing={2}>
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Typography variant="subtitle2" fontWeight={700}>
                      Variant Comparison (Optional)
                    </Typography>
                    <Button variant="outlined" size="small" onClick={addVariantDraft}>
                      Add Variant
                    </Button>
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Control is created automatically from your base hypothesis.
                    Add alternatives to run side-by-side comparisons.
                  </Typography>
                  {variantDrafts.length === 0 && (
                    <Typography variant="caption" color="text.secondary">
                      No extra variants yet. Launching now will run a control-only verification.
                    </Typography>
                  )}
                  {variantDrafts.map((variant, index) => (
                    <Card key={`${variant.name}-${index}`} variant="outlined">
                      <CardContent>
                        <Stack spacing={1.5}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="subtitle2" fontWeight={700}>
                              Variant {index + 1}
                            </Typography>
                            <Button
                              size="small"
                              color="error"
                              onClick={() => removeVariantDraft(index)}
                            >
                              Remove
                            </Button>
                          </Stack>
                          <TextField
                            label="Variant Name"
                            value={variant.name}
                            onChange={(e) =>
                              updateVariantDraft(index, { name: e.target.value })
                            }
                            fullWidth
                            size="small"
                          />
                          <TextField
                            label="Change Summary"
                            value={variant.changeSummary}
                            onChange={(e) =>
                              updateVariantDraft(index, {
                                changeSummary: e.target.value,
                              })
                            }
                            fullWidth
                            size="small"
                          />
                          <TextField
                            label="Variant Hypothesis"
                            value={variant.content}
                            onChange={(e) =>
                              updateVariantDraft(index, {
                                content: e.target.value,
                              })
                            }
                            fullWidth
                            multiline
                            rows={3}
                            size="small"
                          />
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              </CardContent>
            </Card>
            {launchError && (
              <Alert
                severity="error"
                onClose={() => setLaunchError(null)}
                action={
                  <Button color="inherit" size="small" onClick={() => setLaunchError(null)}>
                    Dismiss
                  </Button>
                }
              >
                {launchError}
              </Alert>
            )}
          </Stack>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', py: { xs: 2, md: 4 } }}>
      <Typography variant="h5" fontWeight={800} sx={{ mb: { xs: 2, md: 4 }, textAlign: 'center' }}>
        Create Simulation Test
      </Typography>

      {isMobile ? (
        <MobileStepper
          variant="dots"
          steps={steps.length}
          position="static"
          activeStep={activeStep}
          sx={{ mb: 2, bgcolor: 'transparent', justifyContent: 'center' }}
          backButton={<Box />}
          nextButton={<Box />}
        />
      ) : (
        <Stepper activeStep={activeStep} sx={{ mb: 6 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>
                <Typography variant="caption" fontWeight={600}>{label}</Typography>
              </StepLabel>
            </Step>
          ))}
        </Stepper>
      )}

      {isMobile && (
        <Typography variant="subtitle2" fontWeight={700} textAlign="center" sx={{ mb: 2 }}>
          Step {activeStep + 1}: {steps[activeStep]}
        </Typography>
      )}

      <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
        <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: { xs: 300, md: 400 }, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ flex: 1 }}>
            {renderStepContent(activeStep)}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
            <Button
              color="inherit"
              disabled={activeStep === 0 || isLaunching}
              onClick={handleBack}
              startIcon={<NavigateBefore />}
            >
              Back
            </Button>
            <Box>
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ mr: 1 }}
                disabled={isLaunching}
              >
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleLaunch}
                  disabled={
                    isLaunching ||
                    !hypothesisTitle ||
                    !hypothesisStatement ||
                    !selectedSegment ||
                    personas.length === 0 ||
                    primaryMetricThreshold < 0 ||
                    primaryMetricThreshold > 1
                  }
                  startIcon={isLaunching ? <CircularProgress size={20} color="inherit" /> : <Science />}
                >
                  {isLaunching ? 'Simulating...' : 'Launch Test'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  endIcon={<NavigateNext />}
                  disabled={
                    (activeStep === 0 && (!hypothesisTitle || !hypothesisStatement)) ||
                    (activeStep === 1 && !selectedSegment)
                  }
                >
                  Continue
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
