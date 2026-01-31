# API Testing Guide

This guide provides examples for testing the Referral Infrastructure MVP API endpoints, plus automated test suite details, performance testing, and a full test report.

---

## Test Suite Overview (Tests Conducted)

The project includes automated tests across four categories:

| Category | Purpose | Location | Run command |
|----------|---------|----------|--------------|
| **Unit tests** | Route handlers, middleware, auth, validation, status codes (mocked DB/auth) | `tests/api/`, `tests/lib/` | `npm run test` |
| **Performance tests** | Latency (p50/p95/p99) for critical routes; SLO threshold checks | `tests/performance/`, `scripts/bench.ts` | `npm run test` (skips without API_KEY) or `npx tsx scripts/bench.ts` |
| **DB query tests** | Query count and N+1 checks against a test database | `tests/db/` | `DATABASE_URL_TEST=... npm run test -- tests/db` |
| **Load tests (Artillery)** | Throughput, error rate, p95 under ramp/sustained/spike | `artillery/v1-flow.yml` | `npm run test:load` |

### Unit tests conducted

- **API middleware** (`tests/lib/api-middleware.test.ts`): `authenticateApiKey` (missing/invalid header, invalid key, suspended app/partner, rate limit 429, success), `logApiUsage` (create + update calls). **8 tests**
- **v1 API** (`tests/api/v1/`): POST clicks, referrals, conversions; GET stats. Success, 400/401/403/404/500, validation, auth. **24 tests**
- **Auth** (`tests/api/auth/`): POST signup, GET verify-email, POST forgot-password. Validation, duplicates, redirects, generic reset message. **11 tests**
- **Partner** (`tests/api/partner/`): GET dashboard-stats, GET campaigns. Session auth, appId, pagination. **8 tests**
- **Admin** (`tests/api/admin/`): GET stats. SUPER_ADMIN role, aggregates. **2 tests**
- **User** (`tests/api/user/`): GET/PATCH profile. Session auth, email-in-use. **6 tests**

**Total unit tests: 59 passed.** Performance and DB query suites add 3 tests (skipped when env not set).

---

## Running the Test Suite

```bash
# Install dependencies (use legacy peer deps)
npm ci --legacy-peer-deps

# Run all tests (unit + performance + DB query; performance/DB skip without env)
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage
```

Environment variables used by optional tests:

- **Performance:** `BASE_URL`, `API_KEY`, `CAMPAIGN_ID`, `P95_THRESHOLD_MS`, `PERF_SAMPLE_SIZE`
- **DB query:** `DATABASE_URL_TEST` (test database URL)
- **Artillery:** `BASE_URL`, `API_KEY`, `CAMPAIGN_ID`

---

## Performance Testing

### Vitest performance tests (`tests/performance/api-latency.test.ts`)

- Send multiple requests to GET /api/v1/stats and POST /api/v1/referrals.
- Compute p95 latency and assert it is under `P95_THRESHOLD_MS` (default 2000 ms).
- **Skipped** when `API_KEY` is not set.

```bash
export API_KEY=your_key CAMPAIGN_ID=your_campaign
npm run test -- --run tests/performance
```

### Benchmark script (`scripts/bench.ts`)

- Quick p50/p95/p99 for GET /api/v1/stats and POST /api/v1/referrals.
- Requires `API_KEY` and optionally `BASE_URL`, `CAMPAIGN_ID`, `BENCH_N` (default 20).

```bash
export API_KEY=your_key CAMPAIGN_ID=your_campaign
npx tsx scripts/bench.ts
```

### Performance report (example)

When run with valid `API_KEY` and server:

- **GET /api/v1/stats:** p95 &lt; threshold (e.g. 2000 ms).
- **POST /api/v1/referrals:** p95 &lt; threshold.
- **Bench script:** Prints p50, p95, p99 per endpoint.

---

## Full Test Report

### Summary

| Metric | Value |
|--------|--------|
| Test files (total) | 14 |
| Test files (run by default) | 12 passed, 2 skipped |
| Tests (total) | 62 |
| Tests (passed) | 59 |
| Tests (skipped) | 3 (performance when no API_KEY, DB when no DATABASE_URL_TEST) |
| Runner | Vitest |
| Default duration | ~2–3 s |

