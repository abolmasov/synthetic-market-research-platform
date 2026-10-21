import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
} from 'react';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  MenuItem,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import BarChart from '@mui/icons-material/BarChart';
import Cancel from '@mui/icons-material/Cancel';
import CheckCircle from '@mui/icons-material/CheckCircle';
import DonutLarge from '@mui/icons-material/DonutLarge';
import Download from '@mui/icons-material/Download';
import ExpandMore from '@mui/icons-material/ExpandMore';
import HelpOutline from '@mui/icons-material/HelpOutline';
import Info from '@mui/icons-material/Info';
import Insights from '@mui/icons-material/Insights';
import PictureAsPdf from '@mui/icons-material/PictureAsPdf';
import Psychology from '@mui/icons-material/Psychology';
import Refresh from '@mui/icons-material/Refresh';
import Science from '@mui/icons-material/Science';
import StackedBarChart from '@mui/icons-material/StackedBarChart';
import TrendingDown from '@mui/icons-material/TrendingDown';
import TrendingFlat from '@mui/icons-material/TrendingFlat';
import TrendingUp from '@mui/icons-material/TrendingUp';
import { Link, useParams } from 'react-router-dom';
import {
  downloadSimulationCsv,
  downloadSimulationPdf,
  fetchSimulationReportMetadata,
  fetchSimulationById,
} from '../api/simulations';
import type {
  ConfidenceBucket,
  ReasonEntry,
  SegmentBreakdownEntry,
  Simulation,
  SimulationDecision,
} from '../types';
import type { SimulationReportMetadata } from '../api/simulations';

// ── Types ──────────────────────────────────────────────────────────────────

type DecisionFilter = 'all' | SimulationDecision['decision'];
type ChartType = 'donut' | 'bar' | 'stacked';

// ── Constants ─────────────────────────────────────────────────────────────

const DECISION_META: Record<
  SimulationDecision['decision'],
  { label: string; color: string; icon: ReactElement }
> = {
  accept: {
    label: 'Accept',
    color: '#2E7D32',
    icon: <CheckCircle fontSize="small" sx={{ color: '#2E7D32' }} />,
  },
  reject: {
    label: 'Reject',
    color: '#C62828',
    icon: <Cancel fontSize="small" sx={{ color: '#C62828' }} />,
  },
  maybe: {
    label: 'Maybe',
    color: '#EF6C00',
    icon: <HelpOutline fontSize="small" sx={{ color: '#EF6C00' }} />,
  },
};

const metricExplanations: Record<string, string> = {
  'Acceptance': 'The percentage of personas that accepted the hypothesis.',
  'Rejection': 'The percentage of personas that explicitly rejected the hypothesis.',
  'Undecided': 'The percentage of personas that were unsure or need more info.',
  'Avg Confidence': 'How confident the AI was in simulating these personas.',
  'Total Personas': 'The number of synthetic personas used in this simulation.',
  'Avg Loop Depth': 'The average number of reasoning iterations the AI needed to reach a decision.',
  'Avg Sentiment': 'The overall sentiment score from -1 (negative) to 1 (positive).',
  'Price Anchor Hit': 'The percentage of personas that found the price acceptable.',
};

// ── Helpers ────────────────────────────────────────────────────────────────

const toPercent = (value: number) => `${Math.round(value * 100)}%`;

const toInitials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

const sentimentIcon = (score: number): ReactElement => {
  if (score > 0.1) return <TrendingUp fontSize="small" sx={{ color: '#2E7D32' }} />;
  if (score < -0.1) return <TrendingDown fontSize="small" sx={{ color: '#C62828' }} />;
  return <TrendingFlat fontSize="small" sx={{ color: '#EF6C00' }} />;
};

// ── Sub-components ─────────────────────────────────────────────────────────

