'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function StatusPage() {
    const systems = [
        { name: 'API Protocol Gateway', status: 'operational', uptime: '100%' },
        { name: 'Corporate Ingress (Dashboard)', status: 'operational', uptime: '99.98%' },
        { name: 'Internal Messaging (Email)', status: 'operational', uptime: '100%' },
        { name: 'Security & Bot Detection', status: 'operational', uptime: '100%' },
        { name: 'Encrypted Database Clusters', status: 'operational', uptime: '100%' },
        { name: 'Webhook Dispatch Engine', status: 'operational', uptime: '99.95%' },
    ];

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary/10">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100 h-20 flex items-center">
                <div className="max-w-[1000px] mx-auto px-6 md:px-8 w-full flex items-center justify-between">
                    <Link href="/">
                        <img src="/logos/logo.png" alt="Incenta" className="h-10 md:h-12" />
                    </Link>
                    <div className="flex items-center gap-3">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Global Status: Normal</span>
                    </div>
                </div>
            </nav>

            <main className="pt-40 pb-32 max-w-[1000px] mx-auto px-6">
                <div className="space-y-20">

                    {/* Header */}
                    <div className="space-y-6">
                        <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary">System Telemetry</span>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-navy tracking-tight leading-tight">
                            Platform Integrity <br />
                            <span className="text-primary italic font-light">Real-time.</span>
                        </h1>
                    </div>

                    {/* System List */}
                    <div className="space-y-4">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-8 pb-4 border-b border-slate-50">Operational Infrastructure Nodes</p>
                        {systems.map((system, i) => (
                            <div key={i} className="flex justify-between items-center py-6 border-b border-slate-50 group hover:bg-slate-50/50 transition-colors px-4 rounded-xl">
                                <div>
                                    <h3 className="font-bold text-navy group-hover:text-primary transition-colors">{system.name}</h3>
                                    <p className="text-xs font-bold font-mono text-slate-400">UPTIME: {system.uptime}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="size-1.5 rounded-full bg-emerald-500"></div>
                                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-600 font-mono">{system.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Average Protocol Latency</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-navy tracking-tighter text-primary">84</span>
                                <span className="text-xl font-bold text-slate-400">ms</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 italic">Historical average across all edge nodes.</p>
                        </div>
                        <div className="p-8 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                            <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">30-Day Reliability</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-extrabold text-navy tracking-tighter">99.99</span>
                                <span className="text-xl font-bold text-slate-400">%</span>
                            </div>
                            <p className="text-[10px] font-bold text-slate-400 italic">Combined uptime of all core services.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="border-t border-slate-100 py-20">
                <div className="max-w-[1000px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2024 Incenta Metrics. All systems nominal.</p>
                    <div className="flex gap-8">
                        <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-widest transition-colors">Terms</Link>
                        <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-widest transition-colors">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
