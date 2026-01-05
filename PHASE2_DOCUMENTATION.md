# Phase 2 Documentation - Referral Platform

## Overview

Phase 2 transforms the MVP into a revenue-generating, scalable referral infrastructure platform with enterprise-grade features.

## New Features

### 1. Billing & Subscription Automation

#### Pricing Plans

Four tiers available:

- **Free**: $0/month, 10,000 API calls, 1 app
- **Growth**: $49/month, 100,000 API calls, 5 apps
- **Pro**: $199/month, 500,000 API calls, 20 apps
- **Enterprise**: $999/month, 5,000,000 API calls, 100 apps

#### Usage-Based Billing

- Automatic API usage tracking
- Overage billing per 1000 API calls
- Monthly invoice generation
- Hard limit enforcement (120% of plan limit)

#### Stripe Integration

Set up your Stripe keys in `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Webhooks & Event System

#### Supported Events

- `REFERRAL_CREATED`: New referral generated
- `REFERRAL_CLICKED`: Referral link clicked
- `REFERRAL_CONVERTED`: Successful conversion
- `REWARD_CREATED`: Reward issued
- `USAGE_LIMIT_EXCEEDED`: API limit warning

#### Creating Webhooks

```bash
POST /api/partner/webhooks
{
  "appId": "app_xyz",
  "url": "https://your-domain.com/webhook",
  "events": ["REFERRAL_CREATED", "REFERRAL_CONVERTED"]
}
```

#### Webhook Payload

```json
{
  "event": "REFERRAL_CREATED",
  "data": {
    "referralId": "ref_xyz",
    "referralCode": "ABC123",
    "referrerId": "user_123",
    "campaignId": "camp_xyz"
  },
  "timestamp": "2025-01-05T19:54:23Z"
}
```

#### Signature Verification

Webhooks include an `X-Webhook-Signature` header for verification:

```javascript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}
```

### 3. Advanced Campaign Rules

#### Time-Based Rules

```json
{
  "startDate": "2025-01-01T00:00:00Z",
  "endDate": "2025-12-31T23:59:59Z",
  "conversionWindow": 30,
  "rewardExpiration": 90
}
```

#### Multi-Level Referrals

```json
{
  "referralType": "MULTI_LEVEL",
  "level1Reward": 10.00,
  "level2Reward": 5.00,
  "level1Cap": 100.00,
  "level2Cap": 50.00
}
```

#### Tiered Rewards

```json
{
  "rewardModel": "TIERED",
  "tierConfig": {
    "tiers": [
      { "min": 0, "max": 10, "reward": 5 },
      { "min": 11, "max": 50, "reward": 10 },
      { "min": 51, "max": null, "reward": 15 }
    ]
  }
}
```

### 4. Fraud & Abuse Prevention

#### Automatic Detection

- **Duplicate IP**: Multiple referrals from same IP
- **Self-Referral**: Referrer = Referee
- **Rate Limiting**: Max 10 referrals/hour per user
- **Suspicious Patterns**: Bot-like behavior detection

#### Manual Review

Navigate to `/dashboard/v2/fraud` to review and resolve flagged referrals.

### 5. Team & Permissions

#### Roles

- **Admin**: Full access to all features
- **Analyst**: View analytics and reports
- **Developer**: API keys and webhooks only

#### Inviting Team Members

```bash
POST /api/partner/team
{
  "email": "teammate@company.com",
  "name": "John Doe",
  "role": "DEVELOPER"
}
```

### 6. Enhanced UI

#### New Dashboard Layout

- Google Console-style sidebar navigation
- Clean, enterprise-grade design
- Real-time alerts and notifications

#### Key Pages

- `/dashboard/v2` - Overview dashboard
- `/dashboard/v2/billing` - Subscription & invoices
- `/dashboard/v2/webhooks` - Webhook management
- `/dashboard/v2/fraud` - Fraud monitoring
- `/dashboard/v2/team` - Team collaboration
- `/dashboard/v2/analytics` - Advanced analytics

### 7. Admin Dashboard

Super admins can access:

- `/admin/v2` - Platform-wide statistics
- `/admin/v2/partners` - Partner management
- `/admin/v2/pricing` - Pricing plan editor
- `/admin/v2/features` - Feature flags
- `/admin/v2/fraud` - Global fraud monitoring

## API Enhancements

### Fraud Detection in API

All referral creation requests now include automatic fraud detection:

```bash
POST /api/v1/referrals
{
  "campaignId": "camp_xyz",
  "referrerId": "user_123",
  "refereeId": "user_456"
}
```

Response includes fraud status:

```json
{
  "referralCode": "ABC123",
  "referralId": "ref_xyz",
  "status": "FLAGGED",
  "warning": "Referral flagged for review",
  "reasons": ["Self-referral detected"]
}
```

### Usage Limits Enforcement

API requests automatically check:

1. Current usage vs plan limit
2. Hard limit threshold (120%)
3. Suspend app if exceeded
4. Trigger `USAGE_LIMIT_EXCEEDED` webhook

## Database Schema Updates

### New Models

- `PricingPlan` - Subscription plans
- `Subscription` - Partner subscriptions
- `Invoice` - Billing history
- `Webhook` - Webhook configurations
- `WebhookDelivery` - Delivery logs
- `TeamMember` - Team collaboration
- `FraudFlag` - Fraud detection flags
- `FeatureFlag` - Platform feature toggles

### Extended Models

- `Campaign` - Time-based rules, multi-level, tiers
- `Referral` - IP tracking, fraud flags, hierarchy
- `App` - Sandbox mode flag

## Environment Variables

```bash
# Required for Phase 2
AUTH_SECRET=your-auth-secret
DATABASE_URL=file:./prisma/dev.db

