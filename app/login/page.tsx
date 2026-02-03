'use client';

import { signIn, getSession } from 'next-auth/react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [emailNotVerified, setEmailNotVerified] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (searchParams?.get('signup') === 'success') {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 5000);
    }

    const verified = searchParams?.get('verified');
    const verificationError = searchParams?.get('error');

    if (verified === 'success') {
      setShowSuccess(true);
      setError('Email verified! You can now access your engine.');
    } else if (verificationError) {
      setError('Email verification failed. Please try again.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setEmailNotVerified(false);
    setLoading(true);

    try {
      const checkResponse = await fetch('/api/auth/check-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (checkResponse.ok) {
        const checkData = await checkResponse.json();
        if (checkData.emailNotVerified) {
          setEmailNotVerified(true);
          setError('Verify your email address to continue access.');
          setLoading(false);
          return;
        }
      }

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid access credentials. Check your details.');
      } else {
        // Fetch session to check role
        const session = await getSession();
        if (session?.user?.role === 'SUPER_ADMIN') {
          router.push('/admin/v2');
        } else {
          router.push('/dashboard/v2');
        }
        router.refresh();
      }
    } catch {
      setError('Operational error. Please try again later.');
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
              Access Your Referral <br />
              <span className="text-primary italic font-light">Infrastructure.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
              Secure gateway for managing viral growth, anti-fraud engines, and multi-tenant SDKs.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500 mb-4">Core status</p>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold font-mono text-emerald-500/80">API NODES: OPERATIONAL</span>
          </div>
        </div>
      </div>

      {/* Right Column - Clean Login */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-12 relative bg-slate-50 md:bg-white">
        <div className="w-full max-w-[440px] space-y-12">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link href="/">
              <img src="/logos/logo.png" alt="Incenta" className="h-16" />
            </Link>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">System Ingress</h2>
            <p className="text-slate-500 font-medium">
              Enter your credentials to manage your platform ecosystem.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100 flex gap-4"
              >
                <span className="material-symbols-outlined text-red-500">report</span>
                <div>
                  <p className="text-sm font-bold text-red-800 tracking-tight">{error}</p>
                  {emailNotVerified && (
                    <button
                      type="button"
                      onClick={async () => {
                        setResendingVerification(true);
                        const res = await fetch('/api/auth/resend-verification', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email }),
                        });
                        if (res.ok) setError('Email dispatched. Check inbox.');
                        setResendingVerification(false);
                      }}
                      disabled={resendingVerification}
                      className="text-[10px] font-extrabold uppercase tracking-widest text-primary mt-2 hover:underline"
                    >
                      {resendingVerification ? 'Requesting...' : 'Resend link'}
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 flex justify-between">
                  Email Identity
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-300"
                  placeholder="admin@platform.io"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400 flex justify-between">
                  Access Key
                  <Link href="/terms" className="hover:text-primary transition-colors lowercase font-bold tracking-normal italic">help?</Link>
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-300 pr-14"
                    placeholder="••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="tactile-btn w-full !rounded-2xl !py-5 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : (
                  <>
                    Initialize Access
                    <span className="material-symbols-outlined text-sm">login</span>
                  </>
                )}
              </button>

              <div className="text-center space-y-4">
                <p className="text-sm text-slate-400 font-medium">
                  New infrastructure partner?{' '}
                  <Link href="/signup" className="text-navy font-bold hover:text-primary transition-colors underline decoration-slate-200 underline-offset-4">
                    Create Deployment
                  </Link>
                </p>
                <div className="pt-10 flex justify-center gap-6">
                  <Link href="/terms" className="text-[10px] font-bold text-slate-300 hover:text-navy uppercase tracking-widest">Compliance</Link>
                  <Link href="/privacy" className="text-[10px] font-bold text-slate-300 hover:text-navy uppercase tracking-widest">Privacy</Link>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <LoginForm />
    </Suspense>
  );
}
