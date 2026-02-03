'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'auth' | 'endpoints' | 'scenarios'>('quickstart');

  const tabs = [
    { id: 'quickstart', label: 'Quick Start', icon: 'rocket_launch' },
    { id: 'auth', label: 'Authentication', icon: 'key' },
    { id: 'endpoints', label: 'Endpoints', icon: 'api' },
    { id: 'scenarios', label: 'Integration Scenarios', icon: 'hub' },
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[110] bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 w-full flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/">
              <img src="/logos/logo.png" alt="Incenta" className="h-10 md:h-12" />
            </Link>
            <div className="h-6 w-px bg-slate-100 hidden md:block"></div>
            <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest hidden md:block">v2.0 Infrastructure Docs</span>
          </div>
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-primary transition-colors">
            Back to Ingress
          </Link>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-6 md:px-8 pt-32 pb-20">
        <div className="flex flex-col lg:flex-row gap-16">

          {/* Sidebar */}
          <aside className="lg:w-64 shrink-0 space-y-8">
            <div className="space-y-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400 mb-6">Integration</p>
              <div className="flex flex-col gap-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-3 ${activeTab === tab.id
                      ? 'bg-navy text-white shadow-xl shadow-navy/10 translate-x-1'
                      : 'text-slate-500 hover:text-navy hover:bg-slate-50'
                      }`}
                  >
                    <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 leading-tight">Current Engine Status</p>
              <div className="flex items-center gap-3">
                <span className="size-2 rounded-full bg-emerald-500"></span>
                <span className="text-[10px] font-bold font-mono text-navy">API PROD: 100%</span>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 max-w-4xl">
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

  const languages: { id: Language; label: string }[] = [
    { id: 'curl', label: 'cURL' },
    { id: 'nodejs', label: 'Node.js' },
    { id: 'python', label: 'Python' },
    { id: 'php', label: 'PHP' },
  ];

  return (
    <div className="relative group rounded-2xl overflow-hidden bg-navy text-white shadow-2xl my-8">
      <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <div className="flex gap-4">
          {languages.map((l) => (
            <button
              key={l.id}
              onClick={() => setLang(l.id)}
              className={`text-[10px] font-bold font-mono uppercase tracking-widest transition-colors ${lang === l.id ? 'text-primary' : 'text-slate-500 hover:text-slate-300'
                }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          {title && <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">{title}</span>}
          <button
            onClick={() => navigator.clipboard.writeText(snippets[lang])}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-sm">content_copy</span>
          </button>
        </div>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="font-mono text-xs md:text-sm leading-relaxed text-slate-300">
          {snippets[lang]}
        </pre>
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
      <div className="space-y-12 text-slate-600 font-medium leading-relaxed font-sans">
        <p className="text-lg text-slate-500">
          This protocol will guide you through the process of initializing your Incenta referral ecosystem. Most integrations take less than 15 minutes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
          <div className="space-y-4">
            <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-navy">01</div>
            <h3 className="text-xl font-bold text-navy">Obtain Master Key</h3>
            <p className="text-sm">Sign in to the ingress portal and generate your product-specific API keys from the <Link href="/dashboard/v2/settings" className="text-primary hover:underline">Settings</Link> layer.</p>
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
            https://api.incenta.io/v2
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
    curl: `curl -X GET "https://api.incenta.io/v2/status" \\
  -H "Authorization: Bearer sk_live_master_identity"`,
    nodejs: `const fetch = require('node-fetch');

const response = await fetch('https://api.incenta.io/v2/status', {
  headers: {
    'Authorization': 'Bearer sk_live_master_identity'
  }
});`,
    python: `import requests

headers = {
    'Authorization': 'Bearer sk_live_master_identity'
}

response = requests.get('https://api.incenta.io/v2/status', headers=headers)`,
    php: `<?php
$ch = curl_init('https://api.incenta.io/v2/status');
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
    'Authorization: Bearer sk_live_master_identity'
));
$response = curl_exec($ch);
?>`
  };

  return (
    <div>
      <SectionHeader title="Bearer Tokens." badge="Authentication" />
      <div className="space-y-8 text-slate-600 font-medium leading-relaxed">
        <p>All protocol requests require a validated Bearer token. This token should be mapped in the Authorization header of every HTTPS request.</p>

        <CodeBlock title="Authorization Protocol" snippets={snippets} />

        <div className="p-6 rounded-2xl border-2 border-primary/10 bg-primary/5 flex gap-6 mt-12">
          <span className="material-symbols-outlined text-primary font-bold">lock</span>
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
    curl: `curl -X POST "https://api.incenta.io/v2/referrals" \\
  -H "Authorization: Bearer <sk_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "campaign_id": "growth_tier_1",
    "referrer_id": "user_89231",
    "metadata": {
      "user_tier": "gold",
      "region": "NP"
    }
  }'`,
    nodejs: `const axios = require('axios');

const createReferral = async () => {
  const { data } = await axios.post('https://api.incenta.io/v2/referrals', {
    campaign_id: 'growth_tier_1',
    referrer_id: 'user_89231',
    metadata: {
      user_tier: 'gold',
      region: 'NP'
    }
  }, {
    headers: { 'Authorization': 'Bearer <sk_key>' }
  });
  
  return data.referral_code; // Returns "ABC123XYZ"
};`,
    python: `import requests

payload = {
    "campaign_id": "growth_tier_1",
    "referrer_id": "user_89231",
    "metadata": {"user_tier": "gold"}
}

response = requests.post(
    'https://api.incenta.io/v2/referrals',
    json=payload,
    headers={'Authorization': 'Bearer <sk_key>'}
)`,
    php: `<?php
$payload = [
    "campaign_id" => "growth_tier_1",
    "referrer_id" => "user_89231"
];

$ch = curl_init('https://api.incenta.io/v2/referrals');
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
// ... common headers setup`
  };

  const conversionSnippets: Record<Language, string> = {
    curl: `curl -X POST "https://api.incenta.io/v2/conversions" \\
  -H "Authorization: Bearer <sk_key>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "referral_code": "ABC123XYZ",
    "referee_id": "new_user_442",
    "conversion_type": "subscription_start",
    "payout_value": 500.00
  }'`,
    nodejs: `// Track final conversion
const trackConversion = async (code, userId) => {
  await axios.post('https://api.incenta.io/v2/conversions', {
    referral_code: code,
    referee_id: userId,
    conversion_type: 'subscription_start',
    payout_value: 500.00
  }, {
    headers: { 'Authorization': 'Bearer <sk_key>' }
  });
};`,
    python: `response = requests.post(
    'https://api.incenta.io/v2/conversions',
    json={
        "referral_code": "ABC123XYZ",
        "referee_id": "new_user_442",
        "payout_value": 500.0
    },
    headers={'Authorization': 'Bearer <sk_key>'}
)`,
    php: `// PHP conversion logic via cURL...`
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
          <h4 className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-4">Payload Schema</h4>
          <div className="space-y-3 font-mono text-xs">
            <div className="flex gap-4">
              <span className="text-navy font-bold w-32">campaign_id</span>
              <span className="text-slate-400">string (Required)</span>
              <span className="text-slate-500 italic">// The UUID of your deployment.</span>
            </div>
            <div className="flex gap-4">
              <span className="text-navy font-bold w-32">referrer_id</span>
              <span className="text-slate-400">string (Required)</span>
              <span className="text-slate-500 italic">// Your internal user identification.</span>
            </div>
          </div>
        </div>

        <CodeBlock title="Create Referral Identity" snippets={referralSnippets} />
      </section>

      <section className="space-y-8 pt-20 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-extrabold text-[10px] tracking-widest">POST</span>
          <h3 className="text-2xl font-extrabold text-navy">/conversions</h3>
        </div>
        <p className="text-slate-500 font-medium">Trigger a conversion event for a referred user. Our bot detection engine will verify the fingerprint before authorizing any payouts.</p>

        <CodeBlock title="Initialize Conversion Event" snippets={conversionSnippets} />

        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 italic text-sm text-slate-500">
          Note: If "payout_value" is omitted, the engine will use the default reward configured for the campaign tier.
        </div>
      </section>

      <section className="space-y-8 pt-20 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg font-extrabold text-[10px] tracking-widest">POST</span>
          <h3 className="text-2xl font-extrabold text-navy">/clicks</h3>
        </div>
        <p className="text-slate-500 font-medium">Log a click event to track the journey from link click to conversion. Required for advanced device fingerprinting and fraud detection.</p>

        <CodeBlock title="Track Click Ingress" snippets={{
          curl: `curl -X POST "https://api.incenta.io/v2/clicks" \\
  -H "Authorization: Bearer <sk_key>" \\
  -d '{"referral_code": "ABC123XYZ"}'`,
          nodejs: `await axios.post('https://api.incenta.io/v2/clicks', { referral_code: 'ABC123XYZ' });`,
          python: `requests.post('https://api.incenta.io/v2/clicks', json={'referral_code': 'ABC123XYZ'})`,
          php: `// PHP click tracking...`
        }} />
      </section>

      <section className="space-y-8 pt-20 border-t border-slate-100">
        <div className="flex items-center gap-4">
          <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg font-extrabold text-[10px] tracking-widest">GET</span>
          <h3 className="text-2xl font-extrabold text-navy">/stats</h3>
        </div>
        <p className="text-slate-500 font-medium">Retrieve real-time performance metrics for a specific campaign or user tier.</p>

        <CodeBlock title="Protocol Telemetry" snippets={{
          curl: `curl -X GET "https://api.incenta.io/v2/stats?campaign_id=growth_q1" \\
  -H "Authorization: Bearer <sk_key>"`,
          nodejs: `const { data } = await axios.get('https://api.incenta.io/v2/stats', {
  params: { campaign_id: 'growth_q1' },
  headers: { 'Authorization': 'Bearer <sk_key>' }
});`,
          python: `response = requests.get('https://api.incenta.io/v2/stats', params={'campaign_id': 'growth_q1'})`,
          php: `// PHP telemetry fetch...`
        }} />
      </section>
    </div>
  );
}