### Coverage by area

| Area | Files | Tests | Notes |
|------|--------|-------|--------|
| API middleware | 1 | 8 | Auth, rate limit, log usage |
| v1 (referrals, clicks, conversions, stats) | 4 | 24 | All methods, errors, validation |
| Auth (signup, verify-email, forgot-password) | 3 | 11 | Redirects, validation, security |
| Partner (dashboard-stats, campaigns) | 2 | 8 | Session, appId, pagination |
| Admin (stats) | 1 | 2 | Role, aggregates |
| User (profile) | 1 | 6 | GET/PATCH, email uniqueness |
| Performance | 1 | 2 skipped* | Latency thresholds |
| DB query | 1 | 1 skipped* | Query count (needs test DB) |

\*Skipped unless required env vars are set.

### Sample test run output

```
 RUN  v2.x.x
 ✓ tests/lib/api-middleware.test.ts (8 tests)
 ✓ tests/api/v1/clicks.test.ts (6 tests)
 ✓ tests/api/v1/referrals.test.ts (7 tests)
 ✓ tests/api/v1/conversions.test.ts (7 tests)
 ✓ tests/api/v1/stats.test.ts (4 tests)
 ✓ tests/api/auth/signup.test.ts (4 tests)
 ✓ tests/api/auth/verify-email.test.ts (3 tests)
 ✓ tests/api/auth/forgot-password.test.ts (4 tests)
 ✓ tests/api/partner/dashboard-stats.test.ts (4 tests)
 ✓ tests/api/partner/campaigns.test.ts (4 tests)
 ✓ tests/api/admin/stats.test.ts (2 tests)
 ✓ tests/api/user/profile.test.ts (6 tests)
 Test Files  12 passed | 2 skipped (14)
      Tests  59 passed | 3 skipped (62)
   Duration  ~2–3s
```

### Load test report (Artillery)

- **Scenarios:** v1 referral flow (referrals → clicks → conversions), v1 stats read.
- **Phases:** Ramp-up (30 s), sustained (60 s), spike (20 s).
- **Thresholds:** maxErrorRate 0.01, p95 2000 ms.
- **Run:** `API_KEY=... CAMPAIGN_ID=... npm run test:load`
- **Output:** Request counts, latency percentiles, error rate, pass/fail vs thresholds.

---

## Prerequisites

1. Start the development server:
```bash
npm run dev
```

2. Create a partner account and app through the web UI:
   - Go to http://localhost:3000
   - Click "Get Started" and create an account
   - Login and create an app
   - Copy the API key from your dashboard

Or use the test partner account:
   - Login with `partner@example.com` / `partner123`
   - Create an app and copy the API key

## Test Workflow

### 1. Create a Campaign (via Dashboard)

Before using the API, create a campaign through the partner dashboard:
- Select your app
- Click "New Campaign"
- Fill in:
  - Name: "Test Campaign"
  - Referral Type: One-Sided
  - Reward Model: Fixed Currency
  - Reward Value: 10
  - Reward Cap: (optional) 50

Copy the campaign ID from the URL or browser devtools network tab.

### 2. Generate a Referral Code

```bash
curl -X POST http://localhost:3000/api/v1/referrals \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "YOUR_CAMPAIGN_ID",
    "referrerId": "user_123"
  }'
```

Response:
```json
{
  "referralCode": "abc12345",
  "referralId": "clxxxx..."
}
```

### 3. Track a Click

```bash
curl -X POST http://localhost:3000/api/v1/clicks \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "abc12345"
  }'
```

Response:
```json
{
  "success": true,
  "referralId": "clxxxx...",
  "status": "CLICKED"
}
```

### 4. Track a Conversion

```bash
curl -X POST http://localhost:3000/api/v1/conversions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "abc12345",
    "refereeId": "user_456",
    "amount": 100,
    "metadata": {
      "orderId": "order_123",
      "product": "Premium Plan"
    }
  }'
```

Response:
```json
{
  "success": true,
  "referralId": "clxxxx...",
  "conversionId": "clxxxx...",
  "rewardAmount": 10.0,
  "status": "CONVERTED"
}
```

### 5. Get Statistics

