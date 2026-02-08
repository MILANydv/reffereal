'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { Play, CheckCircle, XCircle, Loader, Copy, ExternalLink, AlertTriangle, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const API_BASE_URL = 'https://reffereal.vercel.app/api/v1';

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
  status?: number;
}

export default function DemoPage() {
  const { selectedApp } = useAppStore();
  const [apiKey, setApiKey] = useState(selectedApp?.apiKey || '');
  const [campaignId, setCampaignId] = useState('');
  const [referrerId, setReferrerId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [refereeId, setRefereeId] = useState('referee_' + Math.random().toString(36).substr(2, 9));
  const [referralCode, setReferralCode] = useState('');
  const [amount, setAmount] = useState('99.99');
  const [userId, setUserId] = useState('user_' + Math.random().toString(36).substr(2, 9));
  const [loading, setLoading] = useState<string | null>(null);
  const [responses, setResponses] = useState<Record<string, ApiResponse>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const makeRequest = async (endpoint: string, method: string, body?: any): Promise<ApiResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method,
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      return {
        success: response.ok,
        data: data,
        error: response.ok ? undefined : data.error || data.message || 'Request failed',
        status: response.status,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Network error',
        status: 0,
      };
    }
  };

  const handleCreateReferral = async () => {
    if (!apiKey || !campaignId || !referrerId) {
      toast.error('Please fill in API Key, Campaign ID, and Referrer ID');
      return;
    }

    setLoading('create');
    const response = await makeRequest('/referrals', 'POST', {
      campaignId,
      referrerId,
    });

    setResponses({ ...responses, create: response });
    setLoading(null);

    if (response.success && response.data?.referralCode) {
      setReferralCode(response.data.referralCode);
      setUserId(referrerId);
      if (response.data.warning) {
        toast((t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-orange-600 flex items-center gap-1">
              <AlertTriangle size={16} /> Fraud Warning
            </span>
            <span className="text-sm">{response.data.warning}</span>
            {response.data.reasons && (
              <ul className="list-disc pl-4 text-xs text-gray-600 mt-1">
                {response.data.reasons.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        ), { duration: 5000, icon: '⚠️' });
      } else {
        toast.success('Referral created successfully');
      }
    } else {
      toast.error(response.error || 'Failed to create referral');
    }
  };

  const handleTrackClick = async () => {
    if (!apiKey || !referralCode) {
      toast.error('Please create a referral first or enter a referral code');
      return;
    }

    setLoading('click');
    const response = await makeRequest('/clicks', 'POST', {
      referralCode,
    });

    setResponses({ ...responses, click: response });
    setLoading(null);

    if (response.success) {
      toast.success('Click tracked successfully');
    } else {
      toast.error(response.error || 'Failed to track click');
    }
  };

  const handleTrackConversion = async () => {
    if (!apiKey || !referralCode) {
      toast.error('Please create a referral first or enter a referral code');
      return;
    }

    setLoading('convert');
    const response = await makeRequest('/conversions', 'POST', {
      referralCode,
      refereeId: refereeId || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      metadata: {
        orderId: 'order_' + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
      },
    });

    setResponses({ ...responses, convert: response });
    setLoading(null);

    if (response.success) {
      if (response.data?.status === 'FLAGGED' || response.data?.warning || (response.data?.status === 'CONVERTED' && response.data?.reasons)) {
        // Check if response contains fraud info directly or in status
        const reasons = response.data.reasons || [];
        toast((t) => (
          <div className="flex flex-col gap-1">
            <span className="font-bold text-red-600 flex items-center gap-1">
              <ShieldAlert size={16} /> Fraud Detected
            </span>
            <span className="text-sm">Conversion flagged as suspicious.</span>
            {reasons.length > 0 && (
              <ul className="list-disc pl-4 text-xs text-gray-600 mt-1">
                {reasons.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            )}
          </div>
        ), { duration: 6000, icon: '🛑' });
      } else {
        toast.success('Conversion tracked successfully');
      }
    } else {
      toast.error(response.error || 'Failed to track conversion');
    }
  };

  const handleGetStats = async () => {
    if (!apiKey) {
      alert('Please enter your API Key');
      return;
    }

    setLoading('stats');
    const url = campaignId ? `/stats?campaignId=${campaignId}` : '/stats';
    const response = await makeRequest(url, 'GET');

    setResponses({ ...responses, stats: response });
    setLoading(null);
  };

  const handleGetUserStats = async () => {
    if (!apiKey || !userId) {
      toast.error('Please enter your API Key and User ID');
      return;
    }

    setLoading('userStats');
    const url = campaignId ? `/users/${userId}/stats?campaignId=${campaignId}` : `/users/${userId}/stats`;
    const response = await makeRequest(url, 'GET');

    setResponses({ ...responses, userStats: response });
    setLoading(null);

    if (response.success) {
      toast.success('User stats retrieved successfully');
    } else {
      toast.error(response.error || 'Failed to get user stats');
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">API Simulator</h1>
            <p className="text-gray-500 mt-1">Test your referral API endpoints in real-time</p>
          </div>
          <Link
            href="/dashboard/v2/api-keys"
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <ExternalLink size={16} />
            Back to API Keys
          </Link>
        </div>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                API Key <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk_live_..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
              {selectedApp && (
                <button
                  onClick={() => setApiKey(selectedApp.apiKey)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Use current app API key
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Campaign ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignId}
                  onChange={(e) => setCampaignId(e.target.value)}
                  placeholder="campaign_123"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Referrer ID
                </label>
                <input
                  type="text"
                  value={referrerId}
                  onChange={(e) => setReferrerId(e.target.value)}
                  placeholder="user_123"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                User ID (for User Stats in step 5)
              </label>
              <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="user_123"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
              />
              <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">Must match Referrer ID to see data. Auto-syncs when you create a referral in step 1.</p>
            </div>
            <div className="text-xs text-gray-500 bg-blue-50 dark:bg-blue-900/10 p-3 rounded-lg">
              <strong>Base URL:</strong> {API_BASE_URL}
            </div>
          </CardBody>
        </Card>

        {/* Create Referral */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>1. Create Referral</span>
              <Button
                onClick={handleCreateReferral}
                disabled={loading === 'create' || !apiKey || !campaignId || !referrerId}
                className="flex items-center gap-2"
              >
                {loading === 'create' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Test Endpoint
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">POST /referrals</span>
                  <button
                    onClick={() => copyToClipboard(`curl -X POST ${API_BASE_URL}/referrals \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"campaignId": "${campaignId}", "referrerId": "${referrerId}"}'`, 'curl-create')}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {copied === 'curl-create' ? <CheckCircle size={12} /> : <Copy size={12} />}
                    Copy cURL
                  </button>
                </div>
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                  {JSON.stringify({
                    campaignId,
                    referrerId,
                  }, null, 2)}
                </pre>
              </div>
              {responses.create && (
                <div className={`p-4 rounded-lg border ${responses.create.success
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {responses.create.success ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-red-600" size={16} />
                    )}
                    <span className="font-semibold text-sm">
                      {responses.create.success ? 'Success' : 'Error'}
                      {responses.create.status && ` (${responses.create.status})`}
                    </span>
                  </div>
                  <pre className="text-xs overflow-x-auto mt-2">
                    {JSON.stringify(responses.create.data || { error: responses.create.error }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Track Click */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>2. Track Click</span>
              <Button
                onClick={handleTrackClick}
                disabled={loading === 'click' || !apiKey || !referralCode}
                className="flex items-center gap-2"
              >
                {loading === 'click' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Test Endpoint
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Referral Code
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  placeholder="Enter referral code from step 1"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">POST /clicks</span>
                  <button
                    onClick={() => copyToClipboard(`curl -X POST ${API_BASE_URL}/clicks \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"referralCode": "${referralCode}"}'`, 'curl-click')}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {copied === 'curl-click' ? <CheckCircle size={12} /> : <Copy size={12} />}
                    Copy cURL
                  </button>
                </div>
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                  {JSON.stringify({
                    referralCode,
                  }, null, 2)}
                </pre>
              </div>
              {responses.click && (
                <div className={`p-4 rounded-lg border ${responses.click.success
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {responses.click.success ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-red-600" size={16} />
                    )}
                    <span className="font-semibold text-sm">
                      {responses.click.success ? 'Success' : 'Error'}
                      {responses.click.status && ` (${responses.click.status})`}
                    </span>
                  </div>
                  <pre className="text-xs overflow-x-auto mt-2">
                    {JSON.stringify(responses.click.data || { error: responses.click.error }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Track Conversion */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>3. Track Conversion</span>
              <Button
                onClick={handleTrackConversion}
                disabled={loading === 'convert' || !apiKey || !referralCode}
                className="flex items-center gap-2"
              >
                {loading === 'convert' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Test Endpoint
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value)}
                    placeholder="Enter referral code"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Amount (optional)
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="99.99"
                    step="0.01"
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Referee ID (optional)
                </label>
                <input
                  type="text"
                  value={refereeId}
                  onChange={(e) => setRefereeId(e.target.value)}
                  placeholder="referee_123"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">POST /conversions</span>
                  <button
                    onClick={() => copyToClipboard(`curl -X POST ${API_BASE_URL}/conversions \\
  -H "Authorization: Bearer ${apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"referralCode": "${referralCode}", "refereeId": "${refereeId}", "amount": ${amount}}'`, 'curl-convert')}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {copied === 'curl-convert' ? <CheckCircle size={12} /> : <Copy size={12} />}
                    Copy cURL
                  </button>
                </div>
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                  {JSON.stringify({
                    referralCode,
                    refereeId: refereeId || undefined,
                    amount: amount ? parseFloat(amount) : undefined,
                    metadata: {
                      orderId: 'order_123',
                    },
                  }, null, 2)}
                </pre>
              </div>
              {responses.convert && (
                <div className={`p-4 rounded-lg border ${responses.convert.success
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {responses.convert.success ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-red-600" size={16} />
                    )}
                    <span className="font-semibold text-sm">
                      {responses.convert.success ? 'Success' : 'Error'}
                      {responses.convert.status && ` (${responses.convert.status})`}
                    </span>
                  </div>
                  <pre className="text-xs overflow-x-auto mt-2">
                    {JSON.stringify(responses.convert.data || { error: responses.convert.error }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Get Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>4. Get Stats</span>
              <Button
                onClick={handleGetStats}
                disabled={loading === 'stats' || !apiKey}
                className="flex items-center gap-2"
              >
                {loading === 'stats' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Test Endpoint
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    GET /stats{campaignId ? `?campaignId=${campaignId}` : ''}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`curl -X GET "${API_BASE_URL}/stats${campaignId ? `?campaignId=${campaignId}` : ''}" \\
  -H "Authorization: Bearer ${apiKey}"`, 'curl-stats')}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {copied === 'curl-stats' ? <CheckCircle size={12} /> : <Copy size={12} />}
                    Copy cURL
                  </button>
                </div>
              </div>
              {responses.stats && (
                <div className={`p-4 rounded-lg border ${responses.stats.success
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {responses.stats.success ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-red-600" size={16} />
                    )}
                    <span className="font-semibold text-sm">
                      {responses.stats.success ? 'Success' : 'Error'}
                      {responses.stats.status && ` (${responses.stats.status})`}
                    </span>
                  </div>
                  <pre className="text-xs overflow-x-auto mt-2">
                    {JSON.stringify(responses.stats.data || { error: responses.stats.error }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Get User Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>5. Get User Stats</span>
              <Button
                onClick={handleGetUserStats}
                disabled={loading === 'userStats' || !apiKey || !userId}
                className="flex items-center gap-2"
              >
                {loading === 'userStats' ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Test Endpoint
                  </>
                )}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardBody>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="user_123"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                />
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  Use the same ID as <strong>Referrer ID</strong> from step 1. It is auto-filled when you create a referral.
                </p>
                <button
                  type="button"
                  onClick={() => setUserId(referrerId)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Use Referrer ID from step 1
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                    GET /users/{userId}/stats{campaignId ? `?campaignId=${campaignId}` : ''}
                  </span>
                  <button
                    onClick={() => copyToClipboard(`curl -X GET "${API_BASE_URL}/users/${userId}/stats${campaignId ? `?campaignId=${campaignId}` : ''}" \\
  -H "Authorization: Bearer ${apiKey}"`, 'curl-userStats')}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {copied === 'curl-userStats' ? <CheckCircle size={12} /> : <Copy size={12} />}
                    Copy cURL
                  </button>
                </div>
                <pre className="text-xs text-gray-700 dark:text-gray-300 overflow-x-auto mt-2">
                  {`GET /users/${userId}/stats${campaignId ? `?campaignId=${campaignId}` : ''}`}
                </pre>
              </div>
              {responses.userStats && (
                <div className={`p-4 rounded-lg border ${responses.userStats.success
                  ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30'
                  : 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {responses.userStats.success ? (
                      <CheckCircle className="text-green-600" size={16} />
                    ) : (
                      <XCircle className="text-red-600" size={16} />
                    )}
                    <span className="font-semibold text-sm">
                      {responses.userStats.success ? 'Success' : 'Error'}
                      {responses.userStats.status && ` (${responses.userStats.status})`}
                    </span>
                  </div>
                  <pre className="text-xs overflow-x-auto mt-2">
                    {JSON.stringify(responses.userStats.data || { error: responses.userStats.error }, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}