function DonutChart({
  series,
  gradient,
  total,
}: {
  series: { key: SimulationDecision['decision']; label: string; color: string; count: number; rate: number }[];
  gradient: string;
  total: number;
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
      <Box
        sx={{
          flexShrink: 0,
          width: 150,
          height: 150,
          borderRadius: '50%',
          backgroundImage: gradient,
          display: 'grid',
          placeItems: 'center',
          boxShadow: 'inset 0 0 0 18px rgba(255,255,255,0.85)',
        }}
      >
        <Stack alignItems="center" spacing={0}>
          <Typography variant="h6" fontWeight={700} lineHeight={1}>
            {total}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            agents
          </Typography>
        </Stack>
      </Box>
      <Stack spacing={1.4} sx={{ width: '100%' }}>
        {series.map((item) => (
          <Stack spacing={0.5} key={item.key}>
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" spacing={0.8} alignItems="center">
                {DECISION_META[item.key].icon}
                <Typography variant="body2">{item.label}</Typography>
              </Stack>
              <Typography variant="body2" fontWeight={600}>
                {item.count}&nbsp;
                <Typography component="span" variant="caption" color="text.secondary">
                  ({toPercent(item.rate)})
                </Typography>
              </Typography>
            </Stack>
            <Box sx={{ height: 8, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.max(item.rate * 100, 2)}%`,
                  bgcolor: item.color,
                  transition: 'width 350ms ease',
                }}
              />
            </Box>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

function HorizontalBarChart({
  series,
}: {
  series: { key: SimulationDecision['decision']; label: string; color: string; count: number; rate: number }[];
}) {
  const maxRate = Math.max(...series.map((s) => s.rate), 0.01);
  return (
    <Stack spacing={2}>
      {series.map((item) => (
        <Stack key={item.key} spacing={0.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
              {DECISION_META[item.key].icon}
              <Typography variant="body2" fontWeight={500}>
                {item.label}
              </Typography>
            </Stack>
            <Typography variant="body2" fontWeight={700} color={item.color}>
              {toPercent(item.rate)}
            </Typography>
          </Stack>
          <Tooltip title={`${item.count} agents chose ${item.label} (${toPercent(item.rate)})`} placement="top" arrow>
            <Box
              sx={{
                height: 28,
                borderRadius: 2,
                bgcolor: 'action.hover',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              <Box
                sx={{
                  height: '100%',
                  width: `${(item.rate / maxRate) * 100}%`,
                  bgcolor: item.color,
                  opacity: 0.85,
                  transition: 'width 400ms ease',
                  display: 'flex',
                  alignItems: 'center',
                  pl: 1,
                }}
              >
                {item.count > 0 && (
                  <Typography variant="caption" color="white" fontWeight={700}>
                    {item.count}
                  </Typography>
                )}
              </Box>
            </Box>
          </Tooltip>
        </Stack>
      ))}
    </Stack>
  );
}

function StackedBarDecisionChart({
  segmentBreakdown,
}: {
  segmentBreakdown: SegmentBreakdownEntry[];
}) {
  if (segmentBreakdown.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No segment data available.
      </Typography>
    );
  }
  return (
    <Stack spacing={1.5}>
      {segmentBreakdown.map((seg) => (
        <Box key={seg.segment}>
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
            <Typography variant="body2" fontWeight={500} noWrap sx={{ maxWidth: '60%' }}>
              {seg.segment}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {seg.total} agents · {toPercent(seg.acceptRate)} accept
            </Typography>
          </Stack>
          <Box sx={{ height: 22, borderRadius: 2, overflow: 'hidden', display: 'flex', bgcolor: 'action.hover' }}>
            <Tooltip title={`Accept: ${seg.accept} (${toPercent(seg.acceptRate)})`}>
              <Box sx={{ width: `${seg.acceptRate * 100}%`, bgcolor: DECISION_META.accept.color }} />
            </Tooltip>
            <Tooltip title={`Reject: ${seg.reject} (${toPercent(seg.rejectRate)})`}>
              <Box sx={{ width: `${seg.rejectRate * 100}%`, bgcolor: DECISION_META.reject.color }} />
            </Tooltip>
            <Tooltip title={`Maybe: ${seg.maybe} (${toPercent(seg.maybeRate)})`}>
              <Box sx={{ width: `${seg.maybeRate * 100}%`, bgcolor: DECISION_META.maybe.color }} />
            </Tooltip>
          </Box>
        </Box>
      ))}
      {/* Legend */}
      <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ pt: 0.5 }}>
        {(['accept', 'reject', 'maybe'] as const).map((key) => (
          <Stack key={key} direction="row" spacing={0.5} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: 1, bgcolor: DECISION_META[key].color }} />
            <Typography variant="caption">{DECISION_META[key].label}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}

function ConfidenceDistributionCard({
  buckets,
}: {
  buckets: ConfidenceBucket[];
}) {
  return (
    <Stack spacing={1.5}>
      {buckets.map((bucket) => (
        <Stack key={bucket.label} spacing={0.5}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="body2">{bucket.label}</Typography>
            <Typography variant="body2" fontWeight={600}>
              {bucket.count}&nbsp;
              <Typography component="span" variant="caption" color="text.secondary">
                ({toPercent(bucket.rate)})
              </Typography>
            </Typography>
          </Stack>
          <Tooltip title={`${bucket.count} agents have ${bucket.label} confidence`} placement="top" arrow>
            <Box sx={{ height: 12, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden', cursor: 'pointer' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${Math.max(bucket.rate * 100, 2)}%`,
                  bgcolor: 'primary.main',
                  transition: 'width 350ms ease',
                }}
              />
            </Box>
          </Tooltip>
        </Stack>
      ))}
    </Stack>
  );
}