Get stats for all campaigns:
```bash
curl http://localhost:3000/api/v1/stats \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Get stats for a specific campaign:
```bash
curl "http://localhost:3000/api/v1/stats?campaignId=YOUR_CAMPAIGN_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

Response:
```json
{
  "totalReferrals": 1,
  "totalClicks": 1,
  "totalConversions": 1,
  "conversionRate": 100.0,
  "totalRewardValue": 10.0
}
```

## Complete Test Script

Save this as `test-api.sh`:

```bash
#!/bin/bash

# Configuration
API_KEY="YOUR_API_KEY"
CAMPAIGN_ID="YOUR_CAMPAIGN_ID"
BASE_URL="http://localhost:3000/api/v1"

echo "1. Creating referral code..."
RESPONSE=$(curl -s -X POST $BASE_URL/referrals \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"campaignId\": \"$CAMPAIGN_ID\",
    \"referrerId\": \"user_$(date +%s)\"
  }")
echo $RESPONSE | jq .

REFERRAL_CODE=$(echo $RESPONSE | jq -r .referralCode)
echo "Referral Code: $REFERRAL_CODE"

echo -e "\n2. Tracking click..."
curl -s -X POST $BASE_URL/clicks \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"referralCode\": \"$REFERRAL_CODE\"
  }" | jq .

echo -e "\n3. Tracking conversion..."
curl -s -X POST $BASE_URL/conversions \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d "{
    \"referralCode\": \"$REFERRAL_CODE\",
    \"refereeId\": \"user_new_$(date +%s)\",
    \"amount\": 100,
    \"metadata\": {
      \"orderId\": \"order_$(date +%s)\"
    }
  }" | jq .

echo -e "\n4. Getting statistics..."
curl -s "$BASE_URL/stats?campaignId=$CAMPAIGN_ID" \
  -H "Authorization: Bearer $API_KEY" | jq .
```

Make it executable:
```bash
chmod +x test-api.sh
```

Run it (after setting your API_KEY and CAMPAIGN_ID):
```bash
./test-api.sh
```

## Testing Different Reward Models

### Percentage-Based Rewards

Create a campaign with:
- Reward Model: Percentage
- Reward Value: 10 (for 10%)
- Reward Cap: 50

Test conversion with different amounts:

```bash
# $100 order → $10 reward (10%)
curl -X POST http://localhost:3000/api/v1/conversions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "code1",
    "refereeId": "user_789",
    "amount": 100
  }'
# Expected: rewardAmount: 10.0

# $1000 order → $50 reward (capped at $50)
curl -X POST http://localhost:3000/api/v1/conversions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "code2",
    "refereeId": "user_790",
    "amount": 1000
  }'
# Expected: rewardAmount: 50.0 (capped)
```

## Error Scenarios

### Invalid API Key
```bash
curl -X POST http://localhost:3000/api/v1/referrals \
  -H "Authorization: Bearer invalid_key" \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "xxx", "referrerId": "user_1"}'
```

Expected: 401 Unauthorized

### Missing Authorization Header
```bash
curl -X POST http://localhost:3000/api/v1/referrals \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "xxx", "referrerId": "user_1"}'
```

Expected: 401 Unauthorized

### Invalid Campaign ID
```bash
curl -X POST http://localhost:3000/api/v1/referrals \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "invalid", "referrerId": "user_1"}'
```

Expected: 404 Not Found

### Exceeded Monthly Limit

After making 10,000 API calls (or whatever your limit is):

Expected: 429 Too Many Requests

## Monitoring Usage

Check your usage in the dashboard:
1. Login to http://localhost:3000
2. Go to your dashboard
3. View "Current Usage / Monthly Limit" for each app

## Testing with Postman/Thunder Client

Import these as a collection:

**Environment Variables:**
- `baseUrl`: http://localhost:3000/api/v1
- `apiKey`: YOUR_API_KEY
- `campaignId`: YOUR_CAMPAIGN_ID

**Requests:**

1. **Create Referral**
   - POST: `{{baseUrl}}/referrals`
   - Headers: `Authorization: Bearer {{apiKey}}`
   - Body: See example above

