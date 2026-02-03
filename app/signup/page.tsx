'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Infrastructure initialization failed.');
      } else {
        router.push('/login?signup=success');
      }
    } catch {
      setError('Operational error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row overflow-hidden">
      {/* Left Column - Minimal Branding info */}
      <div className="hidden lg:flex flex-col justify-between p-16 w-[40%] bg-navy text-white relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
        <div className="relative z-10">
          <Link href="/" className="group inline-block">
            <img src="/logos/logo.png" alt="Incenta" className="h-14 brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300 mb-20" />
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
              Launch Your <br />
              <span className="text-primary italic font-light">Growth Engine.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
              Join the ecosystem of high-scale SaaS teams using Incenta to automate referral velocity.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-4 text-slate-300 text-sm font-medium">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              API-First Architecture
            </div>
            <div className="flex items-center gap-4 text-slate-300 text-sm font-medium">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              Device Fingerprinting
            </div>
            <div className="flex items-center gap-4 text-slate-300 text-sm font-medium">
              <span className="material-symbols-outlined text-primary">check_circle</span>
              Multi-Tenant Isolation
            </div>
          </div>
          <div className="pt-8 border-t border-white/5">
            <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500 mb-4">Infrastructure</p>
            <div className="flex items-center gap-3">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-xs font-bold font-mono text-primary">READY FOR DEPLOYMENT</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Clean Signup */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-12 relative bg-slate-50 md:bg-white overflow-y-auto py-20">
        <div className="w-full max-w-[440px] space-y-12">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link href="/">
              <img src="/logos/logo.png" alt="Incenta" className="h-16" />
            </Link>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">Partner Registration</h2>
            <p className="text-slate-500 font-medium">
              Initialize your corporate environment and SDK access.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-4"
              >
                <span className="material-symbols-outlined text-red-500">report</span>
                <p className="text-sm font-bold text-red-800 tracking-tight">{error}</p>
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-medium text-navy placeholder:text-slate-300"
                    placeholder="Engineering Lead"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Corporate Email</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-medium text-navy placeholder:text-slate-300"
                    placeholder="name@company.io"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Secure Password</label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-medium text-navy placeholder:text-slate-300"
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">Company / Product Name</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-medium text-navy placeholder:text-slate-300"
                    placeholder="SaaS Platform Inc."
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="tactile-btn w-full !rounded-2xl !py-5 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Initializing...' : (
                  <>
                    Initialize Environment
                    <span className="material-symbols-outlined text-sm">rocket_launch</span>
                  </>
                )}
              </button>

              <div className="text-center space-y-6">
                <p className="text-sm text-slate-400 font-medium">
                  Already have access?{' '}
                  <Link href="/login" className="text-navy font-bold hover:text-primary transition-colors underline decoration-slate-200 underline-offset-4">
                    Sign in to Ingress
                  </Link>
                </p>

                <p className="text-[10px] text-slate-400 leading-relaxed px-8">
                  By initializing, you agree to our{' '}
                  <Link href="/terms" className="text-navy font-bold hover:underline">Terms</Link>
                  {' '}and{' '}
                  <Link href="/privacy" className="text-navy font-bold hover:underline">Privacy Framework</Link>.
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
