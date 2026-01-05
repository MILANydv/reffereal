'use client';

import { useState } from 'react';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'auth' | 'endpoints' | 'examples'>('quickstart');

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-blue-600">Referral Engine API</h1>
              <span className="ml-3 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">v1.0</span>
            </div>
            <div className="flex items-center">
              <a href="/login" className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900">
                Sign In
              </a>
              <a href="/signup" className="ml-4 px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                Get Started
              </a>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-4 sticky top-8">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('quickstart')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'quickstart'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Quick Start
                </button>
                <button
                  onClick={() => setActiveTab('auth')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'auth'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Authentication
                </button>
                <button
                  onClick={() => setActiveTab('endpoints')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'endpoints'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  API Endpoints
                </button>
                <button
                  onClick={() => setActiveTab('examples')}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === 'examples'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Code Examples
                </button>
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm p-8">
              {activeTab === 'quickstart' && <QuickStartSection />}
              {activeTab === 'auth' && <AuthSection />}
              {activeTab === 'endpoints' && <EndpointsSection />}
              {activeTab === 'examples' && <ExamplesSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickStartSection() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-6">Quick Start Guide</h1>
      
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-700">
          <strong>Welcome to Referral Engine API!</strong> This guide will help you integrate referral tracking into your application in minutes.
        </p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 1: Get Your API Key</h2>
      <ol className="list-decimal list-inside space-y-2 ml-4">
        <li>Sign up for an account at <code className="bg-gray-100 px-2 py-1 rounded">/signup</code></li>
        <li>Create a new App in your dashboard</li>
        <li>Copy your API key from the app details</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 2: Create a Campaign</h2>
      <ol className="list-decimal list-inside space-y-2 ml-4">
        <li>In your dashboard, select your app</li>
        <li>Click &ldquo;New Campaign&rdquo;</li>
        <li>Configure your referral type and reward model</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Step 3: Implement Referral Flow</h2>
      <p className="mb-4">The referral lifecycle consists of three main steps:</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 mb-2">1</div>
          <h3 className="font-semibold mb-2">Generate Code</h3>
          <p className="text-sm text-gray-600">Create a unique referral code for each referrer</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 mb-2">2</div>
          <h3 className="font-semibold mb-2">Track Click</h3>
          <p className="text-sm text-gray-600">Record when someone clicks a referral link</p>
        </div>
        <div className="border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600 mb-2">3</div>
          <h3 className="font-semibold mb-2">Track Conversion</h3>
          <p className="text-sm text-gray-600">Record when a referee completes the desired action</p>
        </div>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Base URL</h2>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-6">
        https://your-domain.com/api/v1
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Quick Example</h2>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
        <pre>{`// 1. Generate referral code
const response = await fetch('/api/v1/referrals', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campaignId: 'campaign_id',
    referrerId: 'user_123'
  })
});

const { referralCode } = await response.json();
// Share this code with your users!`}</pre>
      </div>
    </div>
  );
}

function AuthSection() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-6">Authentication</h1>

      <p className="text-lg mb-6">
        All API requests require authentication using Bearer tokens. Your API key acts as your Bearer token.
      </p>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Getting Your API Key</h2>
      <ol className="list-decimal list-inside space-y-2 ml-4 mb-6">
        <li>Log in to your partner dashboard</li>
        <li>Navigate to your app</li>
        <li>Your API key is displayed in the &ldquo;App Details&rdquo; section</li>
        <li>Keep this key secure and never expose it in client-side code</li>
      </ol>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Authentication Header</h2>
      <p className="mb-4">Include your API key in the Authorization header of every request:</p>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-6">
        Authorization: Bearer YOUR_API_KEY
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Example Request</h2>
      <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto mb-6">
        <pre>{`curl -X POST https://your-domain.com/api/v1/referrals \\
  -H "Authorization: Bearer sk_live_abc123..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "campaignId": "campaign_123",
    "referrerId": "user_456"
  }'`}</pre>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-4">Error Responses</h2>
      <div className="space-y-4">
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <code className="text-sm font-semibold">401 Unauthorized</code>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Error</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Missing or invalid API key</p>
          <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
            {`{ "error": "Invalid API key" }`}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <code className="text-sm font-semibold">403 Forbidden</code>
            <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Error</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">App or partner is suspended</p>
          <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
            {`{ "error": "App or partner is suspended" }`}
          </div>
        </div>

        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <code className="text-sm font-semibold">429 Too Many Requests</code>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">Warning</span>
          </div>
          <p className="text-sm text-gray-600 mb-2">Monthly API limit exceeded</p>
          <div className="bg-gray-900 text-gray-100 p-3 rounded font-mono text-xs">
            {`{ "error": "Monthly API limit exceeded" }`}
          </div>
        </div>
      </div>
    </div>
  );
}

