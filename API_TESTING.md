# API Testing Guide

This guide provides examples for testing the Referral Infrastructure MVP API endpoints.

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
