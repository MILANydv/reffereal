import Link from 'next/link';

export default function TermsPage() {
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
          <span className="text-[10px] font-extrabold uppercase tracking-[0.4em] text-primary mb-4 block">Legal Framework</span>
          <h1 className="text-4xl md:text-6xl font-extrabold text-navy tracking-tight mb-6">Terms of Service</h1>
          <p className="text-slate-500 font-medium tracking-tight">Last updated on {lastUpdated}</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[800px] mx-auto px-6 py-20">
        <div className="space-y-16">
          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">01</span>
              Agreement to Terms
            </h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>
                By accessing or using Incenta ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you disagree with any part of these terms, you may not access the Service. These Terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">02</span>
              Description of Service
            </h2>
            <div className="text-slate-600 leading-relaxed space-y-4 font-medium">
              <p>
                Incenta provides a infrastructure-first referral management platform. Our services include API access, campaign management, analytics, device fingerprinting for fraud detection, and multi-tenant application isolation.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">03</span>
              Account Registration
            </h2>
            <div className="text-slate-600 leading-relaxed font-medium">
              <p className="mb-6">To maintain the integrity of the network, users must:</p>
              <ul className="space-y-4 border-l-2 border-slate-100 pl-8">
                <li>Provide accurate, verifiable identification data.</li>
                <li>Maintain the security of API keys and authentication tokens.</li>
                <li>Accept full responsibility for all activity occurring under the account environment.</li>
                <li>Notify Incenta immediately of any security compromise or unauthorized infrastructure access.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">04</span>
              Acceptable Use Policy
            </h2>
            <div className="text-slate-600 leading-relaxed font-medium">
              <p className="mb-6">Our infrastructure may not be used for:</p>
              <ul className="space-y-4 border-l-2 border-slate-100 pl-8">
                <li>The intentional transmission of malicious code or automated scrapers.</li>
                <li>Engineering deceptive referral loops or duplicate identity exploitation.</li>
                <li>Reverse engineering the device fingerprinting or bot detection algorithms.</li>
                <li>Any activity that disrupts the multi-tenant isolation of the platform.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-navy mb-6 flex items-center gap-3">
              <span className="text-xs font-mono text-slate-300">05</span>
              Payment & Infrastructure Billing
            </h2>
            <div className="text-slate-600 leading-relaxed space-y-6 font-medium">
              <p>
                Fees are billed in advance based on your selected plan. Overage charges for advocate volume or API calls will be calculated at the end of each billing cycle.
              </p>
              <p className="text-sm p-4 bg-slate-50 rounded-xl border border-slate-100 italic">
                Note: Subscription fees are non-refundable except where required by law.
              </p>
            </div>
          </section>

          <section className="pt-10 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-navy mb-6">Contact Legal</h2>
            <p className="text-slate-500 font-medium mb-8">Questions regarding our legal framework should be directed to our compliance team.</p>
            <div className="space-y-2">
              <p className="text-navy font-bold">legal@incenta.com</p>
              <p className="text-slate-400 text-sm">Response time: Approx. 48 hours</p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-20">
        <div className="max-w-[800px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-xs font-bold text-slate-400">© 2024 Incenta. Built for technical excellence.</p>
          <div className="flex gap-8">
            <Link href="/privacy" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Privacy Policy</Link>
            <Link href="/" className="text-xs font-bold text-slate-400 hover:text-navy transition-colors">Home</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