2. **Track Click**
   - POST: `{{baseUrl}}/clicks`
   - Headers: `Authorization: Bearer {{apiKey}}`
   - Body: `{"referralCode": "{{referralCode}}"}`

3. **Track Conversion**
   - POST: `{{baseUrl}}/conversions`
   - Headers: `Authorization: Bearer {{apiKey}}`
   - Body: See example above

4. **Get Stats**
   - GET: `{{baseUrl}}/stats?campaignId={{campaignId}}`
   - Headers: `Authorization: Bearer {{apiKey}}`

## Artillery Load Testing

Load tests use [Artillery](https://www.artillery.io/) to validate behavior under load (throughput, error rate, p95 latency).

**Prerequisites:** Dev server running, `API_KEY` and `CAMPAIGN_ID` set (e.g. from dashboard).

**Run locally:**
```bash
export API_KEY=your_api_key
export CAMPAIGN_ID=your_campaign_id
npm run test:load
# Or: npx artillery run artillery/v1-flow.yml --environment local
```

**Scenarios:** v1 referral flow (POST referrals → clicks → conversions) and GET /api/v1/stats. Phases: ramp-up, sustained load, spike.

**Thresholds:** Fail if `http.response_time.p95 > 2000` ms or `http.request_failed_rate > 0.01`. Adjust in `artillery/v1-flow.yml` under `config.ensure`.

**Interpretation:** Artillery prints a summary with request counts, latency percentiles, and error rate. Use it to catch regressions and validate handling under concurrency.

### Artillery Cloud (record runs to cloud)

To record load-test runs to [Artillery Cloud](https://www.artillery.io/cloud) (dashboards, history, team sharing):

1. **Get a cloud API key** from [Artillery Cloud](https://app.artillery.io/) (Settings → API keys). Example format: `a9_xxxxxxxxxxxx`.

2. **Configure the key** (do not commit it):
   - **Option A – environment variable:**
     ```bash
     export ARTILLERY_CLOUD_KEY=a9_xxxxxxxxxxxx
     ```
   - **Option B – `.env`** (ensure `.env` is in `.gitignore`):
     ```
     ARTILLERY_CLOUD_KEY=a9_xxxxxxxxxxxx
     ```
   - **Option C – inline** (only for one-off runs, avoid in shared scripts):
     ```bash
     ARTILLERY_CLOUD_KEY=a9_xxxxxxxxxxxx npm run test:load:cloud
     ```

3. **Run with recording** (same scenario file as local, results go to cloud):
   ```bash
   # With env var set:
   npm run test:load:cloud

   # Or call Artillery directly (use your scenario file and key):
   npx artillery run artillery/v1-flow.yml --record --key $ARTILLERY_CLOUD_KEY
   ```

   To use a different scenario file (e.g. `test.yml` in project root):
   ```bash
   npx artillery run test.yml --record --key $ARTILLERY_CLOUD_KEY
   ```

4. **Optional: pass app env vars** so the same scenario hits your app:
   ```bash
   export API_KEY=your_app_api_key
   export CAMPAIGN_ID=your_campaign_id
   export BASE_URL=https://your-api.example.com
   npm run test:load:cloud
   ```

**Script in `package.json`:**
- `test:load` – local run only (no cloud).
- `test:load:cloud` – runs `artillery/v1-flow.yml` with `--record --key $ARTILLERY_CLOUD_KEY` for cloud usage.

**Security:** Keep `ARTILLERY_CLOUD_KEY` out of version control; use env vars or a local `.env` that is gitignored.

## Database Inspection

To inspect the database directly:

```bash
npx prisma studio
```

This opens a web UI at http://localhost:5555 where you can view:
- All referrals and their status
- Conversions and reward amounts
- API usage logs
- Campaign configurations

## Troubleshooting

### "App or partner is suspended"
- Check in Super Admin dashboard if your app/account is active
- Login as admin@example.com to reactivate

### "Monthly API limit exceeded"
- Reset usage counter (Super Admin can adjust limits)
- Or reset the database: `npx prisma migrate reset`

### "Campaign not found"
- Ensure campaign ID is correct
- Check that campaign belongs to your app
- Verify campaign status is ACTIVE

### Database locked errors
- Make sure only one process is accessing the database
- If using Prisma Studio, close it before running migrations
