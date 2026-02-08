'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Key, Code, Webhook, LayoutGrid, Copy, Lock, ShoppingCart, Cloud, Store, Video, Smartphone } from 'lucide-react';

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
    <div className="min-h-screen bg-white font-sans selection:bg-primary/20">
      {/* Header - same pattern as blog details */}
      <header className="fixed top-0 w-full z-[110] px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between glass-panel px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl">
          <div className="flex items-center gap-2">
            <Link href="/">
              <img src="/logos/logo.png" alt="Incenta" className="h-8 md:h-12 w-auto" />
            </Link>
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest hidden md:block ml-4">API Docs</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-primary transition-colors pr-6 mr-6 border-r border-slate-100 hidden md:block">Home</Link>
            <Link href="/login" className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest bg-navy text-white px-5 py-3 rounded-xl hover:bg-primary transition-all shadow-lg shadow-navy/5">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="pt-32 md:pt-44 pb-32">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 border-t border-slate-100 pt-12 md:pt-20">
            {/* Sidebar - sticky, blog-style metadata labels */}
            <aside className="lg:col-span-3 lg:sticky lg:top-40 h-fit space-y-10 order-2 lg:order-1">
              <div className="space-y-6">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Sections</p>
                <nav className="flex flex-col gap-2" aria-label="Documentation sections">
                  {TABS.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === tab.id
                          ? 'bg-navy text-white shadow-xl shadow-navy/10'
                          : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                          }`}
                      >
                        <Icon size={18} className="shrink-0" />
                        {tab.label}
                      </button>
                    );
                  })}
                </nav>
                <div className="space-y-1 pt-4">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status</p>
                  <div className="flex items-center gap-3">
                    <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
                    <span className="font-mono text-sm text-navy">API PROD: 100%</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main content - blog article column width */}
            <article className="lg:col-span-8 order-1 lg:order-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'quickstart' && <QuickStartSection />}
                  {activeTab === 'auth' && <AuthSection />}
                  {activeTab === 'endpoints' && <EndpointsSection />}
                  {activeTab === 'webhooks' && <WebhooksSection />}
                  {activeTab === 'scenarios' && <ScenariosSection />}
                </motion.div>
              </AnimatePresence>
            </article>
          </div>
        </div>
      </main>
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
    <div className="relative group rounded-2xl overflow-hidden bg-navy text-white shadow-2xl my-8">
      <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex gap-4">
          {languages.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setLang(l.id)}
              className={`text-[10px] font-bold font-mono uppercase tracking-widest transition-colors ${lang === l.id ? 'text-primary' : 'text-slate-500 hover:text-slate-300'}`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {title && <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">{title}</span>}
          <button type="button" onClick={handleCopy} aria-label="Copy code" className="text-slate-500 hover:text-white transition-colors">
            <Copy size={16} />
          </button>
          {copied && <span className="text-xs text-primary font-mono">Copied</span>}
        </div>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="font-mono text-xs md:text-sm leading-relaxed text-slate-300 whitespace-pre">{snippets[lang]}</pre>
      </div>
    </div>
  );
}

function SectionHeader({ title, badge }: { title: string; badge: string }) {
  return (
    <div className="mb-12 space-y-4">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary">{badge}</span>
      <h2 className="text-4xl md:text-5xl font-extrabold text-navy tracking-tight leading-tight">{title}</h2>
    </div>
  );
}

function QuickStartSection() {
  return (
    <div>
      <SectionHeader title="Infrastructure Boot." badge="Quick Start" />
      <div className="space-y-12 text-slate-600 font-medium leading-relaxed">
        <p className="text-lg text-slate-500">
          This protocol will guide you through the process of initializing your Incenta referral ecosystem. Most integrations take less than 15 minutes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
          <div className="space-y-4">
            <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-navy">01</div>
            <h3 className="text-xl font-bold text-navy">Obtain Master Key</h3>
            <p className="text-sm">Sign in to the <Link href="/login" className="text-primary hover:underline">ingress portal</Link>, select an app, then copy your API key from <strong>API &amp; Keys</strong> or from <Link href="/dashboard/v2/apps" className="text-primary hover:underline">App Settings</Link>. Keep the key secret and use it in the <code className="font-mono text-navy">Authorization: Bearer YOUR_API_KEY</code> header.</p>
          </div>
          <div className="space-y-4">
            <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-navy">02</div>
            <h3 className="text-xl font-bold text-navy">Deploy Campaign</h3>
            <p className="text-sm">Define your multi-currency rewards and referral logic in the partner dashboard to get a <code className="text-navy font-bold font-mono">campaign_id</code>.</p>
          </div>
        </div>

        <div className="pt-10 space-y-6">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-navy">Base Protocol URL</h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs font-bold text-navy">
            {BASE_URL}/api/v1
          </div>
        </div>

        <div className="pt-10 space-y-6">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-navy">Initial Link Generation</h3>
          <p className="text-sm">Generate referral links by appending the referral code to your base URL. We recommend using our <code className="text-navy font-bold font-mono">/referrals</code> endpoint to map users to codes.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs font-bold text-navy">
            https://yourbrand.com/signup?ref=ABC123XYZ
          </div>
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
      <SectionHeader title="Bearer Tokens." badge="Authentication" />
      <div className="space-y-8 text-slate-600 font-medium leading-relaxed">
        <p>All API requests require your app&apos;s API key sent as a <strong>Bearer token</strong> in the <code className="font-mono text-navy">Authorization</code> header. Example: <code className="font-mono text-navy">Authorization: Bearer sk_live_xxxx</code>. Invalid or missing keys return <code className="font-mono">401</code>; suspended apps or exceeded monthly limits return <code className="font-mono">403</code> or <code className="font-mono">429</code>.</p>

        <CodeBlock title="Authorization Protocol" snippets={snippets} />

        <div className="p-6 rounded-2xl border-2 border-primary/10 bg-primary/5 flex gap-6 mt-12">
          <Lock size={20} className="shrink-0 text-primary font-bold mt-0.5" />
          <p className="text-sm text-navy">
            <span className="font-extrabold">Warning:</span> Keep your master keys isolated. Never expose production identities in client-side artifacts. Use Environment Variables to manage secrets.
          </p>
        </div>
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
    <div className="space-y-20">
      <SectionHeader title="API Matrix." badge="Reference Guide" />

      <section className="space-y-8">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-extrabold text-[10px] tracking-widest">POST</span>
          <h3 className="text-2xl font-extrabold text-navy">/referrals</h3>
        </div>
        <p className="text-slate-500 font-medium">Generate a unique referral identity for an existing user (Advocate). This links the user to a campaign and returns a shareable code.</p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Request body</h4>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex gap-4 flex-wrap">
              <span className="text-navy font-bold w-32">campaignId</span>
              <span className="text-slate-400">string (required)</span>
              <span className="text-slate-500 italic">Campaign ID from your dashboard.</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <span className="text-navy font-bold w-32">referrerId</span>
              <span className="text-slate-400">string (required)</span>
              <span className="text-slate-500 italic">Your internal user ID (the advocate).</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <span className="text-navy font-bold w-32">refereeId</span>
              <span className="text-slate-400">string (optional)</span>
              <span className="text-slate-500 italic">Referee ID if known at creation.</span>
            </div>
          </div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-4 mb-2">Response (201)</h4>
          <div className="space-y-1 font-mono text-xs text-slate-600">
            <div>referralCode, referralId, status; optionally warning, reasons, riskScore if flagged.</div>
          </div>
        </div>

        <CodeBlock title="Create Referral Identity" snippets={referralSnippets} />
      </section>

      <section className="space-y-8 pt-20 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-extrabold text-[10px] tracking-widest">POST</span>
          <h3 className="text-2xl font-extrabold text-navy">/conversions</h3>
        </div>
        <p className="text-slate-500 font-medium">Trigger a conversion event for a referred user. Our bot detection engine will verify the fingerprint before authorizing any payouts. A reward (PENDING) is created for the referrer.</p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Request body</h4>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex gap-4 flex-wrap">
              <span className="text-navy font-bold w-32">referralCode</span>
              <span className="text-slate-400">string (required)</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <span className="text-navy font-bold w-32">refereeId</span>
              <span className="text-slate-400">string (required)</span>
              <span className="text-slate-500 italic">Your internal ID for the user who converted.</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <span className="text-navy font-bold w-32">amount</span>
              <span className="text-slate-400">number (optional)</span>
              <span className="text-slate-500 italic">Order/transaction amount; campaign default used if omitted.</span>
            </div>
            <div className="flex gap-4 flex-wrap">
              <span className="text-navy font-bold w-32">metadata</span>
              <span className="text-slate-400">string (optional)</span>
              <span className="text-slate-500 italic">Arbitrary JSON string for your records.</span>
            </div>
          </div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-4 mb-2">Response (201)</h4>
          <div className="font-mono text-xs text-slate-600">success, referralId, conversionId, rewardAmount, status</div>
        </div>

        <CodeBlock title="Initialize Conversion Event" snippets={conversionSnippets} />
      </section>

      <section className="space-y-8 pt-20 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-extrabold text-[10px] tracking-widest">POST</span>
          <h3 className="text-2xl font-extrabold text-navy">/clicks</h3>
        </div>
        <p className="text-slate-500 font-medium">Log a click event to track the journey from link click to conversion. Required for advanced device fingerprinting and fraud detection.</p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Request body</h4>
          <div className="font-mono text-xs">referralCode (string, required)</div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-4 mb-2">Response (200)</h4>
          <div className="font-mono text-xs text-slate-600">success, referralId, status</div>
        </div>
        <CodeBlock title="Track Click Ingress" snippets={{
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

      <section className="space-y-8 pt-20 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-extrabold text-[10px] tracking-widest">GET</span>
          <h3 className="text-2xl font-extrabold text-navy">/stats</h3>
        </div>
        <p className="text-slate-500 font-medium">Retrieve real-time performance metrics for a specific campaign or user tier.</p>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Query</h4>
          <div className="font-mono text-xs">campaignId (optional) — filter by campaign.</div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-4 mb-2">Response</h4>
          <div className="font-mono text-xs text-slate-600">totalReferrals, totalClicks, totalConversions, conversionRate, totalRewardValue</div>
        </div>
        <CodeBlock title="Protocol Telemetry" snippets={{
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

      <section className="space-y-8 pt-20 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-extrabold text-[10px] tracking-widest">GET</span>
          <h3 className="text-2xl font-extrabold text-navy">/users/{'{userId}'}/stats</h3>
        </div>
        <p className="text-slate-500 font-medium">Get detailed referral statistics for a specific user, including referrals made, referrals received, rewards earned, and referral codes generated/used.</p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Path &amp; query</h4>
          <div className="font-mono text-xs">GET /api/v1/users/<span className="text-primary">:userId</span>/stats — campaignId (optional)</div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-4 mb-2">Response</h4>
          <div className="font-mono text-xs text-slate-600">userId, referralsMade (total, clicked, converted), referralsReceived, rewardsEarned (total, pending, paid), referralCodesGenerated, referralCodesUsed</div>
        </div>
        <CodeBlock title="User Statistics" snippets={{
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

      <section className="space-y-8 pt-20 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-extrabold text-[10px] tracking-widest">GET</span>
          <h3 className="text-2xl font-extrabold text-navy">/users/{'{userId}'}/rewards</h3>
        </div>
        <p className="text-slate-500 font-medium">List rewards for a user (pending, approved, paid). Supports pagination and optional filters.</p>

        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Query</h4>
          <div className="space-y-1 font-mono text-xs">
            <div>status (optional) — PENDING | APPROVED | PAID | CANCELLED</div>
            <div>campaignId (optional), page (default 1), limit (default 25, max 100)</div>
          </div>
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mt-4 mb-2">Response</h4>
          <div className="font-mono text-xs text-slate-600">rewards (array), pagination (page, limit, totalItems, totalPages)</div>
        </div>
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
    <div className="space-y-16">
      <SectionHeader title="Webhook Events." badge="Webhooks" />

      <p className="text-slate-600 font-medium leading-relaxed">
        Configure webhook URLs in the partner dashboard (Webhooks). We send HTTP POST requests to your URL with a JSON body and an <code className="font-mono text-navy">X-Webhook-Signature</code> header (HMAC-SHA256 of the raw body, hex-encoded). Always verify the signature using your webhook secret.
      </p>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
        <h3 className="text-lg font-bold text-navy mb-4">Payload shape (all events)</h3>
        <pre className="font-mono text-xs text-slate-600 overflow-x-auto">
{`{
  "event": "REFERRAL_CREATED" | "REFERRAL_CLICKED" | "REFERRAL_CONVERTED" | "REWARD_CREATED",
  "data": { ... },
  "timestamp": "2025-01-31T12:00:00.000Z"
}`}
        </pre>
      </div>

      <div className="space-y-6">
        <h3 className="text-lg font-bold text-navy">Event types</h3>
        <ul className="space-y-4 text-sm text-slate-600">
          <li>
            <strong className="text-navy font-mono">REFERRAL_CREATED</strong> — When a referral code is generated. data: referralId, referralCode, referrerId, refereeId (optional), campaignId.
          </li>
          <li>
            <strong className="text-navy font-mono">REFERRAL_CLICKED</strong> — When the referral link is clicked. data: referralId, referralCode, clickedAt, campaignId.
          </li>
          <li>
            <strong className="text-navy font-mono">REFERRAL_CONVERTED</strong> — When a conversion is recorded. data: referralId, referralCode, conversionId, rewardAmount, convertedAt, campaignId.
          </li>
          <li>
            <strong className="text-navy font-mono">REWARD_CREATED</strong> — When a reward is created for the referrer (and optionally L2). data: referralId, referrerId, rewardAmount, campaignId, level (1 or 2).
          </li>
        </ul>
      </div>

      <div className="pt-8">
        <h3 className="text-lg font-bold text-navy mb-4">Verifying the signature</h3>
        <p className="text-slate-600 text-sm mb-4">Use the raw request body (string) and your webhook secret. Compute HMAC-SHA256 and compare to <code className="font-mono">X-Webhook-Signature</code> using a constant-time comparison.</p>
        <CodeBlock title="Signature verification" snippets={verifySnippets} />
      </div>
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
    <div className="space-y-16">
      <SectionHeader title="Protocol Blueprints." badge="Integration Scenarios" />

      <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
        The referral API fits a wide range of products. Use it for <strong className="text-navy">e-commerce</strong>, <strong className="text-navy">SaaS</strong>, <strong className="text-navy">marketplaces</strong>, <strong className="text-navy">content &amp; creators</strong>, and <strong className="text-navy">mobile apps</strong>. Same endpoints everywhere: <code className="font-mono text-navy text-xs">POST /referrals</code> to create a shareable link, <code className="font-mono text-navy text-xs">POST /conversions</code> when the referred user completes your success action. Below are blueprints you can copy and adapt for your stack.
      </p>

      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Detailed blueprints</h3>
        <div className="grid grid-cols-1 gap-6">
          {/* E-commerce */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all min-h-0">
            <div className="p-6 pb-3 flex flex-col items-start">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <ShoppingCart size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-extrabold text-navy mb-2">E-Commerce Reward</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Give advocates a shareable link; when a referred friend makes their first purchase, call <code className="font-mono text-navy text-xs">POST /conversions</code> (e.g. after order is delivered). Use webhooks to sync order status and only credit rewards on confirmed delivery.
              </p>
            </div>
            <div className="p-6 pt-0 flex-1 min-h-0">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl font-mono text-[10px] text-navy overflow-x-auto">
                <pre className="whitespace-pre">{codeEcom}</pre>
              </div>
            </div>
          </div>

          {/* SaaS */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all min-h-0">
            <div className="p-6 pb-3 flex flex-col items-start">
              <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                <Cloud size={22} className="text-primary" />
              </div>
              <h3 className="text-lg font-extrabold text-navy mb-2">SaaS Performance</h3>
              <p className="text-sm text-slate-500 font-medium leading-relaxed">
                Create a referral when a user signs up; when their referred friend upgrades from trial to paid, call <code className="font-mono text-navy text-xs">POST /conversions</code> with the referral code and optional <code className="font-mono text-navy text-xs">amount</code>. Use separate API keys for sandbox and production.
              </p>
            </div>
            <div className="p-6 pt-0 flex-1 min-h-0">
              <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl font-mono text-[10px] text-navy overflow-x-auto">
                <pre className="whitespace-pre">{codeSaaS}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-6">Same API, other platforms</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Marketplace */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Store size={22} className="text-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-navy mb-2">Marketplace</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">
              Reward sellers or buyers when they refer new users who complete onboarding or first transaction. Create referral on signup, fire conversion when the referred user lists an item or makes a purchase.
            </p>
            <p className="text-xs font-mono text-slate-400 mt-4">POST /referrals → POST /conversions</p>
          </div>

          {/* Content & Creators */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Video size={22} className="text-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-navy mb-2">Content &amp; Creators</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">
              Reward creators for referred signups or subscriptions. Generate a referral link per creator; when a referred fan subscribes or makes a first purchase, send a conversion with optional <code className="font-mono text-navy text-xs">amount</code>.
            </p>
            <p className="text-xs font-mono text-slate-400 mt-4">POST /referrals → POST /conversions</p>
          </div>

          {/* Mobile Apps */}
          <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-slate-300/80 transition-all">
            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
              <Smartphone size={22} className="text-primary" />
            </div>
            <h3 className="text-lg font-extrabold text-navy mb-2">Mobile Apps</h3>
            <p className="text-sm text-slate-500 font-medium leading-relaxed flex-1">
              Track installs and in-app conversions. Create referral when the user shares; when the referred user installs and completes your success event (e.g. first in-app purchase or signup), call conversions from your backend or a trusted client.
            </p>
            <p className="text-xs font-mono text-slate-400 mt-4">POST /referrals → POST /conversions</p>
          </div>
        </div>
      </div>

      <div className="pt-12 text-center space-y-8">
        <h4 className="text-navy font-extrabold text-xl font-sans tracking-tight">Need a custom technical blueprint?</h4>
        <Link href="/contact" className="inline-flex items-center px-12 py-5 rounded-xl bg-navy text-white font-bold text-sm hover:bg-primary transition-all shadow-lg shadow-navy/5">
          Request Architecture Call
        </Link>
      </div>
    </div>
  );
}
