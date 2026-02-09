'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const tokenParam = searchParams?.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
    } else {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/login?reset=success');
        }, 2000);
      } else {
        setError(data.error || 'Failed to reset password');
      }
    } catch (error) {
      setError('Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-white font-sans flex flex-col md:flex-row overflow-hidden">
        <div className="hidden lg:flex flex-col justify-between p-16 w-[40%] bg-navy text-white relative">
          <div className="absolute inset-0 bg-dot-pattern opacity-10"></div>
          <div className="relative z-10">
            <Link href="/" className="group inline-block">
              <img src="/logos/logo.png" alt="Incenta" className="h-14 brightness-0 invert group-hover:brightness-100 group-hover:invert-0 transition-all duration-300 mb-20" />
            </Link>
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-12 relative bg-slate-50 md:bg-white">
          <div className="w-full max-w-[440px] space-y-12">
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                <p className="text-sm font-bold text-green-800 tracking-tight">
                  Password reset successfully!
                </p>
                <p className="text-xs text-green-600 mt-2">
                  Redirecting to login page...
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

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
              Create New <br />
              <span className="text-primary italic font-light">Access Key.</span>
            </h1>
            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
              Enter your new password below. Make sure it's at least 8 characters long.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.5em] text-slate-500 mb-4">Security status</p>
          <div className="flex items-center gap-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-bold font-mono text-emerald-500/80">SECURE CHANNEL: ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 lg:px-12 relative bg-slate-50 md:bg-white">
        <div className="w-full max-w-[440px] space-y-12">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-10">
            <Link href="/">
              <img src="/logos/logo.png" alt="Incenta" className="h-16" />
            </Link>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl font-extrabold text-navy tracking-tight">Reset Password</h2>
            <p className="text-slate-500 font-medium">
              Enter your new password below. Make sure it's secure and at least 8 characters long.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 rounded-xl bg-red-50 border border-red-100"
              >
                <p className="text-sm font-bold text-red-800 tracking-tight">{error}</p>
              </motion.div>
            )}

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  New Access Key
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-300 pr-14"
                    placeholder="••••••••••••"
                    minLength={8}
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
                <p className="text-xs text-slate-400">Must be at least 8 characters</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-400">
                  Confirm Access Key
                </label>
                <div className="relative group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-5 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white transition-all outline-none font-medium placeholder:text-slate-300 pr-14"
                    placeholder="••••••••••••"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 transition-all flex items-center justify-center"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showConfirmPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6 pt-4">
              <button
                type="submit"
                disabled={loading || !token}
                className="tactile-btn w-full !rounded-2xl !py-5 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? 'Resetting...' : (
                  <>
                    Reset Password
                    <span className="material-symbols-outlined text-sm">lock_reset</span>
                  </>
                )}
              </button>

              <div className="text-center space-y-4">
                <Link
                  href="/login"
                  className="text-sm text-slate-400 font-medium hover:text-navy transition-colors"
                >
                  ← Back to Login
                </Link>
                <p className="text-xs text-slate-400">
                  Need a new reset link?{' '}
                  <Link href="/forgot-password" className="text-navy font-bold hover:text-primary transition-colors">
                    Request one
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-white"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
