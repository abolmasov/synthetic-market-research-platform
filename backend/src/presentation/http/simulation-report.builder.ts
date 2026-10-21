import { createHash } from 'crypto';
import PDFDocument from 'pdfkit';
import { Simulation } from '../../domain/simulation/simulation';

const toFiniteNumber = (value: unknown, fallback = 0): number => {
  const num = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(num) ? num : fallback;
};

const formatPercent = (value: unknown): string => {
  const numeric = toFiniteNumber(value, 0);
  return `${Math.round(numeric * 100)}%`;
};

// PDFKit's built-in fonts (Helvetica, etc.) are WinAnsi-encoded and will throw
// on many Unicode characters (common in LLM output). Keep this conservative:
// replace common typography and strip unsupported code points.
const normalizePdfText = (value: unknown): string => {
  const input =
    typeof value === 'string'
      ? value
      : value == null
        ? ''
        : typeof value === 'number' || typeof value === 'boolean'
          ? String(value)
          : JSON.stringify(value);

  return (
    input
      .normalize('NFKC')
      .replace(/\r\n?/g, '\n')
      .replace(/\u00A0/g, ' ')
      // Quotes
      .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
      .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
      // Dashes / ellipsis / bullets
      .replace(/[\u2010\u2011\u2012\u2013\u2014\u2015]/g, '-')
      .replace(/\u2026/g, '...')
      .replace(/[\u2022\u25E6\u2219]/g, '*')
      // Misc symbols that frequently appear in summaries
      .replace(/\u20AC/g, 'EUR') // Euro sign
      .replace(/[\u2713\u2714]/g, 'v')
      // Remove zero-width chars
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      // Strip everything outside Latin-1 (keeps common accents), and control chars
      // eslint-disable-next-line no-control-regex
      .replace(/[^\x09\x0A\x0D\x20-\x7E\xA0-\xFF]/g, '')
  );
};

const escapeCsvCell = (value: string | number): string =>
  `"${String(value).replaceAll('"', '""')}"`;

