import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  Accordion, AccordionDetails, AccordionSummary, Alert, Avatar, Box, Button, Card,
  Chip, CircularProgress, Dialog, DialogContent, DialogTitle, FormControl, Grid,
  IconButton, InputLabel, List, ListItem, ListItemAvatar, ListItemText, MenuItem, Select,
  Slider, Stack, TablePagination, TextField, Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import Delete from '@mui/icons-material/Delete';
import Download from '@mui/icons-material/Download';
import Edit from '@mui/icons-material/Edit';
import ExpandMore from '@mui/icons-material/ExpandMore';
import Upload from '@mui/icons-material/Upload';
import {
  createPersona, deletePersona, fetchPersonas, updatePersona, bulkImportPersonas,
  downloadPersonaTemplate, type BulkImportResult,
} from '../api/personas';
import { clearPersonas, seedPersonas, type SeedMode } from '../api/seed';
import type { CognitiveProfile, CreatePersonaInput, DecisionStyle, Gender, HealthProfile, Persona, PersonalityProfile } from '../types';

const defaultPersonality: PersonalityProfile = { openness: 50, conscientiousness: 50, extraversion: 50, agreeableness: 50, neuroticism: 50 };
const defaultHealthProfile: HealthProfile = { insomniaSeverity: 0, anxietyLevel: 0, chronicPain: 0, currentSupplements: [] };
const defaultCognitiveProfile: CognitiveProfile = { lossAversion: 0.5, authorityBias: 0.5, socialProof: 0.5, statusQuoBias: 0.5, anchoring: 0.5, confirmationBias: 0.5 };
const defaultDecisionStyle: DecisionStyle = { system1Weight: 0.5, priceAnchor: 50, riskTolerance: 0.5 };

const createEmptyForm = () => ({
  name: '', segment: '', motivations: '', barriers: '', trustChannel: '', purchaseTriggers: '',
  budgetRange: '', contextNotes: '', age: '', location: '', income: '',
  gender: '' as Gender | '', occupation: '',
  personality: { ...defaultPersonality }, healthProfile: { ...defaultHealthProfile },
  cognitiveProfile: { ...defaultCognitiveProfile }, decisionStyle: { ...defaultDecisionStyle },
  currentSupplements: '',
});

const buildInitials = (n: string) => n.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase();
const parseList = (v: string) => v.split(',').map((s) => s.trim()).filter(Boolean);
const formatList = (a: string[]) => a.join(', ');