function EndpointsSection() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-6">API Endpoints</h1>

      <div className="space-y-8">
        {/* Create Referral */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">POST</span>
            <code className="text-lg font-mono">/api/v1/referrals</code>
          </div>
          <p className="text-gray-700 mb-4">Create a new referral code for a user.</p>
          
          <h4 className="font-semibold mb-2">Request Body</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
            <pre>{`{
  "campaignId": "string",  // Required: Campaign ID
  "referrerId": "string"   // Required: Unique user identifier
}`}</pre>
          </div>

          <h4 className="font-semibold mb-2">Response (201 Created)</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`{
  "referralCode": "ABC123XYZ",
  "referralId": "referral_id_here"
}`}</pre>
          </div>
        </div>

        {/* Track Click */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">POST</span>
            <code className="text-lg font-mono">/api/v1/clicks</code>
          </div>
          <p className="text-gray-700 mb-4">Track when a user clicks on a referral link.</p>
          
          <h4 className="font-semibold mb-2">Request Body</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
            <pre>{`{
  "referralCode": "string"  // Required: The referral code
}`}</pre>
          </div>

          <h4 className="font-semibold mb-2">Response (200 OK)</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`{
  "success": true,
  "referralId": "referral_id",
  "status": "CLICKED"
}`}</pre>
          </div>
        </div>

        {/* Track Conversion */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded">POST</span>
            <code className="text-lg font-mono">/api/v1/conversions</code>
          </div>
          <p className="text-gray-700 mb-4">Track when a referred user completes a conversion action.</p>
          
          <h4 className="font-semibold mb-2">Request Body</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
            <pre>{`{
  "referralCode": "string",      // Required: The referral code
  "refereeId": "string",         // Required: Converted user ID
  "amount": number,              // Optional: Transaction amount
  "metadata": object             // Optional: Additional data
}`}</pre>
          </div>

          <h4 className="font-semibold mb-2">Response (201 Created)</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`{
  "success": true,
  "referralId": "referral_id",
  "conversionId": "conversion_id",
  "rewardAmount": 10.00,
  "status": "CONVERTED"
}`}</pre>
          </div>
        </div>

        {/* Get Stats */}
        <div className="border rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-semibold rounded">GET</span>
            <code className="text-lg font-mono">/api/v1/stats</code>
          </div>
          <p className="text-gray-700 mb-4">Retrieve referral statistics for your app or a specific campaign.</p>
          
          <h4 className="font-semibold mb-2">Query Parameters</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm mb-4 overflow-x-auto">
            <pre>{`?campaignId=string  // Optional: Filter by campaign`}</pre>
          </div>

          <h4 className="font-semibold mb-2">Response (200 OK)</h4>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`{
  "totalReferrals": 100,
  "totalClicks": 75,
  "totalConversions": 30,
  "conversionRate": 40.00,
  "totalRewardValue": 300.00
}`}</pre>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-blue-50 border-l-4 border-blue-500 p-4">
        <p className="text-sm text-blue-700">
          <strong>Rate Limiting:</strong> Each API call counts towards your monthly usage limit. Monitor your usage in the dashboard.
        </p>
      </div>
    </div>
  );
}

