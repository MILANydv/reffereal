'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Webhook, Copy, CheckCircle, XCircle, Shield, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const EVENTS = [
  {
    type: 'REFERRAL_CREATED',
    description: 'Fired when a new referral code is generated.',
    sample: {
      event: 'REFERRAL_CREATED',
      data: {
        referralId: 'clxxxxxxxxxxxx',
        referralCode: 'ABC12XYZ',
        referrerId: 'user_123',
        refereeId: null,
        campaignId: 'clxxxxxxxxxxxx',
      },
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'REFERRAL_CLICKED',
    description: 'Fired when someone clicks a referral link.',
    sample: {
      event: 'REFERRAL_CLICKED',
      data: {
        referralId: 'clxxxxxxxxxxxx',
        referralCode: 'ABC12XYZ',
        clickedAt: new Date().toISOString(),
        campaignId: 'clxxxxxxxxxxxx',
      },
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'REFERRAL_CONVERTED',
    description: 'Fired when a referred user completes a conversion.',
    sample: {
      event: 'REFERRAL_CONVERTED',
      data: {
        referralId: 'clxxxxxxxxxxxx',
        referralCode: 'ABC12XYZ',
        conversionId: 'clxxxxxxxxxxxx',
        rewardAmount: 10,
        convertedAt: new Date().toISOString(),
        campaignId: 'clxxxxxxxxxxxx',
      },
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'REWARD_CREATED',
    description: 'Fired when a reward is created for the referrer.',
    sample: {
      event: 'REWARD_CREATED',
      data: {
        referralId: 'clxxxxxxxxxxxx',
        referrerId: 'user_123',
        rewardAmount: 10,
        campaignId: 'clxxxxxxxxxxxx',
      },
      timestamp: new Date().toISOString(),
    },
  },
  {
    type: 'USAGE_LIMIT_EXCEEDED',
    description: 'Fired when the app exceeds its monthly API usage limit.',
    sample: {
      event: 'USAGE_LIMIT_EXCEEDED',
      data: {
        appId: 'clxxxxxxxxxxxx',
        currentUsage: 10000,
        limit: 10000,
      },
      timestamp: new Date().toISOString(),
    },
  },
];

async function generateSignature(payload: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function DemoWebhooksPage() {
  const [copied, setCopied] = useState<string | null>(null);
  const [verifyPayload, setVerifyPayload] = useState('');
  const [verifySecret, setVerifySecret] = useState('');
  const [verifySignature, setVerifySignature] = useState('');
  const [verifyResult, setVerifyResult] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(false);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied to clipboard');
  };

  const handleVerify = async () => {
    if (!verifyPayload.trim() || !verifySecret.trim() || !verifySignature.trim()) {
      toast.error('Fill in payload, secret, and signature');
      return;
    }
    setVerifying(true);
    setVerifyResult(null);
    try {
      const expected = await generateSignature(verifyPayload.trim(), verifySecret.trim());
      const sig = verifySignature.trim().toLowerCase().replace(/\s/g, '');
      const match = expected.length === sig.length && expected === sig;
      setVerifyResult(match);
      toast.success(match ? 'Signature valid' : 'Signature invalid');
    } catch (e) {
      setVerifyResult(false);
      toast.error('Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Webhooks Simulator
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Inspect payloads and verify signatures for your webhook endpoints
            </p>
          </div>
          <Link
            href="/dashboard/v2/webhooks"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            <ExternalLink size={16} />
            Manage Webhooks
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield size={20} />
              Request format
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We send a <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">POST</code> request to your URL with:
            </p>
            <ul className="text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
              <li>
                <strong>Content-Type:</strong> application/json
              </li>
              <li>
                <strong>X-Webhook-Signature:</strong> HMAC-SHA256 hex of the raw body using your webhook secret
              </li>
              <li>
                <strong>Body:</strong> JSON with <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">event</code>,{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">data</code>, and{' '}
                <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">timestamp</code>
              </li>
            </ul>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg font-mono text-xs">
              <pre>{`POST /your-endpoint HTTP/1.1
Content-Type: application/json
X-Webhook-Signature: <hmac-sha256-hex>

{"event":"REFERRAL_CREATED","data":{...},"timestamp":"..."}`}</pre>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Event payloads</h2>
          {EVENTS.map((ev) => (
            <Card key={ev.type}>
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span className="font-mono">{ev.type}</span>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(ev.sample, null, 2), ev.type)}
                    className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    {copied === ev.type ? <CheckCircle size={14} /> : <Copy size={14} />}
                    Copy JSON
                  </button>
                </CardTitle>
              </CardHeader>
              <CardBody className="pt-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{ev.description}</p>
                <pre className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg text-xs overflow-x-auto text-gray-800 dark:text-gray-200">
                  {JSON.stringify(ev.sample, null, 2)}
                </pre>
              </CardBody>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook size={20} />
              Verify signature
            </CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Paste the raw request body (JSON string), your webhook secret, and the{' '}
              <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded">X-Webhook-Signature</code> header to verify.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Raw payload (JSON string)
              </label>
              <textarea
                value={verifyPayload}
                onChange={(e) => setVerifyPayload(e.target.value)}
                placeholder='{"event":"REFERRAL_CREATED","data":{...},"timestamp":"..."}'
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Webhook secret
                </label>
                <input
                  type="password"
                  value={verifySecret}
                  onChange={(e) => setVerifySecret(e.target.value)}
                  placeholder="Your webhook secret (64-char hex)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  X-Webhook-Signature
                </label>
                <input
                  type="text"
                  value={verifySignature}
                  onChange={(e) => setVerifySignature(e.target.value)}
                  placeholder="Hex signature from header"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button onClick={handleVerify} disabled={verifying}>
                {verifying ? 'Verifying...' : 'Verify'}
              </Button>
              {verifyResult !== null && (
                <span className="flex items-center gap-1.5 text-sm">
                  {verifyResult ? (
                    <>
                      <CheckCircle className="text-green-600" size={18} />
                      <span className="text-green-600 dark:text-green-400">Valid</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={18} />
                      <span className="text-red-600 dark:text-red-400">Invalid</span>
                    </>
                  )}
                </span>
              )}
            </div>
          </CardBody>
        </Card>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/demo"
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            API Simulator
          </Link>
          <Link
            href="/demo/ui-bundles"
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            UI Bundles
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
