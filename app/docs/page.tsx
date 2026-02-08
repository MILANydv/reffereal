'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Key, Code, Webhook, LayoutGrid, Copy, Lock, ShoppingCart, Cloud } from 'lucide-react';

const BASE_URL = 'https://reffereal.vercel.app';

const TABS = [
  { id: 'quickstart' as const, label: 'Quick Start', icon: Rocket },
  { id: 'auth' as const, label: 'Authentication', icon: Key },
  { id: 'endpoints' as const, label: 'API Reference', icon: Code },
  { id: 'webhooks' as const, label: 'Webhooks', icon: Webhook },
  { id: 'scenarios' as const, label: 'Examples', icon: LayoutGrid },
];

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<typeof TABS[number]['id']>('quickstart');

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100">
      {/* Top nav */}
      <nav className="fixed top-0 w-full z-[110] bg-white/95 dark:bg-zinc-900/95 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 h-14 flex items-center">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 w-full flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <img src="/logos/logo.png" alt="Logo" className="h-8" />
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 hidden sm:inline">/docs</span>
            </Link>
            <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider hidden md:inline">API v1</span>
          </div>
          <Link href="/login" className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
            Dashboard →
          </Link>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-20 pb-16">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">

          {/* Sidebar - sticky on desktop */}
          <aside className="lg:w-56 shrink-0 lg:sticky lg:top-24 lg:self-start">
            <nav className="flex flex-wrap gap-2 lg:flex-col lg:gap-1" aria-label="Documentation sections">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2.5 border lg:border-0 ${activeTab === tab.id
                      ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 border-zinc-300 dark:border-zinc-600'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/80 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800'
                      }`}
                  >
                    <Icon size={18} className="shrink-0" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            <div className="mt-6 p-3 rounded-lg bg-zinc-200/50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
              <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
                <span className="text-xs font-mono">All systems operational</span>
              </div>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 max-w-3xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 sm:p-8"
              >
                {activeTab === 'quickstart' && <QuickStartSection />}
                {activeTab === 'auth' && <AuthSection />}
                {activeTab === 'endpoints' && <EndpointsSection />}
                {activeTab === 'webhooks' && <WebhooksSection />}
                {activeTab === 'scenarios' && <ScenariosSection />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

type Language = 'curl' | 'nodejs' | 'python' | 'php';

function CodeBlock({ snippets, title }: { snippets: Record<Language, string>; title?: string }) {
  const [lang, setLang] = useState<Language>('curl');
  const [copied, setCopied] = useState(false);

  const languages: { id: Language; label: string }[] = [
    { id: 'curl', label: 'cURL' },
    { id: 'nodejs', label: 'Node.js' },
    { id: 'python', label: 'Python' },
    { id: 'php', label: 'PHP' },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(snippets[lang]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-lg overflow-hidden border border-zinc-200 dark:border-zinc-700 bg-zinc-900 text-zinc-100 my-6">
      <div className="px-4 py-2.5 bg-zinc-800/80 border-b border-zinc-700 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-1">
          {languages.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${lang === l.id
                ? 'bg-zinc-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          {title && <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider hidden sm:inline">{title}</span>}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code"
            className="p-1.5 rounded text-zinc-400 hover:text-white hover:bg-zinc-600 transition-colors"
          >
            <Copy size={16} />
          </button>
          {copied && <span className="text-xs text-emerald-400 font-mono">Copied</span>}
        </div>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-xs sm:text-sm leading-relaxed text-zinc-300 whitespace-pre">
          {snippets[lang]}
        </pre>
      </div>
    </div>
  );
}

function SectionHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <header className="mb-8 pb-6 border-b border-zinc-200 dark:border-zinc-700">
      <p className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 dark:text-zinc-400 mb-2">{badge}</p>
      <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight font-sans">{title}</h1>
    </header>
  );
}

function QuickStartSection() {
  return (
    <div>
      <SectionHeader title="Quick Start" badge="Getting started" />
      <p className="text-zinc-600 dark:text-zinc-400 mb-8">
        Get your referral API running in under 15 minutes.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
          <span className="inline-block w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center mb-3">1</span>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Get your API key</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Sign in to the <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:underline">dashboard</Link>, select an app, then copy your key from <strong>API &amp; Keys</strong> or <Link href="/dashboard/v2/apps" className="text-blue-600 dark:text-blue-400 hover:underline">App Settings</Link>. Use it in the <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">Authorization: Bearer &lt;key&gt;</code> header.</p>
        </div>
        <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30">
          <span className="inline-block w-8 h-8 rounded bg-zinc-200 dark:bg-zinc-700 font-mono text-sm font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-center mb-3">2</span>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Create a campaign</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">In the partner dashboard, create a campaign and note the <code className="font-mono text-xs bg-zinc-200 dark:bg-zinc-700 px-1 rounded">campaign_id</code> for API calls.</p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        <h3 className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">Base URL</h3>
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm text-zinc-800 dark:text-zinc-200 break-all">
          {BASE_URL}/api/v1
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-mono font-semibold text-zinc-700 dark:text-zinc-300">Referral link format</h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Append the referral code (from <code className="font-mono text-xs">POST /referrals</code>) to your signup URL.</p>
        <div className="p-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 font-mono text-sm text-zinc-800 dark:text-zinc-200">
          https://yourbrand.com/signup?ref=ABC123XYZ
        </div>
      </div>
    </div>
  );
}

function AuthSection() {
  const snippets: Record<Language, string> = {
    curl: `curl -X GET "${BASE_URL}/api/v1/stats" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
    nodejs: `const response = await fetch('${BASE_URL}/api/v1/stats', {
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY'
  }
});`,
    python: `import requests

headers = {
    'Authorization': 'Bearer YOUR_API_KEY'
}

response = requests.get('${BASE_URL}/api/v1/stats', headers=headers)`,
    php: `<?php
$ch = curl_init('${BASE_URL}/api/v1/stats');
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer YOUR_API_KEY'
));
$response = curl_exec($ch);
?>`
  };

  return (
    <div>
      <SectionHeader title="Authentication" badge="Auth" />
      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Send your API key in the <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">Authorization: Bearer &lt;key&gt;</code> header. Invalid key → <code className="font-mono">401</code>, suspended app or over limit → <code className="font-mono">403</code> / <code className="font-mono">429</code>.
      </p>

      <CodeBlock title="Example" snippets={snippets} />

      <div className="mt-6 p-4 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-900/10 flex gap-4">
        <Lock size={20} className="shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <p className="text-sm text-zinc-700 dark:text-zinc-300">
          <strong>Security:</strong> Never expose API keys in client-side code. Use environment variables and server-side only.
        </p>
      </div>
    </div>
  );
}

