import Link from 'next/link';

export default function PrivacyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary/10">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-[1400px] mx-auto px-6 md:px-8 h-20 flex items-center justify-between">
          <Link href="/" className="shrink-0">
            <img src="/logos/logo.png" alt="Incenta Logo" className="h-10 md:h-12 w-auto" />
          </Link>
          <Link href="/login" className="text-xs font-bold uppercase tracking-widest text-navy hover:text-primary transition-colors">
            Back to Login
          </Link>
        </div>
      </nav>

      {/* Hero Header */}
      <header className="pt-40 pb-20 bg-slate-50/50 border-b border-slate-100">
        <div className="max-w-[800px] mx-auto px-6">
          <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary mb-4 block">Data Protection</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-navy tracking-tight mb-6">Privacy Policy</h1>
          <p className="text-slate-500 font-medium tracking-tight">How we handle your data. Updated on {lastUpdated}</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-6 py-20">
        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">01</span>
              Introduction
            </h2>
            <div className="text-slate-600 leading-relaxed font-medium">
              <p>
                At Incenta, your trust is our most valuable asset. This policy outlines how we collect, process, and protect data through our infrastructure. We focus on data minimization—collecting only what is necessary to prevent fraud and track conversions.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">02</span>
              Core Data Collection
            </h2>
            <div className="text-slate-600 leading-relaxed font-medium space-y-6">
              <div>
                <h3 className="text-sm font-bold text-navy uppercase tracking-widest mb-2">Account Metadata</h3>
                <p>Basic identifiers including corporate email, company name, and encrypted authentication credentials.</p>
              </div>
              <div className="border-l-2 border-slate-100 pl-8 space-y-4">
                <h3 className="text-sm font-bold text-navy uppercase tracking-widest">Network Analytics</h3>
                <p>Technical logs including IP addresses, user-agent strings, and hardware metadata used exclusively for device fingerprinting and bot detection.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">03</span>
              How We Use Data
            </h2>
            <ul className="space-y-6 text-slate-600 font-medium">
              <li className="flex gap-4 italic border-b border-slate-50 pb-4">
                <span className="text-primary font-bold">A.</span>
                To provision secure API endpoints and manage multi-tenant environments.
              </li>
              <li className="flex gap-4 italic border-b border-slate-50 pb-4">
                <span className="text-primary font-bold">B.</span>
                To prevent sybil attacks and fraudulent reward exploitation via our security engine.
              </li>
              <li className="flex gap-4 italic border-b border-slate-50 pb-4">
                <span className="text-primary font-bold">C.</span>
                To provide performance analytics for your referral ecosystem.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">04</span>
              Infrastructure Security
            </h2>
            <div className="text-slate-600 leading-relaxed font-medium">
              <p>
                We use industry-standard encryption (AES-256) at rest and TLS 1.3 in transit. Data is isolated using hardware-level virtualization to ensure no cross-tenant information leakage occurs.
              </p>
            </div>
          </section>

          <section className="pt-10 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-navy mb-6">Privacy Requests</h2>
            <p className="text-slate-500 font-medium mb-8">For data deletion requests or portability enquiries, contact our Privacy Officer.</p>
            <div className="space-y-2">
              <p className="text-navy font-bold">privacy@incenta.com</p>
              <p className="text-slate-400 text-sm">Dedicated Response: privacy-team-lead</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-bold text-slate-400">© 2024 Incenta. Privacy by design.</p>
          <div className="flex gap-8">
            <Link href="/terms" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Terms of Service</Link>
            <Link href="/" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
