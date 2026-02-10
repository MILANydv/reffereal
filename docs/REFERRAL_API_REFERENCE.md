# Referral API — Complete Reference

This document describes the **Referral API (v1)** so you can implement referral tracking in your own projects (e.g. e-commerce, SaaS, marketplaces, mobile apps). All requests use the same base URL and Bearer token authentication.

---

## Base URL & Authentication

| Item | Value |
|------|--------|
| **Base URL** | `https://reffereal.vercel.app` (or your deployment URL) |
| **API prefix** | `/api/v1` |
| **Auth** | Bearer token in `Authorization` header |

Every request must include:

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

**Getting your API key**

- Sign in to the partner dashboard, select an app, then copy the API key from **API & Keys** or **App Settings**.
- Use **separate API keys** for sandbox and production.

**Error responses**

| Status | Meaning |
|--------|--------|
| `401` | Missing or invalid `Authorization` header, or invalid API key |
| `403` | App or partner is suspended |
| `429` | Monthly API limit exceeded |
| `4xx` | Validation error (see `error` in JSON body) |
| `500` | Internal server error |

---

## IP Tracking & Fraud Detection

The platform automatically tracks **client IP addresses** and **device fingerprints** for fraud detection. This helps identify suspicious patterns like duplicate referrals from the same IP or device.

### Forwarding Client IP Headers

**Important**: When making API requests from your backend server, you must forward the **end-user's client IP** (not your server's IP) in HTTP headers. This ensures accurate fraud detection.

**Recommended headers** (in priority order):

1. **`x-forwarded-for`** — Most common. Set this to the client's IP address.
   - If your app is behind a proxy/CDN, append the client IP: `x-forwarded-for: CLIENT_IP, PROXY_IP`
   - The platform extracts the first IP (the original client)

2. **`x-real-ip`** — Alternative header (used by nginx). Set to the client's IP.

3. **`cf-connecting-ip`** — Cloudflare-specific (automatically set by Cloudflare).

**Example (Node.js/Express)**

```javascript
// When calling the Referral API from your backend
const clientIp = req.ip || req.headers['x-forwarded-for']?.split(',')[0] || req.connection.remoteAddress;

fetch('https://reffereal.vercel.app/api/v1/referrals', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
    'x-forwarded-for': clientIp,  // Forward the end-user's IP
  },
  body: JSON.stringify({ ... }),
});
```

**Example (Python/Flask)**

```python
from flask import request

client_ip = request.headers.get('X-Forwarded-For', request.remote_addr)

response = requests.post(
    'https://reffereal.vercel.app/api/v1/referrals',
    headers={
        'Authorization': 'Bearer YOUR_API_KEY',
        'Content-Type': 'application/json',
        'x-forwarded-for': client_ip,  # Forward the end-user's IP
    },
    json={...}
)
```

**Why this matters**

- **Fraud detection**: The platform checks for duplicate IPs, suspicious patterns, and device fingerprint matches.
- **Accurate tracking**: Without forwarding client IPs, the platform sees your server's IP, which reduces fraud detection effectiveness.
- **Automatic handling**: The platform checks multiple headers (`cf-connecting-ip`, `x-forwarded-for`, `x-real-ip`, `true-client-ip`, `x-client-ip`) and filters out private/internal IPs to get the real client IP.

**Device fingerprinting**

The platform also generates a **device fingerprint** from:
- User-Agent header
- Accept-Language header  
- Client IP address

This helps detect when the same device is used for multiple suspicious referrals.

---

## Referral link format

After you get a `referralCode` from the API, build the shareable link by appending it to your base URL:

```
https://yourbrand.com/signup?ref=REFERRAL_CODE
```

Example: if the API returns `referralCode: "firir_john_abc12x"`, the link is:

`https://yourbrand.com/signup?ref=firir_john_abc12x`

When a user lands with `?ref=...`, read the `ref` query parameter and later call **POST /conversions** when they complete your success action (e.g. first purchase, subscription).

---

## Endpoints

### 1. Create referral (generate code)

**POST** `/api/v1/referrals`

Creates a referral identity for a user (the referrer/advocate) and returns a unique referral code for that campaign.

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `campaignId` | string | Yes | Campaign ID from your dashboard |
| `referrerId` | string | Yes | Your internal user ID (the person who will share the link) |
| `refereeId` | string | No | Referee user ID if already known at creation |
| `referrerUsername` | string | No | When campaign code format is **USERNAME**, this is included in the generated code (e.g. `firir_john_abc`) |
| `referrerEmail` | string | No | When campaign code format is **EMAIL_PREFIX**, the part before `@` is used in the code (e.g. `firir_john_abc`) |

