# Phase 2 Features - Enterprise Referral Platform

## 🚀 What's New in Phase 2

Phase 2 transforms the MVP into a **revenue-generating, scalable referral infrastructure platform** with enterprise-grade features.

### ✅ Completed Features

#### 1. 💳 Billing & Subscription Automation

**4 Pricing Tiers:**
- **Free**: $0/mo - 10K API calls, 1 app
- **Growth**: $49/mo - 100K API calls, 5 apps
- **Pro**: $199/mo - 500K API calls, 20 apps
- **Enterprise**: $999/mo - 5M API calls, 100 apps

**Features:**
- ✅ Automatic usage tracking
- ✅ Overage billing (per 1000 API calls)
- ✅ Monthly invoice generation
- ✅ Hard limit enforcement (120% of plan)
- ✅ Stripe integration ready
- ✅ Subscription management UI

**Dashboard:** `/dashboard/v2/billing`

#### 2. 🔔 Webhooks & Event System

**5 Event Types:**
- `REFERRAL_CREATED` - New referral generated
- `REFERRAL_CLICKED` - Referral link clicked
- `REFERRAL_CONVERTED` - Successful conversion
- `REWARD_CREATED` - Reward issued
- `USAGE_LIMIT_EXCEEDED` - API limit warning

**Features:**
- ✅ Webhook URL per app
- ✅ Automatic retry logic (5 attempts)
- ✅ Delivery logs & statistics
- ✅ HMAC SHA-256 signature verification
- ✅ Event filtering

**Dashboard:** `/dashboard/v2/webhooks`

#### 3. 🎯 Advanced Campaign Rules

**Time-Based Rules:**
- ✅ Start/end date enforcement
- ✅ Conversion window (e.g., 30 days)
- ✅ Reward expiration

**Multi-Level Referrals:**
- ✅ Level 1 & Level 2 rewards
- ✅ Configurable percentages
- ✅ Caps per level
- ✅ Parent-child hierarchy tracking

**Tiered Rewards:**
- ✅ Performance-based tiers
- ✅ JSON configuration
- ✅ Flexible reward structures

#### 4. 🛡️ Fraud & Abuse Prevention

**Detection Rules:**
- ✅ Duplicate IP detection (5+ in 24hrs)
- ✅ Self-referral prevention
- ✅ Rate limiting (10/hour per user)
- ✅ Suspicious pattern detection (bot behavior)

**Features:**
- ✅ Automatic flagging on creation
- ✅ Manual review queue
- ✅ Fraud flag resolution
- ✅ App-level fraud statistics

**Dashboard:** `/dashboard/v2/fraud`

#### 5. 👥 Team & Permissions

**3 Roles:**
- **Admin**: Full access
- **Analyst**: View analytics
- **Developer**: API keys only

**Features:**
- ✅ Email invitations
- ✅ Invite token system
- ✅ Team member management
- ✅ Last login tracking

**Dashboard:** `/dashboard/v2/team`

#### 6. 🎨 Google Console-Style UI

**New Dashboard:**
- ✅ Clean sidebar navigation
- ✅ Enterprise-grade design
- ✅ Real-time alerts
- ✅ Responsive layout
- ✅ Dark mode ready

**Pages:**
- `/dashboard/v2` - Overview
- `/dashboard/v2/analytics` - Analytics
- `/dashboard/v2/apps` - Applications
- `/dashboard/v2/webhooks` - Webhooks
- `/dashboard/v2/fraud` - Fraud monitoring
- `/dashboard/v2/billing` - Billing
- `/dashboard/v2/team` - Team
- `/dashboard/v2/settings` - Settings
- `/dashboard/v2/api-keys` - API keys

#### 7. 👑 Super Admin Dashboard

**Platform-Wide Control:**
- ✅ Total partners & apps
- ✅ Monthly revenue tracking
- ✅ API usage analytics
- ✅ Fraud monitoring
- ✅ Partner management

**Admin Pages:**
- `/admin/v2` - Admin dashboard
- `/admin/v2/partners` - Partner management
- `/admin/v2/pricing` - Pricing plans
- `/admin/v2/features` - Feature flags
- `/admin/v2/fraud` - Global fraud

## 📊 Database Schema Updates

### New Models

```prisma
PricingPlan       - Subscription plans
Subscription      - Partner subscriptions
Invoice           - Billing history
Webhook           - Webhook configurations
WebhookDelivery   - Delivery logs
TeamMember        - Team collaboration
FraudFlag         - Fraud detection
FeatureFlag       - Platform toggles
```

### Extended Models

```prisma
Campaign:
  + startDate, endDate
  + conversionWindow, rewardExpiration
  + level1Reward, level2Reward
  + tierConfig (JSON)

Referral:
  + level, parentReferralId
  + ipAddress, isFlagged
  + Parent-child relationships

App:
  + isSandbox
```

