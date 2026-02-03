'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function DocsPage() {
  const [activeTab, setActiveTab] = useState<'quickstart' | 'auth' | 'endpoints' | 'examples'>('quickstart');

  const tabs = [
    { id: 'quickstart', label: 'Quick Start', icon: 'rocket_launch' },
    { id: 'auth', label: 'Authentication', icon: 'key' },
    { id: 'endpoints', label: 'Endpoints', icon: 'api' },
    { id: 'examples', label: 'SDK Examples', icon: 'terminal' },
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
                {activeTab === 'examples' && <ExamplesSection />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  );
}

function CodeBlock({ code, lang }: { code: string; lang: string }) {
  return (
    <div className="relative group rounded-2xl overflow-hidden bg-navy text-white shadow-2xl my-8">
      <div className="px-6 py-3 bg-white/5 border-b border-white/5 flex items-center justify-between">
        <span className="text-[10px] font-bold font-mono text-slate-500 uppercase tracking-widest">{lang} identity</span>
        <button
          onClick={() => navigator.clipboard.writeText(code)}
          className="text-slate-500 hover:text-white transition-colors"
        >
          <span className="material-symbols-outlined text-sm">content_copy</span>
        </button>
      </div>
      <div className="p-6 overflow-x-auto">
        <pre className="font-mono text-xs md:text-sm leading-relaxed text-slate-300">
          {code}
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
      <div className="space-y-12 text-slate-600 font-medium leading-relaxed">
        <p className="text-lg text-slate-500">
          This protocol will guide you through the process of initializing your Incenta referral ecosystem. Most integrations take less than 15 minutes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-slate-100">
          <div className="space-y-4">
            <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-navy">01</div>
            <h3 className="text-xl font-bold text-navy">Obtain Master Key</h3>
            <p className="text-sm">Sign in to the ingress portal and generate your product-specific API keys from the application layer.</p>
          </div>
          <div className="space-y-4">
            <div className="size-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-navy">02</div>
            <h3 className="text-xl font-bold text-navy">Deploy Campaign</h3>
            <p className="text-sm">Define your multi-currency rewards and referral logic in the partner dashboard.</p>
          </div>
        </div>

        <div className="pt-10">
          <h3 className="text-sm font-extrabold uppercase tracking-widest text-navy mb-6">Base Protocol URL</h3>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 font-mono text-xs font-bold text-navy">
            https://api.incenta.io/v1/referral
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthSection() {
  return (
    <div>
      <SectionHeader title="Bearer Tokens." badge="Authentication" />
      <div className="space-y-8 text-slate-600 font-medium leading-relaxed">
        <p>All protocol requests require a validated Bearer token. This token should be mapped in the Authorization header of every HTTPS request.</p>

        <CodeBlock
          lang="HTTP"
          code={`Authorization: Bearer <sk_live_master_identity>`}
        />

        <div className="p-6 rounded-2xl border-2 border-primary/10 bg-primary/5 flex gap-6">
          <span className="material-symbols-outlined text-primary font-bold">lock</span>
          <p className="text-sm text-navy">
            <span className="font-extrabold">Warning:</span> Keep your master keys isolated. Never expose production identities in client-side artifacts.
          </p>
        </div>
      </div>
    </div>
  );
}

function EndpointsSection() {
  const endpoints = [
    { method: 'POST', path: '/referrals', desc: 'Initialize new referral identity for an advocate.' },
    { method: 'POST', path: '/clicks', desc: 'Log unique click event with device fingerprinting.' },
    { method: 'POST', path: '/conversions', desc: 'Securely track conversion event and verify payout eligibility.' },
  ];

  return (
    <div>
      <SectionHeader title="Reference Guide." badge="API Endpoints" />
      <div className="space-y-6">
        {endpoints.map((ep, i) => (
          <div key={i} className="group p-6 rounded-3xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-xl transition-all flex flex-col md:flex-row md:items-center gap-6">
            <div className={`px-4 py-1.5 rounded-lg font-extrabold text-[10px] tracking-widest ${ep.method === 'POST' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              }`}>
              {ep.method}
            </div>
            <code className="text-navy font-bold">{ep.path}</code>
            <p className="text-sm text-slate-400 font-medium md:ml-auto">{ep.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExamplesSection() {
  const code = `// Initialize referral event
const referral = await client.events.create({
  "type": "reward.qualified",
  "callback_url": "https://api.yourbrand.com/v1/webhooks",
  "metadata": {
    "campaign_id": "growth_q4",
    "user_tier": "pro"
  }
});

console.log("Infrastructure active.");`;

  return (
    <div>
      <SectionHeader title="Ready-to-use Logic." badge="SDK Examples" />
      <div className="space-y-8">
        <p className="text-slate-600 font-medium">Use these common patterns to implement Incenta infrastructure directly into your codebase.</p>
        <CodeBlock lang="JAVASCRIPT" code={code} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['Python', 'Go', 'PHP', 'Ruby'].map(lang => (
            <div key={lang} className="p-4 rounded-xl border border-slate-100 text-center font-bold text-xs text-slate-400 hover:text-navy hover:border-slate-300 transition-colors cursor-pointer">
              {lang}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