function ReasonsCard({
  title,
  reasons,
  color,
}: {
  title: string;
  reasons: ReasonEntry[];
  color: string;
}) {
  if (reasons.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No data available.
      </Typography>
    );
  }
  const maxCount = reasons[0].count;
  return (
    <Stack spacing={0.8}>
      <Typography variant="subtitle2" gutterBottom>
        {title}
      </Typography>
      {reasons.map((r, i) => (
        <Stack key={i} spacing={0.3}>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption" sx={{ flex: 1, pr: 1 }}>
              {r.reason}
            </Typography>
            <Typography variant="caption" fontWeight={700} color={color}>
              ×{r.count}
            </Typography>
          </Stack>
          <Tooltip title={`${r.count} personas cited: "${r.reason}"`} placement="top" arrow>
            <Box sx={{ height: 6, borderRadius: 999, bgcolor: 'action.hover', overflow: 'hidden', cursor: 'pointer' }}>
              <Box
                sx={{
                  height: '100%',
                  width: `${(r.count / Math.max(maxCount, 1)) * 100}%`,
                  bgcolor: color,
                  opacity: 0.7,
                  transition: 'width 350ms ease',
                }}
              />
            </Box>
          </Tooltip>
        </Stack>
      ))}
    </Stack>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────

export default function SimulationDetailPage() {
  const { id } = useParams();

  const [simulation, setSimulation] = useState<Simulation | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [decisionFilter, setDecisionFilter] = useState<DecisionFilter>('all');
  const [segmentFilter, setSegmentFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [exportError, setExportError] = useState<string | null>(null);
  const [reportMetadata, setReportMetadata] =
    useState<SimulationReportMetadata | null>(null);
  const [chartType, setChartType] = useState<ChartType>('donut');

  const loadSimulation = useCallback(async () => {
    if (!id) {
      setLoadError('Simulation id is missing.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setLoadError(null);
    try {
      const simulationPromise = fetchSimulationById(id);
      const reportMetadataPromise = fetchSimulationReportMetadata(id).catch(
        () => null,
      );
      const result = await simulationPromise;
      setSimulation(result);
      const meta = await reportMetadataPromise;
      setReportMetadata(meta);
    } catch (error) {
      setLoadError(
        error instanceof Error
          ? error.message
          : 'Failed to load simulation details.',
      );
      setSimulation(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadSimulation();
  }, [loadSimulation]);

  // ── Derived data ───────────────────────────────────────────────────────

  const decisionSeries = useMemo(() => {
    if (!simulation) return [];
    const counts = { accept: 0, reject: 0, maybe: 0 };
    for (const d of simulation.decisions) counts[d.decision]++;
    const total = Math.max(simulation.decisions.length, 1);
    return (['accept', 'reject', 'maybe'] as const).map((key) => ({
      key,
      label: DECISION_META[key].label,
      color: DECISION_META[key].color,
      count: counts[key],
      rate: counts[key] / total,
    }));
  }, [simulation]);

  const decisionGradient = useMemo(() => {
    if (decisionSeries.length === 0)
      return 'conic-gradient(#CFD8DC 0 100%)';
    let cursor = 0;
    const stops = decisionSeries.map((item) => {
      const start = cursor;
      cursor += item.rate * 100;
      return `${item.color} ${start}% ${cursor}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [decisionSeries]);

  const segmentOptions = useMemo(() => {
    const values = new Set(
      (simulation?.decisions ?? []).map((d) => d.segment),
    );
    return ['all', ...[...values].sort((a, b) => a.localeCompare(b))];
  }, [simulation]);

  const filteredDecisions = useMemo(() => {
    if (!simulation) return [];
    const needle = search.trim().toLowerCase();
    return simulation.decisions.filter((d) => {
      const dm = decisionFilter === 'all' || d.decision === decisionFilter;
      const sm = segmentFilter === 'all' || d.segment === segmentFilter;
      const tm =
        needle.length === 0 ||
        d.name.toLowerCase().includes(needle) ||
        d.reasons.join(' ').toLowerCase().includes(needle);
      return dm && sm && tm;
    });
  }, [simulation, decisionFilter, segmentFilter, search]);

  const objectionStats = useMemo(() => {
    if (!simulation) return [];
    // Prefer pre-computed objectionFrequency from summary, fall back to re-counting
    if (
      simulation.summary.objectionFrequency &&
      simulation.summary.objectionFrequency.length > 0
    ) {
      return simulation.summary.objectionFrequency.slice(0, 12);
    }
    const counts = new Map<string, number>();
    for (const d of simulation.decisions) {
      if (d.decision === 'accept') continue;
      for (const reason of d.reasons) {
        counts.set(reason, (counts.get(reason) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([label, count]) => ({ label, count }));
  }, [simulation]);

  // ── Export handlers ────────────────────────────────────────────────────

  const handleExportCsv = async () => {
    if (!simulation) return;
    setExportError(null);
    try {
      const meta = await downloadSimulationCsv(simulation.id);
      if (meta) {
        setReportMetadata((cur) =>
          cur ? { ...cur, ...meta } : cur,
        );
      }
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : 'Failed to download simulation CSV.',
      );
    }
  };

  const handleExportPdf = async () => {
    if (!simulation) return;
    setExportError(null);
    try {
      const meta = await downloadSimulationPdf(simulation.id);
      if (meta) {
        setReportMetadata((cur) =>
          cur ? { ...cur, ...meta } : cur,
        );
      }
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : 'Failed to download simulation PDF report.',
      );
    }
  };

  // ── Render guards ──────────────────────────────────────────────────────

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!simulation) {
    return (
      <Stack spacing={2}>
        <Button
          component={Link}
          to="/simulations"
          startIcon={<ArrowBack />}
          variant="text"
          sx={{ alignSelf: 'flex-start' }}
        >
          Back to Simulations
        </Button>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => void loadSimulation()}
            >
              Retry
            </Button>
          }
        >
          {loadError ?? 'Simulation not found.'}
        </Alert>
      </Stack>
    );
  }

  const { summary } = simulation;

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <Stack spacing={3}>
      {/* ── Page header ── */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
      >
        <Stack spacing={0.5}>
          <Button
            component={Link}
            to="/simulations"
            startIcon={<ArrowBack />}
            variant="text"
            sx={{ alignSelf: 'flex-start', px: 0 }}
          >
            Back to Simulations
          </Button>
          <Typography variant="h5" fontWeight={700}>
            Simulation Detail
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created {new Date(simulation.createdAt).toLocaleString()} ·{' '}
            Status: {simulation.status}
          </Typography>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          sx={{ rowGap: 1 }}
        >
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => void loadSimulation()}
            size="small"
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => void handleExportCsv()}
            size="small"
          >
            CSV
          </Button>
          <Button
            variant="outlined"
            startIcon={<PictureAsPdf />}
            onClick={() => void handleExportPdf()}
            size="small"
          >
            PDF
          </Button>
        </Stack>
      </Stack>

      {loadError && <Alert severity="warning">{loadError}</Alert>}
      {exportError && <Alert severity="error">{exportError}</Alert>}

      {/* ── Report metadata ── */}
      {reportMetadata && (
        <Card variant="outlined">
          <CardContent sx={{ py: '12px !important' }}>
            <Typography variant="subtitle2" gutterBottom>
              Report Metadata
            </Typography>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 0.4, sm: 2 }}
              flexWrap="wrap"
            >
              <Typography variant="caption" color="text.secondary">
                ID: {reportMetadata.reportId}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Schema: {reportMetadata.schemaVersion} · Template:{' '}
                {reportMetadata.templateVersion}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Hash: {reportMetadata.simulationSnapshotHash}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Generated:{' '}
                {new Date(reportMetadata.generatedAt).toLocaleString()}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ── Hypothesis KPI strip ── */}
      <Card>
        <CardHeader
          title="Hypothesis"
          subheader={`Simulation ID: ${simulation.id}`}
        />
        <Divider />
        <CardContent>
          <Typography
            variant="body1"
            sx={{ fontStyle: 'italic', mb: 2.5 }}
          >
            "{simulation.hypothesis}"
          </Typography>
          <Grid container spacing={2}>
            {[
              {
                label: 'Acceptance',
                value: toPercent(summary.acceptanceRate),
                color: DECISION_META.accept.color,
              },
              {
                label: 'Rejection',
                value: toPercent(summary.rejectionRate),
                color: DECISION_META.reject.color,
              },
              {
                label: 'Undecided',
                value: toPercent(summary.maybeRate),
                color: DECISION_META.maybe.color,
              },
              {
                label: 'Avg Confidence',
                value: toPercent(summary.averageConfidence),
                color: undefined,
              },
              {
                label: 'Total Personas',
                value: String(summary.totalPersonas),
                color: undefined,
              },
              {
                label: 'Avg Loop Depth',
                value: summary.avgLoopDepth?.toFixed(1) ?? 'N/A',
                color: undefined,
              },
              {
                label: 'Avg Sentiment',
                value: summary.avgSentimentScore?.toFixed(2) ?? 'N/A',
                color:
                  summary.avgSentimentScore !== undefined
                    ? summary.avgSentimentScore > 0.1
                      ? DECISION_META.accept.color
                      : summary.avgSentimentScore < -0.1
                        ? DECISION_META.reject.color
                        : undefined
                    : undefined,
              },
              {
                label: 'Price Anchor Hit',
                value: summary.priceAnchorHitRate !== undefined ? toPercent(summary.priceAnchorHitRate) : 'N/A',
                color: undefined,
              },
            ].map(({ label, value, color }) => (
              <Grid key={label} size={{ xs: 6, sm: 4, md: 3 }}>
                <Tooltip title={metricExplanations[label] || ''} placement="top">
                  <Stack direction="row" spacing={0.5} alignItems="center" sx={{ cursor: 'help', mb: 0.5, display: 'inline-flex' }}>
                    <Typography variant="caption" color="text.secondary">
                      {label}
                    </Typography>
                    <Info fontSize="inherit" sx={{ fontSize: 14, color: 'text.secondary', opacity: 0.7 }} />
                  </Stack>
                </Tooltip>
                <Typography
                  variant="h6"
                  fontWeight={700}
                  sx={{ color: color ?? 'text.primary' }}
                >
                  {value}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* ── Decision distribution + chart type switcher ── */}
      <Card>
        <CardHeader
          avatar={<Insights color="primary" />}
          title="Decision Distribution"
          action={
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={(_, val: ChartType | null) => {
                if (val) setChartType(val);
              }}
              size="small"
              sx={{ mr: 1 }}
            >
              <ToggleButton value="donut" aria-label="Donut chart">
                <Tooltip title="Donut chart">
                  <DonutLarge fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="bar" aria-label="Bar chart">
                <Tooltip title="Horizontal bar chart">
                  <BarChart fontSize="small" />
                </Tooltip>
              </ToggleButton>
              <ToggleButton value="stacked" aria-label="Stacked by segment">
                <Tooltip title="Stacked breakdown by segment">
                  <StackedBarChart fontSize="small" />
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          }
        />
        <Divider />
        <CardContent>
          {chartType === 'donut' && (
            <DonutChart
              series={decisionSeries}
              gradient={decisionGradient}
              total={simulation.decisions.length}
            />
          )}
          {chartType === 'bar' && (
            <HorizontalBarChart series={decisionSeries} />
          )}
          {chartType === 'stacked' && (
            <StackedBarDecisionChart
              segmentBreakdown={summary.segmentBreakdown ?? []}
            />
          )}
        </CardContent>
      </Card>

      {/* ── Confidence distribution ── */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Confidence Distribution"
              avatar={<Psychology color="primary" />}
            />
            <Divider />
            <CardContent>
              <ConfidenceDistributionCard
                buckets={
                  summary.confidenceDistribution?.length
                    ? summary.confidenceDistribution
                    : [
                        { label: '0–39%', min: 0, max: 0.39, count: 0, rate: 0 },
                        { label: '40–59%', min: 0.4, max: 0.59, count: 0, rate: 0 },
                        { label: '60–79%', min: 0.6, max: 0.79, count: 0, rate: 0 },
                        { label: '80–100%', min: 0.8, max: 1, count: 0, rate: 0 },
                      ]
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* ── Top reasons ── */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Top Reasons"
              avatar={<Science color="primary" />}
            />
            <Divider />
            <CardContent>
              <Stack spacing={2.5}>
                <ReasonsCard
                  title="Why they accepted"
                  reasons={summary.topAcceptReasons ?? []}
                  color={DECISION_META.accept.color}
                />
                <Divider />
                <ReasonsCard
                  title="Why they rejected"
                  reasons={summary.topRejectReasons ?? []}
                  color={DECISION_META.reject.color}
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* ── Segment breakdown (detail table) ── */}
      {summary.segmentBreakdown && summary.segmentBreakdown.length > 0 && (
        <Card>
          <CardHeader title="Segment Breakdown" />
          <Divider />
          <CardContent>
            <Stack spacing={1.5}>
              {summary.segmentBreakdown.map((seg) => (
                <Box
                  key={seg.segment}
                  sx={{ p: 1.5, borderRadius: 2, bgcolor: 'action.hover' }}
                >
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    spacing={1}
                    sx={{ mb: 1 }}
                  >
                    <Typography variant="subtitle2">{seg.segment}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {seg.total} personas · Avg confidence{' '}
                      {toPercent(seg.avgConfidence)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        flex: 1,
                        height: 9,
                        borderRadius: 999,
                        overflow: 'hidden',
                        display: 'flex',
                        bgcolor: 'rgba(255,255,255,0.6)',
                      }}
                    >
                      <Box
                        sx={{
                          width: `${seg.acceptRate * 100}%`,
                          bgcolor: DECISION_META.accept.color,
                        }}
                      />
                      <Box
                        sx={{
                          width: `${seg.rejectRate * 100}%`,
                          bgcolor: DECISION_META.reject.color,
                        }}
                      />
                      <Box
                        sx={{
                          width: `${seg.maybeRate * 100}%`,
                          bgcolor: DECISION_META.maybe.color,
                        }}
                      />
                    </Box>
                    <Typography
                      variant="caption"
                      sx={{ minWidth: 110, textAlign: 'right' }}
                    >
                      A:{seg.accept} R:{seg.reject} M:{seg.maybe}
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ── Objections ── */}
      <Card>
        <CardHeader
          title="Objection Frequency"
          avatar={<Science color="action" />}
        />
        <Divider />
        <CardContent>
          {objectionStats.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No objections detected.
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {objectionStats.map((obj) => {
                const label = 'label' in obj ? obj.label : obj.reason;
                const count = obj.count;
                return (
                  <Chip
                    key={label}
                    label={`${label} (${count})`}
                    variant="outlined"
                    sx={{ mb: 1 }}
                  />
                );
              })}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* ── Persona decisions list ── */}
      <Card>
        <CardHeader
          title="Persona Decisions"
          subheader={`Showing ${filteredDecisions.length} of ${simulation.decisions.length}`}
        />
        <Divider />
        <CardContent>
          {/* Filters */}
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            spacing={1}
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ mb: 2 }}
          >
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
              {(['all', 'accept', 'reject', 'maybe'] as const).map((value) => (
                <Chip
                  key={value}
                  label={
                    value === 'all' ? 'All' : DECISION_META[value].label
                  }
                  color={decisionFilter === value ? 'primary' : 'default'}
                  variant={decisionFilter === value ? 'filled' : 'outlined'}
                  onClick={() => setDecisionFilter(value)}
                />
              ))}
            </Stack>
            <Stack direction="row" spacing={1} sx={{ flex: 1 }}>
              <TextField
                value={segmentFilter}
                onChange={(e) => setSegmentFilter(e.target.value)}
                select
                size="small"
                label="Segment"
                sx={{ minWidth: { xs: 120, sm: 200 } }}
              >
                {segmentOptions.map((opt) => (
                  <MenuItem value={opt} key={opt}>
                    {opt === 'all' ? 'All segments' : opt}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                label="Search persona or reason"
                fullWidth
              />
            </Stack>
          </Stack>

          {filteredDecisions.length === 0 ? (
            <Alert severity="info">
              No decisions match your current filters.
            </Alert>
          ) : (
            <Stack spacing={1}>
              {filteredDecisions.map((decision) => (
                <Accordion
                  key={decision.personaId}
                  disableGutters
                  sx={{
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2,
                    '&:before': { display: 'none' },
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{ width: '100%', pr: 1 }}
                    >
                      <Avatar
                        sx={{
                          width: 34,
                          height: 34,
                          bgcolor: 'secondary.main',
                          fontSize: '0.85rem',
                          flexShrink: 0,
                        }}
                      >
                        {toInitials(decision.name)}
                      </Avatar>
                      <Stack sx={{ minWidth: 0, flex: 1 }}>
                        <Typography variant="subtitle2" noWrap>
                          {decision.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          noWrap
                        >
                          {decision.segment}
                          {decision.occupation
                            ? ` · ${decision.occupation}`
                            : ''}
                          {decision.location ? ` · ${decision.location}` : ''}
                          {decision.age ? ` · ${decision.age}y` : ''}
                        </Typography>
                      </Stack>
                      <Stack
                        direction="row"
                        spacing={0.8}
                        alignItems="center"
                        sx={{ flexShrink: 0 }}
                      >
                        <Tooltip
                          title={`Gut sentiment: ${decision.sentimentScore?.toFixed(2) ?? 'N/A'}`}
                        >
                          {sentimentIcon(decision.sentimentScore ?? 0)}
                        </Tooltip>
                        {decision.priceAnchorHit && (
                          <Tooltip title="Price within anchor tolerance">
                            <Chip
                              label="$✓"
                              size="small"
                              sx={{
                                fontSize: '0.65rem',
                                height: 18,
                                bgcolor: '#E8F5E9',
                                color: DECISION_META.accept.color,
                              }}
                            />
                          </Tooltip>
                        )}
                        <Chip
                          icon={DECISION_META[decision.decision].icon}
                          label={`${DECISION_META[decision.decision].label} (${Math.round(decision.confidence * 100)}%)`}
                          size="small"
                          sx={{
                            bgcolor: `${DECISION_META[decision.decision].color}1A`,
                            color: DECISION_META[decision.decision].color,
                            border: '1px solid',
                            borderColor: `${DECISION_META[decision.decision].color}55`,
                            '& .MuiChip-icon': {
                              color: DECISION_META[decision.decision].color,
                            },
                          }}
                        />
                      </Stack>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Stack spacing={1.5}>
                      {/* Persona demographics mini-strip */}
                      {(decision.income ||
                        decision.gender ||
                        decision.age) && (
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          useFlexGap
                        >
                          {decision.gender && (
                            <Chip
                              label={decision.gender}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: 'capitalize' }}
                            />
                          )}
                          {decision.age && (
                            <Chip
                              label={`${decision.age}y`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {decision.income && (
                            <Chip
                              label={`$${decision.income}k/yr`}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {decision.occupation && (
                            <Chip
                              label={decision.occupation}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          {decision.location && (
                            <Chip
                              label={decision.location}
                              size="small"
                              variant="outlined"
                            />
                          )}
                          <Chip
                            label={`Loops: ${decision.loopDepth}`}
                            size="small"
                            variant="outlined"
                          />
                          <Chip
                            label={`Sentiment: ${decision.sentimentScore?.toFixed(2) ?? 'N/A'}`}
                            size="small"
                            variant="outlined"
                          />
                        </Stack>
                      )}

                      <Box>
                        <Typography
                          variant="caption"
                          color="secondary"
                          fontWeight={700}
                        >
                          System 1 — Gut Reaction
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ fontStyle: 'italic', mt: 0.3 }}
                        >
                          "{decision.system1}"
                        </Typography>
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          color="primary"
                          fontWeight={700}
                        >
                          System 2 — Rational Analysis
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.3 }}>
                          {decision.system2}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {decision.reasons.map((reason) => (
                          <Chip
                            key={`${decision.personaId}-${reason}`}
                            label={reason}
                            size="small"
                            variant="outlined"
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Stack>
  );
}