**Referral code rules (campaign settings)**

- In the dashboard you can set a **code prefix** (e.g. `firir_`) and **code format**: Random, Username, or Email prefix.
- The returned `referralCode` follows those rules. If you use **Username** or **Email prefix**, send `referrerUsername` or `referrerEmail` in this request so the code is human-readable.

**Response (201)**

```json
{
  "referralCode": "firir_john_abc12x",
  "referralId": "clx...",
  "status": "PENDING"
}
```

If the referral is flagged by fraud checks:

```json
{
  "referralCode": "firir_john_abc12x",
  "referralId": "clx...",
  "status": "FLAGGED",
  "warning": "Referral flagged for review",
  "reasons": ["Suspicious pattern"],
  "riskScore": 65
}
```

**Example (cURL)**

```bash
curl -X POST "https://reffereal.vercel.app/api/v1/referrals" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "campaign_123",
    "referrerId": "user_89231",
    "referrerUsername": "john"
  }'
```

**Example (Node.js)**

```javascript
const res = await fetch('https://reffereal.vercel.app/api/v1/referrals', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    campaignId: 'campaign_123',
    referrerId: 'user_89231',
    referrerUsername: 'john',  // optional, for USERNAME code format
  }),
});
const { referralCode, referralId, status } = await res.json();
// Share: https://yourbrand.com/signup?ref=${referralCode}
```

---

### 2. Record conversion

**POST** `/api/v1/conversions`

Marks the referred user as converted (e.g. first purchase, subscription). A reward is created for the referrer (status PENDING). Fraud checks run before payouts.

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `referralCode` | string | Yes | The referral code from the link (e.g. from `?ref=...`) |
| `refereeId` | string | Yes | Your internal ID for the user who converted |
| `amount` | number | No | Order/transaction amount; campaign default used if omitted |
| `metadata` | string | No | Optional JSON string for your records |

**Response (201)**

```json
{
  "success": true,
  "referralId": "clx...",
  "originalReferralCode": "firir_john_abc12x",
  "conversionId": "clx...",
  "rewardAmount": 10.00,
  "rewardCreated": true,
  "status": "CONVERTED",
  "refereeId": "new_user_442",
  "referrerId": "user_89231"
}
```

If flagged by fraud detection:

```json
{
  "success": true,
  "referralId": "clx...",
  "conversionId": "clx...",
  "rewardAmount": 10.00,
  "rewardCreated": false,
  "status": "FLAGGED",
  "warning": "Conversion flagged for review. Reward will be created when resolved."
}
```

**Example (Node.js)**

```javascript
const res = await fetch('https://reffereal.vercel.app/api/v1/conversions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    referralCode: 'firir_john_abc12x',
    refereeId: 'new_user_442',
    amount: 99.99,
  }),
});
const data = await res.json();
// data.rewardCreated — whether a reward was generated (false if flagged)
// data.referralId — the new conversion referral record
```

---

### 3. Track click (optional but recommended)

**POST** `/api/v1/clicks`

Logs that the referral link was clicked. Use this when the user lands on your site with `?ref=...` so the platform can track click-to-conversion and improve fraud detection.

**Request body**

| Field | Type | Required |
|-------|------|----------|
| `referralCode` | string | Yes |

**Response (200)**

```json
{
  "success": true,
  "referralId": "clx...",
  "status": "CLICKED"
}
```

**Example**

```bash
curl -X POST "https://reffereal.vercel.app/api/v1/clicks" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"referralCode": "firir_john_abc12x"}'
```

---

### 4. App/campaign stats

**GET** `/api/v1/stats`

Returns aggregate metrics for your app, optionally filtered by campaign.

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | No | Filter by campaign ID |

**Response (200)**

```json
{
  "totalReferrals": 1250,
  "totalClicks": 890,
  "totalConversions": 312,
  "conversionRate": 35.06,
  "totalRewardValue": 3120.00
}
```

**Example**

