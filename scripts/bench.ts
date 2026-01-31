/**
 * Lightweight benchmark script for critical API routes.
 * Run with: npx tsx scripts/bench.ts
 * Requires BASE_URL and API_KEY (and CAMPAIGN_ID for referrals) in env.
 */

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000';
const API_KEY = process.env.API_KEY;
const N = Number(process.env.BENCH_N ?? 20);

function percentile(sorted: number[], p: number): number {
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)] ?? 0;
}

async function bench(name: string, fn: () => Promise<Response>): Promise<void> {
  const times: number[] = [];
  for (let i = 0; i < N; i++) {
    const start = performance.now();
    await fn();
    times.push(performance.now() - start);
  }
  times.sort((a, b) => a - b);
  const p50 = percentile(times, 50);
  const p95 = percentile(times, 95);
  const p99 = percentile(times, 99);
  console.log(`${name}: p50=${p50.toFixed(0)}ms p95=${p95.toFixed(0)}ms p99=${p99.toFixed(0)}ms`);
}

async function main() {
  if (!API_KEY) {
    console.log('Set API_KEY (and optionally BASE_URL, CAMPAIGN_ID, BENCH_N) to run benchmark.');
    process.exit(0);
    return;
  }
  const campaignId = process.env.CAMPAIGN_ID ?? 'camp_1';
  console.log(`Benchmarking ${BASE_URL} (n=${N})...`);

  await bench('GET /api/v1/stats', () =>
    fetch(`${BASE_URL}/api/v1/stats`, {
      headers: { authorization: `Bearer ${API_KEY}` },
    })
  );
  await bench('POST /api/v1/referrals', () =>
    fetch(`${BASE_URL}/api/v1/referrals`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignId,
        referrerId: `bench_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      }),
    })
  );
  console.log('Done.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