function ScenariosSection() {
  const codeEcom = `// Scenario: E-Commerce Post-Purchase
// Notify Incenta to generate a code when a user reaches a specific spend tier.

await incenta.referrals.create({
  campaign_id: "VIP_REWARDS",
  referrer_id: "customer_9921",
  metadata: {
     avg_basket: 4500,
     purchase_count: 5
  }
});`;

  const codeSaaS = `// Scenario: SaaS Free Trial Expansion
// Track conversion when a user upgrades from Trial to Pro.

await incenta.conversions.create({
  referral_code: "TRIAL_USER_123",
  referee_id: "user_uuid_988",
  conversion_type: "upgrade_tier",
  metadata: {
     plan: "enterprise"
  }
});`;

  return (
    <div className="space-y-16">
      <SectionHeader title="Protocol Blueprints." badge="Integration Scenarios" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white space-y-6">
          <span className="material-symbols-outlined text-primary text-3xl">shopping_cart</span>
          <h3 className="text-2xl font-extrabold text-navy">E-Commerce Reward</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Implement complex basket-size rewards. Only trigger payouts if order status becomes "Delivered" via webhooks.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl font-mono text-[10px] text-navy">
            {codeEcom}
          </div>
        </div>

        <div className="p-8 rounded-[2.5rem] border border-slate-100 bg-white space-y-6">
          <span className="material-symbols-outlined text-primary text-3xl">cloud_queue</span>
          <h3 className="text-2xl font-extrabold text-navy">SaaS Performance</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">
            Perfect for multi-app isolation. Use independent API keys for Sandbox vs Production environments.
          </p>
          <div className="bg-slate-50 p-4 rounded-xl font-mono text-[10px] text-navy">
            {codeSaaS}
          </div>
        </div>
      </div>

      <div className="pt-20 text-center space-y-8">
        <h4 className="text-navy font-extrabold text-xl font-sans tracking-tight">Need a custom technical blueprint?</h4>
        <Link href="/contact" className="tactile-btn !px-12 !py-5">Request Architecture Call</Link>
      </div>
    </div>
  );
}