```bash
curl -X GET "https://reffereal.vercel.app/api/v1/stats?campaignId=growth_q1" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### 5. User stats

**GET** `/api/v1/users/:userId/stats`

Returns referral statistics for a specific user (your internal `userId`).

**Path**

- `userId` — your internal user ID (referrer/advocate).

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `campaignId` | string | No | Filter by campaign |

**Response (200)**

```json
{
  "userId": "user_89231",
  "referralsMade": {
    "total": 45,
    "clicked": 32,
    "converted": 12
  },
  "referralsReceived": {
    "total": 1,
    "referrerId": "user_abc",
    "referralCode": "firir_abc_xyz",
    "campaignId": "clx...",
    "campaignName": "Q1 Growth",
    "converted": true,
    "receivedAt": "2025-01-15T10:00:00.000Z"
  },
  "rewardsEarned": {
    "total": 120.00,
    "pending": 30.00,
    "paid": 90.00
  },
  "referralCodesGenerated": [
    {
      "referralCode": "firir_john_abc12x",
      "campaignId": "clx...",
      "campaignName": "Q1 Growth",
      "status": "CONVERTED",
      "createdAt": "2025-01-10T08:00:00.000Z",
      "clicks": 5,
      "conversions": 2,
      "rewardAmount": 20.00
    }
  ],
  "referralCodesUsed": [
    {
      "referralCode": "firir_abc_xyz",
      "referrerId": "user_abc",
      "campaignId": "clx...",
      "campaignName": "Q1 Growth",
      "status": "CONVERTED",
      "usedAt": "2025-01-15T10:00:00.000Z",
      "rewardEarned": 10.00
    }
  ]
}
```

`referralsReceived` is `null` if the user was never referred.

---

### 6. User rewards list

**GET** `/api/v1/users/:userId/rewards`

Lists rewards for a user (pending, approved, paid). Use this to show “My rewards” or to reconcile payouts.

**Path**

- `userId` — your internal user ID.

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | `PENDING` \| `APPROVED` \| `PAID` \| `CANCELLED` |
| `campaignId` | string | No | Filter by campaign |
| `page` | number | No | Default `1` |
| `limit` | number | No | Default `25`, max `100` |

**Response (200)**

```json
{
  "rewards": [
    {
      "id": "clx...",
      "amount": 10.00,
      "currency": "USD",
      "status": "PENDING",
      "level": 1,
      "paidAt": null,
      "payoutReference": null,
      "fulfillmentType": null,
      "fulfillmentReference": null,
      "createdAt": "2025-01-20T14:00:00.000Z",
      "Referral": {
        "referralCode": "firir_john_abc12x",
        "campaignId": "clx...",
        "Campaign": { "name": "Q1 Growth" }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 25,
    "totalItems": 12,
    "totalPages": 1
  }
}
```

---

## Rewards & Payouts

Campaigns define a **payout type** that determines how rewards are fulfilled. When a conversion creates a reward, the campaign's `payoutType` is stored on the reward as `fulfillmentType`. Use the endpoints below to manage the full claim → validate → redeem lifecycle.

**Payout types** (set on campaigns in the dashboard):

| Type | Description |
|------|-------------|
| `IN_APP_DISCOUNT` | System auto-generates a unique discount code when the reward is claimed |
| `COUPON_CODE` | You provide an external coupon code when claiming the reward |
| `STORE_CREDIT` | Credit to user's account balance — you handle the crediting |
| `CASH` | Direct payment (PayPal, bank transfer) — you handle externally |
| `POINTS` | Loyalty points credited to the user — you handle externally |
| `OTHER` | Custom fulfillment handled by your system |

**Reward lifecycle:**

```
PENDING → (claim) → APPROVED → (redeem) → PAID
                  ↘ CANCELLED
```

### 7. List rewards (app-wide)

**GET** `/api/v1/rewards`

List all rewards for your app, with optional filters.

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string | No | Filter by user ID |
| `status` | string | No | `PENDING` \| `APPROVED` \| `PAID` \| `CANCELLED` |
| `fulfillmentType` | string | No | `IN_APP_DISCOUNT` \| `COUPON_CODE` \| `STORE_CREDIT` \| `CASH` \| `POINTS` \| `OTHER` |
| `page` | number | No | Default `1` |
| `limit` | number | No | Default `25`, max `100` |

**Response (200)**

```json
{
  "rewards": [
    {
      "id": "clx...",
      "userId": "user_89231",
      "amount": 10.00,
      "currency": "USD",
      "status": "PENDING",
      "level": 1,
      "fulfillmentType": "IN_APP_DISCOUNT",
      "fulfillmentReference": null,
      "discountCode": null,
      "expiresAt": null,
      "claimedAt": null,
      "paidAt": null,
      "payoutReference": null,
      "createdAt": "2026-01-20T14:00:00.000Z",
      "Referral": {
        "referralCode": "firir_john_abc12x",
        "campaignId": "clx...",
        "Campaign": { "name": "Q1 Growth" }
      }
    }
  ],
  "pagination": { "page": 1, "limit": 25, "totalItems": 12, "totalPages": 1 }
}
```

**Example (cURL)**

```bash
curl -X GET "https://reffereal.vercel.app/api/v1/rewards?userId=user_123&status=PENDING" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### 8. Get reward detail

**GET** `/api/v1/rewards/:rewardId`

Returns full details for a single reward, including discount code, referral info, and conversion data.

**Response (200)**

```json
{
  "reward": {
    "id": "clx...",
    "userId": "user_89231",
    "amount": 10.00,
    "currency": "USD",
    "status": "APPROVED",
    "fulfillmentType": "IN_APP_DISCOUNT",
    "discountCode": "A3K7YN9P",
    "expiresAt": "2026-03-01T00:00:00.000Z",
    "claimedAt": "2026-01-20T15:00:00.000Z",
    "paidAt": null,
    "Referral": {
      "id": "clx...",
      "referralCode": "firir_john_abc12x",
      "referrerId": "user_89231",
      "refereeId": "new_user_442",
      "campaignId": "clx...",
      "Campaign": { "name": "Q1 Growth", "payoutType": "IN_APP_DISCOUNT" }
    },
    "Conversion": { "id": "clx...", "amount": 99.99, "createdAt": "2026-01-20T14:00:00.000Z" }
  }
}
```

**Example**

```bash
curl -X GET "https://reffereal.vercel.app/api/v1/rewards/REWARD_ID" \
  -H "Authorization: Bearer YOUR_API_KEY"
```

---

### 9. Claim reward

**POST** `/api/v1/rewards/:rewardId/claim`

Claim a PENDING reward. What happens depends on the fulfillment type:

| Fulfillment type | What happens on claim | Request body |
|------------------|-----------------------|-------------|
| `IN_APP_DISCOUNT` | Unique 8-char discount code auto-generated, stored as `discountCode` | None required |
| `COUPON_CODE` | Your external coupon code stored as `fulfillmentReference` | `{ "couponCode": "SUMMER2026-50OFF" }` (required) |
| `STORE_CREDIT` / `POINTS` | Marked as APPROVED; you credit the user externally | `{ "reference": "..." }` (optional) |
| `CASH` | Marked as APPROVED; you handle the payment externally | `{ "payoutReference": "paypal_tx_123" }` (optional) |

Sets status to `APPROVED`, `claimedAt` to now. If the campaign has `rewardExpiration` (in days), `expiresAt` is set.

**Response (200)**

```json
{
  "success": true,
  "reward": {
    "id": "clx...",
    "userId": "user_89231",
    "amount": 10.00,
    "currency": "USD",
    "status": "APPROVED",
    "fulfillmentType": "IN_APP_DISCOUNT",
    "discountCode": "A3K7YN9P",
    "expiresAt": "2026-03-01T00:00:00.000Z",
    "claimedAt": "2026-01-20T15:00:00.000Z"
  }
}
```

**Example — IN_APP_DISCOUNT (code auto-generated)**

```bash
curl -X POST "https://reffereal.vercel.app/api/v1/rewards/REWARD_ID/claim" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json"
```

**Example — COUPON_CODE (you provide the code)**

```bash
curl -X POST "https://reffereal.vercel.app/api/v1/rewards/REWARD_ID/claim" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"couponCode": "SUMMER2026-50OFF"}'
```

**Example (Node.js)**

```javascript
// IN_APP_DISCOUNT — code is auto-generated
const res = await fetch('https://reffereal.vercel.app/api/v1/rewards/REWARD_ID/claim', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
});
const { reward } = await res.json();
console.log(reward.discountCode); // "A3K7YN9P"
// Show this code to the user: "Use code A3K7YN9P for $10 off!"

// COUPON_CODE — provide your own code
const res2 = await fetch('https://reffereal.vercel.app/api/v1/rewards/REWARD_ID/claim', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ couponCode: 'SUMMER2026-50OFF' }),
});
```

---

### 10. Validate discount/coupon code

**GET** `/api/v1/rewards/validate?code=CODE`

Check if a discount or coupon code is valid **without consuming it**. Use this at checkout to show the user whether their code is valid and what discount amount they'll receive.

**Query parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `code` | string | Yes | The discount or coupon code to validate |

**Response (200)**

```json
{
  "valid": true,
  "rewardId": "clx...",
  "userId": "user_89231",
  "amount": 10.00,
  "currency": "USD",
  "fulfillmentType": "IN_APP_DISCOUNT",
  "status": "APPROVED",
  "isExpired": false,
  "isRedeemed": false,
  "isCancelled": false,
  "expiresAt": "2026-03-01T00:00:00.000Z"
}
```

If the code doesn't exist: `{ "valid": false, "error": "Code not found" }`

**Example (Node.js) — checkout flow**

```javascript
// At checkout, when user enters a discount code:
const res = await fetch(
  `https://reffereal.vercel.app/api/v1/rewards/validate?code=${userCode}`,
  { headers: { 'Authorization': 'Bearer YOUR_API_KEY' } }
);
const { valid, amount, currency, isExpired } = await res.json();

if (valid) {
  // Apply $10.00 USD discount to cart
  applyDiscount(amount, currency);
  showMessage(`Code applied! $${amount} discount.`);
} else if (isExpired) {
  showError('This code has expired.');
} else {
  showError('Invalid discount code.');
}
```

---

### 11. Redeem (consume) discount/coupon code

**POST** `/api/v1/rewards/redeem`

Redeem a code when the user completes their purchase. This marks the reward as `PAID` and prevents the code from being used again.

**Request body**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `code` | string | Yes | The discount or coupon code to redeem |
| `orderReference` | string | No | Your order/transaction ID for reconciliation |

**Response (200)**

```json
{
  "success": true,
  "reward": {
    "id": "clx...",
    "userId": "user_89231",
    "amount": 10.00,
    "currency": "USD",
    "status": "PAID",
    "fulfillmentType": "IN_APP_DISCOUNT",
    "discountCode": "A3K7YN9P",
    "paidAt": "2026-01-21T09:30:00.000Z",
    "payoutReference": "order_12345"
  }
}
```

**Error responses:**
- Code not found → `404`
- Already redeemed → `400` with `{ "error": "This code has already been redeemed" }`
- Expired → `400` with `{ "error": "This code has expired" }`
- Not yet claimed (still PENDING) → `400` with `{ "error": "Reward cannot be redeemed; current status is PENDING. It must be claimed first." }`

**Example (Node.js) — after successful purchase**

```javascript
// After payment is confirmed:
const res = await fetch('https://reffereal.vercel.app/api/v1/rewards/redeem', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    code: 'A3K7YN9P',
    orderReference: 'order_12345', // your order ID
  }),
});
const { success, reward } = await res.json();
// reward.status === 'PAID'
```

**Example (Python)**

```python
response = requests.post(
    'https://reffereal.vercel.app/api/v1/rewards/redeem',
    json={'code': 'A3K7YN9P', 'orderReference': 'order_12345'},
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
```

---

## Webhooks

Configure webhook URLs in the partner dashboard (Webhooks). The platform sends **HTTP POST** requests to your URL with:

- **Body**: JSON payload
- **Header**: `X-Webhook-Signature` — HMAC-SHA256 of the **raw body** (hex-encoded), using your webhook secret.

**Payload shape (all events)**

```json
{
  "event": "REFERRAL_CREATED | REFERRAL_CLICKED | REFERRAL_CONVERTED | REWARD_CREATED | REWARD_CLAIMED | REWARD_REDEEMED",
  "data": { ... },
  "timestamp": "2026-01-31T12:00:00.000Z"
}
```

**Event types**

| Event | When | `data` (typical) |
|-------|------|-------------------|
| `REFERRAL_CREATED` | A referral code is generated | `referralId`, `referralCode`, `referrerId`, `refereeId` (optional), `campaignId` |
| `REFERRAL_CLICKED` | Referral link was clicked | `referralId`, `referralCode`, `clickedAt`, `campaignId` |
| `REFERRAL_CONVERTED` | A conversion was recorded | `referralId`, `referralCode`, `conversionId`, `rewardAmount`, `convertedAt`, `campaignId` |
| `REWARD_CREATED` | A reward was created for the referrer | `referralId`, `referrerId`, `rewardAmount`, `campaignId`, `level` (1 or 2) |
| `REWARD_CLAIMED` | A reward was claimed | `rewardId`, `userId`, `amount`, `currency`, `fulfillmentType`, `discountCode`, `claimedAt` |
| `REWARD_REDEEMED` | A discount/coupon code was redeemed | `rewardId`, `userId`, `amount`, `currency`, `fulfillmentType`, `discountCode`, `paidAt`, `payoutReference` |

**Verifying the signature**

1. Read the **raw request body** as received (string/bytes).
2. Compute HMAC-SHA256 of that raw body with your **webhook secret**; output hex.
3. Compare with `X-Webhook-Signature` using a **constant-time** comparison (e.g. `crypto.timingSafeEqual` in Node, `hmac.compare_digest` in Python).

**Node.js example**

```javascript
const crypto = require('crypto');

function verifyWebhook(rawBody, signature, secret) {
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex'));
}
```

---

## Implementation flows

### E-commerce (with in-app discount)

1. **Create campaign** in the dashboard. Set payout type to `IN_APP_DISCOUNT`.
2. **When a customer wants to refer friends**: Call **POST /referrals** with `campaignId` and `referrerId`. Get `referralCode`.
3. **Share link**: `https://yourstore.com/signup?ref=${referralCode}`.
4. **When referred user lands**: Read `ref` from URL; optionally call **POST /clicks**.
5. **When referred user completes first purchase**: Call **POST /conversions** with `referralCode`, `refereeId`, and `amount`. A reward is created with `fulfillmentType: IN_APP_DISCOUNT`.
6. **Referrer claims reward**: Call **POST /rewards/:rewardId/claim**. A unique discount code (e.g. `A3K7YN9P`) is auto-generated.
7. **Referrer uses code at checkout**: Your checkout page calls **GET /rewards/validate?code=A3K7YN9P** to verify validity and discount amount.
8. **After purchase confirmed**: Call **POST /rewards/redeem** with the code and your order ID. The code is consumed and cannot be reused.

### SaaS (with store credit)

1. **Create campaign** in the dashboard. Set payout type to `STORE_CREDIT`.
2. **When a user signs up**: Call **POST /referrals** to get a `referralCode`.
3. **Share link**: `https://yourapp.com/signup?ref=${referralCode}`.
4. **When referred user upgrades to paid**: Call **POST /conversions**. A reward is created.
5. **Credit the referrer**: Call **POST /rewards/:rewardId/claim** to mark as APPROVED. Your system credits the user's account balance.

### Same API for other platforms

- **Marketplaces**: Create referral on signup; fire conversion when referred user completes onboarding. Use `COUPON_CODE` payout type and assign partner-provided coupon codes on claim.
- **Content/creators**: One referral link per creator; conversion when fan subscribes. Use `CASH` payout and handle PayPal/bank transfer externally.
- **Mobile apps**: Create referral when user shares; conversion on install + first purchase. Use `POINTS` payout type for in-app loyalty points.

---

## Quick reference

| Action | Method | Endpoint | Key body/query |
|--------|--------|----------|----------------|
| Generate referral code | POST | `/api/v1/referrals` | `campaignId`, `referrerId`; optional `referrerUsername`, `referrerEmail` |
| Record conversion | POST | `/api/v1/conversions` | `referralCode`, `refereeId`; optional `amount`, `metadata` |
| Track click | POST | `/api/v1/clicks` | `referralCode` |
| App/campaign stats | GET | `/api/v1/stats` | optional `campaignId` |
| User stats | GET | `/api/v1/users/:userId/stats` | optional `campaignId` |
| User rewards | GET | `/api/v1/users/:userId/rewards` | optional `status`, `campaignId`, `page`, `limit` |
| **List app rewards** | GET | `/api/v1/rewards` | optional `userId`, `status`, `fulfillmentType`, `page`, `limit` |
| **Get reward detail** | GET | `/api/v1/rewards/:rewardId` | — |
| **Claim reward** | POST | `/api/v1/rewards/:rewardId/claim` | varies: `couponCode` for COUPON_CODE; empty for IN_APP_DISCOUNT |
| **Validate code** | GET | `/api/v1/rewards/validate` | `code` (required) |
| **Redeem code** | POST | `/api/v1/rewards/redeem` | `code` (required); optional `orderReference` |

**Link format:** `https://yourbrand.com/path?ref=REFERRAL_CODE`

**Reward flow:** `POST /conversions` → `POST /rewards/:id/claim` → `GET /rewards/validate?code=X` → `POST /rewards/redeem`

Use this reference to implement the referral and payout flow in your projects end-to-end.
