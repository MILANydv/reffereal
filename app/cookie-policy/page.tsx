import Link from 'next/link';

export default function CookiePolicyPage() {
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
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
                    <p className="text-gray-600 mb-8">This policy explains how Incenta uses cookies and similar technologies to recognize you when you visit our website.</p>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">What are cookies?</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Why do we use cookies?</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our Website to operate, and we refer to these as "essential" or "strictly necessary" cookies.
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">Types of cookies we use</h2>
                        <ul className="list-disc pl-6 text-gray-700 space-y-2 mb-4">
                            <li><strong>Essential:</strong> Required to provide you with services through our website.</li>
                            <li><strong>Analytics:</strong> Help us understand how our website is being used.</li>
                            <li><strong>Functional:</strong> Remember choices you make to improve your experience.</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">How can I control cookies?</h2>
                        <p className="text-gray-700 leading-relaxed mb-4">
                            You have the right to decide whether to accept or reject cookies. You can set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted.
                        </p>
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
