# Referral Infrastructure MVP

A developer-focused referral platform that allows developers to create apps, manage referral campaigns, and track conversions via API.

## Features

### Core Functionality
- ✅ **Multi-tenant Partner System**: Each partner can create multiple apps
- ✅ **API Key Authentication**: Secure Bearer token authentication for API endpoints
- ✅ **Campaign Management**: Create multiple campaigns per app with different reward models
- ✅ **Referral Engine**: Generate codes, track clicks, and record conversions
- ✅ **Analytics**: Real-time stats including conversions, clicks, and reward calculations
- ✅ **Usage Tracking**: Monitor API usage against monthly limits
- ✅ **Super Admin Dashboard**: Platform management and oversight

### Reward Models
- **Fixed Currency**: Award a fixed amount per conversion
- **Percentage**: Award a percentage of the conversion amount
- **Reward Cap**: Optional maximum reward amount

### Referral Types
- **One-Sided**: Reward only the referrer
- **Two-Sided**: Reward both referrer and referee

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: SQLite with Prisma ORM
- **Authentication**: NextAuth.js v5
- **UI**: Tailwind CSS
- **API**: RESTful endpoints

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
npm run seed
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000)

### Default Test Accounts

After seeding, you can use these accounts:

**Super Admin:**
- Email: `admin@example.com`
- Password: `admin123`

**Test Partner:**
- Email: `partner@example.com`
- Password: `partner123`

## API Endpoints

### Authentication

All API endpoints require Bearer token authentication:

```
Authorization: Bearer <your_api_key>
```

### Base URL

```
/api/v1
```

### Endpoints

#### 1. Create Referral Code

**POST** `/api/v1/referrals`

Generate a new referral code for a user.

```json
{
  "campaignId": "campaign_id",
  "referrerId": "user_123"
}
```

Response:
```json
{
  "referralCode": "abc12345",
  "referralId": "referral_id"
}
```

#### 2. Track Referral Click

**POST** `/api/v1/clicks`

Track when a referral link is clicked.

```json
{
  "referralCode": "abc12345"
}
```

Response:
```json
{
  "success": true,
  "referralId": "referral_id",
  "status": "CLICKED"
}
```

#### 3. Track Conversion

**POST** `/api/v1/conversions`

Record a successful referral conversion.

```json
{
  "referralCode": "abc12345",
  "refereeId": "user_456",
  "amount": 100,
  "metadata": { "orderId": "order_123" }
}
```

Response:
```json
{
  "success": true,
  "referralId": "referral_id",
  "conversionId": "conversion_id",
  "rewardAmount": 10.0,
  "status": "CONVERTED"
}
```

#### 4. Get Stats

**GET** `/api/v1/stats?campaignId=campaign_id`

Retrieve referral statistics. Campaign ID is optional.

Response:
```json
{
  "totalReferrals": 100,
  "totalClicks": 75,
  "totalConversions": 25,
  "conversionRate": 33.33,
  "totalRewardValue": 250.0
}
```

## Dashboard Features

### Partner Dashboard

Access at `/dashboard` after logging in as a partner.

- **App Management**: Create and manage multiple apps
- **API Key Display**: View and copy API keys
- **Campaign Creation**: Set up referral campaigns with custom settings
- **Usage Monitoring**: Track API usage against monthly limits

### Super Admin Dashboard

Access at `/admin` after logging in as super admin.

- **Partner Overview**: View all partners and their activity
- **App Management**: Monitor all apps across the platform
- **Suspend/Activate**: Control app and partner status
- **Platform Analytics**: View total usage, campaigns, and API calls

## Database Schema

### Key Models

- **User**: System users (Super Admin, Partner)
- **Partner**: Partner accounts linked to users
- **App**: Applications with API keys
- **Campaign**: Referral campaigns with reward rules
- **Referral**: Individual referral codes and their lifecycle
- **Conversion**: Successful referral conversions
- **ApiUsageLog**: API call tracking for billing

## Usage Limits

Each app has:
- Default monthly API limit: 10,000 calls
- Real-time usage tracking
- Soft limit enforcement (returns 429 when exceeded)
- Admin-adjustable limits

## Development

### Database Migrations

Create a new migration:
```bash
npx prisma migrate dev --name migration_name
```

Reset database:
```bash
npx prisma migrate reset
```

### Seed Database

```bash
npm run seed
```

### Code Structure

```
├── app/
│   ├── api/
│   │   ├── v1/           # Public API endpoints
│   │   ├── partner/      # Partner internal APIs
│   │   └── admin/        # Admin internal APIs
│   ├── dashboard/        # Partner dashboard
│   ├── admin/            # Super admin dashboard
│   ├── login/            # Login page
│   └── signup/           # Signup page
├── lib/
│   ├── db.ts             # Prisma client singleton
│   ├── auth.ts           # NextAuth configuration
│   ├── api-key.ts        # API key generation
│   └── api-middleware.ts # API authentication
└── prisma/
    ├── schema.prisma     # Database schema
    └── migrations/       # Migration history
```

## Security

- Passwords hashed with bcrypt
- API keys prefixed with `rk_`
- Role-based access control (RBAC)
- Partner data isolation
- Session-based authentication for web UI
- Bearer token authentication for API

## Future Enhancements (Out of Phase 1)

- Payment gateway integration
- Webhook notifications
- Multi-level referrals
- Fraud detection
- Team permissions
- Advanced analytics & exports
- UI widgets/embeds

## License

Proprietary - Internal MVP

## Support

For issues or questions, please contact the development team.