function EndpointsSection() {
  const referralSnippets: Record<Language, string> = {
    curl: `curl -X POST "${BASE_URL}/api/v1/referrals" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "campaignId": "campaign_123",
    "referrerId": "user_89231"
  }'`,
    nodejs: `const res = await fetch('${BASE_URL}/api/v1/referrals', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campaignId: 'campaign_123',
    referrerId: 'user_89231'
  })
});
const data = await res.json();
// data.referralCode, data.referralId, data.status; optional: data.warning, data.reasons (if flagged)`,
    python: `import requests

payload = {
    "campaignId": "campaign_123",
    "referrerId": "user_89231"
}

response = requests.post(
    '${BASE_URL}/api/v1/referrals',
    json=payload,
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)
data = response.json()  # referralCode, referralId, status`,
    php: `$payload = ['campaignId' => 'campaign_123', 'referrerId' => 'user_89231'];
$ch = curl_init('${BASE_URL}/api/v1/referrals');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer YOUR_API_KEY',
  'Content-Type: application/json'
]);
$response = curl_exec($ch);`
  };

  const conversionSnippets: Record<Language, string> = {
    curl: `curl -X POST "${BASE_URL}/api/v1/conversions" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "referralCode": "ABC123XYZ",
    "refereeId": "new_user_442",
    "amount": 100.00
  }'`,
    nodejs: `await fetch('${BASE_URL}/api/v1/conversions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    referralCode: 'ABC123XYZ',
    refereeId: 'new_user_442',
    amount: 99.99
  })
});
// Response: { success, referralId, conversionId, rewardAmount, status }`,
    python: `response = requests.post(
    '${BASE_URL}/api/v1/conversions',
    json={
        'referralCode': 'ABC123XYZ',
        'refereeId': 'new_user_442',
        'amount': 99.99
    },
    headers={'Authorization': 'Bearer YOUR_API_KEY'}
)`,
    php: `$payload = [
  'referralCode' => 'ABC123XYZ',
  'refereeId' => 'new_user_442',
  'amount' => 99.99
];
$ch = curl_init('${BASE_URL}/api/v1/conversions');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Authorization: Bearer YOUR_API_KEY',
  'Content-Type: application/json'
]);`
  };

  return (
    <div className="space-y-12">
      <SectionHeader title="API Reference" badge="Endpoints" />

      <section className="space-y-4">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold">POST</span>
          <h3 className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">/referrals</h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Create a referral for a user. Returns <code className="font-mono text-xs">referralCode</code>, <code className="font-mono text-xs">referralId</code>, <code className="font-mono text-xs">status</code>.</p>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">Request body</h4>
          <dl className="space-y-2 font-mono text-xs">
            <div className="flex gap-3 flex-wrap"><dt className="text-zinc-900 dark:text-zinc-200 font-medium w-28">campaignId</dt><dd className="text-zinc-500">string, required</dd></div>
            <div className="flex gap-3 flex-wrap"><dt className="text-zinc-900 dark:text-zinc-200 font-medium w-28">referrerId</dt><dd className="text-zinc-500">string, required</dd></div>
            <div className="flex gap-3 flex-wrap"><dt className="text-zinc-900 dark:text-zinc-200 font-medium w-28">refereeId</dt><dd className="text-zinc-500">string, optional</dd></div>
          </dl>
          <p className="mt-3 text-[10px] font-mono text-zinc-500">Response 201: referralCode, referralId, status</p>
        </div>

        <CodeBlock title="Create Referral Identity" snippets={referralSnippets} />
      </section>

      <section className="space-y-4 pt-10 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold">POST</span>
          <h3 className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">/conversions</h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Record a conversion. Creates a reward (PENDING) for the referrer. Body: referralCode, refereeId (required), amount, metadata (optional). Response: success, referralId, conversionId, rewardAmount, status.</p>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 mb-3">Body</h4>
          <dl className="space-y-1 font-mono text-xs">
            <div className="flex gap-3"><dt className="text-zinc-900 dark:text-zinc-200 font-medium w-28">referralCode</dt><dd className="text-zinc-500">string</dd></div>
            <div className="flex gap-3"><dt className="text-zinc-900 dark:text-zinc-200 font-medium w-28">refereeId</dt><dd className="text-zinc-500">string</dd></div>
            <div className="flex gap-3"><dt className="text-zinc-900 dark:text-zinc-200 font-medium w-28">amount</dt><dd className="text-zinc-500">number, optional</dd></div>
            <div className="flex gap-3"><dt className="text-zinc-900 dark:text-zinc-200 font-medium w-28">metadata</dt><dd className="text-zinc-500">string, optional</dd></div>
          </dl>
        </div>

        <CodeBlock title="Initialize Conversion Event" snippets={conversionSnippets} />
      </section>

      <section className="space-y-4 pt-10 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="px-2 py-0.5 rounded bg-emerald-600 text-white font-mono text-xs font-bold">POST</span>
          <h3 className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">/clicks</h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Track a click. Body: referralCode. Response: success, referralId, status.</p>

        <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <p className="font-mono text-xs text-zinc-600 dark:text-zinc-400">Body: referralCode (string)</p>
        </div>
        <CodeBlock title="Track Click" snippets={{
          curl: `curl -X POST "${BASE_URL}/api/v1/clicks" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"referralCode": "ABC123XYZ"}'`,
          nodejs: `await fetch('${BASE_URL}/api/v1/clicks', {
  method: 'POST',
  headers: { 'Authorization': 'Bearer YOUR_API_KEY', 'Content-Type': 'application/json' },
  body: JSON.stringify({ referralCode: 'ABC123XYZ' })
});`,
          python: `requests.post('${BASE_URL}/api/v1/clicks', json={'referralCode': 'ABC123XYZ'}, headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
          php: `$ch = curl_init('${BASE_URL}/api/v1/clicks');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(['referralCode' => 'ABC123XYZ']));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer YOUR_API_KEY', 'Content-Type: application/json']);`
        }} />
      </section>

      <section className="space-y-4 pt-10 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">GET</span>
          <h3 className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">/stats</h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Query: campaignId (optional). Response: totalReferrals, totalClicks, totalConversions, conversionRate, totalRewardValue.</p>
        <CodeBlock title="Get stats" snippets={{
          curl: `curl -X GET "${BASE_URL}/api/v1/stats?campaignId=growth_q1" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          nodejs: `const res = await fetch('${BASE_URL}/api/v1/stats?campaignId=growth_q1', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
const data = await res.json();`,
          python: `r = requests.get('${BASE_URL}/api/v1/stats', params={'campaignId': 'growth_q1'}, headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
          php: `$ch = curl_init('${BASE_URL}/api/v1/stats?campaignId=growth_q1');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer YOUR_API_KEY']);`
        }} />
      </section>

      <section className="space-y-4 pt-10 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">GET</span>
          <h3 className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">/users/{'{userId}'}/stats</h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Query: campaignId (optional). Returns user stats: referralsMade, referralsReceived, rewardsEarned, referralCodesGenerated, referralCodesUsed.</p>
        <CodeBlock title="User statistics" snippets={{
          curl: `curl -X GET "${BASE_URL}/api/v1/users/user_123/stats?campaignId=growth_q1" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          nodejs: `const res = await fetch('${BASE_URL}/api/v1/users/user_123/stats?campaignId=growth_q1', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
const data = await res.json();`,
          python: `r = requests.get('${BASE_URL}/api/v1/users/user_123/stats', params={'campaignId': 'growth_q1'}, headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
          php: `$ch = curl_init('${BASE_URL}/api/v1/users/user_123/stats?campaignId=growth_q1');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer YOUR_API_KEY']);`
        }} />
      </section>

      <section className="space-y-4 pt-10 border-t border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-mono text-xs font-bold">GET</span>
          <h3 className="font-mono text-lg font-semibold text-zinc-900 dark:text-zinc-100">/users/{'{userId}'}/rewards</h3>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">Query: status, campaignId, page, limit. Response: rewards[], pagination.</p>
        <CodeBlock title="List user rewards" snippets={{
          curl: `curl -X GET "${BASE_URL}/api/v1/users/user_123/rewards?status=PENDING&page=1&limit=25" \\
  -H "Authorization: Bearer YOUR_API_KEY"`,
          nodejs: `const res = await fetch('${BASE_URL}/api/v1/users/user_123/rewards?page=1&limit=25', {
  headers: { 'Authorization': 'Bearer YOUR_API_KEY' }
});
const { rewards, pagination } = await res.json();`,
          python: `r = requests.get('${BASE_URL}/api/v1/users/user_123/rewards', params={'page': 1, 'limit': 25}, headers={'Authorization': 'Bearer YOUR_API_KEY'})`,
          php: `$ch = curl_init('${BASE_URL}/api/v1/users/user_123/rewards?page=1&limit=25');
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Authorization: Bearer YOUR_API_KEY']);`
        }} />
      </section>
    </div>
  );
}

function WebhooksSection() {
  const verifySnippets: Record<Language, string> = {
    curl: `# Your server receives POST with body and header:
# X-Webhook-Signature: <hmac_sha256_hex_of_body>

# Verify (e.g. in Node): compute HMAC-SHA256 of raw body with your webhook secret, compare to header.`,
    nodejs: `const crypto = require('crypto');

function verifyWebhook(rawBody, signature, secret) {
  const expected = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expected, 'hex')
  );
}

// In your route: use raw body (string), not parsed JSON
const isValid = verifyWebhook(req.rawBody, req.headers['x-webhook-signature'], process.env.WEBHOOK_SECRET);`,
    python: `import hmac
import hashlib

def verify_webhook(raw_body: bytes, signature: str, secret: str) -> bool:
    expected = hmac.new(
        secret.encode(), raw_body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(signature, expected)

# In your view: use request.get_data(), not request.json
is_valid = verify_webhook(
    request.get_data(),
    request.headers.get('X-Webhook-Signature', ''),
    os.environ['WEBHOOK_SECRET']
)`,
    php: `function verifyWebhook($rawBody, $signature, $secret) {
  $expected = hash_hmac('sha256', $rawBody, $secret);
  return hash_equals($expected, $signature);
}
// Use php://input for raw body`
  };

  return (
    <div>
      <SectionHeader title="Webhooks" badge="Events" />

      <p className="text-zinc-600 dark:text-zinc-400 mb-6">
        Configure URLs in Dashboard → Webhooks. We POST a JSON body and <code className="font-mono text-sm bg-zinc-100 dark:bg-zinc-800 px-1 rounded">X-Webhook-Signature</code> (HMAC-SHA256 of raw body, hex). Always verify with your secret.
      </p>

      <div className="p-4 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 mb-6">
        <h3 className="text-sm font-mono font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Payload</h3>
        <pre className="font-mono text-xs text-zinc-600 dark:text-zinc-400 overflow-x-auto whitespace-pre">
{`{ "event": "REFERRAL_CREATED" | "REFERRAL_CLICKED" | "REFERRAL_CONVERTED" | "REWARD_CREATED",
  "data": { ... }, "timestamp": "ISO8601" }`}
        </pre>
      </div>

      <h3 className="text-sm font-mono font-semibold text-zinc-800 dark:text-zinc-200 mb-3">Event types</h3>
      <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400 mb-8">
        <li><code className="font-mono text-xs">REFERRAL_CREATED</code> — code generated. data: referralId, referralCode, referrerId, campaignId.</li>
        <li><code className="font-mono text-xs">REFERRAL_CLICKED</code> — link clicked. data: referralId, referralCode, clickedAt, campaignId.</li>
        <li><code className="font-mono text-xs">REFERRAL_CONVERTED</code> — conversion recorded. data: referralId, conversionId, rewardAmount, campaignId.</li>
        <li><code className="font-mono text-xs">REWARD_CREATED</code> — reward created. data: referralId, referrerId, rewardAmount, campaignId, level.</li>
      </ul>

      <h3 className="text-sm font-mono font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Verifying the signature</h3>
      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">HMAC-SHA256(raw body, secret) → hex; compare to header with constant-time equality.</p>
      <CodeBlock title="Verification" snippets={verifySnippets} />
    </div>
  );
}

function ScenariosSection() {
  const codeEcom = `// E-Commerce: generate referral code for a customer
const response = await fetch('${BASE_URL}/api/v1/referrals', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campaignId: 'VIP_REWARDS',
    referrerId: 'customer_9921'
  })
});
const { referralCode } = await response.json();
// Share: https://yourstore.com/signup?ref=\${referralCode}`;

  const codeSaaS = `// SaaS: track conversion when user upgrades
await fetch('${BASE_URL}/api/v1/conversions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    referralCode: 'TRIAL_USER_123',
    refereeId: 'user_uuid_988',
    amount: 99.99
  })
});`;

  return (
    <div>
      <SectionHeader title="Examples" badge="Use cases" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={22} className="text-zinc-600 dark:text-zinc-400" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">E-Commerce</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Create referral on signup; track conversion when order is delivered. Use webhooks to sync order status.
          </p>
          <div className="rounded-lg bg-zinc-900 text-zinc-300 p-3 font-mono text-[11px] overflow-x-auto">
            <pre className="whitespace-pre">{codeEcom}</pre>
          </div>
        </div>

        <div className="p-5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-800/30 space-y-4">
          <div className="flex items-center gap-2">
            <Cloud size={22} className="text-zinc-600 dark:text-zinc-400" />
            <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">SaaS</h3>
          </div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Track conversion on upgrade. Use separate API keys for sandbox vs production.
          </p>
          <div className="rounded-lg bg-zinc-900 text-zinc-300 p-3 font-mono text-[11px] overflow-x-auto">
            <pre className="whitespace-pre">{codeSaaS}</pre>
          </div>
        </div>
      </div>

      <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-700 text-center">
        <Link href="/contact" className="inline-flex items-center px-5 py-2.5 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-sm font-medium hover:opacity-90 transition-opacity">
          Contact for custom integration
        </Link>
      </div>
    </div>
  );
}
