'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter SDK',
      price: { monthly: 29, yearly: 290 },
      description: 'Infrastructure for emerging SaaS teams and prototypes.',
      features: [
        '10,000 Verified Events/mo',
        '3 Independent Environments',
        'Standard Bot Detection',
        'Native JS / Python SDKs',
        '24h Response SLA'
      ],
      cta: 'Initialize Deployment',
      popular: false
    },
    {
      name: 'Professional',
      price: { monthly: 99, yearly: 990 },
      description: 'Production-grade scale with advanced fraud prevention.',
      features: [
        '100,000 Verified Events/mo',
        'Unlimited Multi-tenancy',
        'Device Fingerprinting',
        'Dedicated Account Hub',
        'Custom Webhook Headers',
        'Advanced Payout Logic'
      ],
      cta: 'Start Scaling',
      popular: true
    },
    {
      name: 'Enterprise',
      price: { monthly: 'Custom', yearly: 'Custom' },
      description: 'Tailored architecture for high-velocity global platforms.',
      features: [
        'Unlimited Throughput',
        'On-premise Isolation',
        'SLA Guaranteed Uptime',
        'Custom Protocol Support',
        'Private Security Audits',
        '24/7 Priority Ingress'
      ],
      cta: 'Contact Architecture',
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/10 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 w-full flex items-center justify-between">
          <Link href="/">
            <img src="/logos/logo.png" alt="Incenta" className="h-10 md:h-12" />
          </Link>
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-primary transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <main className="pt-40 pb-32">
        <div className="max-w-[1200px] mx-auto px-6 space-y-20">

          {/* Header */}
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary">Billing Framework</span>
              <h1 className="text-5xl md:text-7xl font-extrabold text-navy tracking-tight leading-tight">
                Simple. Scalable. <br />
                <span className="text-primary italic font-light">Transparent.</span>
              </h1>
            </div>

            {/* Toggle */}
            <div className="inline-flex items-center p-1 bg-slate-50 rounded-2xl border border-slate-100">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-8 py-3 rounded-xl text-xs font-bold transition-all ${billingPeriod === 'monthly' ? 'bg-navy text-white shadow-xl' : 'text-slate-400 hover:text-navy'
                  }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingPeriod('yearly')}
                className={`px-8 py-3 rounded-xl text-xs font-bold transition-all relative ${billingPeriod === 'yearly' ? 'bg-navy text-white shadow-xl' : 'text-slate-400 hover:text-navy'
                  }`}
              >
                Yearly
                <span className="absolute -top-1 -right-4 bg-emerald-500 text-[8px] text-white px-2 py-0.5 rounded-full font-extrabold animate-bounce">
                  -17%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`p-10 rounded-[2.5rem] border transition-all flex flex-col justify-between ${plan.popular
                    ? 'border-navy bg-navy text-white shadow-2xl scale-105 z-10'
                    : 'border-slate-100 bg-white hover:border-slate-200'
                  }`}
              >
                <div className="space-y-8">
                  <div className="space-y-2">
                    <h3 className={`text-2xl font-extrabold ${plan.popular ? 'text-white' : 'text-navy'}`}>{plan.name}</h3>
                    <p className={`text-sm font-medium ${plan.popular ? 'text-slate-400' : 'text-slate-500'}`}>{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className={`text-5xl font-extrabold tracking-tight ${plan.popular ? 'text-white' : 'text-navy'}`}>
                      {typeof plan.price[billingPeriod] === 'number' ? `$${plan.price[billingPeriod]}` : plan.price[billingPeriod]}
                    </span>
                    {typeof plan.price[billingPeriod] === 'number' && (
                      <span className={`text-sm font-bold ${plan.popular ? 'text-slate-500' : 'text-slate-400'}`}>/ {billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                    )}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-slate-100/10">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className={`material-symbols-outlined text-[10px] size-4 rounded-full flex items-center justify-center font-bold ${plan.popular ? 'bg-primary text-navy' : 'bg-slate-50 text-slate-400'
                          }`}>check</span>
                        <span className={`text-sm font-medium ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-12">
                  <Link
                    href={plan.name === 'Enterprise' ? '/contact' : '/signup'}
                    className={`tactile-btn w-full !rounded-2xl !py-4 flex items-center justify-center gap-3 ${plan.popular ? '!bg-white !text-navy' : ''
                      }`}
                  >
                    {plan.cta}
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Infrastructure Note */}
          <div className="text-center pt-20">
            <p className="text-slate-400 text-sm font-medium italic">
              All infrastructures involve a 14-day zero-cost initialization period. <br />
              Need custom volume? <Link href="/contact" className="text-navy font-bold underline decoration-slate-200">Request Technical Briefing</Link>
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 py-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2024 Incenta Core Infrastructure.</p>
          <div className="flex gap-8">
            <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-widest">Terms</Link>
            <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-widest">Privacy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
