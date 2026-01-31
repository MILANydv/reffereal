/**
 * Performance tests: measure response time for critical API routes.
 * Assumes dev server is running at BASE_URL (default http://localhost:3000).
 * Set BASE_URL and optionally API_KEY, CAMPAIGN_ID for real requests, or skip when env not set.
 */

import { describe, it, expect } from 'vitest';

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const API_KEY = process.env.API_KEY;
const P95_THRESHOLD_MS = Number(process.env.P95_THRESHOLD_MS ?? 2000);
const SAMPLE_SIZE = Number(process.env.PERF_SAMPLE_SIZE ?? 10);

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

async function measureLatency(url: string, options?: RequestInit): Promise<number[]> {
  const times: number[] = [];
  for (let i = 0; i < SAMPLE_SIZE; i++) {
    const start = performance.now();
    try {
      await fetch(url, options);
    } catch {
      // ignore network errors for timing
    }
    times.push(performance.now() - start);
  }
  return times.sort((a, b) => a - b);
}

describe('API performance', () => {
  const skipNoServer = !API_KEY
    ? 'Set API_KEY (and optionally BASE_URL) to run performance tests against a running server'
    : undefined;

  it.skipIf(!!skipNoServer)(
    'GET /api/v1/stats p95 latency under threshold',
    async () => {
      const url = `${BASE_URL}/api/v1/stats`;
      const times = await measureLatency(url, {
        headers: { authorization: `Bearer ${API_KEY}` },
      });
      const p95 = percentile(times, 95);
      expect(p95).toBeLessThan(P95_THRESHOLD_MS);
    },
    { timeout: 60000 }
  );

  it.skipIf(!!skipNoServer)(
    'POST /api/v1/referrals p95 latency under threshold',
    async () => {
      const campaignId = process.env.CAMPAIGN_ID ?? 'camp_1';
      const url = `${BASE_URL}/api/v1/referrals`;
      const times = await measureLatency(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId,
          referrerId: `perf_user_${Date.now()}`,
        }),
      });
      const p95 = percentile(times, 95);
      expect(p95).toBeLessThan(P95_THRESHOLD_MS);
    },
    { timeout: 60000 }
  );
});
