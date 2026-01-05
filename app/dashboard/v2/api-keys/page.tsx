'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { Copy, RefreshCw, Key, ShieldCheck, Terminal, Check } from 'lucide-react';
import { useState } from 'react';

export default function ApiKeysPage() {
  const { selectedApp } = useAppStore();
  const [copied, setCopied] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!selectedApp) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <Key size={32} />
          </div>
          <h2 className="text-xl font-bold">No App Selected</h2>
          <p className="text-gray-500 mt-2">Please select an app from the switcher above to view its API keys.</p>
        </div>
      </DashboardLayout>
    );
  }

  const curlExample = `curl -X POST https://api.referral.com/v1/referrals \\
  -H "X-API-Key: ${selectedApp.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"referrerId": "user_123", "campaignId": "camp_abc"}'`;

  const nodeExample = `const response = await fetch('https://api.referral.com/v1/referrals', {
  method: 'POST',
  headers: {
    'X-API-Key': '${selectedApp.apiKey}',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    referrerId: 'user_123',
    campaignId: 'camp_abc'
  })
});`;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API & Keys</h1>
          <p className="text-gray-500 mt-1">Manage your application authentication and view usage limits.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center">
                    <ShieldCheck className="mr-2 text-green-500" size={20} />
                    Production API Key
                  </CardTitle>
                  <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded uppercase">
                    Active
                  </span>
                </div>
              </CardHeader>
              <CardBody className="pt-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1.5 block">API Key</label>
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 font-mono text-sm overflow-hidden truncate">
                        {showKey ? selectedApp.apiKey : '•'.repeat(32)}
                      </div>
                      <button 
                        onClick={() => setShowKey(!showKey)}
                        className="p-2.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-800 transition-colors"
                      >
                        {showKey ? 'Hide' : 'Show'}
                      </button>
                      <button 
                        onClick={() => copyToClipboard(selectedApp.apiKey)}
                        className="p-2.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/30 transition-colors"
                      >
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-lg flex items-start">
                    <RefreshCw className="text-amber-600 mr-3 mt-0.5" size={18} />
                    <div className="text-sm text-amber-800 dark:text-amber-400">
                      <p className="font-semibold">Regenerating your API key</p>
                      <p className="mt-1">Doing this will immediately invalidate the current key. Any services using it will stop working until they are updated with the new key.</p>
                      <button className="mt-3 text-amber-700 dark:text-amber-300 font-medium underline underline-offset-4 decoration-amber-300 hover:decoration-amber-700">
                        Regenerate key
                      </button>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                <CardTitle className="flex items-center text-lg">
                  <Terminal className="mr-2 text-blue-500" size={20} />
                  Quick Start Snippets
                </CardTitle>
              </CardHeader>
              <CardBody className="pt-6">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center justify-between">
                      cURL
                      <button onClick={() => copyToClipboard(curlExample)} className="text-blue-600 text-xs hover:underline flex items-center">
                        <Copy size={12} className="mr-1" /> Copy
                      </button>
                    </h4>
                    <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
                      {curlExample}
                    </pre>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center justify-between">
                      JavaScript (Fetch)
                      <button onClick={() => copyToClipboard(nodeExample)} className="text-blue-600 text-xs hover:underline flex items-center">
                        <Copy size={12} className="mr-1" /> Copy
                      </button>
                    </h4>
                    <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed">
                      {nodeExample}
                    </pre>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500 uppercase font-bold tracking-wider">Usage Limits</CardTitle>
              </CardHeader>
              <CardBody>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <div className="text-2xl font-bold">1,234</div>
                        <div className="text-xs text-gray-500">API Requests this month</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">10,000</div>
                        <div className="text-xs text-gray-500">Monthly limit</div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '12.34%' }} />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-sm py-2">
                      <span className="text-gray-500">Plan</span>
                      <span className="font-semibold">Free Tier</span>
                    </div>
                    <div className="flex justify-between text-sm py-2">
                      <span className="text-gray-500">Overage cost</span>
                      <span className="font-semibold">$0.01 / hit</span>
                    </div>
                    <div className="flex justify-between text-sm py-2">
                      <span className="text-gray-500">Reset date</span>
                      <span className="font-semibold">Feb 1, 2024</span>
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="bg-blue-600 text-white border-none">
              <CardBody className="p-6">
                <h3 className="font-bold text-lg mb-2">Need higher limits?</h3>
                <p className="text-blue-100 text-sm mb-4">Upgrade your plan to get more monthly API hits and enterprise-grade features.</p>
                <button className="w-full bg-white text-blue-600 font-bold py-2 rounded-lg text-sm hover:bg-blue-50 transition-colors">
                  View Pricing Plans
                </button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
