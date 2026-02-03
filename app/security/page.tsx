import Link from 'next/link';

export default function SecurityPage() {
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Security Architecture</h1>
                    <p className="text-gray-600 mb-8">Enterprise-grade security is at the core of Incenta. We protect your data and your brand with multi-layered defense mechanisms.</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Data Encryption</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            All data transmitted to and from Incenta is encrypted using industry-standard TLS 1.3 encryption. At rest, sensitive data is protected using AES-256 encryption.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Fraud Protection</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Our advanced fraud detection engine uses machine learning to identify and block suspicious referral activities. We monitor for:
                        </p>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li>Self-referral detection</li>
                            <li>IP and device fingerprinting</li>
                            <li>Pattern-based anomaly detection</li>
                            <li>Customizable velocity limits</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Data Residency & Infrastructure</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Incenta is hosted on world-class cloud infrastructure providers (AWS) with multiple availability zones for high availability and disaster recovery.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Compliance & SOC2</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We are working towards our SOC2 Type II certification. Our internal processes follow strict security guidelines to ensure your data remains confidential and integral.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Responsible Disclosure</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We operate a bug bounty program to encourage the responsible reporting of security vulnerabilities. We investigate all security reports diligently.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Contact Security</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            For security-related inquiries or to report a vulnerability, please contact us:
                        </p>
                        <div className="bg-gray-50 rounded-lg p-6 mt-4">
                            <p className="text-gray-700 mb-2"><strong>Email:</strong> security@incenta.com</p>
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
