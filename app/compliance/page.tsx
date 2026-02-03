import Link from 'next/link';

export default function CompliancePage() {
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <Link href="/" className="flex items-center space-x-3">
                        <img src="/logos/logo.png" alt="Incenta Logo" className="h-12 w-auto" />
                    </Link>
                </div>
            </header>

            {/* Content */}
            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="prose prose-lg max-w-none">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Compliance & Data Protection</h1>
                    <p className="text-gray-600 mb-8">Incenta is committed to global data privacy standards. We provide the tools you need to stay compliant with regional and international regulations.</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. GDPR Compliance</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We are fully committed to GDPR compliance. For our customers in the EEA and UK, we provide:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>Data Processing Agreements (DPA)</li>
                            <li>Right to be forgotten tools</li>
                            <li>Data portability features</li>
                            <li>Strict data sub-processor management</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. CCPA / CPRA</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We support our customers in meeting their obligations under the California Consumer Privacy Act (CCPA) and the California Privacy Rights Act (CPRA).
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Data Privacy in Nepal</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            As a leader in Nepal's SaaS ecosystem, we stay ahead of local data protection guidelines to ensure that our platform remains the most trusted for regional enterprises.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Compliance</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            For compliance-related inquiries, please contact our legal team:
                        </p>
                        <div className="bg-gray-50 rounded-lg p-6 mt-4">
                            <p className="text-gray-700 mb-2"><strong>Email:</strong> legal@incenta.com</p>
                        </div>
                    </section>
                </div>

                {/* Footer */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                        <p className="text-sm text-gray-600">
                            © {new Date().getFullYear()} Incenta. All rights reserved.
                        </p>
                        <div className="flex space-x-6">
                            <Link href="/privacy" className="text-sm text-blue-600 hover:text-blue-700">
                                Privacy Policy
                            </Link>
                            <Link href="/" className="text-sm text-blue-600 hover:text-blue-700">
                                Home
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