const truncate = (value: unknown, maxLength = 180): string => {
  const normalized = normalizePdfText(value);
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength - 3)}...`;
};

export const SIMULATION_REPORT_SCHEMA_VERSION = 'smr-report-v1';
export const SIMULATION_REPORT_TEMPLATE_VERSION = '1.2.0';

export type SimulationReportMetadata = {
  reportId: string;
  schemaVersion: string;
  templateVersion: string;
  generatedAt: string;
  generator: string;
  simulationId: string;
  simulationSnapshotHash: string;
  decisionCount: number;
};

const buildSimulationSnapshotHash = (simulation: Simulation): string => {
  const payload = {
    simulationId: simulation.id ?? null,
    hypothesis: simulation.hypothesis,
    hypothesisId: simulation.hypothesisId ?? null,
    status: simulation.status,
    summary: simulation.summary,
    decisions: simulation.decisions,
    ragSources: simulation.ragSources,
    topSignals: simulation.topSignals,
    objections: simulation.objections,
    createdAt: simulation.createdAt?.toISOString() ?? null,
    completedAt: simulation.completedAt?.toISOString() ?? null,
  };

  return createHash('sha256').update(JSON.stringify(payload)).digest('hex');
};

export const createSimulationReportMetadata = (
  simulation: Simulation,
): SimulationReportMetadata => {
  const simulationId = simulation.id ?? 'unknown-simulation';
  const simulationSnapshotHash = buildSimulationSnapshotHash(simulation);
  const versionTag = SIMULATION_REPORT_TEMPLATE_VERSION.replaceAll('.', '_');
  const reportId = `${simulationId}-${versionTag}-${simulationSnapshotHash.slice(0, 12)}`;

  return {
    reportId,
    schemaVersion: SIMULATION_REPORT_SCHEMA_VERSION,
    templateVersion: SIMULATION_REPORT_TEMPLATE_VERSION,
    generatedAt: new Date().toISOString(),
    generator: 'smr-platform-backend',
    simulationId,
    simulationSnapshotHash,
    decisionCount: simulation.decisions.length,
  };
};

export const buildSimulationCsv = (
  simulation: Simulation,
  metadata: SimulationReportMetadata,
): string => {
  const header = [
    'report_id',
    'report_schema_version',
    'report_template_version',
    'report_generated_at',
    'report_snapshot_hash',
    'simulation_id',
    'hypothesis',
    'status',
    'created_at',
    'completed_at',
    'acceptance_rate',
    'rejection_rate',
    'maybe_rate',
    'average_confidence',
    'total_personas',
    'persona_id',
    'persona_name',
    'segment',
    'decision',
    'confidence_percent',
    'loop_depth',
    'system_1',
    'system_2',
    'reasons',
  ];

  const rows = simulation.decisions.map((decision) => [
    metadata.reportId,
    metadata.schemaVersion,
    metadata.templateVersion,
    metadata.generatedAt,
    metadata.simulationSnapshotHash,
    simulation.id ?? '',
    simulation.hypothesis,
    simulation.status,
    simulation.createdAt?.toISOString() ?? '',
    simulation.completedAt?.toISOString() ?? '',
    formatPercent(simulation.summary.acceptanceRate),
    formatPercent(simulation.summary.rejectionRate),
    formatPercent(simulation.summary.maybeRate),
    formatPercent(simulation.summary.averageConfidence),
    simulation.summary.totalPersonas,
    decision.personaId,
    decision.name,
    decision.segment,
    decision.decision,
    Math.round(decision.confidence * 100),
    decision.loopDepth,
    decision.system1,
    decision.system2,
    decision.reasons.join(' | '),
  ]);

  return [header, ...rows]
    .map((row) => row.map((cell) => escapeCsvCell(cell)).join(','))
    .join('\n');
};

export const buildSimulationPdf = async (
  simulation: Simulation,
  metadata: SimulationReportMetadata,
): Promise<Buffer> => {
  const brand = {
    primary: '#0F6B5B',
    secondary: '#F29F05',
    ink: '#0F172A',
    muted: '#475569',
    panel: '#EAF4F2',
  };

  const doc = new PDFDocument({
    margin: 48,
    size: 'A4',
    info: {
      Title: `Simulation Report ${simulation.id ?? ''}`,
      Author: 'Synthetic Market Research Platform',
      Subject: 'Synthetic Market Research Simulation Report',
      Keywords: `${metadata.schemaVersion},${metadata.templateVersion},${metadata.reportId}`,
    },
  });

  const chunks: Buffer[] = [];
  const finished = new Promise<Buffer>((resolve, reject) => {
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);
  });

  const decisions = Array.isArray(simulation.decisions)
    ? simulation.decisions
    : [];
  const topSignals = Array.isArray(simulation.topSignals)
    ? simulation.topSignals
    : [];
  const objections = Array.isArray(simulation.objections)
    ? simulation.objections
    : [];
  const total = Math.max(decisions.length, 1);
  const decisionCounts = decisions.reduce(
    (acc, decision) => {
      if (decision?.decision === 'accept') acc.accept += 1;
      if (decision?.decision === 'reject') acc.reject += 1;
      if (decision?.decision === 'maybe') acc.maybe += 1;
      return acc;
    },
    { accept: 0, reject: 0, maybe: 0 },
  );

  let pageIndex = 1;
  const headerHeight = 72;
  const footerHeight = 24;

  const drawPageChrome = () => {
    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.save();
    doc.rect(0, 0, pageWidth, headerHeight).fill(brand.primary);
    doc
      .fillColor('white')
      .font('Helvetica-Bold')
      .fontSize(15)
      .text(
        normalizePdfText('Synthetic Market Research Platform'),
        doc.page.margins.left,
        22,
      );
    doc
      .font('Helvetica')
      .fontSize(9)
      .text(
        normalizePdfText(
          `Simulation Report | Template ${metadata.templateVersion}`,
        ),
        doc.page.margins.left,
        42,
      );
    doc.restore();

    doc.save();
    const compactId =
      metadata.reportId.length > 28
        ? `${metadata.reportId.slice(0, 18)}...${metadata.reportId.slice(-6)}`
        : metadata.reportId;
    doc
      .fillColor(brand.muted)
      .font('Helvetica')
      .fontSize(8)
      .text(
        normalizePdfText(
          `Report ID: ${compactId} | Snapshot: ${metadata.simulationSnapshotHash.slice(0, 12)}... | Page ${pageIndex}`,
        ),
        doc.page.margins.left,
        pageHeight - footerHeight,
        {
          width: pageWidth - doc.page.margins.left - doc.page.margins.right,
          align: 'left',
          lineBreak: false,
        },
      );
    doc.restore();

    doc.fillColor(brand.ink);
    doc.x = doc.page.margins.left;
    doc.y = headerHeight + 16;
  };

  const addReportPage = () => {
    doc.addPage();
    pageIndex += 1;
    drawPageChrome();
  };

  const ensureSpace = (height = 56) => {
    const bottomLimit =
      doc.page.height - doc.page.margins.bottom - footerHeight - 8;
    if (doc.y + height > bottomLimit) {
      addReportPage();
    }
  };

  const segmentCounts = new Map<string, number>();
  for (const decision of decisions) {
    segmentCounts.set(
      decision.segment,
      (segmentCounts.get(decision.segment) ?? 0) + 1,
    );
  }

  const topSegments = [...segmentCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const sectionHeader = (text: string) => {
    ensureSpace(34);
    doc.moveDown(0.8);
    doc
      .font('Helvetica-Bold')
      .fontSize(12)
      .fillColor(brand.primary)
      .text(normalizePdfText(text));
    doc
      .moveDown(0.2)
      .lineWidth(0.8)
      .strokeColor('#CFE4E0')
      .moveTo(doc.page.margins.left, doc.y)
      .lineTo(doc.page.width - doc.page.margins.right, doc.y)
      .stroke();
    doc.moveDown(0.3);
    doc.fillColor(brand.ink);
  };

  const drawMetricCard = (
    label: string,
    value: string,
    x: number,
    y: number,
  ) => {
    const width = 118;
    const height = 50;
    doc.save();
    doc.roundedRect(x, y, width, height, 8).fill(brand.panel);
    doc
      .fillColor(brand.muted)
      .font('Helvetica')
      .fontSize(8)
      .text(normalizePdfText(label), x + 10, y + 8, { width: width - 20 });
    doc
      .fillColor(brand.primary)
      .font('Helvetica-Bold')
      .fontSize(13)
      .text(normalizePdfText(value), x + 10, y + 23, { width: width - 20 });
    doc.restore();
  };

  drawPageChrome();

  doc
    .font('Helvetica-Bold')
    .fontSize(20)
    .fillColor(brand.ink)
    .text(normalizePdfText('Simulation Report'));
  doc
    .font('Helvetica')
    .fontSize(10)
    .fillColor(brand.muted)
    .text(normalizePdfText(`Simulation ID: ${simulation.id ?? 'n/a'}`))
    .text(
      normalizePdfText(
        `Generated: ${new Date(metadata.generatedAt).toLocaleString()}`,
      ),
    )
    .text(
      normalizePdfText(
        `Created: ${simulation.createdAt?.toLocaleString() ?? 'n/a'}`,
      ),
    )
    .text(normalizePdfText(`Status: ${simulation.status}`))
    .text(normalizePdfText(`Report ID: ${metadata.reportId}`))
    .text(normalizePdfText(`Snapshot Hash: ${metadata.simulationSnapshotHash}`))
    .fillColor(brand.ink);

  ensureSpace(70);
  const metricsY = doc.y + 8;
  const metricsX = doc.page.margins.left;
  drawMetricCard(
    'Acceptance',
    formatPercent(
      (simulation.summary as unknown as { acceptanceRate?: unknown })
        ?.acceptanceRate,
    ),
    metricsX,
    metricsY,
  );
  drawMetricCard(
    'Avg Confidence',
    formatPercent(
      (simulation.summary as unknown as { averageConfidence?: unknown })
        ?.averageConfidence,
    ),
    metricsX + 126,
    metricsY,
  );
  drawMetricCard(
    'Total Personas',
    `${toFiniteNumber((simulation.summary as unknown as { totalPersonas?: unknown })?.totalPersonas, 0)}`,
    metricsX + 252,
    metricsY,
  );
  drawMetricCard(
    'Avg Loop Depth',
    toFiniteNumber(
      (simulation.summary as unknown as { avgLoopDepth?: unknown })
        ?.avgLoopDepth,
      0,
    ).toFixed(1),
    metricsX + 378,
    metricsY,
  );
  doc.y = metricsY + 58;

  sectionHeader('Hypothesis');
  ensureSpace(50);
  doc
    .font('Helvetica')
    .fontSize(11)
    .text(truncate(simulation.hypothesis, 1200), { width: 500 });

  sectionHeader('Summary Metrics');
  ensureSpace(60);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(
      normalizePdfText(
        `Acceptance Rate: ${formatPercent(
          (simulation.summary as unknown as { acceptanceRate?: unknown })
            ?.acceptanceRate,
        )}`,
      ),
    )
    .text(
      normalizePdfText(
        `Rejection Rate: ${formatPercent(
          (simulation.summary as unknown as { rejectionRate?: unknown })
            ?.rejectionRate,
        )}`,
      ),
    )
    .text(
      normalizePdfText(
        `Maybe Rate: ${formatPercent(
          (simulation.summary as unknown as { maybeRate?: unknown })?.maybeRate,
        )}`,
      ),
    )
    .text(
      normalizePdfText(
        `Average Confidence: ${formatPercent(
          (simulation.summary as unknown as { averageConfidence?: unknown })
            ?.averageConfidence,
        )}`,
      ),
    )
    .text(
      normalizePdfText(
        `Average Loop Depth: ${toFiniteNumber(
          (simulation.summary as unknown as { avgLoopDepth?: unknown })
            ?.avgLoopDepth,
          0,
        ).toFixed(1)}`,
      ),
    )
    .text(
      normalizePdfText(
        `Total Personas: ${toFiniteNumber(
          (simulation.summary as unknown as { totalPersonas?: unknown })
            ?.totalPersonas,
          0,
        )}`,
      ),
    );

  sectionHeader('Decision Distribution');
  ensureSpace(52);
  doc
    .font('Helvetica')
    .fontSize(10)
    .text(
      normalizePdfText(
        `Accept: ${decisionCounts.accept} (${formatPercent(decisionCounts.accept / total)})`,
      ),
    )
    .text(
      normalizePdfText(
        `Reject: ${decisionCounts.reject} (${formatPercent(decisionCounts.reject / total)})`,
      ),
    )
    .text(
      normalizePdfText(
        `Maybe: ${decisionCounts.maybe} (${formatPercent(decisionCounts.maybe / total)})`,
      ),
    );

  sectionHeader('Top Segments');
  ensureSpace(48);
  if (topSegments.length === 0) {
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(normalizePdfText('No segment data available.'));
  } else {
    for (const [segment, count] of topSegments) {
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(
          normalizePdfText(
            `- ${truncate(segment, 80)}: ${count} personas (${formatPercent(count / total)})`,
          ),
        );
    }
  }

  sectionHeader('Top Signals');
  ensureSpace(48);
  if (topSignals.length === 0) {
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(normalizePdfText('No dominant signals available.'));
  } else {
    for (const signal of topSignals.slice(0, 8)) {
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(normalizePdfText(`- ${truncate(signal, 160)}`));
    }
  }

  sectionHeader('Top Objections');
  ensureSpace(48);
  if (objections.length === 0) {
    doc
      .font('Helvetica')
      .fontSize(10)
      .text(normalizePdfText('No objections were recorded.'));
  } else {
    for (const objection of objections.slice(0, 8)) {
      doc
        .font('Helvetica')
        .fontSize(10)
        .text(normalizePdfText(`- ${truncate(objection, 160)}`));
    }
  }

  sectionHeader('Persona Decisions (sample)');
  for (const decision of decisions.slice(0, 20)) {
    ensureSpace(78);

    doc
      .font('Helvetica-Bold')
      .fontSize(10)
      .fillColor(brand.primary)
      .text(
        normalizePdfText(
          `${truncate(decision.name, 60)} (${truncate(decision.segment, 60)}) - ${String(decision.decision).toUpperCase()} ${Math.round(toFiniteNumber(decision.confidence, 0) * 100)}%`,
        ),
      );
    doc
      .font('Helvetica')
      .fontSize(9)
      .fillColor(brand.ink)
      .text(normalizePdfText(`System 1: ${truncate(decision.system1, 220)}`))
      .text(normalizePdfText(`System 2: ${truncate(decision.system2, 220)}`))
      .text(
        normalizePdfText(
          `Reasons: ${truncate(
            Array.isArray(decision.reasons)
              ? decision.reasons
                  .map((reason) => normalizePdfText(reason))
                  .join('; ')
              : '',
            220,
          )}`,
        ),
      );
    doc.moveDown(0.4);
  }

  doc.end();
  return finished;
};
