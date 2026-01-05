import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-blue-600">Referral Engine</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/docs" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Documentation
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Enterprise Referral Engine
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Developer-focused referral platform for building powerful reward programs
          </p>
          <p className="text-lg text-gray-500 mb-10 max-w-3xl mx-auto">
            Track referrals, clicks, and conversions with a simple API. Enterprise-grade analytics and usage metering included.
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/signup"
              className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Get Started Free
            </Link>
            <Link
              href="/docs"
              className="px-8 py-4 bg-white text-blue-600 font-semibold text-lg rounded-lg border-2 border-blue-600 hover:bg-blue-50 transition shadow-lg hover:shadow-xl"
            >
              View API Docs
            </Link>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-3">Simple API</h3>
            <p className="text-gray-600">
              Integrate referral tracking with just a few API calls. Generate codes, track clicks, and record conversions.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-3">Real-time Analytics</h3>
            <p className="text-gray-600">
              Track referrals, clicks, conversions, and rewards with accurate real-time analytics and KPIs.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-3">Multi-Campaign</h3>
            <p className="text-gray-600">
              Create multiple campaigns per app with different reward models and configurations.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-semibold mb-3">Usage Metering</h3>
            <p className="text-gray-600">
              Built-in API usage tracking and soft limits with enterprise-grade authentication.
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">1.</span>
              <span>Sign up and create your app to get an API key</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">2.</span>
              <span>Create a referral campaign with your desired reward model</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">3.</span>
              <span>Use the API to generate referral codes and track conversions</span>
            </div>
            <div className="flex items-start">
              <span className="font-bold text-blue-600 mr-3">4.</span>
              <span>Monitor performance through your dashboard</span>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-gray-900 text-white p-8 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">API Example</h2>
          <pre className="bg-gray-800 p-4 rounded overflow-x-auto text-sm">
{`// Generate a referral code
const response = await fetch('https://api.example.com/v1/referrals', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer rk_your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    campaignId: 'campaign_id',
    referrerId: 'user_123'
  })
});

const { referralCode } = await response.json();

// Track a conversion
await fetch('https://api.example.com/v1/conversions', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer rk_your_api_key',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    referralCode,
    refereeId: 'user_456',
    amount: 100
  })
});`}
          </pre>
        </div>
      </div>
    </div>
  );
}
