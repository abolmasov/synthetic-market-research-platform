import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  FormControl, Grid, IconButton, InputLabel, List, ListItem, ListItemText, MenuItem,
  Select, Stack, TablePagination, TextField, Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { createHypothesis, deleteHypothesis, fetchHypotheses, updateHypothesis } from '../api/hypotheses';
import { clearHypotheses, seedHypotheses, type SeedMode } from '../api/seed';
import type {
  CreateHypothesisInput,
  Hypothesis,
  HypothesisGuardrail,
  HypothesisMetric,
  HypothesisStage,
  HypothesisStatus,
  VerificationDirection,
} from '../types';

const STAGES: HypothesisStage[] = ['H1', 'H2', 'H3'];
const STATUSES: HypothesisStatus[] = ['draft', 'ready', 'running', 'completed', 'canceled', 'active', 'archived'];
const PRIMARY_METRICS: HypothesisMetric[] = [
  'acceptanceRate',
  'rejectionRate',
  'maybeRate',
  'averageConfidence',
  'priceAnchorHitRate',
];
const VERIFICATION_DIRECTIONS: VerificationDirection[] = ['at_least', 'at_most'];

const metricLabel = (metric: HypothesisMetric): string => {
  if (metric === 'acceptanceRate') return 'Acceptance Rate';
  if (metric === 'rejectionRate') return 'Rejection Rate';
  if (metric === 'maybeRate') return 'Maybe Rate';
  if (metric === 'averageConfidence') return 'Average Confidence';
  return 'Price Anchor Hit Rate';
};

const directionLabel = (direction: VerificationDirection): string =>
  direction === 'at_least' ? 'At least (>=)' : 'At most (<=)';

const parseGuardrails = (input: string): HypothesisGuardrail[] => {
  if (!input.trim()) {
    return [];
  }

  const rows = input
    .split('\n')
    .map((row) => row.trim())
    .filter((row) => row.length > 0);

  return rows.map((row) => {
    const [metricRaw, directionRaw, thresholdRaw, ...labelParts] = row
      .split(',')
      .map((part) => part.trim());

    if (!metricRaw || !directionRaw || !thresholdRaw) {
      throw new Error(
        'Guardrail format: metric,direction,threshold,label(optional)',
      );
    }

    if (!PRIMARY_METRICS.includes(metricRaw as HypothesisMetric)) {
      throw new Error(`Unknown guardrail metric: ${metricRaw}`);
    }

    if (!VERIFICATION_DIRECTIONS.includes(directionRaw as VerificationDirection)) {
      throw new Error(`Unknown guardrail direction: ${directionRaw}`);
    }

    const threshold = Number(thresholdRaw);
    if (!Number.isFinite(threshold) || threshold < 0 || threshold > 1) {
      throw new Error('Guardrail threshold must be between 0 and 1');
    }

    const label = labelParts.join(',');
    return {
      metric: metricRaw as HypothesisMetric,
      direction: directionRaw as VerificationDirection,
      threshold,
      label: label || null,
    };
  });
};

const stringifyGuardrails = (guardrails: HypothesisGuardrail[]): string =>
  guardrails
    .map(
      (guardrail) =>
        `${guardrail.metric},${guardrail.direction},${guardrail.threshold}${guardrail.label ? `,${guardrail.label}` : ''}`,
    )
    .join('\n');

const statusColor = (s: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  if (s === 'completed') return 'success';
  if (s === 'running' || s === 'active') return 'primary';
  if (s === 'ready') return 'warning';
  if (s === 'canceled' || s === 'archived') return 'error';
  return 'default';
};

const emptyForm = (): CreateHypothesisInput => ({
  title: '',
  statement: '',
  stage: 'H1',
  status: 'draft',
  primaryMetric: 'acceptanceRate',
  primaryMetricDirection: 'at_least',
  primaryMetricThreshold: 0.6,
  sampleSize: 100,
});

