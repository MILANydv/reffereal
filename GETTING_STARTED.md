# Getting Started - Referral Infrastructure MVP

Welcome! This guide will help you get the Referral Infrastructure MVP up and running in 5 minutes.

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Database

```bash
npx prisma migrate dev
npx prisma generate
npm run seed
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## What You'll See

### Landing Page
- Overview of the platform
- "Get Started" button to sign up
- "Sign In" button for existing users

### Your First Steps

1. **Sign Up**
   - Click "Get Started"
   - Enter email, password, name, company name
   - Submit to create your partner account

2. **Create Your First App**
   - Login to your dashboard
   - Click "New App"
   - Give it a name
   - Copy the API key (starts with `rk_`)

3. **Create a Campaign**
   - Select your app
   - Click "New Campaign"
   - Configure:
     - Name: "Launch Campaign"
     - Referral Type: One-Sided
     - Reward Model: Fixed Currency
     - Reward Value: 10
   - Click "Create"

4. **Test the API**
   - Use the API key to test endpoints
   - See `API_TESTING.md` for examples

## Test Accounts

After running `npm run seed`, you have:

**Partner Account:**
- Email: `partner@example.com`
- Password: `partner123`
- Use this to test partner features

**Super Admin:**
- Email: `admin@example.com`
- Password: `admin123`
- Use this to test admin features

## Example API Usage

### Generate a Referral Code

```bash
curl -X POST http://localhost:3000/api/v1/referrals \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "YOUR_CAMPAIGN_ID",
    "referrerId": "user_123"
  }'
```

### Track a Conversion

```bash
curl -X POST http://localhost:3000/api/v1/conversions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "referralCode": "CODE_FROM_PREVIOUS_STEP",
    "refereeId": "user_456",
    "amount": 100
  }'
```

### Get Statistics

```bash
curl http://localhost:3000/api/v1/stats \
  -H "Authorization: Bearer YOUR_API_KEY"
```

## Project Structure

```
├── app/
│   ├── api/              # API routes
│   │   ├── v1/          # Public API endpoints
│   │   ├── partner/     # Partner-only endpoints
│   │   └── admin/       # Admin-only endpoints
│   ├── dashboard/       # Partner dashboard
│   ├── admin/           # Super admin dashboard
│   ├── login/           # Login page
│   └── signup/          # Signup page
├── lib/                 # Utility functions
├── prisma/              # Database schema & migrations
└── types/               # TypeScript types
```

## Key Features

### For Partners
- Create unlimited apps
- Each app gets a unique API key
- Create multiple campaigns per app
- Real-time usage tracking
- API usage limits (default: 10,000/month)

### For Super Admin
- View all partners and apps
- Suspend/activate accounts
- Adjust API limits
- Platform-wide analytics

### API Features
- Generate referral codes
- Track clicks
- Track conversions
- Calculate rewards automatically
- Fetch statistics

## Common Tasks

### View Database
```bash
npx prisma studio
```
Opens at http://localhost:5555

### Reset Database
```bash
npx prisma migrate reset
npm run seed
```

### Check Build
```bash
npm run build
```

### Run Production Mode
```bash
npm run build
npm run start
```

## Reward Models Explained

### Fixed Currency
- Award a set amount per conversion
- Example: $10 per referral
- Set "Reward Value" to 10

### Percentage
- Award a percentage of the conversion amount
- Example: 10% of purchase value
- Set "Reward Value" to 10 (for 10%)
- Optional: Set "Reward Cap" to limit maximum reward

## Testing Scenarios

### Scenario 1: Fixed Reward
1. Create campaign: Fixed Currency, $10 reward
2. Generate referral code
3. Track conversion with any amount
4. Result: Always $10 reward

### Scenario 2: Percentage with Cap
1. Create campaign: Percentage, 10%, $50 cap
2. Test $100 purchase → $10 reward (10%)
3. Test $1000 purchase → $50 reward (capped)

### Scenario 3: Referral Lifecycle
1. Generate code → Status: PENDING
2. Track click → Status: CLICKED
3. Track conversion → Status: CONVERTED

## Troubleshooting

### Port 3000 already in use
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9
```

### Database locked
```bash
# Close Prisma Studio if open
# Or reset database
npx prisma migrate reset
```

### Build errors
```bash
# Clean and reinstall
rm -rf .next node_modules
npm install
npm run build
```

### API returns 401
- Check API key is correct
- Verify app is active (not suspended)
- Ensure Bearer token format: `Bearer rk_xxxxx`

### API returns 429
- Monthly limit exceeded
- Admin can adjust limit in admin dashboard
- Or reset usage counter

## Next Steps

1. **Integrate with Your App**
   - Use the API to generate referral codes
   - Track conversions when users complete actions
   - Award rewards to users

2. **Monitor Performance**
   - Check dashboard for usage stats
   - View conversion rates
   - Track reward costs

3. **Scale**
   - See `DEPLOYMENT.md` for production deployment
   - Consider PostgreSQL for production
   - Add caching layer for high traffic

## Documentation

- `README.md` - Project overview and setup
- `API_TESTING.md` - Complete API testing guide
- `PHASE1_CHECKLIST.md` - Feature verification
- `DEPLOYMENT.md` - Production deployment guide

## Support

For issues or questions:
1. Check existing documentation
2. Review error logs in terminal
3. Use Prisma Studio to inspect database
4. Check browser console for UI issues

## Development Tips

- Use `console.log()` for debugging
- Check terminal for API errors
- Use browser DevTools Network tab
- Test with curl before integrating

Happy coding! 🚀
