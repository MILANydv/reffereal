# Referral Engine API Documentation

## Overview

The Referral Engine API provides a comprehensive solution for implementing referral programs in your application. Track referrals, clicks, conversions, and calculate rewards automatically.

**Base URL:** `https://your-domain.com/api/v1`

## Quick Start

1. **Sign up** for an account at `/signup`
2. **Create an app** in your dashboard to get an API key
3. **Create a campaign** with your desired reward model
4. **Integrate** the API endpoints into your application

## Authentication

All API requests require authentication using Bearer tokens.

### Getting Your API Key

1. Log in to your partner dashboard
2. Navigate to your app
3. Copy the API key from the app details section

### Making Authenticated Requests

Include your API key in the `Authorization` header:

```
Authorization: Bearer YOUR_API_KEY
```

### Example

```bash
curl -X POST https://your-domain.com/api/v1/referrals \
  -H "Authorization: Bearer sk_live_abc123..." \
  -H "Content-Type: application/json" \
  -d '{"campaignId": "campaign_123", "referrerId": "user_456"}'
```

## Referral Lifecycle

The referral system follows a three-step lifecycle:

```
1. PENDING    →  2. CLICKED    →  3. CONVERTED
   (Created)      (Link clicked)    (Action completed)
```

## API Endpoints

### 1. Create Referral Code

Generate a unique referral code for a user.

**Endpoint:** `POST /api/v1/referrals`

**Request Body:**
```json
{
  "campaignId": "campaign_abc123",
  "referrerId": "user_456"
}
```

**Response (201 Created):**
```json
{
  "referralCode": "ABC123XYZ",
  "referralId": "ref_xyz789"
}
```

**Errors:**
- `400 Bad Request` - Missing required fields
- `401 Unauthorized` - Invalid API key
- `403 Forbidden` - App or partner suspended
- `404 Not Found` - Campaign not found
- `429 Too Many Requests` - API limit exceeded

---

### 2. Track Referral Click

Track when a user clicks on a referral link.

**Endpoint:** `POST /api/v1/clicks`

**Request Body:**
```json
{
  "referralCode": "ABC123XYZ"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "referralId": "ref_xyz789",
  "status": "CLICKED"
}
```

**Note:** This endpoint updates the referral status from `PENDING` to `CLICKED` and records the timestamp.

---

### 3. Track Conversion

Track when a referred user completes a conversion action and calculate rewards.

**Endpoint:** `POST /api/v1/conversions`

**Request Body:**
```json
{
  "referralCode": "ABC123XYZ",
  "refereeId": "user_789",
  "amount": 99.99,
  "metadata": {
    "orderId": "order_123",
    "source": "web"
  }
}
```

**Fields:**
- `referralCode` (required): The referral code
- `refereeId` (required): Unique identifier for the converted user
- `amount` (optional): Transaction amount (required for percentage-based rewards)
- `metadata` (optional): Additional data to store with the conversion

**Response (201 Created):**
```json
{
  "success": true,
  "referralId": "ref_xyz789",
  "conversionId": "conv_abc456",
  "rewardAmount": 10.00,
  "status": "CONVERTED"
}
```

**Reward Calculation:**
- **Fixed Currency:** Returns the fixed reward value from the campaign
- **Percentage:** Calculates `amount * (rewardValue / 100)`
- **Reward Cap:** Applies maximum reward limit if configured

---

### 4. Get Statistics

Retrieve referral statistics for your app or a specific campaign.

**Endpoint:** `GET /api/v1/stats`

**Query Parameters:**
- `campaignId` (optional): Filter by specific campaign

**Examples:**
```bash
# App-level stats
GET /api/v1/stats

# Campaign-level stats
GET /api/v1/stats?campaignId=campaign_abc123
```

**Response (200 OK):**
```json
{
  "totalReferrals": 100,
  "totalClicks": 75,
  "totalConversions": 30,
  "conversionRate": 40.00,
  "totalRewardValue": 300.00
}
```

**Metrics:**
- `totalReferrals`: Total referral codes created
- `totalClicks`: Number of referral links clicked
- `totalConversions`: Number of successful conversions
- `conversionRate`: (conversions / clicks) * 100
- `totalRewardValue`: Sum of all rewards earned

---

## Rate Limiting

Each API call counts towards your monthly usage limit. Monitor your usage in the dashboard.

**HTTP Status Code:** `429 Too Many Requests`

**Response:**
```json
{
  "error": "Monthly API limit exceeded"
}
```

**Tips:**
- Check your current usage in the dashboard
- Contact support to increase your limit
- Implement caching to reduce API calls

---

## Error Handling

All errors return a JSON response with an `error` field:

```json
{
  "error": "Error message description"
}
```

### Common Error Codes

| Status Code | Description |
|-------------|-------------|
| `400` | Bad Request - Invalid or missing parameters |
| `401` | Unauthorized - Missing or invalid API key |
| `403` | Forbidden - App or partner is suspended |
| `404` | Not Found - Resource does not exist |
| `429` | Too Many Requests - API limit exceeded |
| `500` | Internal Server Error - Contact support |