## 🔧 Technical Implementation

### Libraries Added

- `stripe` - Payment processing
- `lucide-react` - Icon library
- `recharts` - Data visualization
- `date-fns` - Date utilities
- `zustand` - State management

### Core Utilities

```
lib/
├── stripe.ts           - Stripe integration
├── billing.ts          - Usage & invoicing
├── webhooks.ts         - Event system
├── fraud-detection.ts  - Fraud rules
```

### API Enhancements

**Referral API** (`/api/v1/referrals`):
- ✅ Automatic fraud detection
- ✅ Webhook trigger
- ✅ IP address capture
- ✅ Status flagging

**Partner APIs** (`/api/partner/*`):
- ✅ `/dashboard-stats` - Overview data
- ✅ `/billing` - Subscription info
- ✅ `/pricing-plans` - Available plans
- ✅ `/webhooks` - Webhook CRUD
- ✅ `/team` - Team management
- ✅ `/fraud` - Fraud flags

**Admin APIs** (`/api/admin/*`):
- ✅ `/stats` - Platform metrics

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Migrations

```bash
npx prisma migrate dev --name phase2_features
```

### 3. Seed Database

```bash
npm run seed
```

This creates:
- 4 pricing plans
- Super admin account
- Test partner with free subscription

### 4. Configure Stripe (Optional)

Add to `.env`:

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5. Start Development

```bash
npm run dev
```

## 📖 Usage Examples

### Creating a Webhook

```bash
POST /api/partner/webhooks
Content-Type: application/json

{
  "appId": "app_xyz",
  "url": "https://your-domain.com/webhook",
  "events": ["REFERRAL_CREATED", "REFERRAL_CONVERTED"]
}
```

### Webhook Payload

```json
{
  "event": "REFERRAL_CREATED",
  "data": {
    "referralId": "ref_123",
    "referralCode": "ABC123",
    "referrerId": "user_123",
    "campaignId": "camp_123"
  },
  "timestamp": "2025-01-05T19:54:23Z"
}
```

### Verifying Webhook Signatures

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

// Use in your webhook endpoint
const signature = req.headers['x-webhook-signature'];
const isValid = verifySignature(req.body, signature, webhookSecret);
```

### Upgrading Subscription

```bash
POST /api/partner/subscription/upgrade
Content-Type: application/json

{
  "planId": "plan_growth_id"
}
```

### Inviting Team Member

```bash
POST /api/partner/team
Content-Type: application/json

{
  "email": "teammate@company.com",
  "name": "John Doe",
  "role": "DEVELOPER"
}
```

## 🎯 Default Accounts

After seeding:

**Super Admin:**
- Email: `admin@example.com`
- Password: `admin123`
- Access: `/admin/v2`

**Test Partner:**
- Email: `partner@example.com`
- Password: `partner123`
- Access: `/dashboard/v2`
- Plan: Free

## 🔐 Security Features

### Fraud Detection

All referral creations automatically check:
- Self-referral (referrer = referee)
- Duplicate IPs (5+ in 24hrs)
- Rate limits (10/hour per user)
- Suspicious patterns (bot behavior)

Flagged referrals have status `FLAGGED` and require manual review.

### Webhook Security

All webhooks include HMAC SHA-256 signature in `X-Webhook-Signature` header.

### Usage Limits

- Soft limit: Plan API limit
- Hard limit: 120% of plan limit
- Action: App suspended at hard limit

## 📈 Monitoring

### Partner View

- Real-time usage dashboard
- Fraud alert notifications
- Webhook delivery logs
- Team activity tracking

### Admin View

- Platform-wide metrics
- Revenue tracking
- Fraud monitoring
- Partner health scores

## 🛣️ Roadmap (Future Phases)

### Phase 3 Ideas

- [ ] JavaScript SDK
- [ ] Sandbox environment
- [ ] CSV export
- [ ] Scheduled reports
- [ ] Referral widgets (embeddable)
- [ ] Advanced BI dashboard
- [ ] Multi-currency support
- [ ] Local payment gateways (eSewa, Khalti)
- [ ] Mobile app
- [ ] API rate limiting by plan

## 📚 Documentation

- **API Docs**: `/docs`
- **Phase 2 Guide**: `PHASE2_DOCUMENTATION.md`
- **Getting Started**: `GETTING_STARTED.md`
- **Deployment**: `DEPLOYMENT.md`

## 🐛 Known Issues

None currently. All Phase 2 features are production-ready.

## 📞 Support

For questions or issues:
- Check documentation
- Review API endpoints
- Test with provided accounts
- Submit issues on GitHub

## 🎉 Credits

Built with Next.js 16, React 19, Tailwind CSS 4, Prisma, and Stripe.

---

**Phase 2 Status:** ✅ Complete and Production-Ready
