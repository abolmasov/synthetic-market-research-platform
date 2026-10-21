#!/usr/bin/env npx ts-node
/**
 * RAG Retrieval Evaluation Harness
 *
 * Runs benchmark queries against the RAG API and computes retrieval quality metrics.
 * Requires: Backend running (npm run start:dev) and valid JWT.
 *
 * Usage:
 *   npx ts-node scripts/rag-evaluation.ts
 *   RAG_EVAL_API_URL=http://localhost:3003 RAG_EVAL_TOKEN=<jwt> npx ts-node scripts/rag-evaluation.ts
 *
 * Get a token: POST /auth/login or POST /auth/register, then use the returned access_token.
 */

import * as fs from 'fs';
import * as path from 'path';

const API_URL = process.env.RAG_EVAL_API_URL ?? 'http://localhost:3003';
const TOKEN = process.env.RAG_EVAL_TOKEN ?? '';

type BenchmarkQuery = {
  id: string;
  hypothesis: string;
  expectedKeywords: string[];
  expectedDocumentTitles: string[];
};

type BenchmarkFile = {
  description: string;
  queries: BenchmarkQuery[];
};

type RagSource = {
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
};

function loadBenchmark(): BenchmarkFile {
  const p = path.join(__dirname, 'benchmark-queries.json');
  const raw = fs.readFileSync(p, 'utf-8');
  return JSON.parse(raw) as BenchmarkFile;
}

async function queryRag(hypothesis: string): Promise<RagSource[]> {
  const res = await fetch(`${API_URL}/rag/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}),
    },
    body: JSON.stringify({ hypothesis }),
  });

  if (!res.ok) {
    throw new Error(`RAG query failed: ${res.status} ${res.statusText}`);
  }

  return res.json() as Promise<RagSource[]>;
}

function computeMetrics(
  query: BenchmarkQuery,
  results: RagSource[],
): {
  keywordHit: boolean;
  keywordPrecision: number;
  documentHit: boolean;
  documentPrecision: number;
  avgRelevance: number;
  topRelevance: number;
  resultCount: number;
} {
  const resultCount = results.length;
  const avgRelevance =
    resultCount > 0
      ? results.reduce((s, r) => s + r.relevanceScore, 0) / resultCount
      : 0;
  const topRelevance = resultCount > 0 ? results[0].relevanceScore : 0;

  const combinedText = results
    .map((r) => `${r.title} ${r.snippet}`)
    .join(' ')
    .toLowerCase();

  let keywordHits = 0;
  for (const kw of query.expectedKeywords) {
    if (combinedText.includes(kw.toLowerCase())) {
      keywordHits++;
    }
  }
  const keywordHit = keywordHits > 0;
  const keywordPrecision =
    query.expectedKeywords.length > 0
      ? keywordHits / query.expectedKeywords.length
      : 1;

  let docHits = 0;
  for (const title of query.expectedDocumentTitles) {
    if (results.some((r) => r.title === title)) {
      docHits++;
    }
  }
  const documentHit = docHits > 0;
  const documentPrecision =
    query.expectedDocumentTitles.length > 0
      ? docHits / query.expectedDocumentTitles.length
      : 1;

  return {
    keywordHit,
    keywordPrecision,
    documentHit,
    documentPrecision,
    avgRelevance,
    topRelevance,
    resultCount,
  };
}

async function main(): Promise<void> {
  if (!TOKEN) {
    console.error(
      'RAG_EVAL_TOKEN is required. Get a JWT via POST /auth/login or /auth/register.',
    );
    console.error(
      'Example: RAG_EVAL_TOKEN=eyJ... npx ts-node scripts/rag-evaluation.ts',
    );
    process.exit(1);
  }

  const benchmark = loadBenchmark();
  console.log(`\nRAG Evaluation Harness`);
  console.log(`API: ${API_URL}`);
  console.log(`Queries: ${benchmark.queries.length}`);
  console.log('---\n');

  const allMetrics: ReturnType<typeof computeMetrics>[] = [];
  let passed = 0;
  let failed = 0;

  for (const q of benchmark.queries) {
    try {
      const results = await queryRag(q.hypothesis);
      const m = computeMetrics(q, results);
      allMetrics.push(m);

      const ok = m.keywordHit || m.documentHit;
      if (ok) passed++;
      else failed++;

      const status = ok ? 'PASS' : 'FAIL';
      console.log(`[${status}] ${q.id}`);
      console.log(
        `  Hypothesis: "${q.hypothesis.slice(0, 60)}..."`,
      );
      console.log(
        `  Results: ${m.resultCount} | Top relevance: ${m.topRelevance.toFixed(4)} | Avg: ${m.avgRelevance.toFixed(4)}`,
      );
      console.log(
        `  Keyword hit: ${m.keywordHit} (${(m.keywordPrecision * 100).toFixed(0)}%) | Doc hit: ${m.documentHit} (${(m.documentPrecision * 100).toFixed(0)}%)`,
      );
      if (results.length > 0) {
        console.log(`  Top result: "${results[0].title}"`);
      }
      console.log('');
    } catch (err) {
      failed++;
      console.error(`[ERROR] ${q.id}: ${err}`);
      console.log('');
    }
  }

  const total = benchmark.queries.length;
  const keywordHitRate =
    allMetrics.filter((m) => m.keywordHit).length / total;
  const docHitRate = allMetrics.filter((m) => m.documentHit).length / total;
  const avgRelevanceOverall =
    allMetrics.length > 0
      ? allMetrics.reduce((s, m) => s + m.avgRelevance, 0) / allMetrics.length
      : 0;
  const avgTopRelevance =
    allMetrics.length > 0
      ? allMetrics.reduce((s, m) => s + m.topRelevance, 0) / allMetrics.length
      : 0;

  console.log('---');
  console.log('Summary');
  console.log(`  Passed: ${passed}/${total}`);
  console.log(`  Failed: ${failed}/${total}`);
  console.log(`  Keyword hit rate: ${(keywordHitRate * 100).toFixed(1)}%`);
  console.log(`  Document hit rate: ${(docHitRate * 100).toFixed(1)}%`);
  console.log(`  Avg top relevance: ${avgTopRelevance.toFixed(4)}`);
  console.log(`  Avg relevance (all results): ${avgRelevanceOverall.toFixed(4)}`);
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

main();
