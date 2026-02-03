'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Home() {
  const [copied, setCopied] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 w-full z-[100] px-4 md:px-8 py-4 md:py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between glass-panel px-4 md:px-8 py-3 md:py-4 rounded-2xl md:rounded-3xl">
          <div className="flex items-center gap-2">
            <img src="/logos/logo.png" alt="Incenta Logo" className="h-8 md:h-12 w-auto" />
          </div>
          <nav className="hidden lg:flex items-center gap-10">
            <a className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#features">The Grid</a>
            <a className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#developer">Infrastructure</a>
            <Link className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="/blogs">Library</Link>
            <a className="text-xs font-bold uppercase tracking-widest hover:text-primary transition-colors" href="#pricing">Plans</a>
          </nav>
          <div className="flex items-center gap-2 md:gap-4">
            <Link href="/login" className="text-[10px] md:text-xs font-extrabold uppercase tracking-widest px-2 md:px-4">Login</Link>
            <Link href="/signup" className="bg-navy text-white text-[10px] md:text-xs font-extrabold uppercase tracking-widest px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl hover:bg-primary transition-all">Get Started</Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="min-h-[100vh] pt-32 md:pt-44 pb-20 md:pb-32 relative overflow-hidden flex items-center">
          <div className="absolute inset-0 bg-dot-pattern"></div>
          <div className="gradient-glow size-[300px] md:size-[600px] bg-primary/20 -top-20 md:-top-40 -left-20 md:-left-40"></div>
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10 w-full">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8 animate-in slide-in-from-top-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-primary">v2.0 Infrastructure Live</span>
              </div>
              <h1 className="text-5xl md:text-7xl xl:text-9xl mb-6 md:mb-8 font-light italic leading-[1.1] md:leading-[0.9] animate-in slide-in-from-top-2 [animation-delay:200ms]">
                Scale Your <br />
                <span className="font-extrabold not-italic bg-gradient-to-r from-navy via-primary to-navy bg-clip-text text-transparent">Nepal SaaS</span>
              </h1>
              <p className="text-lg md:text-xl text-slate-500 max-w-lg leading-relaxed font-medium mb-8 md:mb-12 animate-in slide-in-from-top-2 [animation-delay:400ms]">
                Automate referrals, eliminate fraud, and turn users into revenue with pixel-perfect tracking and seamless payouts.
              </p>
              <div className="flex flex-col gap-10 animate-in slide-in-from-top-2 [animation-delay:600ms]">
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-16">
                  <Link href="/signup" className="tactile-btn text-lg w-full sm:w-auto text-center">Claim Your Access</Link>
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className={`size-12 rounded-full border-4 border-white bg-slate-${i + 1}00 overflow-hidden shadow-xl relative z-${40 - i * 10}`}>
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300"></div>
                        </div>
                      ))}
                      <div className="size-12 rounded-full border-4 border-white bg-primary flex items-center justify-center text-[10px] text-white font-bold shadow-xl relative z-0">+2k</div>
                    </div>
                    <div className="flex flex-col">
                      <div className="flex text-amber-500 text-sm">
                        {"★★★★★".split("").map((s, i) => <span key={i}>{s}</span>)}
                      </div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">from top founders</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-6 p-6 rounded-3xl bg-white/40 backdrop-blur-sm border border-white/40 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Trusted by 500+ scaling teams
                  </span>
                  <div className="flex items-center gap-8 md:gap-12 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all cursor-default">
                    <div className="h-6 w-24 bg-slate-800/10 rounded-full flex items-center justify-center px-4">
                      <div className="w-full h-2 bg-slate-400/40 rounded-full"></div>
                    </div>
                    <div className="h-6 w-20 bg-slate-800/10 rounded-full flex items-center justify-center px-4">
                      <div className="w-full h-2 bg-slate-400/40 rounded-full"></div>
                    </div>
                    <div className="h-6 w-24 bg-slate-800/10 rounded-full flex items-center justify-center px-4">
                      <div className="w-full h-2 bg-slate-400/40 rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative h-[400px] md:h-[600px] flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-full blur-3xl opacity-50"></div>
              <div className="relative w-full h-full flex items-center justify-center">
                {/* Dashed Circles - Restored for all sizes */}
                <motion.div
                  initial={false}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="absolute w-[280px] h-[280px] md:w-[450px] md:h-[450px] border border-dashed border-slate-200/60 rounded-full"
                ></motion.div>
                <div className="absolute w-[180px] h-[180px] md:w-[280px] md:h-[280px] border border-slate-100 rounded-full scale-110"></div>

                {/* SVG Lines - Restored and refined */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.15 }}
                    transition={{ duration: 2, delay: 1 }}
                    stroke="currentColor" strokeWidth="1.5" x1="15%" x2="50%" y1="15%" y2="50%" strokeDasharray="5 5"></motion.line>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.15 }}
                    transition={{ duration: 2, delay: 1.2 }}
                    stroke="currentColor" strokeWidth="1.5" x1="85%" x2="50%" y1="80%" y2="50%" strokeDasharray="5 5"></motion.line>
                  <motion.line
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.15 }}
                    transition={{ duration: 2, delay: 1.4 }}
                    stroke="currentColor" strokeWidth="1.5" x1="80%" x2="50%" y1="35%" y2="50%" strokeDasharray="5 5"></motion.line>
                </svg>

                {/* Nodes with conditional animation */}
                <motion.div
                  initial={false}
                  animate={isMobile ? {} : { y: [0, -15, 0] }}
                  transition={isMobile ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  id="node-1"
                  className="molecule-node top-10 left-10 md:left-20 z-20 scale-75 md:scale-100"
                >
                  <span className="material-symbols-outlined text-primary text-2xl md:text-3xl">person_add</span>
                </motion.div>

                <motion.div
                  initial={false}
                  animate={isMobile ? {} : { y: [0, 15, 0] }}
                  transition={isMobile ? {} : { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  id="node-2"
                  className="molecule-node bottom-10 md:bottom-20 right-5 md:right-10 z-20 scale-75 md:scale-100"
                >
                  <span className="material-symbols-outlined text-emerald-500 text-2xl md:text-3xl">redeem</span>
                </motion.div>

                {/* Center Node with Incenta Logo */}
                <div className="molecule-node top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-20 md:size-28 bg-white shadow-[0_0_50px_rgba(37,99,235,0.15)] !rounded-3xl z-30 border-2 border-primary/5 p-2">
                  <div className="size-full bg-navy rounded-[1.25rem] flex items-center justify-center overflow-hidden">
                    <img src="/android-chrome-192x192.png" alt="Incenta" className="size-10 md:size-14" />
                  </div>
                </div>

                <motion.div
                  initial={false}
                  animate={isMobile ? {} : { scale: [1, 1.1, 1] }}
                  transition={isMobile ? {} : { duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  id="node-3"
                  className="molecule-node top-32 md:top-40 right-10 md:right-20 scale-75 md:scale-100"
                >
                  <span className="material-symbols-outlined text-amber-500 text-xl md:text-2xl">bolt</span>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-[120px] bg-slate-50/50" id="features">
          <div className="max-w-[1400px] mx-auto px-8">
            <header className="mb-12 md:mb-20 space-y-4">
              <h2 className="text-4xl md:text-6xl font-extrabold tracking-tight">Engineered for Scale.</h2>
              <p className="text-lg md:text-xl text-slate-500 max-w-xl">Deep attribution meets seamless rewards. A multi-layered approach to referral management.</p>
            </header>
            <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-6 h-auto md:min-h-[800px]">
              <div className="md:col-span-3 bento-card rounded-bento p-8 md:p-12 bg-navy text-white overflow-hidden group">
                <div className="gradient-glow size-96 bg-primary/20 -top-20 -right-20"></div>
                <div className="relative z-10 max-w-sm">
                  <span className="inline-block px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">Real-time Attribution</span>
                  <h3 className="text-3xl md:text-4xl font-bold mb-4">Live Performance Tracking</h3>
                  <p className="text-slate-400 text-base md:text-lg leading-relaxed">Watch your viral coefficient evolve in real-time with pixel-perfect accuracy across all touchpoints.</p>
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
              <div className="md:col-span-1 bento-card rounded-bento p-10 flex flex-col justify-between group">
                <div className="size-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 shadow-sm mb-6 group-hover:bg-red-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">fingerprint</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold mb-2">Advanced Security</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Device fingerprinting, bot detection, and automated fraud prevention.</p>
                </div>
              </div>
              <div className="md:col-span-1 bento-card rounded-bento p-10 flex flex-col justify-between group">
                <div className="size-16 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 shadow-sm mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                  <span className="material-symbols-outlined text-3xl">layers</span>
                </div>
                <div>
                  <h3 className="text-xl font-extrabold mb-2">Multi-App Isolation</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Independent API keys and analytics for multiple products or staging environments.</p>
                </div>
              </div>
              <div className="md:col-span-2 bento-card rounded-bento p-8 md:p-12 flex flex-col justify-between group overflow-hidden bg-slate-50">
                <div className="gradient-glow size-96 bg-primary/5 -bottom-20 -left-20"></div>
                <div className="relative z-10">
                  <h3 className="text-2xl md:text-3xl font-extrabold mb-4">Two-Sided Rewards</h3>
                  <p className="text-slate-500 text-base md:text-lg">Incentivize both the advocate and the referred friend with custom logic for any event.</p>
                </div>
                <div className="mt-8 flex gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                    Advocate Reward
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-slate-200 text-[10px] font-bold text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    Friend Reward
                  </div>
                </div>
              </div>
              <div className="md:col-span-1 bento-card rounded-bento bg-primary text-white p-10 flex flex-col justify-center text-center">
                <span className="text-4xl font-extrabold mb-2">Scale</span>
                <p className="text-xs uppercase tracking-widest font-bold opacity-70">Infrastructure First</p>
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
        <section className="py-20 md:py-32" id="developer">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
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
              <div className="lg:col-span-5 flex flex-col justify-center p-8 md:p-12 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <span className="text-primary font-bold text-xs uppercase tracking-widest mb-6">Developer First</span>
                <h2 className="text-4xl md:text-5xl font-extrabold mb-6 md:mb-8 tracking-tight leading-tight">API-Driven Architecture.</h2>
                <p className="text-slate-500 text-base md:text-lg leading-relaxed mb-8 md:mb-10">
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
        <section className="pb-32 overflow-hidden">
          <div className="max-w-[1400px] mx-auto px-8">
            <div className="bento-card rounded-bento bg-navy p-8 md:p-16 flex flex-col lg:flex-row items-center justify-between gap-16 group relative">
              <div className="absolute inset-0 bg-grid-white opacity-10"></div>
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-widest mb-8">
                  White-Glove Support
                </div>
                <h2 className="text-4xl md:text-6xl text-white font-extrabold mb-8 tracking-tight leading-tight">
                  Your growth, <br />
                  <span className="text-primary italic font-light">fully managed.</span>
                </h2>
                <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-12">
                  Our <span className="text-white font-bold">Dedicated Account Managers</span> act as an extension of your engineering team, handling custom reward logic, API orchestrations, and strategy.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl">psychology</span>
                    </div>
                    <span className="font-bold text-sm">Strategic Mapping</span>
                  </div>
                  <div className="flex items-center gap-4 text-white/80">
                    <div className="size-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary text-xl">terminal</span>
                    </div>
                    <span className="font-bold text-sm">Custom API Logic</span>
                  </div>
                </div>
              </div>
              <div className="relative shrink-0">
                <div className="size-[300px] md:size-[450px] relative flex items-center justify-center">
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.4, 0.3] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="absolute inset-0 bg-primary rounded-full blur-[100px]"
                  ></motion.div>
                  <div className="relative z-10 bg-white/5 backdrop-blur-2xl border border-white/10 p-8 rounded-[3rem] shadow-2xl">
                    <div className="flex -space-x-4 mb-8">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="size-16 rounded-2xl border-4 border-navy bg-slate-700 shadow-2xl overflow-hidden">
                          <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800"></div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-primary/20 border border-primary/30 rounded-2xl p-4 flex items-center gap-4">
                      <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">headset_mic</span>
                      </div>
                      <div>
                        <p className="text-white font-bold text-sm">Priority Support</p>
                        <p className="text-primary text-[10px] font-bold uppercase tracking-widest">Active 24/7</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-32 bg-eggshell/50" id="pricing">
          <div className="max-w-[1400px] mx-auto px-8">
            <header className="text-center mb-16 md:mb-20">
              <h2 className="text-4xl md:text-6xl font-extrabold mb-6">Simple, Scaling Plans.</h2>
              <p className="text-lg md:text-xl text-slate-500">No hidden fees. Choose the tier that matches your growth velocity.</p>
            </header>
            <div className="flex flex-col lg:flex-row gap-8 items-center lg:items-stretch lg:justify-center">
              <div className="w-full max-w-[400px] lg:min-w-[380px] bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200/50 flex flex-col">
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
              <div className="w-full max-w-[420px] lg:min-w-[400px] bg-navy text-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl shadow-primary/20 flex flex-col relative overflow-hidden lg:scale-105 z-10">
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
              <div className="w-full max-w-[400px] lg:min-w-[380px] bg-white p-8 md:p-12 rounded-[2.5rem] border border-slate-200/50 flex flex-col">
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
            <header className="mb-16">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Technical FAQ</h2>
              <p className="text-slate-500 font-medium text-lg">Infrastructure answers for scaling teams.</p>
            </header>
            <div className="divide-y divide-slate-100 border-t border-slate-100">
              {[
                {
                  q: "How do Webhooks work?",
                  a: "We send POST requests to your registered endpoint whenever a referral event occurs. You can verify payloads using the secret HMAC-SHA256 signature provided in your app settings.",
                },
                {
                  q: "Can I use multiple API keys?",
                  a: "Yes. Our platform allows you to create independent applications with their own unique API keys and webhooks, perfect for managing staging and production environments.",
                },
                {
                  q: "Do you support custom rewards?",
                  a: "Absolutely. You can use our 'External Payout' hook to trigger internal reward mechanisms like account credits, physical gifts, or NFT-styled badges.",
                },
                {
                  q: "How does device fingerprinting work?",
                  a: "We analyze multiple browser and hardware data points to create a unique identifier, preventing fraudulent signups even when attackers use VPNs or clear their cookies.",
                }
              ].map((item, i) => (
                <details key={i} className="faq-item group">
                  <summary className="flex items-center justify-between py-8 cursor-pointer list-none">
                    <h3 className="text-xl font-bold text-navy group-hover:text-primary transition-colors">{item.q}</h3>
                    <span className="material-symbols-outlined text-slate-300 group-open:rotate-180 transition-transform">add</span>
                  </summary>
                  <div className="pb-8">
                    <p className="text-slate-500 leading-relaxed font-medium text-base">
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-40 bg-navy relative overflow-hidden">
          <div className="gradient-glow size-[800px] bg-primary/20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="max-w-[1000px] mx-auto px-6 md:px-8 text-center relative z-10">
            <h2 className="text-white text-5xl md:text-7xl lg:text-9xl mb-12 italic font-light leading-tight">
              Ready to <span className="not-italic font-extrabold">scale?</span>
            </h2>
            <div className="flex justify-center">
              <Link href="/signup" className="tactile-btn text-xl md:text-2xl !px-10 md:!px-16 !py-6 md:!py-8">
                Launch Your Program
              </Link>
            </div>
            <p className="mt-12 text-slate-500 font-bold text-xs md:text-sm uppercase tracking-[0.4em]">14-Day Free Trial • No Credit Card</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 pt-24 pb-12">
        <div className="max-w-[1400px] mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-24">
            <div className="col-span-2 space-y-8">
              <div className="flex items-center gap-3">
                <img src="/logos/logo.png" alt="Incenta Logo" className="h-16 w-auto" />
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed font-medium">Nepal's next-generation referral architecture built for high-scale SaaS and subscription engines.</p>
              <div className="pt-4 flex items-center gap-3">
                <span className="size-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-bold font-mono text-navy uppercase tracking-widest">Latest: v2.1.0 (Feb 2024)</span>
                <Link href="/changelog" className="text-[10px] font-bold text-primary hover:underline">View Timeline →</Link>
              </div>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">Governance</h4>
              <ul className="space-y-4 text-sm font-bold text-navy">
                <li><Link href="/security" className="hover:text-primary transition-colors">Security Architecture</Link></li>
                <li><Link href="/compliance" className="hover:text-primary transition-colors">Compliance Hub</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">Engineering</h4>
              <ul className="space-y-4 text-sm font-bold text-navy">
                <li><Link href="/docs" className="hover:text-primary transition-colors">Documentation</Link></li>
                <li><Link href="/blogs" className="hover:text-primary transition-colors">Resource Hub</Link></li>
                <li><Link href="/changelog" className="hover:text-primary transition-colors">Change Log</Link></li>
                <li><Link href="/status" className="hover:text-primary transition-colors">System Status</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">Growth</h4>
              <ul className="space-y-4 text-sm font-bold text-navy">
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Support Protocol</Link></li>
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-[10px] font-extrabold uppercase tracking-[0.3em] text-slate-400">Infrastructure</h4>
              <ul className="space-y-4 text-sm font-bold text-navy">
                <li><Link href="/login" className="hover:text-primary transition-colors">System Ingress</Link></li>
                <li><Link href="/signup" className="hover:text-primary transition-colors">New Deployment</Link></li>
              </ul>
            </div>
          </div>
          <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-xs font-bold text-slate-400">© 2024 Incenta. Engineered for technical excellence.</p>
            <div className="flex gap-8">
              <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Terms of Service</Link>
              <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Privacy Policy</Link>
              <Link href="/cookie-policy" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
