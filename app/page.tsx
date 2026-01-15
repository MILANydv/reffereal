'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function Home() {
  const [copied, setCopied] = useState(false);

  return (
    <div className="selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 w-full z-[100] px-8 py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between glass-panel px-8 py-4 rounded-3xl">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-navy rounded-lg flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-xl">hub</span>
            </div>
            <span className="text-xl font-extrabold tracking-tighter">ReferralSystem</span>
          </div>
          <nav className="hidden lg:flex items-center gap-10">
            <a className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#features">The Grid</a>
            <a className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#developer">Infrastructure</a>
            <a className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#pricing">Plans</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-extrabold uppercase tracking-widest px-4">Login</Link>
            <Link href="/signup" className="bg-navy text-white text-xs font-extrabold uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-primary transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="min-h-[100vh] pt-44 pb-32 relative overflow-hidden">
          <div className="gradient-glow size-[600px] bg-primary/20 -top-40 -left-40"></div>
          <div className="max-w-[1400px] mx-auto px-8 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.3em] mb-8">
                <span className="w-10 h-px bg-primary"></span>
                Automated Viral Growth
              </div>
              <h1 className="text-7xl xl:text-9xl mb-8 font-light italic">
                Scale Your <br/>
                <span className="font-extrabold not-italic text-navy">SaaS Growth</span>
              </h1>
              <p className="text-xl text-slate-500 max-w-lg leading-relaxed font-medium mb-12">
                Automate referrals, eliminate fraud, and turn users into revenue with pixel-perfect tracking and seamless payouts.
              </p>
              <div className="flex flex-col gap-10">
                <div className="flex items-center gap-6">
                  <Link href="/signup" className="tactile-btn text-lg">Claim Your Access</Link>
                  <div className="flex -space-x-3">
                    <div className="size-12 rounded-full border-4 border-white bg-slate-200"></div>
                    <div className="size-12 rounded-full border-4 border-white bg-slate-300"></div>
                    <div className="size-12 rounded-full border-4 border-white bg-slate-400"></div>
                    <div className="size-12 rounded-full border-4 border-white bg-primary flex items-center justify-center text-[10px] text-white font-bold">+2k</div>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Trusted by 500+ scaling teams</span>
                  <div className="flex items-center gap-8 opacity-40 grayscale pointer-events-none">
                    <div className="h-5 w-20 bg-slate-300 rounded"></div>
                    <div className="h-5 w-20 bg-slate-300 rounded"></div>
                    <div className="h-5 w-20 bg-slate-300 rounded"></div>
                    <div className="h-5 w-20 bg-slate-300 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[400px] h-[400px] border border-dashed border-slate-300 rounded-full"
                ></motion.div>
                <div className="absolute w-[250px] h-[250px] border border-slate-200 rounded-full"></div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="molecule-node top-10 left-20 z-20"
                >
                  <span className="material-symbols-outlined text-primary text-3xl">person_add</span>
                </motion.div>
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="molecule-node bottom-20 right-10 z-20"
                >
                  <span className="material-symbols-outlined text-emerald-500 text-3xl">redeem</span>
                </motion.div>
                <div className="molecule-node top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-24 bg-white/60 shadow-2xl !rounded-3xl">
                  <div className="size-16 bg-navy rounded-2xl flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-4xl">insights</span>
                  </div>
                </div>
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="molecule-node top-40 right-20"
                >
                  <span className="material-symbols-outlined text-amber-500 text-2xl">bolt</span>
                </motion.div>
                <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                  <line stroke="currentColor" strokeWidth="2" x1="25%" x2="50%" y1="15%" y2="50%"></line>
                  <line stroke="currentColor" strokeWidth="2" x1="85%" x2="50%" y1="75%" y2="50%"></line>
                  <line stroke="currentColor" strokeWidth="2" x1="75%" x2="50%" y1="35%" y2="50%"></line>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-[120px] bg-slate-50/50" id="features">
          <div className="max-w-[1400px] mx-auto px-8">
            <header className="mb-20 space-y-4">
              <h2 className="text-6xl font-extrabold tracking-tight">Engineered for Scale.</h2>
              <p className="text-xl text-slate-500 max-w-xl">Deep attribution meets seamless rewards. A multi-layered approach to referral management.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:min-h-[800px]">
              <div className="md:col-span-3 bento-card rounded-bento p-12 bg-navy text-white overflow-hidden group">
                <div className="gradient-glow size-96 bg-primary/20 -top-20 -right-20"></div>
                <div className="relative z-10 max-w-sm">
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Real-time Attribution</span>
                  <h3 className="text-4xl font-bold mb-4">Live Performance Tracking</h3>
                  <p className="text-slate-400 text-lg leading-relaxed">Watch your viral coefficient evolve in real-time with pixel-perfect accuracy across all touchpoints.</p>
                </div>
                <div className="absolute bottom-0 right-0 w-3/4 h-1/2 translate-y-10 group-hover:translate-y-5 transition-transform">
                  <div className="flex items-end gap-2 h-full px-12">
                    <div className="w-full bg-primary/20 h-[30%] rounded-t-xl"></div>
                    <div className="w-full bg-primary/40 h-[50%] rounded-t-xl"></div>
                    <div className="w-full bg-primary/60 h-[45%] rounded-t-xl"></div>
                    <div className="w-full bg-primary h-[85%] rounded-t-xl shadow-[0_0_30px_rgba(37,99,235,0.4)]"></div>
                    <div className="w-full bg-primary/70 h-[65%] rounded-t-xl"></div>
                    <div className="w-full bg-primary/40 h-[95%] rounded-t-xl"></div>
                    <div className="w-full bg-primary/20 h-[55%] rounded-t-xl"></div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1 bento-card rounded-bento p-10 flex flex-col justify-between">
                <div className="size-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-sm mb-6">
                  <span className="material-symbols-outlined text-3xl">verified_user</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold mb-2">Anti-Fraud</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">AI-driven patterns to block duplicate identities and bot referrals.</p>
                </div>
              </div>
              <div className="md:col-span-1 bento-card rounded-bento p-10 flex flex-col justify-between">
                <div className="size-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm mb-6">
                  <span className="material-symbols-outlined text-3xl">currency_exchange</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold mb-2">Global Payouts</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Automated rewards in 135+ currencies via Stripe and PayPal.</p>
                </div>
              </div>
              <div className="md:col-span-2 bento-card rounded-bento p-12 flex flex-col justify-between group overflow-hidden">
                <div className="gradient-glow size-96 bg-indigo-500/10 -bottom-20 -left-20"></div>
                <div className="relative z-10">
                  <h3 className="text-3xl font-extrabold mb-4">Branded Link Studio</h3>
                  <p className="text-slate-500 text-lg">Generate clean, custom vanity URLs that match your domain perfectly.</p>
                </div>
                <div className="mt-12 bg-slate-50 p-6 rounded-2xl border border-slate-200/60 shadow-inner translate-y-4 group-hover:translate-y-0 transition-transform">
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl shadow-sm mb-4">
                    <span className="text-slate-400 text-sm">refer.yourbrand.com/</span>
                    <span className="text-primary font-bold text-sm">summer-sale-2024</span>
                    <button
                      onClick={() => {
                        setCopied(true);
                        navigator.clipboard.writeText('refer.yourbrand.com/summer-sale-2024');
                        setTimeout(() => setCopied(false), 2000);
                      }}
                      className="ml-auto text-slate-300 hover:text-primary transition-colors"
                    >
                      <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                    </button>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full w-[65%] bg-primary"></div>
                  </div>
                </div>
              </div>
              <div className="md:col-span-1 bento-card rounded-bento bg-primary text-white p-10 flex flex-col justify-center text-center">
                <span className="text-4xl font-extrabold mb-2">99.9%</span>
                <p className="text-xs uppercase tracking-widest font-bold opacity-70">Uptime Reliability</p>
              </div>
            </div>
          </div>
        </section>

        {/* Brand Logos */}
        <section className="py-24 border-y border-slate-100 bg-white">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="flex flex-col items-center gap-12">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.5em] text-slate-400">Join 2,000+ scaling teams</p>
              <div className="flex flex-wrap justify-center items-center gap-12 md:gap-20 opacity-40 grayscale">
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
                <div className="h-8 w-24 bg-slate-300 rounded"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="py-32" id="developer">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              <div className="lg:col-span-7 bg-code-bg rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden group">
                <div className="flex items-center gap-2 mb-8">
                  <div className="flex gap-1.5">
                    <div className="size-3 rounded-full bg-red-500/20"></div>
                    <div className="size-3 rounded-full bg-amber-500/20"></div>
                    <div className="size-3 rounded-full bg-emerald-500/20"></div>
                  </div>
                  <span className="ml-4 text-xs font-mono text-slate-500">webhook_trigger.js</span>
                </div>
                <pre className="font-mono text-sm md:text-base leading-relaxed overflow-x-auto text-slate-300">
                  <span className="code-syntax-comment">// Initialize referral webhook</span>{'\n'}
                  <span className="code-syntax-keyword">const</span> referral = <span className="code-syntax-keyword">await</span> client.<span className="code-syntax-function">events</span>.<span className="code-syntax-function">create</span>({'{'}
{'\n'}  <span className="code-syntax-string">"type"</span>: <span className="code-syntax-string">"reward.qualified"</span>,
{'\n'}  <span className="code-syntax-string">"callback_url"</span>: <span className="code-syntax-string">"https://api.yourbrand.com/v1/webhooks"</span>,
{'\n'}  <span className="code-syntax-string">"metadata"</span>: {'{'}
{'\n'}    <span className="code-syntax-string">"campaign_id"</span>: <span className="code-syntax-string">"growth_q4"</span>,
{'\n'}    <span className="code-syntax-string">"user_tier"</span>: <span className="code-syntax-string">"pro"</span>
{'\n'}  {'}'}
{'\n'}{'}'});
{'\n'}<span className="code-syntax-function">console</span>.<span className="code-syntax-function">log</span>(<span className="code-syntax-string">"Infrastructure active."</span>);
                </pre>
                <div className="absolute bottom-8 right-8">
                  <button
                    onClick={() => {
                      const code = `const referral = await client.events.create({
  "type": "reward.qualified",
  "callback_url": "https://api.yourbrand.com/v1/webhooks",
  "metadata": {
    "campaign_id": "growth_q4",
    "user_tier": "pro"
  }
});
console.log("Infrastructure active.");`;
                      navigator.clipboard.writeText(code);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="size-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/40 group-hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                  </button>
                </div>
              </div>
              <div className="lg:col-span-5 flex flex-col justify-center p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <span className="text-primary font-bold text-xs uppercase tracking-widest mb-6">Developer First</span>
                <h2 className="text-5xl font-extrabold mb-8 tracking-tight">API-Driven Architecture.</h2>
                <p className="text-slate-500 text-lg leading-relaxed mb-10">
                  Build custom referral experiences with our robust <span className="text-navy font-bold">REST APIs</span> and real-time <span className="text-navy font-bold">Webhooks</span>. We don&apos;t just provide a dashboard; we provide a platform.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="material-symbols-outlined text-primary mt-1">support_agent</span>
                    <div>
                      <p className="font-bold text-navy">Dedicated Integration Support</p>
                      <p className="text-sm text-slate-500">Your dedicated account manager handles the complex mapping for your enterprise stack.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Service */}
        <section className="pb-32">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="bento-card rounded-bento bg-navy p-12 flex flex-col md:flex-row items-center justify-between gap-12 group">
              <div className="relative z-10 max-w-xl">
                <span className="text-primary font-bold text-xs uppercase tracking-[0.3em] mb-4 block">Premium Service</span>
                <h2 className="text-4xl md:text-5xl text-white font-extrabold mb-6 tracking-tight">Need a custom hand-off?</h2>
                <p className="text-slate-400 text-xl leading-relaxed">Our <span className="text-white font-bold">Dedicated Account Managers</span> act as an extension of your engineering team, handling custom reward logic and API orchestrations.</p>
              </div>
              <div className="relative">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.3, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="size-48 bg-primary rounded-full blur-[80px] opacity-20 absolute -z-10"
                ></motion.div>
                <div className="flex -space-x-4">
                  <div className="size-20 rounded-3xl border-4 border-navy bg-slate-200 overflow-hidden shadow-2xl relative z-10">
                    <div className="w-full h-full bg-gradient-to-br from-slate-300 to-slate-400"></div>
                  </div>
                  <div className="size-20 rounded-3xl border-4 border-navy bg-primary flex items-center justify-center text-white relative z-20">
                    <span className="material-symbols-outlined text-4xl">verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-32 bg-eggshell/50" id="pricing">
          <div className="max-w-[1400px] mx-auto px-8">
            <header className="text-center mb-20">
              <h2 className="text-6xl font-extrabold mb-6">Simple, Scaling Plans.</h2>
              <p className="text-xl text-slate-500">No hidden fees. Choose the tier that matches your growth velocity.</p>
            </header>
            <div className="flex gap-8 overflow-x-auto pb-12 hide-scrollbar px-4">
              <div className="min-w-[400px] bg-white p-12 rounded-[2.5rem] border border-slate-200/50 flex flex-col">
                <div className="mb-6 flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">For early stage</span>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Startup</span>
                </div>
                <div className="mb-12">
                  <span className="text-6xl font-serif">$49</span>
                  <span className="text-slate-400 font-bold ml-2">/mo</span>
                </div>
                <ul className="space-y-6 mb-12 flex-1">
                  <li className="flex items-center gap-4 text-sm font-bold text-slate-600">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    1,000 Active Advocates
                  </li>
                  <li className="flex items-center gap-4 text-sm font-bold text-slate-600">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Branded Experience
                  </li>
                </ul>
                <Link href="/signup" className="w-full py-4 border-2 border-slate-200 rounded-2xl font-extrabold uppercase tracking-widest text-xs hover:bg-slate-50 transition-colors text-center block">Start Building</Link>
              </div>
              <div className="min-w-[420px] bg-navy text-white p-12 rounded-[2.5rem] shadow-2xl shadow-primary/20 flex flex-col relative overflow-hidden scale-105">
                <div className="absolute top-0 right-0 bg-primary px-6 py-2 rounded-bl-3xl text-[10px] font-bold uppercase tracking-widest">Most Popular</div>
                <div className="mb-6 flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">For scaling teams</span>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Growth Engine</span>
                </div>
                <div className="mb-12">
                  <span className="text-6xl font-serif">$149</span>
                  <span className="text-slate-500 font-bold ml-2">/mo</span>
                </div>
                <ul className="space-y-6 mb-12 flex-1">
                  <li className="flex items-center gap-4 text-sm font-bold">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Unlimited Advocates
                  </li>
                  <li className="flex items-center gap-4 text-sm font-bold">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Advanced Anti-Fraud AI
                  </li>
                  <li className="flex items-center gap-4 text-sm font-bold">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Multi-Currency Support
                  </li>
                </ul>
                <Link href="/signup" className="w-full py-4 bg-primary text-white rounded-2xl font-extrabold uppercase tracking-widest text-xs hover:shadow-xl transition-all text-center block">Go Premium</Link>
              </div>
              <div className="min-w-[400px] bg-white p-12 rounded-[2.5rem] border border-slate-200/50 flex flex-col">
                <div className="mb-6 flex flex-col gap-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">For high-volume platforms</span>
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Enterprise</span>
                </div>
                <div className="mb-12">
                  <span className="text-6xl font-serif">$499</span>
                  <span className="text-slate-400 font-bold ml-2">/mo</span>
                </div>
                <ul className="space-y-6 mb-12 flex-1">
                  <li className="flex items-center gap-4 text-sm font-bold text-slate-600">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Dedicated Strategist
                  </li>
                  <li className="flex items-center gap-4 text-sm font-bold text-slate-600">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    Custom Integration Path
                  </li>
                  <li className="flex items-center gap-4 text-sm font-bold text-slate-600">
                    <span className="material-symbols-outlined text-primary">check_circle</span>
                    SLA-Backed Uptime
                  </li>
                </ul>
                <Link href="/contact" className="w-full py-4 border-2 border-navy text-navy rounded-2xl font-extrabold uppercase tracking-widest text-xs hover:bg-navy hover:text-white transition-all text-center block">Contact Sales</Link>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-32 bg-white">
          <div className="max-w-[800px] mx-auto px-8">
            <header className="text-center mb-16">
              <h2 className="text-5xl font-extrabold mb-4">Technical FAQ</h2>
              <p className="text-slate-500 font-medium">Clear answers for your engineering team.</p>
            </header>
            <div className="space-y-4">
              <details className="faq-item group border-b border-slate-100 pb-6">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-xl font-bold text-navy group-hover:text-primary transition-colors">How do Webhooks work?</h3>
                  <span className="faq-icon material-symbols-outlined transition-transform duration-300">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-500 leading-relaxed font-medium">
                  We send POST requests to your registered endpoint whenever a referral event occurs (signup, conversion, payout). You can verify payloads using the secret HMAC-SHA256 signature in the header.
                </p>
              </details>
              <details className="faq-item group border-b border-slate-100 pb-6 pt-6">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-xl font-bold text-navy group-hover:text-primary transition-colors">Can I use my own domain?</h3>
                  <span className="faq-icon material-symbols-outlined transition-transform duration-300">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-500 leading-relaxed font-medium">
                  Yes. You can configure custom CNAME records in your DNS settings. We provide automated SSL certificate provisioning for all custom domains.
                </p>
              </details>
              <details className="faq-item group border-b border-slate-100 pb-6 pt-6">
                <summary className="flex items-center justify-between cursor-pointer list-none">
                  <h3 className="text-xl font-bold text-navy group-hover:text-primary transition-colors">Do you support custom rewards via API?</h3>
                  <span className="faq-icon material-symbols-outlined transition-transform duration-300">expand_more</span>
                </summary>
                <p className="mt-4 text-slate-500 leading-relaxed font-medium">
                  Absolutely. While we automate Stripe and PayPal, you can use our &apos;External Payout&apos; hook to trigger your own internal reward mechanisms, such as account credits or physical gifts.
                </p>
              </details>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 bg-navy relative overflow-hidden">
          <div className="gradient-glow size-[800px] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-[1000px] mx-auto px-8 text-center relative z-10">
            <h2 className="text-white text-7xl md:text-9xl mb-12 italic font-light">
              Ready to <span className="not-italic font-extrabold">scale?</span>
            </h2>
            <div className="flex justify-center">
              <Link href="/signup" className="tactile-btn text-2xl !px-16 !py-8">
                Launch Your Program
              </Link>
            </div>
            <p className="mt-12 text-slate-500 font-bold text-sm uppercase tracking-[0.4em]">14-Day Free Trial • No Credit Card</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-24">
            <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-navy rounded-xl flex items-center justify-center text-white">
                  <span className="material-symbols-outlined text-2xl">hub</span>
                </div>
                <span className="text-2xl font-extrabold tracking-tighter">ReferralSystem</span>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed font-medium">Next-generation referral architecture built for high-scale SaaS and subscription engines.</p>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">Security</h4>
              <ul className="space-y-4 text-sm font-bold text-navy">
                <li><a className="hover:text-primary transition-colors" href="#">Encryption</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">SOC2 Type II</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Data Residency</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Bug Bounty</a></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">Compliance</h4>
              <ul className="space-y-4 text-sm font-bold text-navy">
                <li><a className="hover:text-primary transition-colors" href="#">GDPR</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">CCPA</a></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">System</h4>
              <ul className="space-y-4 text-sm font-bold text-navy">
                <li><a className="hover:text-primary transition-colors" href="#">Status Page</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">API Uptime</a></li>
                <li><a className="hover:text-primary transition-colors" href="#">Integrations</a></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Support</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">Product</h4>
              <ul className="space-y-4 text-sm font-bold text-navy">
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><a className="hover:text-primary transition-colors" href="#">Change Log</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-bold text-slate-400">© 2024 ReferralSystem. Engineered for viral velocity.</p>
            <div className="flex gap-8">
              <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-navy">Privacy</Link>
              <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-navy">Terms</Link>
              <a className="text-xs font-bold text-slate-400 hover:text-navy" href="#">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