export default function HypothesesPage() {
  const [items, setItems] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [guardrailsText, setGuardrailsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const [seedMode, setSeedMode] = useState<SeedMode>('demo');
  const [seedCount, setSeedCount] = useState(5);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPage = (p: number, limit: number) => {
    setLoading(true);
    setLoadError(null);
    fetchHypotheses(undefined, p + 1, limit)
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Failed to load hypotheses'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPage(page, rowsPerPage); }, [page, rowsPerPage]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setGuardrailsText('');
    setError(null);
    setDialogOpen(true);
  };

  const openEdit = (h: Hypothesis) => {
    setEditingId(h.id); setError(null);
    setForm({
      title: h.title,
      statement: h.statement,
      stage: h.stage,
      status: h.status,
      successCriteria: h.successCriteria ?? '',
      protocolId: h.protocolId ?? '',
      primaryMetric: h.primaryMetric ?? 'acceptanceRate',
      primaryMetricDirection: h.primaryMetricDirection ?? 'at_least',
      primaryMetricThreshold: h.primaryMetricThreshold ?? 0.6,
      guardrails: h.guardrails,
      falsificationRule: h.falsificationRule ?? '',
      sampleSize: h.sampleSize ?? 100,
      testDurationDays: h.testDurationDays ?? undefined,
      decisionOutcome: h.decisionOutcome,
      decisionReason: h.decisionReason ?? '',
      notes: h.notes ?? '',
    });
    setGuardrailsText(stringifyGuardrails(h.guardrails));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    try {
      const guardrails = parseGuardrails(guardrailsText);
      const payload: CreateHypothesisInput = {
        ...form,
        primaryMetricThreshold:
          form.primaryMetricThreshold !== undefined
            ? Number(form.primaryMetricThreshold)
            : undefined,
        sampleSize:
          form.sampleSize !== undefined ? Number(form.sampleSize) : undefined,
        testDurationDays:
          form.testDurationDays !== undefined
            ? Number(form.testDurationDays)
            : undefined,
        guardrails,
      };

      if (editingId) {
        const u = await updateHypothesis(editingId, payload);
        setItems((p) => p.map((h) => (h.id === u.id ? u : h)));
      } else {
        const c = await createHypothesis(payload);
        setItems((p) => [c, ...p]);
        setTotal((t) => t + 1);
      }
      setDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteHypothesis(deleteId);
      setItems((p) => p.filter((h) => h.id !== deleteId));
      setTotal((t) => Math.max(0, t - 1));
      setDeleteDialogOpen(false);
      setActionMessage({ type: 'success', text: 'Hypothesis deleted.' });
    }
    catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Delete failed.',
      });
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const result = await seedHypotheses({
        mode: seedMode,
        overwrite: true,
        count: seedMode === 'random' ? seedCount : undefined,
      });
      const refreshed = await fetchHypotheses(undefined, page + 1, rowsPerPage);
      setItems(refreshed.data);
      setTotal(refreshed.total);
      setSeedMessage(
        `${seedMode === 'demo' ? 'Demo' : 'Generated'} hypotheses ready: created ${result.created}, skipped ${result.skipped}.`,
      );
    } catch (err) {
      setSeedMessage(
        err instanceof Error ? err.message : 'Failed to seed hypotheses.',
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
      const result = await clearHypotheses();
      const refreshed = await fetchHypotheses(undefined, page + 1, rowsPerPage);
      setItems(refreshed.data);
      setTotal(refreshed.total);
      setActionMessage({ type: 'success', text: `Cleared ${result.deleted} hypotheses.` });
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to clear hypotheses.',
      });
    } finally {
      setClearing(false);
      setClearDialogOpen(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
        <Typography variant="h5" fontWeight="bold">Hypotheses</Typography>
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
            startIcon={clearing ? <CircularProgress size={16} /> : <Delete />}
            onClick={() => setClearDialogOpen(true)}
            disabled={seeding || clearing || total === 0}
            size="small"
          >
            Clear
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} size="small">New Hypothesis</Button>
        </Stack>
      </Stack>
      {seedMessage && (
        <Typography variant="body2" color="text.secondary">{seedMessage}</Typography>
      )}
      {actionMessage && <Alert severity={actionMessage.type}>{actionMessage.text}</Alert>}
      {loadError && <Alert severity="error">{loadError}</Alert>}

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
        <Card>
          <List disablePadding>
            {items.map((h) => (
              <ListItem key={h.id} divider secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => openEdit(h)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => { setDeleteId(h.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton>
                </Stack>
              }>
                <ListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}><Chip label={h.stage} size="small" /><Typography fontWeight={600} noWrap sx={{ maxWidth: { xs: 150, sm: 300, md: 'none' } }}>{h.title}</Typography><Chip label={h.status} size="small" color={statusColor(h.status)} variant="outlined" />{h.decisionOutcome !== 'pending' && <Chip label={h.decisionOutcome.toUpperCase()} size="small" color={h.decisionOutcome === 'pass' ? 'success' : h.decisionOutcome === 'iterate' ? 'warning' : 'error'} />}</Stack>}
                  secondary={<Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{h.statement}</Typography>}
                />
              </ListItem>
            ))}
            {items.length === 0 && <ListItem><ListItemText secondary="No hypotheses yet." /></ListItem>}
          </List>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Card>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Hypothesis' : 'Create Hypothesis'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} fullWidth required size="small" inputProps={{ maxLength: 160 }} />
            <TextField label="Statement" value={form.statement} onChange={(e) => setForm((p) => ({ ...p, statement: e.target.value }))} fullWidth required multiline rows={3} size="small" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small"><InputLabel>Stage</InputLabel>
                  <Select value={form.stage ?? 'H1'} label="Stage" onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value as HypothesisStage }))}>
                    {STAGES.map((s) => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <FormControl fullWidth size="small"><InputLabel>Status</InputLabel>
                  <Select value={form.status ?? 'draft'} label="Status" onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as HypothesisStatus }))}>
                    {STATUSES.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField label="Success Criteria" value={form.successCriteria ?? ''} onChange={(e) => setForm((p) => ({ ...p, successCriteria: e.target.value }))} fullWidth size="small" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Primary Metric</InputLabel>
                  <Select
                    value={form.primaryMetric ?? 'acceptanceRate'}
                    label="Primary Metric"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        primaryMetric: e.target.value as HypothesisMetric,
                      }))
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
                    value={form.primaryMetricDirection ?? 'at_least'}
                    label="Direction"
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        primaryMetricDirection: e.target
                          .value as VerificationDirection,
                      }))
                    }
                  >
                    {VERIFICATION_DIRECTIONS.map((direction) => (
                      <MenuItem key={direction} value={direction}>
                        {directionLabel(direction)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField
                  label="Threshold (0-1)"
                  type="number"
                  value={form.primaryMetricThreshold ?? 0.6}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      primaryMetricThreshold: Number(e.target.value),
                    }))
                  }
                  fullWidth
                  size="small"
                  inputProps={{ min: 0, max: 1, step: 0.01 }}
                />
              </Grid>
            </Grid>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Sample Size"
                  type="number"
                  value={form.sampleSize ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      sampleSize: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  fullWidth
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  label="Test Duration (days)"
                  type="number"
                  value={form.testDurationDays ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      testDurationDays: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    }))
                  }
                  fullWidth
                  size="small"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
            <TextField
              label="Guardrails"
              helperText="One per line: metric,direction,threshold,label(optional)"
              value={guardrailsText}
              onChange={(e) => setGuardrailsText(e.target.value)}
              fullWidth
              multiline
              rows={3}
              size="small"
            />
            <TextField
              label="Falsification Rule"
              helperText="Format: metric operator threshold (e.g., rejectionRate>=0.6)"
              value={form.falsificationRule ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, falsificationRule: e.target.value }))
              }
              fullWidth
              size="small"
            />
            <TextField
              label="Decision Reason"
              value={form.decisionReason ?? ''}
              onChange={(e) =>
                setForm((p) => ({ ...p, decisionReason: e.target.value }))
              }
              fullWidth
              size="small"
            />
            <TextField label="Notes" value={form.notes ?? ''} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))} fullWidth multiline rows={2} size="small" />
            {error && <Typography color="error" variant="caption">{error}</Typography>}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
              <Button variant="contained" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Seed Dialog */}
      <Dialog open={seedDialogOpen} onClose={() => setSeedDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Seed Hypotheses</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Seeding will delete and replace all existing hypotheses. This cannot be undone.
            </Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Seed type</InputLabel>
              <Select
                value={seedMode}
                label="Seed type"
                onChange={(e) => setSeedMode(e.target.value as SeedMode)}
              >
                <MenuItem value="demo">Predefined demo hypotheses</MenuItem>
                <MenuItem value="random">Generate new test hypotheses</MenuItem>
              </Select>
            </FormControl>
            {seedMode === 'random' && (
              <TextField
                label="How many hypotheses?"
                type="number"
                size="small"
                value={seedCount}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (!Number.isFinite(next)) return;
                  setSeedCount(Math.max(1, Math.min(30, next)));
                }}
                inputProps={{ min: 1, max: 30 }}
              />
            )}
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
        <DialogTitle>Clear Hypotheses</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will permanently delete all hypotheses. Simulations that reference a hypothesis text are not deleted here.
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

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Hypothesis</DialogTitle>
        <DialogContent><Typography>Are you sure? This cannot be undone.</Typography></DialogContent>
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </Stack>
      </Dialog>
    </Stack>
  );
}
