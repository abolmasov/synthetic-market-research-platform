import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, Chip, CircularProgress, Dialog, DialogContent, DialogTitle,
  Grid, IconButton, List, ListItem, ListItemText, MenuItem, Select,
  Stack, TablePagination, TextField, Typography, InputLabel, FormControl
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import Delete from '@mui/icons-material/Delete';
import Edit from '@mui/icons-material/Edit';
import { createStudy, deleteStudy, fetchStudies, updateStudy } from '../api/studies';
import type { CreateStudyInput, Study, StudyStatus } from '../types';

const STATUSES: StudyStatus[] = ['draft', 'active', 'completed', 'archived'];

const statusColor = (s: string): 'default' | 'primary' | 'success' | 'warning' | 'error' => {
  if (s === 'completed') return 'success';
  if (s === 'active') return 'primary';
  if (s === 'draft') return 'default';
  if (s === 'archived') return 'error';
  return 'default';
};

const emptyForm = (): CreateStudyInput => ({ name: '', objective: '', status: 'draft', tags: [] });

export default function StudiesPage() {
  const [items, setItems] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateStudyInput>(emptyForm);
  const [tagsInput, setTagsInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);

  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPage = (p: number, limit: number) => {
    setLoading(true);
    setLoadError(null);
    fetchStudies(p + 1, limit)
      .then((res) => { setItems(res.data); setTotal(res.total); })
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Failed to load studies'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadPage(page, rowsPerPage); }, [page, rowsPerPage]);

  const openCreate = () => { 
    setEditingId(null); 
    setForm(emptyForm()); 
    setTagsInput('');
    setError(null); 
    setDialogOpen(true); 
  };

  const openEdit = (s: Study) => {
    setEditingId(s.id); 
    setError(null);
    setForm({ 
      name: s.name, 
      objective: s.objective, 
      status: s.status, 
      tags: s.tags ?? [] 
    });
    setTagsInput((s.tags ?? []).join(', '));
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    setSaving(true); 
    setError(null);
    
    // Parse tags
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    const payload = { ...form, tags };

    try {
      if (editingId) { 
        const u = await updateStudy(editingId, payload); 
        setItems((p) => p.map((s) => s.id === u.id ? u : s)); 
      } else { 
        const c = await createStudy(payload); 
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
      await deleteStudy(deleteId);
      setItems((p) => p.filter((s) => s.id !== deleteId));
      setTotal((t) => Math.max(0, t - 1));
      setDeleteDialogOpen(false);
      setActionMessage({ type: 'success', text: 'Study deleted.' });
    }
    catch (err) {
      setActionMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Delete failed.',
      });
    }
  };

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
        <Typography variant="h5" fontWeight="bold">Studies</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
          <Button variant="contained" startIcon={<Add />} onClick={openCreate} size="small">New Study</Button>
        </Stack>
      </Stack>
      
      {actionMessage && <Alert severity={actionMessage.type}>{actionMessage.text}</Alert>}
      {loadError && <Alert severity="error">{loadError}</Alert>}

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : (
        <Card>
          <List disablePadding>
            {items.map((s) => (
              <ListItem key={s.id} divider secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <IconButton size="small" aria-label="Edit study" onClick={() => openEdit(s)}><Edit fontSize="small" /></IconButton>
                  <IconButton size="small" aria-label="Delete study" onClick={() => { setDeleteId(s.id); setDeleteDialogOpen(true); }}><Delete fontSize="small" /></IconButton>
                </Stack>
              }>
                <ListItemText
                  primaryTypographyProps={{ component: 'div' }}
                  secondaryTypographyProps={{ component: 'div' }}
                  primary={
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}>
                      <Typography fontWeight={600} noWrap sx={{ maxWidth: { xs: 150, sm: 300, md: 'none' } }}>{s.name}</Typography>
                      <Chip label={s.status} size="small" color={statusColor(s.status)} variant="outlined" />
                    </Stack>
                  }
                  secondary={
                    <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {s.objective}
                      </Typography>
                      {s.tags && s.tags.length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap sx={{ rowGap: 0.5 }}>
                          {s.tags.map(t => (
                            <Chip key={t} label={t} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />
                          ))}
                        </Stack>
                      )}
                      <Typography variant="caption" color="text.disabled">
                        Created: {new Date(s.createdAt).toLocaleDateString()}
                      </Typography>
                    </Stack>
                  }
                />
              </ListItem>
            ))}
            {items.length === 0 && <ListItem><ListItemText secondary="No studies yet." /></ListItem>}
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
        <DialogTitle>{editingId ? 'Edit Study' : 'Create Study'}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField 
              label="Name" 
              value={form.name} 
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} 
              fullWidth 
              required 
              size="small" 
              inputProps={{ maxLength: 160 }} 
            />
            <TextField 
              label="Objective" 
              value={form.objective} 
              onChange={(e) => setForm((p) => ({ ...p, objective: e.target.value }))} 
              fullWidth 
              required 
              multiline 
              rows={3} 
              size="small" 
            />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select 
                    value={form.status ?? 'draft'} 
                    label="Status" 
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as StudyStatus }))}
                  >
                    {STATUSES.map((s) => <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField 
              label="Tags (comma separated)" 
              value={tagsInput} 
              onChange={(e) => setTagsInput(e.target.value)} 
              fullWidth 
              size="small" 
            />
            {error && <Typography color="error" variant="caption">{error}</Typography>}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setDialogOpen(false)} color="inherit">Cancel</Button>
              <Button variant="contained" onClick={handleSubmit} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Study</DialogTitle>
        <DialogContent><Typography>Are you sure? This cannot be undone.</Typography></DialogContent>
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </Stack>
      </Dialog>
    </Stack>
  );
}
