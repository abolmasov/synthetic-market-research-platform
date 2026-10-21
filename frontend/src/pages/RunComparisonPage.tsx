import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import EmojiEvents from '@mui/icons-material/EmojiEvents';
import OpenInNew from '@mui/icons-material/OpenInNew';
import { Link, useParams } from 'react-router-dom';
import { getHypothesis } from '../api/hypotheses';
import { getRun } from '../api/runs';
import { fetchSimulationById } from '../api/simulations';
import { fetchVariants } from '../api/variants';
import type {
  Hypothesis,
  HypothesisMetric,
  Run,
  Simulation,
  Variant,
  VerificationDirection,
} from '../types';

type ComparisonRow = {
  variant: Variant;
  simulation: Simulation;
  score: number;
};

const metricLabel = (metric: HypothesisMetric): string => {
  if (metric === 'acceptanceRate') return 'Acceptance Rate';
  if (metric === 'rejectionRate') return 'Rejection Rate';
  if (metric === 'maybeRate') return 'Maybe Rate';
  if (metric === 'averageConfidence') return 'Average Confidence';
  return 'Price Anchor Hit Rate';
};

const toPercent = (value: number): string => `${Math.round(value * 100)}%`;

export default function RunComparisonPage() {
  const { id } = useParams();
  const [run, setRun] = useState<Run | null>(null);
  const [hypothesis, setHypothesis] = useState<Hypothesis | null>(null);
  const [rows, setRows] = useState<ComparisonRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        setError('Run id is missing.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedRun = await getRun(id);
        setRun(fetchedRun);

        const [fetchedHypothesis, variantPage] = await Promise.all([
          getHypothesis(fetchedRun.hypothesisId),
          fetchVariants(fetchedRun.hypothesisId, 1, 100),
        ]);
        setHypothesis(fetchedHypothesis);

        const simulationMapRaw = fetchedRun.config['simulationMap'];
        const simulationMap: Record<string, string> =
          simulationMapRaw &&
          typeof simulationMapRaw === 'object' &&
          !Array.isArray(simulationMapRaw)
            ? Object.fromEntries(
                Object.entries(simulationMapRaw).filter(
                  (entry): entry is [string, string] =>
                    typeof entry[1] === 'string',
                ),
              )
            : {};

        const variantsById = new Map<string, Variant>(
          variantPage.data.map((variant) => [variant.id, variant]),
        );

        const rowData = await Promise.all(
          Object.entries(simulationMap).map(async ([variantId, simulationId]) => {
            const simulation = await fetchSimulationById(simulationId);
            const variant = variantsById.get(variantId);
            if (!variant) {
              throw new Error(`Variant ${variantId} not found for comparison`);
            }

            const metric =
              fetchedHypothesis.primaryMetric ?? ('acceptanceRate' as HypothesisMetric);

            return {
              variant,
              simulation,
              score: simulation.summary[metric] ?? 0,
            };
          }),
        );

        setRows(rowData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to load run comparison.',
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  const ranking = useMemo(() => {
    if (!hypothesis) {
      return [];
    }

    const direction =
      hypothesis.primaryMetricDirection ?? ('at_least' as VerificationDirection);
    return [...rows].sort((a, b) =>
      direction === 'at_most' ? a.score - b.score : b.score - a.score,
    );
  }, [hypothesis, rows]);

  const winnerVariantId = useMemo(() => {
    if (!run) {
      return null;
    }

    const explicitWinner = run.config['winnerVariantId'];
    if (typeof explicitWinner === 'string') {
      return explicitWinner;
    }

    return ranking[0]?.variant.id ?? null;
  }, [run, ranking]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !run || !hypothesis) {
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
        <Alert severity="error">{error ?? 'Run comparison not found.'}</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={3}>
      <Button
        component={Link}
        to="/simulations"
        startIcon={<ArrowBack />}
        variant="text"
        sx={{ alignSelf: 'flex-start', px: 0 }}
      >
        Back to Simulations
      </Button>

      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={700}>
          Variant Comparison
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Primary metric: {metricLabel(hypothesis.primaryMetric ?? 'acceptanceRate')}{' '}
          {hypothesis.primaryMetricDirection === 'at_most' ? '(lower is better)' : '(higher is better)'}
          {hypothesis.primaryMetricThreshold !== null
            ? ` · threshold ${hypothesis.primaryMetricThreshold.toFixed(2)}`
            : ''}
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip label={`Decision: ${hypothesis.decisionOutcome.toUpperCase()}`} />
          {hypothesis.decisionReason && (
            <Chip label={hypothesis.decisionReason} variant="outlined" />
          )}
        </Stack>
      </Stack>

      {ranking.length === 0 ? (
        <Alert severity="warning">No simulations were attached to this run.</Alert>
      ) : (
        <Stack spacing={2}>
          {ranking.map((row, index) => {
            const isWinner = row.variant.id === winnerVariantId;
            return (
              <Card key={row.variant.id} variant="outlined">
                <CardContent>
                  <Stack spacing={1.5}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      spacing={1}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle1" fontWeight={700}>
                          {row.variant.name}
                        </Typography>
                        {isWinner && (
                          <Chip
                            icon={<EmojiEvents />}
                            label="Winner"
                            color="success"
                            size="small"
                          />
                        )}
                        {!isWinner && (
                          <Chip label={`#${index + 1}`} size="small" variant="outlined" />
                        )}
                      </Stack>
                      <Button
                        component={Link}
                        to={`/simulations/${row.simulation.id}`}
                        size="small"
                        variant="outlined"
                        endIcon={<OpenInNew fontSize="small" />}
                      >
                        Detail
                      </Button>
                    </Stack>

                    <Typography variant="body2" color="text.secondary">
                      {row.variant.changeSummary}
                    </Typography>

                    <Divider />

                    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                      <Chip
                        label={`${metricLabel(hypothesis.primaryMetric ?? 'acceptanceRate')}: ${toPercent(row.score)}`}
                        color={isWinner ? 'success' : 'default'}
                      />
                      <Chip
                        label={`Acceptance: ${toPercent(row.simulation.summary.acceptanceRate)}`}
                        variant="outlined"
                      />
                      <Chip
                        label={`Rejection: ${toPercent(row.simulation.summary.rejectionRate)}`}
                        variant="outlined"
                      />
                      <Chip
                        label={`Confidence: ${toPercent(row.simulation.summary.averageConfidence)}`}
                        variant="outlined"
                      />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}
