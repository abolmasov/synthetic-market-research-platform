import { useEffect, useState } from 'react';
import {
  Alert, Box, Button, Card, CardContent, CardHeader, Checkbox, Chip, CircularProgress, Dialog,
  DialogContent, DialogTitle, Divider, FormControlLabel, Grid, LinearProgress, Stack, TextField,
  Typography,
} from '@mui/material';
import Add from '@mui/icons-material/Add';
import AutoAwesome from '@mui/icons-material/AutoAwesome';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import DeleteSweep from '@mui/icons-material/DeleteSweep';
import Storage from '@mui/icons-material/Storage';
import UploadFile from '@mui/icons-material/UploadFile';
import { useAuth } from '../contexts/useAuth';
import {
  clearAllDocuments,
  deleteRagDocument,
  fetchRagDocuments,
  fetchRagStats,
  ingestFile,
  ingestText,
  type RagDocument,
  type RagStats,
} from '../api/rag';
import { starterRagCorpus } from '../data/starterRagCorpus';

export default function DocumentsPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [stats, setStats] = useState<RagStats | null>(null);
  const [documents, setDocuments] = useState<RagDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [ingestOpen, setIngestOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [sourceType, setSourceType] = useState('article');
  const [url, setUrl] = useState('');
  const [industry, setIndustry] = useState('');
  const [ingesting, setIngesting] = useState(false);
  const [ingestResult, setIngestResult] = useState<number | null>(null);
  const [ingestFileResult, setIngestFileResult] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clearing, setClearing] = useState(false);
  const [clearDialogOpen, setClearDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [seedingStarter, setSeedingStarter] = useState(false);
  const [seedProgress, setSeedProgress] = useState({ done: 0, total: 0 });
  const [documentToDelete, setDocumentToDelete] = useState<RagDocument | null>(
    null,
  );
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [selectedDocumentIds, setSelectedDocumentIds] = useState<string[]>([]);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [deletingBatchDocuments, setDeletingBatchDocuments] = useState(false);

  const loadData = () => {
    setLoading(true);
    Promise.all([fetchRagStats(), fetchRagDocuments()])
      .then(([nextStats, nextDocuments]) => {
        setStats(nextStats);
        setDocuments(nextDocuments);
        setSelectedDocumentIds((prevIds) =>
          prevIds.filter((id) =>
            nextDocuments.some((document) => document.id === id),
          ),
        );
      })
      .catch((error) => {
        setFeedback({
          type: 'error',
          message:
            error instanceof Error ? error.message : 'Unable to load RAG data.',
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIngest = async () => {
    if (!text.trim()) return;
    setIngesting(true);
    setIngestResult(null);
    setFeedback(null);
    try {
      const effectiveTitle = title.trim() || 'Untitled text document';
      const r = await ingestText({ text, title: effectiveTitle, sourceType, url: url || undefined, industry: industry || undefined });
      setIngestResult(r.chunksCreated);
      setIngestFileResult(null);
      loadData();
      setFeedback({
        type: 'success',
        message: `Text document ingested into ${r.chunksCreated} chunks.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Ingestion failed.',
      });
    } finally {
      setIngesting(false);
    }
  };

  const handleIngestFile = async () => {
    if (!selectedFile || !sourceType.trim()) return;
    setIngesting(true);
    setIngestResult(null);
    setIngestFileResult(null);
    setFeedback(null);
    try {
      const r = await ingestFile({
        file: selectedFile,
        title: title || undefined,
        sourceType,
        url: url || undefined,
        industry: industry || undefined,
      });
      setIngestResult(r.chunksCreated);
      setIngestFileResult(r.fileName);
      loadData();
      setFeedback({
        type: 'success',
        message: `File "${r.fileName}" ingested into ${r.chunksCreated} chunks.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'File ingestion failed.',
      });
    } finally {
      setIngesting(false);
    }
  };

  const handleClear = async () => {
    setClearing(true);
    setFeedback(null);
    try {
      const result = await clearAllDocuments();
      loadData();
      setClearDialogOpen(false);
      setFeedback({
        type: 'info',
        message: `Removed ${result.deletedChunks} document chunks from the corpus.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Clear failed.',
      });
    } finally {
      setClearing(false);
    }
  };

  const handleSeedStarterCorpus = async () => {
    setFeedback(null);
    setSeedingStarter(true);
    setSeedProgress({ done: 0, total: starterRagCorpus.length });

    let success = 0;
    let failed = 0;

    for (const [index, document] of starterRagCorpus.entries()) {
      try {
        await ingestText({
          text: document.text,
          title: document.title,
          sourceType: document.sourceType,
          url: document.url,
          industry: document.industry,
        });
        success += 1;
      } catch {
        failed += 1;
      } finally {
        setSeedProgress({ done: index + 1, total: starterRagCorpus.length });
      }
    }

    loadData();
    setSeedingStarter(false);
    setFeedback({
      type: failed > 0 ? 'info' : 'success',
      message:
        failed > 0
          ? `Starter corpus partially loaded: ${success} succeeded, ${failed} failed.`
          : `Starter corpus loaded with ${success} documents.`,
    });
  };

  const handleDeleteDocument = async () => {
    if (!documentToDelete) {
      return;
    }

    setDeletingDocument(true);
    setFeedback(null);

    try {
      const result = await deleteRagDocument(documentToDelete.id);
      setDocumentToDelete(null);
      loadData();
      setFeedback({
        type: 'info',
        message: `Removed "${documentToDelete.title}" (${result.deletedChunks} chunks).`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error instanceof Error ? error.message : 'Document delete failed.',
      });
    } finally {
      setDeletingDocument(false);
    }
  };

  const toggleDocumentSelection = (documentId: string) => {
    setSelectedDocumentIds((current) => {
      if (current.includes(documentId)) {
        return current.filter((id) => id !== documentId);
      }

      return [...current, documentId];
    });
  };

  const handleToggleAllDocuments = () => {
    setSelectedDocumentIds((current) => {
      if (current.length === documents.length) {
        return [];
      }

      return documents.map((document) => document.id);
    });
  };

  const handleDeleteSelectedDocuments = async () => {
    if (!selectedDocumentIds.length) {
      return;
    }

    setDeletingBatchDocuments(true);
    setFeedback(null);

    const selectedDocuments = documents.filter((document) =>
      selectedDocumentIds.includes(document.id),
    );

    let removedCount = 0;
    let deletedChunks = 0;
    let failedCount = 0;

    for (const ragDocument of selectedDocuments) {
      try {
        const result = await deleteRagDocument(ragDocument.id);
        removedCount += 1;
        deletedChunks += result.deletedChunks;
      } catch {
        failedCount += 1;
      }
    }

    setBatchDeleteDialogOpen(false);
    setSelectedDocumentIds([]);
    loadData();

    if (failedCount === 0) {
      setFeedback({
        type: 'info',
        message: `Removed ${removedCount} documents (${deletedChunks} chunks).`,
      });
    } else if (removedCount > 0) {
      setFeedback({
        type: 'info',
        message: `Removed ${removedCount} documents (${deletedChunks} chunks), ${failedCount} failed.`,
      });
    } else {
      setFeedback({
        type: 'error',
        message: 'Batch remove failed for all selected documents.',
      });
    }

    setDeletingBatchDocuments(false);
  };

  const allDocumentsSelected =
    documents.length > 0 && selectedDocumentIds.length === documents.length;
  const hasSomeDocumentSelection =
    selectedDocumentIds.length > 0 && !allDocumentsSelected;

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={1.5}>
        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' } }}>Documents & RAG</Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ rowGap: 1 }}>
          <Button
            variant="outlined"
            startIcon={seedingStarter ? <CircularProgress size={16} /> : <AutoAwesome />}
            onClick={handleSeedStarterCorpus}
            disabled={seedingStarter || ingesting}
            size="small"
          >
            {seedingStarter
              ? 'Seeding...'
              : `Starter (${starterRagCorpus.length})`}
          </Button>
          {isAdmin && (
            <Button variant="outlined" color="error" startIcon={<DeleteSweep />} onClick={() => setClearDialogOpen(true)} disabled={!stats?.totalChunks} size="small">
              Clear
            </Button>
          )}
          <Button variant="contained" startIcon={<Add />} onClick={() => { setIngestOpen(true); setIngestResult(null); setIngestFileResult(null); setSelectedFile(null); setTitle(''); setText(''); setSourceType('article'); setUrl(''); setIndustry(''); }} size="small">
            Ingest
          </Button>
        </Stack>
      </Stack>

      {seedingStarter && (
        <Card variant="outlined">
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="body2">
                Seeding starter corpus ({seedProgress.done}/{seedProgress.total})
              </Typography>
              <LinearProgress
                variant="determinate"
                value={(seedProgress.done / Math.max(seedProgress.total, 1)) * 100}
              />
            </Stack>
          </CardContent>
        </Card>
      )}

      {feedback && <Alert severity={feedback.type}>{feedback.message}</Alert>}

      {loading ? <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box> : stats ? (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader title="Total Chunks" avatar={<Storage color="primary" />} />
              <CardContent><Typography variant="h3" color="primary">{stats.totalChunks}</Typography></CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader title="By Source Type" />
              <CardContent>
                {Object.keys(stats.bySourceType).length === 0 ? <Typography variant="body2" color="text.secondary">No documents ingested yet.</Typography> : (
                  <Stack spacing={1}>
                    {Object.entries(stats.bySourceType).map(([type, count]) => (
                      <Stack key={type} direction="row" justifyContent="space-between" alignItems="center">
                        <Chip label={type} size="small" variant="outlined" />
                        <Typography variant="body2" fontWeight={600}>{count}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <Card>
              <CardHeader title="By Industry" />
              <CardContent>
                {Object.keys(stats.byIndustry).length === 0 ? <Typography variant="body2" color="text.secondary">No industry data.</Typography> : (
                  <Stack spacing={1}>
                    {Object.entries(stats.byIndustry).map(([ind, count]) => (
                      <Stack key={ind} direction="row" justifyContent="space-between" alignItems="center">
                        <Chip label={ind} size="small" color="primary" variant="outlined" />
                        <Typography variant="body2" fontWeight={600}>{count}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      ) : <Typography color="text.secondary">Unable to load stats.</Typography>}

      <Card>
        <CardHeader title={`Uploaded Documents (${documents.length})`} />
        <CardContent>
          {documents.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No uploaded documents yet.
            </Typography>
          ) : (
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
                spacing={1}
              >
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={allDocumentsSelected}
                      indeterminate={hasSomeDocumentSelection}
                      onChange={handleToggleAllDocuments}
                    />
                  }
                  label={`Select all (${documents.length})`}
                />
                <Button
                  color="error"
                  variant="outlined"
                  size="small"
                  startIcon={<DeleteSweep />}
                  onClick={() => setBatchDeleteDialogOpen(true)}
                  disabled={selectedDocumentIds.length === 0}
                >
                  Remove Selected ({selectedDocumentIds.length})
                </Button>
              </Stack>
              {documents.map((ragDocument) => (
                <Card
                  key={ragDocument.id}
                  variant="outlined"
                  sx={{ borderRadius: 2 }}
                >
                  <CardContent>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Stack spacing={1}>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {ragDocument.title}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          <Chip label={ragDocument.sourceType} size="small" variant="outlined" />
                          {ragDocument.industry && (
                            <Chip
                              label={ragDocument.industry}
                              size="small"
                              color="primary"
                              variant="outlined"
                            />
                          )}
                          <Chip
                            label={`${ragDocument.chunks} chunks`}
                            size="small"
                          />
                          {ragDocument.isLegacy && (
                            <Chip
                              label="Legacy"
                              size="small"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </Stack>
                        {ragDocument.uploadedFileName && (
                          <Typography variant="body2" color="text.secondary">
                            File: {ragDocument.uploadedFileName}
                          </Typography>
                        )}
                        {ragDocument.url && (
                          <Typography variant="body2" color="text.secondary">
                            Source URL: {ragDocument.url}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Uploaded: {new Date(ragDocument.createdAt).toLocaleString()}
                        </Typography>
                      </Stack>
                      <Stack justifyContent="center" alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={selectedDocumentIds.includes(ragDocument.id)}
                              onChange={() =>
                                toggleDocumentSelection(ragDocument.id)
                              }
                            />
                          }
                          label="Select"
                          sx={{ mr: 0 }}
                        />
                        <Button
                          color="error"
                          variant="outlined"
                          size="small"
                          startIcon={<DeleteOutline />}
                          onClick={() => setDocumentToDelete(ragDocument)}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Usage guidance */}
      <Card variant="outlined" sx={{ bgcolor: 'rgba(15,107,91,0.03)' }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom>How RAG Documents Work</Typography>
          <Typography variant="body2" color="text.secondary">
            Documents you ingest are split into chunks, embedded using Vertex AI, and stored in PostgreSQL with pgvector.
            When a simulation runs, the hypothesis text is embedded and matched against stored chunks to provide
            relevant market context to each AI agent. This enriches the quality of accept/reject decisions.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Tip:</strong> Ingest market research reports, competitor analyses, customer reviews, and industry
            trend articles to get the best simulation results.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Use <strong>Load Starter Corpus</strong> to quickly seed baseline context documents, then add your own
            domain-specific reports for stronger retrieval quality.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            <strong>Supported upload file types:</strong> CSV (`.csv`), PDF (`.pdf`), Text (`.txt`), JSON (`.json`).
          </Typography>
        </CardContent>
      </Card>

      {/* Ingest Dialog */}
      <Dialog open={ingestOpen} onClose={() => setIngestOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Ingest Document</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField label="Title (optional for file upload)" value={title} onChange={(e) => setTitle(e.target.value)} fullWidth size="small" />
            <TextField label="Source Type" value={sourceType} onChange={(e) => setSourceType(e.target.value)} fullWidth size="small" placeholder="e.g. article, report, review" />
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="URL (optional)" value={url} onChange={(e) => setUrl(e.target.value)} fullWidth size="small" /></Grid>
              <Grid size={{ xs: 12, sm: 6 }}><TextField label="Industry (optional)" value={industry} onChange={(e) => setIndustry(e.target.value)} fullWidth size="small" /></Grid>
            </Grid>
            <Divider />
            <Typography variant="subtitle2">Upload File (CSV, PDF, TXT, JSON)</Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Button variant="outlined" component="label" startIcon={<UploadFile />}>
                Choose File
                <input
                  type="file"
                  hidden
                  accept=".csv,.pdf,.txt,.json"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)}
                />
              </Button>
              <Typography variant="body2" color="text.secondary">
                {selectedFile ? selectedFile.name : 'No file selected'}
              </Typography>
            </Stack>
            <Button
              variant="outlined"
              onClick={handleIngestFile}
              disabled={ingesting || !selectedFile || !sourceType.trim()}
            >
              {ingesting ? 'Ingesting File...' : 'Ingest File'}
            </Button>
            {ingestResult !== null && ingestFileResult && (
              <Typography color="success.main" variant="body2">
                File "{ingestFileResult}" processed into {ingestResult} chunks.
              </Typography>
            )}
            <Divider />
            <Typography variant="subtitle2">Paste Text</Typography>
            <TextField label="Document Text" value={text} onChange={(e) => setText(e.target.value)} fullWidth required multiline rows={10} size="small" placeholder="Paste the full document text here..." />
            {ingestResult !== null && !ingestFileResult && (
              <Typography color="success.main" variant="body2">Successfully created {ingestResult} chunks.</Typography>
            )}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button onClick={() => setIngestOpen(false)} color="inherit">Close</Button>
              <Button variant="contained" onClick={handleIngest} disabled={ingesting || !text.trim()}>
                {ingesting ? 'Ingesting...' : 'Ingest'}
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={documentToDelete !== null}
        onClose={() => {
          if (!deletingDocument) {
            setDocumentToDelete(null);
          }
        }}
      >
        <DialogTitle>Remove Document</DialogTitle>
        <DialogContent>
          <Typography>
            Remove "{documentToDelete?.title ?? 'this document'}" from the
            knowledge base?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This deletes all chunks for this upload and cannot be undone.
          </Typography>
        </DialogContent>
        <Divider />
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button
            onClick={() => setDocumentToDelete(null)}
            color="inherit"
            disabled={deletingDocument}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDocument}
            color="error"
            variant="contained"
            disabled={deletingDocument}
          >
            {deletingDocument ? 'Removing...' : 'Remove'}
          </Button>
        </Stack>
      </Dialog>

      <Dialog
        open={batchDeleteDialogOpen}
        onClose={() => {
          if (!deletingBatchDocuments) {
            setBatchDeleteDialogOpen(false);
          }
        }}
      >
        <DialogTitle>Remove Selected Documents</DialogTitle>
        <DialogContent>
          <Typography>
            Remove {selectedDocumentIds.length} selected documents from the
            knowledge base?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This deletes all chunks for those uploads and cannot be undone.
          </Typography>
        </DialogContent>
        <Divider />
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button
            onClick={() => setBatchDeleteDialogOpen(false)}
            color="inherit"
            disabled={deletingBatchDocuments}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteSelectedDocuments}
            color="error"
            variant="contained"
            disabled={deletingBatchDocuments || selectedDocumentIds.length === 0}
          >
            {deletingBatchDocuments ? 'Removing...' : 'Remove Selected'}
          </Button>
        </Stack>
      </Dialog>

      {/* Clear Confirmation */}
      <Dialog open={clearDialogOpen} onClose={() => setClearDialogOpen(false)}>
        <DialogTitle>Clear All Documents</DialogTitle>
        <DialogContent>
          <Typography>This will permanently delete all {stats?.totalChunks ?? 0} document chunks from the knowledge base. This cannot be undone.</Typography>
        </DialogContent>
        <Divider />
        <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ p: 2 }}>
          <Button onClick={() => setClearDialogOpen(false)} color="inherit">Cancel</Button>
          <Button onClick={handleClear} color="error" variant="contained" disabled={clearing}>{clearing ? 'Clearing...' : 'Clear All'}</Button>
        </Stack>
      </Dialog>
    </Stack>
  );
}
