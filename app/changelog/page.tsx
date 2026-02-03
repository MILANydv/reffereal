'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ChangelogPage() {
    const changes = [
        {
            version: 'v2.1.0',
            date: 'Feb 2024',
            title: 'Advanced Anti-Fraud Engine',
            description: 'Localized device fingerprinting and bot detection protocols for the South Asian market.',
            type: 'major',
            points: [
                'Implemented hardware-level metadata analysis.',
                'Added multi-currency support for NRP & INR.',
                'Enhanced encryption to TLS 1.3 for all ingress points.'
            ]
        },
        {
            version: 'v2.0.4',
            date: 'Jan 2024',
            title: 'Developer Experience Patch',
            description: 'Streamlined documentation and added SDK supports for Go and Ruby.',
            type: 'minor',
            points: [
                'Added interactive API playground.',
                'Fixed latency issues in Webhook dispatchers.',
                'Standardized error payload schemas.'
            ]
        },
        {
            version: 'v2.0.0',
            date: 'Dec 2023',
            title: 'Infrastructure Overhaul',
            description: 'Ground-up rebuild of the referral engine using a multi-tenant isolation architecture.',
            type: 'major',
            points: [
                'Migrated to isolated database clusters per partner.',
                'Introduced the Partner Ingress Dashboard (v2).',
                'API limits increased to 1M events/month for Pro tier.'
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary/10">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
                <div className="max-w-[1000px] mx-auto px-6 md:px-8 w-full flex items-center justify-between">
                    <Link href="/">
                        <img src="/logos/logo.png" alt="Incenta" className="h-10 md:h-12" />
                    </Link>
                    <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-primary transition-colors">
                        Back to Home
                    </Link>
                </div>
            </nav>

            <main className="pt-40 pb-32 max-w-[800px] mx-auto px-6">
                <div className="space-y-20">

                    {/* Header */}
                    <div className="space-y-6">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary">System Evolution</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-navy tracking-tight leading-tight">
                            Change Log <br />
                            <span className="text-primary italic font-light">Protocol.</span>
                        </h1>
                        <p className="text-slate-500 font-medium text-lg leading-relaxed">
                            Tracking every modification to the Incenta core engine. We ship improvements to the infrastructure weekly.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="relative pt-10">
                        {/* Vertical Line */}
                        <div className="absolute left-[7px] top-10 bottom-0 w-px bg-slate-100 hidden md:block"></div>

                        <div className="space-y-24">
                            {changes.map((change, i) => (
                                <div key={i} className="relative pl-0 md:pl-12 group">
                                    {/* Dot */}
                                    <div className={`absolute left-0 top-3 size-4 rounded-full border-4 border-white z-10 hidden md:block transition-colors ${change.type === 'major' ? 'bg-primary' : 'bg-slate-300'
                                        }`}></div>

                                    <div className="space-y-8">
                                        <div className="flex flex-col md:flex-row md:items-baseline gap-4">
                                            <span className="text-sm font-bold font-mono text-primary bg-primary/5 px-3 py-1 rounded-lg">{change.version}</span>
                                            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">{change.date}</span>
                                        </div>

                                        <div className="space-y-4">
                                            <h3 className="text-3xl font-extrabold text-navy tracking-tight">{change.title}</h3>
                                            <p className="text-slate-500 font-medium leading-relaxed">{change.description}</p>
                                        </div>

                                        <ul className="space-y-4 border-l-2 border-slate-50 pl-8 md:pl-0 md:border-none">
                                            {change.points.map((point, index) => (
                                                <li key={index} className="flex gap-4 text-sm font-medium text-slate-600">
                                                    <span className="text-primary font-bold opacity-30 select-none">//</span>
                                                    {point}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Note */}
                    <div className="pt-20 border-t border-slate-100 text-center">
                        <p className="text-xs font-bold font-mono text-slate-300 uppercase tracking-widest leading-loose">
                            End of established log. <br />
                            Follow <Link href="https://twitter.com/incenta" className="text-navy hover:text-primary transition-colors underline decoration-slate-200">@incenta_io</Link> for real-time deployment notifications.
                        </p>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-20 bg-slate-50/30">
                <div className="max-w-[800px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2024 Incenta Evolution Log.</p>
                    <div className="flex gap-8">
                        <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-widest transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-widest transition-colors">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