---

## Code Examples

### JavaScript / Node.js

```javascript
const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://your-domain.com/api/v1';

async function createReferral(campaignId, referrerId) {
  const response = await fetch(`${BASE_URL}/referrals`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ campaignId, referrerId })
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

async function trackClick(referralCode) {
  const response = await fetch(`${BASE_URL}/clicks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ referralCode })
  });
  
  return response.json();
}

async function trackConversion(referralCode, refereeId, amount) {
  const response = await fetch(`${BASE_URL}/conversions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      referralCode,
      refereeId,
      amount,
      metadata: { timestamp: new Date().toISOString() }
    })
  });
  
  return response.json();
}

// Usage
const referral = await createReferral('campaign_123', 'user_456');
await trackClick(referral.referralCode);
const conversion = await trackConversion(referral.referralCode, 'user_789', 99.99);
```

### Python

```python
import requests

class ReferralAPI:
    def __init__(self, api_key, base_url):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def create_referral(self, campaign_id, referrer_id):
        response = requests.post(
            f'{self.base_url}/referrals',
            headers=self.headers,
            json={'campaignId': campaign_id, 'referrerId': referrer_id}
        )
        response.raise_for_status()
        return response.json()
    
    def track_click(self, referral_code):
        response = requests.post(
            f'{self.base_url}/clicks',
            headers=self.headers,
            json={'referralCode': referral_code}
        )
        response.raise_for_status()
        return response.json()
    
    def track_conversion(self, referral_code, referee_id, amount=None):
        payload = {
            'referralCode': referral_code,
            'refereeId': referee_id
        }
        if amount:
            payload['amount'] = amount
        
        response = requests.post(
            f'{self.base_url}/conversions',
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()

# Usage
api = ReferralAPI('your_api_key_here', 'https://your-domain.com/api/v1')
referral = api.create_referral('campaign_123', 'user_456')
api.track_click(referral['referralCode'])
conversion = api.track_conversion(referral['referralCode'], 'user_789', 99.99)
```

### PHP

```php
<?php

class ReferralAPI {
    private $apiKey;
    private $baseUrl;
    
    public function __construct($apiKey, $baseUrl) {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
    }
    
    private function request($endpoint, $method = 'GET', $data = null) {
        $ch = curl_init($this->baseUrl . $endpoint);
        
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Content-Type: application/json'
        ];
        
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        
        if ($method === 'POST') {
            curl_setopt($ch, CURLOPT_POST, true);
            if ($data) {
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
            }
        }
        
        $response = curl_exec($ch);
        curl_close($ch);
        
        return json_decode($response, true);
    }
    
    public function createReferral($campaignId, $referrerId) {
        return $this->request('/referrals', 'POST', [
            'campaignId' => $campaignId,
            'referrerId' => $referrerId
        ]);
    }
    
    public function trackClick($referralCode) {
        return $this->request('/clicks', 'POST', [
            'referralCode' => $referralCode
        ]);
    }
    
    public function trackConversion($referralCode, $refereeId, $amount = null) {
        $data = [
            'referralCode' => $referralCode,
            'refereeId' => $refereeId
        ];
        if ($amount !== null) {
            $data['amount'] = $amount;
        }
        return $this->request('/conversions', 'POST', $data);
    }
}

// Usage
$api = new ReferralAPI('your_api_key_here', 'https://your-domain.com/api/v1');
$referral = $api->createReferral('campaign_123', 'user_456');
$api->trackClick($referral['referralCode']);
$conversion = $api->trackConversion($referral['referralCode'], 'user_789', 99.99);
```

---

## Campaign Configuration

When creating campaigns in the dashboard, you can configure:

### Referral Type
- **One-Sided**: Only the referrer receives a reward
- **Two-Sided**: Both referrer and referee receive rewards

### Reward Model
- **Fixed Currency**: Fixed dollar amount per conversion
- **Percentage**: Percentage of transaction amount

### Additional Settings
- **Reward Value**: The amount or percentage
- **Reward Cap**: Maximum reward per conversion (optional)
- **First Time User Only**: Restrict conversions to new users

---

## Best Practices

1. **Server-Side Integration**: Never expose API keys in client-side code
2. **Error Handling**: Always handle API errors gracefully
3. **Idempotency**: Store referral codes to avoid duplicate creations
4. **Testing**: Use test campaigns before going live
5. **Monitoring**: Check your API usage regularly in the dashboard
6. **Caching**: Cache referral codes to reduce API calls

---

## Support

- **Documentation**: Visit `/docs` for interactive documentation
- **Dashboard**: Access your analytics and settings at `/dashboard`
- **API Status**: Monitor your usage and limits in real-time

---

## Changelog

### Version 1.0 (Current)
- Initial release
- Core referral tracking (create, click, convert)
- Statistics API
- Usage metering
- Enterprise dashboard