function ExamplesSection() {
  return (
    <div className="prose max-w-none">
      <h1 className="text-3xl font-bold mb-6">Code Examples</h1>

      <div className="space-y-8">
        {/* JavaScript Example */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">JavaScript / Node.js</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`// Initialize with your API key
const API_KEY = 'your_api_key_here';
const BASE_URL = 'https://your-domain.com/api/v1';

// Helper function for API calls
async function callAPI(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': \`Bearer \${API_KEY}\`,
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(\`\${BASE_URL}\${endpoint}\`, options);
  
  if (!response.ok) {
    throw new Error(\`API Error: \${response.status}\`);
  }
  
  return response.json();
}

// 1. Create referral code
async function createReferral(campaignId, referrerId) {
  return await callAPI('/referrals', 'POST', {
    campaignId,
    referrerId
  });
}

// 2. Track click
async function trackClick(referralCode) {
  return await callAPI('/clicks', 'POST', {
    referralCode
  });
}

// 3. Track conversion
async function trackConversion(referralCode, refereeId, amount = null) {
  return await callAPI('/conversions', 'POST', {
    referralCode,
    refereeId,
    amount,
    metadata: {
      source: 'web',
      timestamp: new Date().toISOString()
    }
  });
}

// 4. Get statistics
async function getStats(campaignId = null) {
  const query = campaignId ? \`?campaignId=\${campaignId}\` : '';
  return await callAPI(\`/stats\${query}\`);
}

// Example usage
async function main() {
  try {
    // Create referral
    const referral = await createReferral('campaign_123', 'user_456');
    console.log('Referral code:', referral.referralCode);
    
    // Track click
    await trackClick(referral.referralCode);
    console.log('Click tracked');
    
    // Track conversion
    const conversion = await trackConversion(
      referral.referralCode,
      'user_789',
      99.99
    );
    console.log('Conversion tracked. Reward:', conversion.rewardAmount);
    
    // Get stats
    const stats = await getStats();
    console.log('Stats:', stats);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();`}</pre>
          </div>
        </div>

        {/* Python Example */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">Python</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`import requests
from typing import Optional, Dict

class ReferralAPI:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        }
    
    def create_referral(self, campaign_id: str, referrer_id: str) -> Dict:
        """Create a new referral code."""
        response = requests.post(
            f'{self.base_url}/referrals',
            headers=self.headers,
            json={
                'campaignId': campaign_id,
                'referrerId': referrer_id
            }
        )
        response.raise_for_status()
        return response.json()
    
    def track_click(self, referral_code: str) -> Dict:
        """Track a referral click."""
        response = requests.post(
            f'{self.base_url}/clicks',
            headers=self.headers,
            json={'referralCode': referral_code}
        )
        response.raise_for_status()
        return response.json()
    
    def track_conversion(
        self,
        referral_code: str,
        referee_id: str,
        amount: Optional[float] = None,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Track a referral conversion."""
        payload = {
            'referralCode': referral_code,
            'refereeId': referee_id
        }
        if amount:
            payload['amount'] = amount
        if metadata:
            payload['metadata'] = metadata
        
        response = requests.post(
            f'{self.base_url}/conversions',
            headers=self.headers,
            json=payload
        )
        response.raise_for_status()
        return response.json()
    
    def get_stats(self, campaign_id: Optional[str] = None) -> Dict:
        """Get referral statistics."""
        params = {'campaignId': campaign_id} if campaign_id else {}
        response = requests.get(
            f'{self.base_url}/stats',
            headers=self.headers,
            params=params
        )
        response.raise_for_status()
        return response.json()

# Example usage
if __name__ == '__main__':
    api = ReferralAPI(
        api_key='your_api_key_here',
        base_url='https://your-domain.com/api/v1'
    )
    
    # Create referral
    referral = api.create_referral('campaign_123', 'user_456')
    print(f"Referral code: {referral['referralCode']}")
    
    # Track click
    api.track_click(referral['referralCode'])
    print("Click tracked")
    
    # Track conversion
    conversion = api.track_conversion(
        referral['referralCode'],
        'user_789',
        amount=99.99,
        metadata={'source': 'mobile'}
    )
    print(f"Conversion tracked. Reward: {conversion['rewardAmount']}")
    
    # Get stats
    stats = api.get_stats()
    print(f"Total conversions: {stats['totalConversions']}")`}</pre>
          </div>
        </div>

        {/* PHP Example */}
        <div>
          <h2 className="text-2xl font-semibold mb-4">PHP</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
            <pre>{`<?php

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
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        if ($httpCode >= 400) {
            throw new Exception("API Error: " . $httpCode);
        }
        
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
    
    public function getStats($campaignId = null) {
        $endpoint = '/stats';
        if ($campaignId) {
            $endpoint .= '?campaignId=' . urlencode($campaignId);
        }
        return $this->request($endpoint);
    }
}

// Example usage
$api = new ReferralAPI(
    'your_api_key_here',
    'https://your-domain.com/api/v1'
);

// Create referral
$referral = $api->createReferral('campaign_123', 'user_456');
echo "Referral code: " . $referral['referralCode'] . "\\n";

// Track click
$api->trackClick($referral['referralCode']);
echo "Click tracked\\n";

// Track conversion
$conversion = $api->trackConversion(
    $referral['referralCode'],
    'user_789',
    99.99
);
echo "Conversion tracked. Reward: " . $conversion['rewardAmount'] . "\\n";

// Get stats
$stats = $api->getStats();
echo "Total conversions: " . $stats['totalConversions'] . "\\n";

?>`}</pre>
          </div>
        </div>
      </div>

      <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-500 p-4">
        <p className="text-sm text-yellow-700">
          <strong>Security Note:</strong> Never expose your API key in client-side code or public repositories. Always make API calls from your backend server.
        </p>
      </div>
    </div>
  );
}
