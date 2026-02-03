import Link from 'next/link';

export default function SecurityPage() {
    return (
        <div className="min-h-screen bg-white font-sans selection:bg-primary/10">
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

            <header className="pt-40 pb-20 bg-slate-50/50 border-b border-slate-100 font-sans">
                <div className="max-w-[800px] mx-auto px-6">
                    <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary mb-4 block">Infrastructure Security</span>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-navy tracking-tight mb-6">Security Architecture</h1>
                    <p className="text-slate-500 font-medium tracking-tight">Enterprise-grade defense for referral velocity.</p>
                </div>
            </header>

            <main className="max-w-[800px] mx-auto px-6 py-20 font-sans">
                <div className="space-y-16">
                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-300">01</span>
                            Data Encryption
                        </h2>
                        <div className="text-slate-600 leading-relaxed font-medium">
                            <p>
                                All data transmitted to and from Incenta is encrypted using industry-standard TLS 1.3 encryption. At rest, sensitive identities and payout data are protected using AES-256 encryption.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-300">02</span>
                            Fraud Protection Engine
                        </h2>
                        <div className="text-slate-600 leading-relaxed font-medium">
                            <p className="mb-6">Our security fabric uses real-time heuristics to block suspicious activity:</p>
                            <ul className="space-y-4 border-l-2 border-slate-100 pl-8">
                                <li><span className="text-navy font-bold">Sybil Defense:</span> Multi-layered device fingerprinting to prevent duplicate identities.</li>
                                <li><span className="text-navy font-bold">Velocity Tracking:</span> Automated blocking of anomalous referral surges.</li>
                                <li><span className="text-navy font-bold">Bot Detection:</span> Hardware-level metadata analysis to filter automated traffic.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
                            <span className="text-xs font-mono text-slate-300">03</span>
                            Compliance
                        </h2>
                        <div className="text-slate-600 leading-relaxed font-medium">
                            <p>
                                We follow SOC2 Type II guidelines and maintain strict internal access controls. No PII is exposed to thirdnd-party analytics without explicit corporate environment consent.
                            </p>
                        </div>
                    </section>

                    <section className="pt-10 border-t border-slate-100">
                        <h2 className="text-2xl font-bold text-navy mb-6">Security Disclosure</h2>
                        <p className="text-slate-500 font-medium mb-8">Report vulnerabilities to our security operations center.</p>
                        <div className="space-y-2">
                            <p className="text-navy font-bold">security@incenta.io</p>
                            <p className="text-slate-400 text-sm">Escalation PGP: 0x8A2C...</p>
                        </div>
                    </section>
                </div>
            </main>

            <footer className="border-t border-slate-100 py-20">
                <div className="max-w-[800px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sans">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">© 2024 Incenta. Built for security.</p>
                    <div className="flex gap-8">
                        <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-widest">Terms</Link>
                        <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-navy uppercase tracking-widest">Privacy</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