# Stripe (for billing)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Development Commands

```bash
# Install dependencies
npm install

# Run migrations
npx prisma migrate dev

# Seed database
npm run seed

# Start development server
npm run dev
```

## Migration from Phase 1

### Automatic Migration

Run the Phase 2 migration:

```bash
npx prisma migrate dev --name phase2_features
```

### Assign Free Plans

All existing partners are automatically assigned the Free plan on first seed.

### Enable New Features

1. Update to latest code
2. Run migration
3. Restart application
4. Partners can upgrade from `/dashboard/v2/billing`

## Best Practices

### Webhooks

1. Always verify signatures
2. Respond with 200 OK quickly
3. Process async in background
4. Implement retry logic on your end

### Fraud Detection

1. Review flagged referrals daily
2. Configure custom thresholds if needed
3. Use metadata for additional context
4. Whitelist trusted IPs if necessary

### Billing

1. Set up Stripe webhook endpoints
2. Monitor usage regularly
3. Alert partners at 80% usage
4. Enforce hard limits strictly

### Team Management

1. Use least-privilege principle
2. Regularly audit team access
3. Revoke access for departed members
4. Use invite tokens for security

## Support & Troubleshooting

### Common Issues

**Webhooks not delivering?**
- Check URL is publicly accessible
- Verify webhook is active
- Check delivery logs in dashboard
- Ensure endpoint returns 200 OK

**Usage limits incorrect?**
- Verify subscription is active
- Check current billing period
- Reset usage counters monthly
- Contact support for adjustments

**Fraud detection too aggressive?**
- Review flagged patterns
- Adjust thresholds if needed
- Whitelist trusted sources
- Contact support for tuning

## Roadmap

### Upcoming Features

- JavaScript SDK for easy integration
- Sandbox environment for testing
- CSV export for analytics
- Scheduled reports via email
- Custom referral widgets
- Advanced BI dashboard
- Multi-currency support
- Local payment gateways

## License & Support

For enterprise support, custom integrations, or questions:
- Email: support@referralplatform.com
- Docs: https://docs.referralplatform.com
- Discord: https://discord.gg/referralplatform
