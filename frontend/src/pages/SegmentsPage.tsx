import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogContent, DialogTitle, Divider, FormControl, Grid,
  IconButton, InputLabel, List, ListItem, ListItemText, MenuItem, Select, Stack, TablePagination, TextField, Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { createSegment, deleteSegment, fetchSegments, generatePersonasFromSegment, updateSegment } from '../api/segments';
import { clearSegments, seedSegments, type SeedMode } from '../api/seed';
import type { CreateSegmentInput, GeneratePersonasResult, Segment, UpdateSegmentInput } from '../types';

const emptyForm = (): CreateSegmentInput => ({
  name: '', description: '',
  demographicCriteria: { ageRange: { min: 18, max: 65 }, incomeRange: { min: 20, max: 200 }, locations: [] },
  psychographicTraits: { motivations: [], barriers: [], values: [] },
  behavioralPatterns: { purchaseTriggers: [], trustChannels: [] },
});

export default function SegmentsPage() {
  const [segments, setSegments] = useState<Segment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  // Generate personas
  const [genDialogOpen, setGenDialogOpen] = useState(false);
  const [genSegmentId, setGenSegmentId] = useState<string | null>(null);
  const [genCount, setGenCount] = useState(5);
  const [genDiversity, setGenDiversity] = useState<'low' | 'medium' | 'high'>('medium');
  const [generating, setGenerating] = useState(false);
  const [genResult, setGenResult] = useState<GeneratePersonasResult | null>(null);
  // Text fields for arrays
  const [locationsText, setLocationsText] = useState('');
  const [motivationsText, setMotivationsText] = useState('');
  const [barriersText, setBarriersText] = useState('');
  const [valuesText, setValuesText] = useState('');
  const [triggersText, setTriggersText] = useState('');
  const [channelsText, setChannelsText] = useState('');
  const [seeding, setSeeding] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const [seedMode, setSeedMode] = useState<SeedMode>('demo');
  const [seedCount, setSeedCount] = useState(6);
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
    fetchSegments(p + 1, limit)
      .then((res) => { setSegments(res.data); setTotal(res.total); })
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Failed to load segments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPage(page, rowsPerPage); }, [page, rowsPerPage]);

  const parseList = (s: string) => s.split(',').map((v) => v.trim()).filter(Boolean);

  const openCreate = () => {
    setEditingId(null); setForm(emptyForm()); setError(null);
    setLocationsText(''); setMotivationsText(''); setBarriersText(''); setValuesText(''); setTriggersText(''); setChannelsText('');
    setDialogOpen(true);
  };

  const openEdit = (s: Segment) => {
    setEditingId(s.id); setError(null);
    setForm({ name: s.name, description: s.description, demographicCriteria: s.demographicCriteria, psychographicTraits: s.psychographicTraits, behavioralPatterns: s.behavioralPatterns });
    setLocationsText(s.demographicCriteria.locations.join(', '));
    setMotivationsText(s.psychographicTraits.motivations.join(', '));
    setBarriersText(s.psychographicTraits.barriers.join(', '));
    setValuesText(s.psychographicTraits.values.join(', '));
    setTriggersText(s.behavioralPatterns.purchaseTriggers.join(', '));
    setChannelsText(s.behavioralPatterns.trustChannels.join(', '));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true); setError(null);
    const payload: CreateSegmentInput | UpdateSegmentInput = {
      name: form.name, description: form.description,
      demographicCriteria: { ...form.demographicCriteria, locations: parseList(locationsText) },
      psychographicTraits: { motivations: parseList(motivationsText), barriers: parseList(barriersText), values: parseList(valuesText) },
      behavioralPatterns: { purchaseTriggers: parseList(triggersText), trustChannels: parseList(channelsText) },
    };
    try {
      if (editingId) { const u = await updateSegment(editingId, payload); setSegments((p) => p.map((s) => s.id === u.id ? u : s)); }
      else { const c = await createSegment(payload as CreateSegmentInput); setSegments((p) => [c, ...p]); setTotal((t) => t + 1); }
      setDialogOpen(false);
    } catch (err) { setError(err instanceof Error ? err.message : 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteSegment(deleteId);
      setSegments((p) => p.filter((s) => s.id !== deleteId));
      setTotal((t) => Math.max(0, t - 1));
      setDeleteDialogOpen(false);
      setActionMessage({ type: 'success', text: 'Segment deleted.' });
    }
    catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Delete failed.',
      });
    }
  };

  const handleGenerate = async () => {
    if (!genSegmentId) return;
    setGenerating(true); setGenResult(null);
    try { const r = await generatePersonasFromSegment(genSegmentId, { count: genCount, diversityLevel: genDiversity }); setGenResult(r); }
    catch (error) {
      setGenResult(null);
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Generation failed.',
      });
    } finally { setGenerating(false); }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const result = await seedSegments({
        mode: seedMode,
        overwrite: true,
        count: seedMode === 'random' ? seedCount : undefined,
      });
      const refreshed = await fetchSegments(page + 1, rowsPerPage);
      setSegments(refreshed.data);
      setTotal(refreshed.total);
      setSeedMessage(
        `${seedMode === 'demo' ? 'Demo' : 'Generated'} segments ready: created ${result.created}, skipped ${result.skipped}.`,
      );
    } catch (err) {
      setSeedMessage(
        err instanceof Error ? err.message : 'Failed to seed segments.',
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
      const result = await clearSegments();
      const refreshed = await fetchSegments(page + 1, rowsPerPage);
      setSegments(refreshed.data);
      setTotal(refreshed.total);
      setActionMessage({ type: 'success', text: `Cleared ${result.deleted} segments.` });
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to clear segments.',
      });
    } finally {
      setClearing(false);
      setClearDialogOpen(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
        <Typography variant="h5" fontWeight="bold">Segments</Typography>
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
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} size="small">New Segment</Button>
        </Stack>
      </Stack>
      {seedMessage && (
        <Typography variant="body2" color="text.secondary">{seedMessage}</Typography>
      )}
      {actionMessage && <Alert severity={actionMessage.type}>{actionMessage.text}</Alert>}
      {loadError && <Alert severity="error">{loadError}</Alert>}

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
        <Stack spacing={2}>
          {segments.map((s) => (
            <Card key={s.id}>
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'flex-start' }} spacing={1.5} sx={{ p: 2 }}>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="h6" noWrap>{s.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{s.description}</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 1, rowGap: 1 }}>
                    <Chip size="small" label={`Ages ${s.demographicCriteria.ageRange.min}-${s.demographicCriteria.ageRange.max}`} />
                    <Chip size="small" label={`Income $${s.demographicCriteria.incomeRange.min}-${s.demographicCriteria.incomeRange.max}k`} />
                    {s.demographicCriteria.locations.slice(0, 3).map((l) => <Chip key={l} size="small" variant="outlined" label={l} />)}
                  </Stack>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
                    {s.psychographicTraits.values.slice(0, 4).map((v) => <Chip key={v} size="small" label={v} color="primary" variant="outlined" />)}
                  </Stack>
                </Box>
                <Stack direction="row" spacing={0.5} flexWrap="wrap" alignItems="center">
                  <Button size="small" startIcon={<AutoAwesome />} onClick={() => { setGenSegmentId(s.id); setGenResult(null); setGenDialogOpen(true); }}>Generate</Button>
                  <IconButton size="small" onClick={() => openEdit(s)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => { setDeleteId(s.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton>
                </Stack>
              </Stack>
            </Card>
          ))}
          {segments.length === 0 && <Typography color="text.secondary" textAlign="center" py={4}>No segments yet. Create one to get started.</Typography>}
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 20, 50]}
          />
        </Stack>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Segment' : 'Create Segment'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Name" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} fullWidth required size="small" />
            <TextField label="Description" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} fullWidth required multiline rows={2} size="small" />
            <Divider />
            <Typography variant="subtitle2">Demographics</Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 6, sm: 3 }}><TextField label="Min Age" type="number" value={form.demographicCriteria.ageRange.min} onChange={(e) => setForm((p) => ({ ...p, demographicCriteria: { ...p.demographicCriteria, ageRange: { ...p.demographicCriteria.ageRange, min: Number(e.target.value) } } }))} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><TextField label="Max Age" type="number" value={form.demographicCriteria.ageRange.max} onChange={(e) => setForm((p) => ({ ...p, demographicCriteria: { ...p.demographicCriteria, ageRange: { ...p.demographicCriteria.ageRange, max: Number(e.target.value) } } }))} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><TextField label="Min Income ($k)" type="number" value={form.demographicCriteria.incomeRange.min} onChange={(e) => setForm((p) => ({ ...p, demographicCriteria: { ...p.demographicCriteria, incomeRange: { ...p.demographicCriteria.incomeRange, min: Number(e.target.value) } } }))} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 6, sm: 3 }}><TextField label="Max Income ($k)" type="number" value={form.demographicCriteria.incomeRange.max} onChange={(e) => setForm((p) => ({ ...p, demographicCriteria: { ...p.demographicCriteria, incomeRange: { ...p.demographicCriteria.incomeRange, max: Number(e.target.value) } } }))} fullWidth size="small" /></Grid>
            </Grid>
            <TextField label="Locations (comma separated)" value={locationsText} onChange={(e) => setLocationsText(e.target.value)} fullWidth size="small" />
            <Divider />
            <Typography variant="subtitle2">Psychographics</Typography>
            <TextField label="Motivations (comma separated)" value={motivationsText} onChange={(e) => setMotivationsText(e.target.value)} fullWidth size="small" />
            <TextField label="Barriers (comma separated)" value={barriersText} onChange={(e) => setBarriersText(e.target.value)} fullWidth size="small" />
            <TextField label="Values (comma separated)" value={valuesText} onChange={(e) => setValuesText(e.target.value)} fullWidth size="small" />
            <Divider />
            <Typography variant="subtitle2">Behavioral Patterns</Typography>
            <TextField label="Purchase Triggers (comma separated)" value={triggersText} onChange={(e) => setTriggersText(e.target.value)} fullWidth size="small" />
            <TextField label="Trust Channels (comma separated)" value={channelsText} onChange={(e) => setChannelsText(e.target.value)} fullWidth size="small" />
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
        <DialogTitle>Seed Segments</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Seeding will delete and replace all existing segments. This cannot be undone.
            </Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Seed type</InputLabel>
              <Select
                value={seedMode}
                label="Seed type"
                onChange={(e) => setSeedMode(e.target.value as SeedMode)}
              >
                <MenuItem value="demo">Predefined demo segments</MenuItem>
                <MenuItem value="random">Generate new test segments</MenuItem>
              </Select>
            </FormControl>
            {seedMode === 'random' && (
              <TextField
                label="How many segments?"
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
        <DialogTitle>Clear Segments</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will permanently delete all segments. Personas and hypotheses are not deleted here.
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

      {/* Generate Personas Dialog */}
      <Dialog open={genDialogOpen} onClose={() => setGenDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Personas from Segment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Count" type="number" value={genCount} onChange={(e) => setGenCount(Number(e.target.value))} inputProps={{ min: 1, max: 20 }} size="small" />
            <Stack direction="row" spacing={1}>
              {(['low', 'medium', 'high'] as const).map((d) => (
                <Chip key={d} label={d} color={genDiversity === d ? 'primary' : 'default'} onClick={() => setGenDiversity(d)} sx={{ textTransform: 'capitalize' }} />
              ))}
            </Stack>
            <Button variant="contained" startIcon={generating ? <CircularProgress size={20} /> : <AutoAwesome />} onClick={handleGenerate} disabled={generating}>
              {generating ? 'Generating...' : 'Generate'}
            </Button>
            {genResult && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" color="success.main">Generated {genResult.generatedCount} personas for "{genResult.segmentName}"</Typography>
                <List dense>{genResult.personas.slice(0, 5).map((p) => <ListItem key={p.id}><ListItemText primary={p.name} secondary={p.segment} /></ListItem>)}</List>
              </Box>
            )}
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Segment</DialogTitle>
        <DialogContent><Typography>Are you sure? This cannot be undone.</Typography></DialogContent>
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </Stack>
      </Dialog>
    </Stack>
  );
}