export default function PersonasPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formState, setFormState] = useState(createEmptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<BulkImportResult | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
  const [seedMode, setSeedMode] = useState<SeedMode>('demo');
  const [seedCount, setSeedCount] = useState(12);
  const [seedMessage, setSeedMessage] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const loadPage = (p: number, limit: number) => {
    setLoading(true);
    setLoadError(null);
    fetchPersonas(p + 1, limit)
      .then((res) => { setPersonas(res.data); setTotal(res.total); })
      .catch((e) => setLoadError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadPage(page, rowsPerPage);
  }, [page, rowsPerPage]);

  const handleField = (field: string) => (e: ChangeEvent<HTMLInputElement>) => setFormState((p) => ({ ...p, [field]: e.target.value }));

  const openCreate = () => { setEditingId(null); setFormState(createEmptyForm()); setCreateError(null); setDialogOpen(true); };

  const openEdit = (p: Persona) => {
    setEditingId(p.id); setCreateError(null);
    setFormState({
      name: p.name, segment: p.segment, motivations: formatList(p.motivations), barriers: formatList(p.barriers),
      trustChannel: p.trustChannel, purchaseTriggers: formatList(p.purchaseTriggers), budgetRange: p.budgetRange,
      contextNotes: p.contextNotes ?? '', age: p.age?.toString() ?? '', location: p.location ?? '', income: p.income?.toString() ?? '',
      gender: p.gender ?? '', occupation: p.occupation ?? '',
      personality: p.personality ?? { ...defaultPersonality },
      healthProfile: p.healthProfile ? { ...p.healthProfile } : { ...defaultHealthProfile },
      cognitiveProfile: p.cognitiveProfile ?? { ...defaultCognitiveProfile },
      decisionStyle: p.decisionStyle ?? { ...defaultDecisionStyle },
      currentSupplements: p.healthProfile?.currentSupplements.join(', ') ?? '',
    });
    setDialogOpen(true);
  };

  const handleClose = () => { setDialogOpen(false); setTimeout(() => { setEditingId(null); setFormState(createEmptyForm()); setCreateError(null); }, 200); };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setCreateError(null); setCreating(true);
    const motivations = parseList(formState.motivations);
    const barriers = parseList(formState.barriers);
    const purchaseTriggers = parseList(formState.purchaseTriggers);
    if (!motivations.length || !barriers.length || !purchaseTriggers.length || !formState.trustChannel.trim() || !formState.budgetRange.trim()) {
      setCreateError('Please fill in all required fields.'); setCreating(false); return;
    }
    const healthProfile: HealthProfile = { ...formState.healthProfile, currentSupplements: parseList(formState.currentSupplements) };
    const payload: CreatePersonaInput = {
      name: formState.name.trim(), segment: formState.segment.trim(), motivations, barriers,
      trustChannel: formState.trustChannel.trim(), purchaseTriggers, budgetRange: formState.budgetRange.trim(),
      contextNotes: formState.contextNotes.trim() || undefined, age: formState.age ? Number(formState.age) : undefined,
      location: formState.location.trim() || undefined, income: formState.income ? Number(formState.income) : undefined,
      gender: formState.gender || undefined, occupation: formState.occupation.trim() || undefined,
      personality: formState.personality, healthProfile, cognitiveProfile: formState.cognitiveProfile, decisionStyle: formState.decisionStyle,
    };
    try {
      if (editingId) { const u = await updatePersona(editingId, payload); setPersonas((prev) => prev.map((p) => p.id === u.id ? u : p)); }
      else { const c = await createPersona(payload); setPersonas((prev) => [c, ...prev]); setTotal((t) => t + 1); }
      handleClose();
    } catch (err) { setCreateError(err instanceof Error ? err.message : 'Operation failed'); } finally { setCreating(false); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePersona(deleteId);
      setPersonas((prev) => prev.filter((p) => p.id !== deleteId));
      setTotal((t) => Math.max(0, t - 1));
      setDeleteDialogOpen(false);
      setDeleteId(null);
      setActionMessage({ type: 'success', text: 'Persona deleted.' });
    }
    catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Unable to delete persona.',
      });
    }
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploading(true); setUploadResult(null);
    try {
      const content = await file.text(); const result = await bulkImportPersonas(content);
      setUploadResult(result); setUploadDialogOpen(true);
      if (result.personas.length > 0) { setPersonas((prev) => [...result.personas, ...prev]); setTotal((t) => t + result.personas.length); }
    } catch (err) {
      setUploadResult({ success: 0, failed: 0, errors: [{ row: 0, error: err instanceof Error ? err.message : 'Upload failed' }], personas: [] });
      setUploadDialogOpen(true);
    } finally { setUploading(false); e.target.value = ''; }
  };

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    try {
      const result = await seedPersonas({
        mode: seedMode,
        overwrite: true,
        count: seedMode === 'random' ? seedCount : undefined,
      });
      const refreshed = await fetchPersonas(page + 1, rowsPerPage);
      setPersonas(refreshed.data);
      setTotal(refreshed.total);
      setSeedMessage(
        `${seedMode === 'demo' ? 'Demo' : 'Generated'} personas ready: created ${result.created}, skipped ${result.skipped}.`,
      );
    } catch (err) {
      setSeedMessage(
        err instanceof Error ? err.message : 'Failed to seed personas.',
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
      const result = await clearPersonas();
      const refreshed = await fetchPersonas(page + 1, rowsPerPage);
      setPersonas(refreshed.data);
      setTotal(refreshed.total);
      setActionMessage({ type: 'success', text: `Cleared ${result.deleted} personas.` });
    } catch (error) {
      setActionMessage({
        type: 'error',
        text: error instanceof Error ? error.message : 'Failed to clear personas.',
      });
    } finally {
      setClearing(false);
      setClearDialogOpen(false);
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
        <Typography variant="h5" fontWeight="bold">Personas</Typography>
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
          <Button variant="outlined" startIcon={<Download />} onClick={downloadPersonaTemplate} size="small" sx={{ display: { xs: 'none', md: 'inline-flex' } }}>Template</Button>
          <Button variant="outlined" component="label" startIcon={uploading ? <CircularProgress size={20} /> : <Upload />} disabled={uploading} size="small">
            {uploading ? 'Uploading...' : 'CSV'}
            <input type="file" hidden accept=".csv" onChange={handleFileUpload} />
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} size="small">New Persona</Button>
        </Stack>
      </Stack>
      {seedMessage && (
        <Typography variant="body2" color="text.secondary">{seedMessage}</Typography>
      )}
      {actionMessage && <Alert severity={actionMessage.type}>{actionMessage.text}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
      ) : loadError ? (
        <Typography color="error">{loadError}</Typography>
      ) : (
        <Card>
          <List disablePadding>
            {personas.map((p) => (
              <ListItem key={p.id} divider secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" onClick={() => openEdit(p)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" onClick={() => { setDeleteId(p.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton>
                </Stack>
              }>
                <ListItemAvatar><Avatar sx={{ bgcolor: 'secondary.main' }}>{buildInitials(p.name)}</Avatar></ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={<Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}><Typography fontWeight={600} noWrap sx={{ maxWidth: { xs: 120, sm: 200, md: 'none' } }}>{p.name}</Typography><Chip label={p.segment} size="small" variant="outlined" /></Stack>}
                  secondary={<Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5, rowGap: 0.5 }}>{p.age && <Typography variant="caption">Age: {p.age}</Typography>}{p.location && <Typography variant="caption">{p.location}</Typography>}{p.income && <Typography variant="caption">${p.income}k</Typography>}{p.gender && <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{p.gender}</Typography>}</Stack>}
                />
              </ListItem>
            ))}
            {personas.length === 0 && <ListItem><ListItemText secondary="No personas yet. Create one or upload a CSV." /></ListItem>}
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
      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Persona' : 'Create New Persona'}</DialogTitle>
        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <Stack spacing={2}>
              <Typography variant="subtitle2" color="text.secondary">Basic Information</Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Persona Name" value={formState.name} onChange={handleField('name')} fullWidth required size="small" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Segment Archetype" value={formState.segment} onChange={handleField('segment')} fullWidth required size="small" /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><TextField label="Age" type="number" value={formState.age} onChange={handleField('age')} fullWidth size="small" /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <FormControl fullWidth size="small"><InputLabel>Gender</InputLabel>
                    <Select value={formState.gender} label="Gender" onChange={(e) => setFormState((p) => ({ ...p, gender: e.target.value as Gender | '' }))}>
                      <MenuItem value="">Not specified</MenuItem><MenuItem value="male">Male</MenuItem><MenuItem value="female">Female</MenuItem><MenuItem value="non-binary">Non-binary</MenuItem><MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}><TextField label="Income" type="number" value={formState.income} onChange={handleField('income')} fullWidth size="small" /></Grid>
                <Grid size={{ xs: 6, sm: 3 }}><TextField label="Location" value={formState.location} onChange={handleField('location')} fullWidth size="small" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Occupation" value={formState.occupation} onChange={handleField('occupation')} fullWidth size="small" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Budget Range" value={formState.budgetRange} onChange={handleField('budgetRange')} fullWidth required size="small" /></Grid>
              </Grid>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 2 }}>Behavioral Profile</Typography>
              <TextField label="Motivations (comma separated)" value={formState.motivations} onChange={handleField('motivations')} fullWidth required multiline rows={2} size="small" />
              <TextField label="Barriers (comma separated)" value={formState.barriers} onChange={handleField('barriers')} fullWidth required multiline rows={2} size="small" />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Trust Channel" value={formState.trustChannel} onChange={handleField('trustChannel')} fullWidth required size="small" /></Grid>
                <Grid size={{ xs: 12, sm: 6 }}><TextField label="Purchase Triggers (comma separated)" value={formState.purchaseTriggers} onChange={handleField('purchaseTriggers')} fullWidth required size="small" /></Grid>
              </Grid>
              {/* OCEAN */}
              <Accordion defaultExpanded={false}><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="subtitle2">OCEAN Personality Profile</Typography></AccordionSummary>
                <AccordionDetails><Grid container spacing={2}>
                  {(['openness','conscientiousness','extraversion','agreeableness','neuroticism'] as const).map((t) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={t}>
                      <Typography variant="caption" sx={{ textTransform: 'capitalize' }}>{t}: {formState.personality[t]}</Typography>
                      <Slider value={formState.personality[t]} onChange={(_, v) => setFormState((p) => ({ ...p, personality: { ...p.personality, [t]: v as number } }))} min={0} max={100} size="small" />
                    </Grid>
                  ))}
                </Grid></AccordionDetails>
              </Accordion>
              {/* Health */}
              <Accordion defaultExpanded={false}><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="subtitle2">Health Profile</Typography></AccordionSummary>
                <AccordionDetails><Grid container spacing={2}>
                  {([{ k: 'insomniaSeverity', l: 'Insomnia Severity' },{ k: 'anxietyLevel', l: 'Anxiety Level' },{ k: 'chronicPain', l: 'Chronic Pain' }] as const).map(({ k, l }) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={k}>
                      <Typography variant="caption">{l}: {formState.healthProfile[k]}</Typography>
                      <Slider value={formState.healthProfile[k]} onChange={(_, v) => setFormState((p) => ({ ...p, healthProfile: { ...p.healthProfile, [k]: v as number } }))} min={0} max={10} size="small" />
                    </Grid>
                  ))}
                  <Grid size={{ xs: 12 }}><TextField label="Current Supplements (comma separated)" value={formState.currentSupplements} onChange={handleField('currentSupplements')} fullWidth size="small" /></Grid>
                </Grid></AccordionDetails>
              </Accordion>
              {/* Cognitive */}
              <Accordion defaultExpanded={false}><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="subtitle2">Cognitive Biases</Typography></AccordionSummary>
                <AccordionDetails><Grid container spacing={2}>
                  {([{ key: 'lossAversion', label: 'Loss Aversion' },{ key: 'authorityBias', label: 'Authority Bias' },{ key: 'socialProof', label: 'Social Proof' },{ key: 'statusQuoBias', label: 'Status Quo Bias' },{ key: 'anchoring', label: 'Anchoring' },{ key: 'confirmationBias', label: 'Confirmation Bias' }] as const).map(({ key, label }) => (
                    <Grid size={{ xs: 12, sm: 6 }} key={key}>
                      <Typography variant="caption">{label}: {formState.cognitiveProfile[key].toFixed(2)}</Typography>
                      <Slider value={formState.cognitiveProfile[key]} onChange={(_, v) => setFormState((p) => ({ ...p, cognitiveProfile: { ...p.cognitiveProfile, [key]: v as number } }))} min={0} max={1} step={0.05} size="small" />
                    </Grid>
                  ))}
                </Grid></AccordionDetails>
              </Accordion>
              {/* Decision Style */}
              <Accordion defaultExpanded={false}><AccordionSummary expandIcon={<ExpandMore />}><Typography variant="subtitle2">Decision Style</Typography></AccordionSummary>
                <AccordionDetails><Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 4 }}><Typography variant="caption">System 1 Weight: {formState.decisionStyle.system1Weight.toFixed(2)}</Typography><Slider value={formState.decisionStyle.system1Weight} onChange={(_, v) => setFormState((p) => ({ ...p, decisionStyle: { ...p.decisionStyle, system1Weight: v as number } }))} min={0} max={1} step={0.05} size="small" /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><Typography variant="caption">Risk Tolerance: {formState.decisionStyle.riskTolerance.toFixed(2)}</Typography><Slider value={formState.decisionStyle.riskTolerance} onChange={(_, v) => setFormState((p) => ({ ...p, decisionStyle: { ...p.decisionStyle, riskTolerance: v as number } }))} min={0} max={1} step={0.05} size="small" /></Grid>
                  <Grid size={{ xs: 12, sm: 4 }}><TextField label="Price Anchor ($)" type="number" value={formState.decisionStyle.priceAnchor} onChange={(e) => setFormState((p) => ({ ...p, decisionStyle: { ...p.decisionStyle, priceAnchor: Number(e.target.value) } }))} fullWidth size="small" /></Grid>
                </Grid></AccordionDetails>
              </Accordion>
              <TextField label="Context Notes" value={formState.contextNotes} onChange={handleField('contextNotes')} fullWidth multiline rows={2} size="small" />
              <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 2 }}>
                <Button onClick={handleClose} color="inherit">Cancel</Button>
                <Button type="submit" variant="contained" disabled={creating}>{creating ? 'Saving...' : 'Save Persona'}</Button>
              </Stack>
              {createError && <Typography color="error" variant="caption">{createError}</Typography>}
            </Stack>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Upload Result Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Import Results</DialogTitle>
        <DialogContent>{uploadResult && (
          <Stack spacing={2}>
            <Typography><strong>Imported:</strong> {uploadResult.success} | <strong style={{ color: 'red' }}>Failed:</strong> {uploadResult.failed}</Typography>
            {uploadResult.errors.length > 0 && <List dense>{uploadResult.errors.map((err, i) => <ListItem key={i}><ListItemText primary={`Row ${err.row}: ${err.error}`} primaryTypographyProps={{ variant: 'caption', color: 'error' }} /></ListItem>)}</List>}
          </Stack>
        )}</DialogContent>
        <Stack direction="row" justifyContent="flex-end" sx={{ p: 2 }}><Button onClick={() => setUploadDialogOpen(false)} variant="contained">Close</Button></Stack>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent><Typography>Are you sure? This action cannot be undone.</Typography></DialogContent>
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </Stack>
      </Dialog>

      {/* Seed Dialog */}
      <Dialog open={seedDialogOpen} onClose={() => setSeedDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Seed Personas</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              Seeding will delete and replace all existing personas in your workspace. This cannot be undone.
            </Alert>
            <FormControl fullWidth size="small">
              <InputLabel>Seed type</InputLabel>
              <Select
                value={seedMode}
                label="Seed type"
                onChange={(e) => setSeedMode(e.target.value as SeedMode)}
              >
                <MenuItem value="demo">Predefined demo personas</MenuItem>
                <MenuItem value="random">Generate new test personas</MenuItem>
              </Select>
            </FormControl>
            {seedMode === 'random' && (
              <TextField
                label="How many personas?"
                type="number"
                size="small"
                value={seedCount}
                onChange={(e) => {
                  const next = Number(e.target.value);
                  if (!Number.isFinite(next)) return;
                  setSeedCount(Math.max(1, Math.min(50, next)));
                }}
                inputProps={{ min: 1, max: 50 }}
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
        <DialogTitle>Clear Personas</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <Alert severity="warning">
              This will permanently delete all personas. If you want to start from scratch, this is the fastest option.
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
