# Referral Platform Demo

This demo shows how to integrate the Referral Platform API into your applications. It provides examples in multiple programming languages and frameworks.

## Features Demonstrated

- **API Key Authentication**
- **Creating Referrals**
- **Tracking Clicks**
- **Managing Conversions**
- **Analytics Integration**
- **Webhook Handling**

## Quick Start

1. Get your API key from the [Referral Platform Dashboard](https://your-domain.com/dashboard/v2/api-keys)
2. Replace `YOUR_API_KEY` in the examples below with your actual API key
3. Run the examples

## Supported Languages

- [Node.js](#nodejs)
- [Python](#python)
- [PHP](#php)
- [Ruby](#ruby)
- [Go](#go)
- [Java](#java)

---

## Node.js

### Installation

```bash
npm install axios
```

### Basic Usage

```javascript
const axios = require('axios');

class ReferralAPI {
    constructor(apiKey, baseURL = 'https://api.your-domain.com') {
        this.apiKey = apiKey;
        this.baseURL = baseURL;
        this.client = axios.create({
            baseURL,
            headers: {
                'X-API-Key': apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    // Create a new referral
    async createReferral(campaignId, referrerId, refereeId = null) {
        try {
            const response = await this.client.post('/v1/referrals', {
                campaignId,
                referrerId,
                refereeId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating referral:', error.response?.data || error.message);
            throw error;
        }
    }

    // Track a referral click
    async trackClick(referralCode, metadata = {}) {
        try {
            const response = await this.client.post(`/v1/referrals/${referralCode}/click`, {
                metadata
            });
            return response.data;
        } catch (error) {
            console.error('Error tracking click:', error.response?.data || error.message);
            throw error;
        }
    }

    // Record a conversion
    async recordConversion(referralCode, amount = null, metadata = {}) {
        try {
            const response = await this.client.post(`/v1/referrals/${referralCode}/convert`, {
                amount,
                metadata
            });
            return response.data;
        } catch (error) {
            console.error('Error recording conversion:', error.response?.data || error.message);
            throw error;
        }
    }

    // Get referral statistics
    async getStats(campaignId = null) {
        try {
            const params = campaignId ? { campaignId } : {};
            const response = await this.client.get('/v1/stats', { params });
            return response.data;
        } catch (error) {
            console.error('Error fetching stats:', error.response?.data || error.message);
            throw error;
        }
    }
}

// Usage Example
async function main() {
    const api = new ReferralAPI('YOUR_API_KEY');
    
    try {
        // Create a referral
        const referral = await api.createReferral('campaign_123', 'user_456');
        console.log('Referral created:', referral);
        
        // Track a click (when someone clicks the referral link)
        const click = await api.trackClick(referral.referralCode, {
            userAgent: navigator.userAgent,
            ipAddress: '192.168.1.1'
        });
        console.log('Click tracked:', click);
        
        // Record a conversion (when the referee makes a purchase)
        const conversion = await api.recordConversion(referral.referralCode, 99.99, {
            orderId: 'order_789',
            productId: 'prod_abc'
        });
        console.log('Conversion recorded:', conversion);
        
        // Get stats
        const stats = await api.getStats();
        console.log('Stats:', stats);
        
    } catch (error) {
        console.error('API Error:', error);
    }
}

main();
```

### Express.js Integration

```javascript
const express = require('express');
const { ReferralAPI } = require('./referral-api');

const app = express();
app.use(express.json());

const referralAPI = new ReferralAPI('YOUR_API_KEY');

// Middleware to extract user info
app.use((req, res, next) => {
    // Extract user ID from your auth system
    req.userId = req.headers['x-user-id'];
    next();
});

// Create referral endpoint
app.post('/api/referrals', async (req, res) => {
    try {
        const { campaignId, refereeId } = req.body;
        const referral = await referralAPI.createReferral(campaignId, req.userId, refereeId);
        res.json(referral);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Track referral link click
app.get('/r/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const metadata = {
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip,
            referrer: req.headers.referer
        };
        
        await referralAPI.trackClick(code, metadata);
        
        // Redirect to your application
        res.redirect(`https://your-app.com/signup?ref=${code}`);
    } catch (error) {
        res.status(400).send('Invalid referral code');
    }
});

// Handle conversions (webhook endpoint)
app.post('/webhooks/conversion', async (req, res) => {
    try {
        const { referralCode, amount, metadata } = req.body;
        await referralAPI.recordConversion(referralCode, amount, metadata);
        res.json({ success: true });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

---

## Python

### Installation

```bash
pip install requests
```

### Basic Usage

```python
import requests
import json

class ReferralAPI:
    def __init__(self, api_key, base_url='https://api.your-domain.com'):
        self.api_key = api_key
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })
    
    def create_referral(self, campaign_id, referrer_id, referee_id=None):
        """Create a new referral"""
        try:
            response = self.session.post(
                f'{self.base_url}/v1/referrals',
                json={
                    'campaignId': campaign_id,
                    'referrerId': referrer_id,
                    'refereeId': referee_id
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            print(f'Error creating referral: {error}')
            raise error
    
    def track_click(self, referral_code, metadata=None):
        """Track a referral click"""
        try:
            response = self.session.post(
                f'{self.base_url}/v1/referrals/{referral_code}/click',
                json={'metadata': metadata or {}}
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            print(f'Error tracking click: {error}')
            raise error
    
    def record_conversion(self, referral_code, amount=None, metadata=None):
        """Record a conversion"""
        try:
            response = self.session.post(
                f'{self.base_url}/v1/referrals/{referral_code}/convert',
                json={
                    'amount': amount,
                    'metadata': metadata or {}
                }
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            print(f'Error recording conversion: {error}')
            raise error
    
    def get_stats(self, campaign_id=None):
        """Get referral statistics"""
        try:
            params = {'campaignId': campaign_id} if campaign_id else {}
            response = self.session.get(f'{self.base_url}/v1/stats', params=params)
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as error:
            print(f'Error fetching stats: {error}')
            raise error

# Usage Example
def main():
    api = ReferralAPI('YOUR_API_KEY')
    
    try:
        # Create a referral
        referral = api.create_referral('campaign_123', 'user_456')
        print('Referral created:', referral)
        
        # Track a click
        click = api.track_click(referral['referralCode'], {
            'userAgent': 'Mozilla/5.0...',
            'ipAddress': '192.168.1.1'
        })
        print('Click tracked:', click)
        
        # Record a conversion
        conversion = api.record_conversion(referral['referralCode'], 99.99, {
            'orderId': 'order_789',
            'productId': 'prod_abc'
        })
        print('Conversion recorded:', conversion)
        
        # Get stats
        stats = api.get_stats()
        print('Stats:', stats)
        
    except Exception as error:
        print('API Error:', error)

if __name__ == '__main__':
    main()
```

### Django Integration

```python
# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .referral_api import ReferralAPI

referral_api = ReferralAPI('YOUR_API_KEY')

@require_http_methods(["POST"])
@csrf_exempt
def create_referral(request):
    try:
        data = json.loads(request.body)
        referral = referral_api.create_referral(
            campaign_id=data['campaign_id'],
            referrer_id=request.user.id,
            referee_id=data.get('referee_id')
        )
        return JsonResponse(referral)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@require_http_methods(["GET"])
def referral_click(request, code):
    try:
        metadata = {
            'userAgent': request.META.get('HTTP_USER_AGENT'),
            'ipAddress': request.META.get('REMOTE_ADDR'),
            'referrer': request.META.get('HTTP_REFERER')
        }
        
        referral_api.track_click(code, metadata)
        
        # Redirect to your application
        return JsonResponse({
            'redirect_url': f'https://your-app.com/signup?ref={code}'
        })
    except Exception as e:
        return JsonResponse({'error': 'Invalid referral code'}, status=400)

@require_http_methods(["POST"])
@csrf_exempt
def conversion_webhook(request):
    try:
        data = json.loads(request.body)
        referral_api.record_conversion(
            referral_code=data['referral_code'],
            amount=data.get('amount'),
            metadata=data.get('metadata', {})
        )
        return JsonResponse({'success': True})
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)
```

---

## PHP

### Installation

```bash
composer require guzzlehttp/guzzle
```

### Basic Usage

```php
<?php

require 'vendor/autoload.php';

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ReferralAPI {
    private $apiKey;
    private $baseUrl;
    private $client;
    
    public function __construct($apiKey, $baseUrl = 'https://api.your-domain.com') {
        $this->apiKey = $apiKey;
        $this->baseUrl = $baseUrl;
        $this->client = new Client([
            'base_uri' => $baseUrl,
            'headers' => [
                'X-API-Key' => $apiKey,
                'Content-Type' => 'application/json'
            ]
        ]);
    }
    
    public function createReferral($campaignId, $referrerId, $refereeId = null) {
        try {
            $response = $this->client->post('/v1/referrals', [
                'json' => [
                    'campaignId' => $campaignId,
                    'referrerId' => $referrerId,
                    'refereeId' => $refereeId
                ]
            ]);
            
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            error_log('Error creating referral: ' . $e->getMessage());
            throw $e;
        }
    }
    
    public function trackClick($referralCode, $metadata = []) {
        try {
            $response = $this->client->post("/v1/referrals/{$referralCode}/click", [
                'json' => ['metadata' => $metadata]
            ]);
            
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            error_log('Error tracking click: ' . $e->getMessage());
            throw $e;
        }
    }
    
    public function recordConversion($referralCode, $amount = null, $metadata = []) {
        try {
            $response = $this->client->post("/v1/referrals/{$referralCode}/convert", [
                'json' => [
                    'amount' => $amount,
                    'metadata' => $metadata
                ]
            ]);
            
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            error_log('Error recording conversion: ' . $e->getMessage());
            throw $e;
        }
    }
    
    public function getStats($campaignId = null) {
        try {
            $params = $campaignId ? ['campaignId' => $campaignId] : [];
            
            $response = $this->client->get('/v1/stats', [
                'query' => $params
            ]);
            
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            error_log('Error fetching stats: ' . $e->getMessage());
            throw $e;
        }
    }
}

// Usage Example
function main() {
    $api = new ReferralAPI('YOUR_API_KEY');
    
    try {
        // Create a referral
        $referral = $api->createReferral('campaign_123', 'user_456');
        echo 'Referral created: ' . json_encode($referral) . "\n";
        
        // Track a click
        $click = $api->trackClick($referral['referralCode'], [
            'userAgent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'ipAddress' => $_SERVER['REMOTE_ADDR'] ?? ''
        ]);
        echo 'Click tracked: ' . json_encode($click) . "\n";
        
        // Record a conversion
        $conversion = $api->recordConversion($referral['referralCode'], 99.99, [
            'orderId' => 'order_789',
            'productId' => 'prod_abc'
        ]);
        echo 'Conversion recorded: ' . json_encode($conversion) . "\n";
        
        // Get stats
        $stats = $api->getStats();
        echo 'Stats: ' . json_encode($stats) . "\n";
        
    } catch (Exception $e) {
        echo 'API Error: ' . $e->getMessage() . "\n";
    }
}

main();
?>
```

### Laravel Integration

```php
<?php

// app/Services/ReferralAPI.php
namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;

class ReferralAPI
{
    private $apiKey;
    private $baseUrl;
    private $client;
    
    public function __construct()
    {
        $this->apiKey = config('services.referral.api_key');
        $this->baseUrl = config('services.referral.base_url');
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'X-API-Key' => $this->apiKey,
                'Content-Type' => 'application/json'
            ]
        ]);
    }
    
    public function createReferral($campaignId, $referrerId, $refereeId = null)
    {
        try {
            $response = $this->client->post('/v1/referrals', [
                'json' => [
                    'campaignId' => $campaignId,
                    'referrerId' => $referrerId,
                    'refereeId' => $refereeId
                ]
            ]);
            
            return json_decode($response->getBody(), true);
        } catch (RequestException $e) {
            \Log::error('Referral API Error: ' . $e->getMessage());
            throw $e;
        }
    }
    
    // ... other methods similar to above
}

// app/Http/Controllers/ReferralController.php
namespace App\Http\Controllers;

use App\Services\ReferralAPI;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ReferralController extends Controller
{
    private $referralAPI;
    
    public function __construct(ReferralAPI $referralAPI)
    {
        $this->referralAPI = $referralAPI;
    }
    
    public function create(Request $request): JsonResponse
    {
        try {
            $referral = $this->referralAPI->createReferral(
                $request->campaign_id,
                $request->user()->id,
                $request->referee_id
            );
            
            return response()->json($referral);
        } catch (\Exception $e) {
            return response()->json(['error' => $e->getMessage()], 400);
        }
    }
    
    public function trackClick($code): JsonResponse
    {
        try {
            $metadata = [
                'userAgent' => $request->userAgent(),
                'ipAddress' => $request->ip(),
                'referrer' => $request->headers->get('referer')
            ];
            
            $this->referralAPI->trackClick($code, $metadata);
            
            return response()->json([
                'redirect_url' => config('app.url') . "/signup?ref={$code}"
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid referral code'], 400);
        }
    }
}
?>
```

---

## Ruby

### Installation

```bash
gem install httparty
```

### Basic Usage

```ruby
require 'httparty'

class ReferralAPI
  include HTTParty
  base_uri 'https://api.your-domain.com'
  
  def initialize(api_key)
    @api_key = api_key
    @headers = {
      'X-API-Key' => api_key,
      'Content-Type' => 'application/json'
    }
  end
  
  def create_referral(campaign_id, referrer_id, referee_id = nil)
    response = self.class.post('/v1/referrals', 
      headers: @headers,
      body: {
        campaignId: campaign_id,
        referrerId: referrer_id,
        refereeId: referee_id
      }.to_json
    )
    
    raise "Error: #{response.code}" unless response.success?
    response.parsed_response
  end
  
  def track_click(referral_code, metadata = {})
    response = self.class.post("/v1/referrals/#{referral_code}/click",
      headers: @headers,
      body: { metadata: metadata }.to_json
    )
    
    raise "Error: #{response.code}" unless response.success?
    response.parsed_response
  end
  
  def record_conversion(referral_code, amount = nil, metadata = {})
    response = self.class.post("/v1/referrals/#{referral_code}/convert",
      headers: @headers,
      body: {
        amount: amount,
        metadata: metadata
      }.to_json
    )
    
    raise "Error: #{response.code}" unless response.success?
    response.parsed_response
  end
  
  def get_stats(campaign_id = nil)
    params = campaign_id ? { campaignId: campaign_id } : {}
    
    response = self.class.get('/v1/stats',
      headers: @headers,
      query: params
    )
    
    raise "Error: #{response.code}" unless response.success?
    response.parsed_response
  end
end

# Usage Example
def main
  api = ReferralAPI.new('YOUR_API_KEY')
  
  begin
    # Create a referral
    referral = api.create_referral('campaign_123', 'user_456')
    puts "Referral created: #{referral}"
    
    # Track a click
    click = api.track_click(referral['referralCode'], {
      'userAgent' => 'Mozilla/5.0...',
      'ipAddress' => '192.168.1.1'
    })
    puts "Click tracked: #{click}"
    
    # Record a conversion
    conversion = api.record_conversion(referral['referralCode'], 99.99, {
      'orderId' => 'order_789',
      'productId' => 'prod_abc'
    })
    puts "Conversion recorded: #{conversion}"
    
    # Get stats
    stats = api.get_stats()
    puts "Stats: #{stats}"
    
  rescue => e
    puts "API Error: #{e.message}"
  end
end

main if __FILE__ == $PROGRAM_NAME
```

---

## Go

### Installation

```bash
go get github.com/google/go-querystring
go get github.com/mitchellh/mapstructure
```

### Basic Usage

```go
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

type ReferralAPI struct {
	apiKey  string
	baseURL string
	client  *http.Client
}

type Referral struct {
	ID           string `json:"id"`
	ReferralCode string `json:"referralCode"`
	CampaignID   string `json:"campaignId"`
	ReferrerID   string `json:"referrerId"`
	Status       string `json:"status"`
	CreatedAt    string `json:"createdAt"`
}

type Click struct {
	ID        string `json:"id"`
	ClickedAt string `json:"clickedAt"`
}

type Conversion struct {
	ID            string  `json:"id"`
	Amount        float64 `json:"amount"`
	ConvertedAt   string  `json:"convertedAt"`
}

type Stats struct {
	TotalReferrals  int     `json:"totalReferrals"`
	TotalClicks     int     `json:"totalClicks"`
	TotalConversions int   `json:"totalConversions"`
	ConversionRate  float64 `json:"conversionRate"`
}

func NewReferralAPI(apiKey string) *ReferralAPI {
	return &ReferralAPI{
		apiKey:  apiKey,
		baseURL: "https://api.your-domain.com",
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (api *ReferralAPI) makeRequest(method, endpoint string, data interface{}) ([]byte, error) {
	var req *http.Request
	var err error
	
	if data != nil {
		jsonData, _ := json.Marshal(data)
		req, err = http.NewRequest(method, api.baseURL+endpoint, bytes.NewBuffer(jsonData))
	} else {
		req, err = http.NewRequest(method, api.baseURL+endpoint, nil)
	}
	
	if err != nil {
		return nil, err
	}
	
	req.Header.Set("X-API-Key", api.apiKey)
	req.Header.Set("Content-Type", "application/json")
	
	resp, err := api.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()
	
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	
	if resp.StatusCode >= 400 {
		return nil, fmt.Errorf("API error: %s", string(body))
	}
	
	return body, nil
}

func (api *ReferralAPI) CreateReferral(campaignID, referrerID string, refereeID *string) (*Referral, error) {
	data := map[string]interface{}{
		"campaignId": campaignID,
		"referrerId": referrerID,
	}
	
	if refereeID != nil {
		data["refereeId"] = *refereeID
	}
	
	body, err := api.makeRequest("POST", "/v1/referrals", data)
	if err != nil {
		return nil, err
	}
	
	var referral Referral
	if err := json.Unmarshal(body, &referral); err != nil {
		return nil, err
	}
	
	return &referral, nil
}

func (api *ReferralAPI) TrackClick(referralCode string, metadata map[string]interface{}) (*Click, error) {
	data := map[string]interface{}{
		"metadata": metadata,
	}
	
	body, err := api.makeRequest("POST", fmt.Sprintf("/v1/referrals/%s/click", referralCode), data)
	if err != nil {
		return nil, err
	}
	
	var click Click
	if err := json.Unmarshal(body, &click); err != nil {
		return nil, err
	}
	
	return &click, nil
}

func (api *ReferralAPI) RecordConversion(referralCode string, amount *float64, metadata map[string]interface{}) (*Conversion, error) {
	data := map[string]interface{}{
		"metadata": metadata,
	}
	
	if amount != nil {
		data["amount"] = *amount
	}
	
	body, err := api.makeRequest("POST", fmt.Sprintf("/v1/referrals/%s/convert", referralCode), data)
	if err != nil {
		return nil, err
	}
	
	var conversion Conversion
	if err := json.Unmarshal(body, &conversion); err != nil {
		return nil, err
	}
	
	return &conversion, nil
}

func (api *ReferralAPI) GetStats(campaignID *string) (*Stats, error) {
	endpoint := "/v1/stats"
	if campaignID != nil {
		endpoint += fmt.Sprintf("?campaignId=%s", *campaignID)
	}
	
	body, err := api.makeRequest("GET", endpoint, nil)
	if err != nil {
		return nil, err
	}
	
	var stats Stats
	if err := json.Unmarshal(body, &stats); err != nil {
		return nil, err
	}
	
	return &stats, nil
}

// Usage Example
func main() {
	api := NewReferralAPI("YOUR_API_KEY")
	
	// Create a referral
	referral, err := api.CreateReferral("campaign_123", "user_456", nil)
	if err != nil {
		fmt.Printf("Error creating referral: %v\n", err)
		return
	}
	fmt.Printf("Referral created: %+v\n", referral)
	
	// Track a click
	click, err := api.TrackClick(referral.ReferralCode, map[string]interface{}{
		"userAgent": "Mozilla/5.0...",
		"ipAddress": "192.168.1.1",
	})
	if err != nil {
		fmt.Printf("Error tracking click: %v\n", err)
		return
	}
	fmt.Printf("Click tracked: %+v\n", click)
	
	// Record a conversion
	amount := 99.99
	conversion, err := api.RecordConversion(referral.ReferralCode, &amount, map[string]interface{}{
		"orderId":   "order_789",
		"productId": "prod_abc",
	})
	if err != nil {
		fmt.Printf("Error recording conversion: %v\n", err)
		return
	}
	fmt.Printf("Conversion recorded: %+v\n", conversion)
	
	// Get stats
	stats, err := api.GetStats(nil)
	if err != nil {
		fmt.Printf("Error fetching stats: %v\n", err)
		return
	}
	fmt.Printf("Stats: %+v\n", stats)
}
```

---

## Java

### Installation

Add to your `pom.xml`:

```xml
<dependency>
    <groupId>com.squareup.okhttp3</groupId>
    <artifactId>okhttp</artifactId>
    <version>4.10.0</version>
</dependency>
<dependency>
    <groupId>com.google.code.gson</groupId>
    <artifactId>gson</artifactId>
    <version>2.10.1</version>
</dependency>
```

### Basic Usage

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.TimeUnit;

public class ReferralAPI {
    private final String apiKey;
    private final String baseURL;
    private final OkHttpClient client;
    private final Gson gson;
    
    public ReferralAPI(String apiKey) {
        this(apiKey, "https://api.your-domain.com");
    }
    
    public ReferralAPI(String apiKey, String baseURL) {
        this.apiKey = apiKey;
        this.baseURL = baseURL;
        this.client = new OkHttpClient.Builder()
                .connectTimeout(30, TimeUnit.SECONDS)
                .writeTimeout(30, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        this.gson = new Gson();
    }
    
    private JsonObject makeRequest(String method, String endpoint, Map<String, Object> data) throws IOException {
        Request.Builder requestBuilder = new Request.Builder()
                .url(baseURL + endpoint)
                .addHeader("X-API-Key", apiKey)
                .addHeader("Content-Type", "application/json");
        
        if (data != null && (method.equals("POST") || method.equals("PUT"))) {
            RequestBody body = RequestBody.create(
                gson.toJson(data),
                MediaType.parse("application/json")
            );
            requestBuilder.method(method, body);
        } else {
            requestBuilder.method(method, null);
        }
        
        try (Response response = client.newCall(requestBuilder.build()).execute()) {
            String responseBody = response.body().string();
            
            if (!response.isSuccessful()) {
                throw new IOException("API Error: " + response.code() + " - " + responseBody);
            }
            
            return gson.fromJson(responseBody, JsonObject.class);
        }
    }
    
    public Referral createReferral(String campaignId, String referrerId, String refereeId) throws IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("campaignId", campaignId);
        data.put("referrerId", referrerId);
        if (refereeId != null) {
            data.put("refereeId", refereeId);
        }
        
        JsonObject response = makeRequest("POST", "/v1/referrals", data);
        return gson.fromJson(response, Referral.class);
    }
    
    public Click trackClick(String referralCode, Map<String, Object> metadata) throws IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("metadata", metadata != null ? metadata : new HashMap<>());
        
        JsonObject response = makeRequest("POST", "/v1/referrals/" + referralCode + "/click", data);
        return gson.fromJson(response, Click.class);
    }
    
    public Conversion recordConversion(String referralCode, Double amount, Map<String, Object> metadata) throws IOException {
        Map<String, Object> data = new HashMap<>();
        data.put("metadata", metadata != null ? metadata : new HashMap<>());
        if (amount != null) {
            data.put("amount", amount);
        }
        
        JsonObject response = makeRequest("POST", "/v1/referrals/" + referralCode + "/convert", data);
        return gson.fromJson(response, Conversion.class);
    }
    
    public Stats getStats(String campaignId) throws IOException {
        String endpoint = "/v1/stats";
        if (campaignId != null) {
            endpoint += "?campaignId=" + campaignId;
        }
        
        JsonObject response = makeRequest("GET", endpoint, null);
        return gson.fromJson(response, Stats.class);
    }
    
    // Model classes
    public static class Referral {
        public String id;
        public String referralCode;
        public String campaignId;
        public String referrerId;
        public String status;
        public String createdAt;
    }
    
    public static class Click {
        public String id;
        public String clickedAt;
    }
    
    public static class Conversion {
        public String id;
        public double amount;
        public String convertedAt;
    }
    
    public static class Stats {
        public int totalReferrals;
        public int totalClicks;
        public int totalConversions;
        public double conversionRate;
    }
}

// Usage Example
public class ReferralDemo {
    public static void main(String[] args) {
        ReferralAPI api = new ReferralAPI("YOUR_API_KEY");
        
        try {
            // Create a referral
            ReferralAPI.Referral referral = api.createReferral("campaign_123", "user_456", null);
            System.out.println("Referral created: " + referral.referralCode);
            
            // Track a click
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("userAgent", "Mozilla/5.0...");
            metadata.put("ipAddress", "192.168.1.1");
            
            ReferralAPI.Click click = api.trackClick(referral.referralCode, metadata);
            System.out.println("Click tracked: " + click.clickedAt);
            
            // Record a conversion
            ReferralAPI.Conversion conversion = api.recordConversion(
                referral.referralCode, 
                99.99, 
                Map.of("orderId", "order_789", "productId", "prod_abc")
            );
            System.out.println("Conversion recorded: " + conversion.amount);
            
            // Get stats
            ReferralAPI.Stats stats = api.getStats(null);
            System.out.println("Stats: " + stats.totalReferrals + " referrals, " + 
                             stats.conversionRate + "% conversion rate");
            
        } catch (IOException e) {
            System.err.println("API Error: " + e.getMessage());
        }
    }
}
```

---

## Error Handling

All examples include proper error handling. Common error responses:

```json
{
  "error": "Invalid API key",
  "code": "UNAUTHORIZED"
}
```

```json
{
  "error": "Campaign not found",
  "code": "NOT_FOUND"
}
```

```json
{
  "error": "Referral code has expired",
  "code": "EXPIRED"
}
```

## Rate Limiting

The API has rate limits:
- **1000 requests per hour** for Free tier
- **10000 requests per hour** for Growth tier  
- **100000 requests per hour** for Pro tier
- **Unlimited** for Enterprise tier

When rate limited, you'll receive a `429 Too Many Requests` response:

```json
{
  "error": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "resetTime": "2023-12-01T12:00:00Z"
}
```

## Webhook Integration

For real-time updates, set up webhooks in your dashboard. The platform will POST events to your webhook URL:

```javascript
// Express.js webhook handler
app.post('/webhooks/referral-platform', express.raw({type: 'application/json'}), (req, res) => {
    const signature = req.headers['x-signature'];
    const payload = req.body;
    
    // Verify webhook signature
    if (!verifySignature(payload, signature)) {
        return res.status(401).send('Invalid signature');
    }
    
    const event = JSON.parse(payload);
    
    switch (event.type) {
        case 'referral.created':
            console.log('New referral:', event.data);
            break;
        case 'referral.clicked':
            console.log('Referral clicked:', event.data);
            break;
        case 'referral.converted':
            console.log('Referral converted:', event.data);
            // Trigger rewards, send emails, etc.
            break;
    }
    
    res.status(200).send('OK');
});
```

## Best Practices

1. **Cache API responses** where appropriate to reduce API calls
2. **Handle rate limiting** gracefully with exponential backoff
3. **Store referral codes** in your database for quick lookup
4. **Validate webhook signatures** to ensure security
5. **Monitor your API usage** through the dashboard
6. **Use sandbox mode** for testing: `https://sandbox-api.your-domain.com`

## Support

- **Documentation**: [https://docs.your-domain.com](https://docs.your-domain.com)
- **Dashboard**: [https://your-domain.com/dashboard](https://your-domain.com/dashboard)
- **Email**: support@your-domain.com
- **Discord**: [https://discord.gg/your-domain](https://discord.gg/your-domain)

## License

This demo is provided under the MIT License. See the main project repository for details.