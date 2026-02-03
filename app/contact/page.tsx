'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <img src="/logos/logo.png" alt="Incenta Logo" className="h-10 md:h-12 w-auto" />
          </Link>
          <Link href="/" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-40 pb-20">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20">

          {/* Left Column: Context */}
          <div className="space-y-12">
            <div className="space-y-6">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary block">Support Ingress</span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-navy tracking-tight leading-[0.9]">
                Let's discuss <br />
                <span className="text-primary italic font-light">your scale.</span>
              </h1>
              <p className="text-slate-500 text-lg md:text-xl font-medium max-w-md leading-relaxed">
                Whether you're mapping custom reward logic or need high-volume API support, our engineering team is ready to assist.
              </p>
            </div>

            <div className="space-y-8 pt-10 border-t border-slate-100">
              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Direct Protocol</p>
                <p className="text-xl font-bold text-navy hover:text-primary transition-colors cursor-pointer underline decoration-slate-200 underline-offset-8">hello@incenta.com</p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Technical Briefings</p>
                <p className="text-sm font-bold text-navy">Kathmandu, Nepal • Remote First</p>
              </div>

              <div className="flex items-center gap-4 pt-4">
                <div className="size-3 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest">Support Core: Operational</span>
              </div>
            </div>
          </div>

          {/* Right Column: Clean Form */}
          <div className="relative">
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="h-full flex flex-col justify-center items-center text-center space-y-6 py-20 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200"
                >
                  <div className="size-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl font-bold">check</span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-navy">Signal Received</h3>
                    <p className="text-slate-500 font-medium">Our team will initialize contact within 24 hours.</p>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-8"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Identity</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-0 py-4 bg-transparent border-b-2 border-slate-100 focus:border-primary transition-all outline-none font-bold text-navy placeholder:text-slate-200 placeholder:font-medium text-lg"
                        placeholder="Your Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Endpoint</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-0 py-4 bg-transparent border-b-2 border-slate-100 focus:border-primary transition-all outline-none font-bold text-navy placeholder:text-slate-200 placeholder:font-medium text-lg"
                        placeholder="email@protocol.io"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Environment / Company</label>
                    <input
                      type="text"
                      value={formData.company}
                      onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                      className="w-full px-0 py-4 bg-transparent border-b-2 border-slate-100 focus:border-primary transition-all outline-none font-bold text-navy placeholder:text-slate-200 placeholder:font-medium text-lg"
                      placeholder="SaaS Platform"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Message Payload</label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-0 py-4 bg-transparent border-b-2 border-slate-100 focus:border-primary transition-all outline-none font-bold text-navy placeholder:text-slate-200 placeholder:font-medium text-lg resize-none"
                      placeholder="Tell us about your referral requirements..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="tactile-btn w-full !py-6 !rounded-2xl flex items-center justify-center gap-3 group"
                  >
                    Dispatch Message
                    <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">send</span>
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-bold text-slate-400">© 2024 Incenta. Technical support for technical teams.</p>
          <div className="flex gap-8">
            <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Terms</Link>
            <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
