'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface App {
  id: string;
  name: string;
  apiKey: string;
  monthlyLimit: number;
  currentUsage: number;
  status: string;
  _count: {
    campaigns: number;
  };
}

interface Analytics {
  appTotals: {
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    clickRate: number;
    conversionRate: number;
    totalRewardValue: number;
  };
  apiUsage: {
    current: number;
    limit: number;
    percentage: number;
  };
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    status: string;
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    clickRate: number;
    conversionRate: number;
    totalRewardValue: number;
  }>;
}

export default function EnhancedDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [showNewAppForm, setShowNewAppForm] = useState(false);
  const [showNewCampaignForm, setShowNewCampaignForm] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadApps = async () => {
    try {
      const response = await fetch('/api/partner/apps');
      if (response.ok) {
        const data = await response.json();
        setApps(data);
        if (data.length > 0 && !selectedApp) {
          setSelectedApp(data[0]);
          loadAnalytics(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error loading apps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session.user.role === 'SUPER_ADMIN') {
        router.push('/admin');
      } else {
        loadApps();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, session, router]);

  const loadAnalytics = async (appId: string) => {
    try {
      const response = await fetch(`/api/partner/analytics?appId=${appId}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  };

  const handleCreateApp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get('name') as string;

    try {
      const response = await fetch('/api/partner/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        setShowNewAppForm(false);
        loadApps();
      }
    } catch (error) {
      console.error('Error creating app:', error);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const campaignData = {
      appId: selectedApp?.id,
      name: formData.get('name') as string,
      referralType: formData.get('referralType') as string,
      rewardModel: formData.get('rewardModel') as string,
      rewardValue: parseFloat(formData.get('rewardValue') as string),
      rewardCap: formData.get('rewardCap') ? parseFloat(formData.get('rewardCap') as string) : null,
    };

    try {
      const response = await fetch('/api/partner/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (response.ok) {
        setShowNewCampaignForm(false);
        loadAnalytics(selectedApp!.id);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleAppSelect = (app: App) => {
    setSelectedApp(app);
    loadAnalytics(app.id);
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-blue-600">Referral Engine</h1>
              <div className="hidden md:flex space-x-4">
                <a href="/dashboard/enhanced" className="text-blue-600 border-b-2 border-blue-600 px-3 py-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/docs" className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium">
                  API Docs
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">{session?.user?.email}</span>
              <Button variant="ghost" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* App Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Your Applications</h2>
            <Button onClick={() => setShowNewAppForm(true)} size="sm">
              + New Application
            </Button>
          </div>

          {showNewAppForm && (
            <Card className="mb-4">
              <CardBody>
                <form onSubmit={handleCreateApp} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Application Name</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="My Awesome App"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button type="submit" size="sm">Create</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewAppForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardBody>
            </Card>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {apps.map((app) => (
              <Card
                key={app.id}
                className={`cursor-pointer transition-all ${
                  selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
                }`}
                onClick={() => handleAppSelect(app)}
              >
                <CardBody>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg text-gray-900">{app.name}</h3>
                    <Badge variant={app.status === 'ACTIVE' ? 'success' : 'error'} size="sm">
                      {app.status}
                    </Badge>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>Campaigns:</span>
                      <span className="font-medium">{app._count.campaigns}</span>
                    </div>
                    <ProgressBar
                      current={app.currentUsage}
                      max={app.monthlyLimit}
                      showPercentage={false}
                    />
                    <div className="text-xs text-gray-500 text-right">
                      {app.currentUsage.toLocaleString()} / {app.monthlyLimit.toLocaleString()} API calls
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          {apps.length === 0 && !showNewAppForm && (
            <Card>
              <CardBody className="text-center py-12">
                <p className="text-gray-500 mb-4">No applications yet. Create one to get started!</p>
                <Button onClick={() => setShowNewAppForm(true)}>Create Your First App</Button>
              </CardBody>
            </Card>
          )}
        </div>

        {/* Analytics Dashboard */}
        {selectedApp && analytics && (
          <>
            {/* API Usage */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>API Usage</CardTitle>
              </CardHeader>
              <CardBody>
                <ProgressBar
                  current={analytics.apiUsage.current}
                  max={analytics.apiUsage.limit}
                  label="Monthly API Calls"
                />
                {analytics.apiUsage.percentage >= 80 && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm text-yellow-800">
                      ⚠️ You are approaching your monthly API limit. Consider upgrading your plan.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Key Metrics */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Total Referrals"
                  value={analytics.appTotals.totalReferrals.toLocaleString()}
                  icon={<span className="text-2xl">👥</span>}
                />
                <StatCard
                  title="Total Clicks"
                  value={analytics.appTotals.totalClicks.toLocaleString()}
                  icon={<span className="text-2xl">🖱️</span>}
                />
                <StatCard
                  title="Total Conversions"
                  value={analytics.appTotals.totalConversions.toLocaleString()}
                  icon={<span className="text-2xl">✅</span>}
                />
                <StatCard
                  title="Total Rewards"
                  value={`$${analytics.appTotals.totalRewardValue.toLocaleString()}`}
                  icon={<span className="text-2xl">💰</span>}
                />
              </div>
            </div>

            {/* Conversion Rates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <Card>
                <CardBody>
                  <div className="text-sm font-medium text-gray-600 mb-2">Click Rate</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {analytics.appTotals.clickRate.toFixed(2)}%
                  </div>
                  <ProgressBar
                    current={analytics.appTotals.clickRate}
                    max={100}
                    showPercentage={false}
                    colorClass="bg-purple-600"
                  />
                </CardBody>
              </Card>
              <Card>
                <CardBody>
                  <div className="text-sm font-medium text-gray-600 mb-2">Conversion Rate</div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">
                    {analytics.appTotals.conversionRate.toFixed(2)}%
                  </div>
                  <ProgressBar
                    current={analytics.appTotals.conversionRate}
                    max={100}
                    showPercentage={false}
                    colorClass="bg-green-600"
                  />
                </CardBody>
              </Card>
            </div>

            {/* API Key */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>API Credentials</CardTitle>
              </CardHeader>
              <CardBody>
                <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-4 py-2 bg-gray-100 rounded-lg text-sm font-mono break-all border border-gray-300">
                    {selectedApp.apiKey}
                  </code>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigator.clipboard.writeText(selectedApp.apiKey)}
                  >
                    Copy
                  </Button>
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Use this API key to authenticate your requests. Keep it secure and never expose it in client-side code.
                </p>
              </CardBody>
            </Card>

            {/* Campaigns */}
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle>Campaigns</CardTitle>
                <Button size="sm" onClick={() => setShowNewCampaignForm(true)}>
                  + New Campaign
                </Button>
              </CardHeader>
              <CardBody>
                {showNewCampaignForm && (
                  <form onSubmit={handleCreateCampaign} className="mb-6 p-4 border border-gray-200 rounded-lg space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Campaign Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Summer Referral Campaign"
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Referral Type</label>
                        <select
                          name="referralType"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Type</option>
                          <option value="ONE_SIDED">One-Sided (Referrer only)</option>
                          <option value="TWO_SIDED">Two-Sided (Both parties)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reward Model</label>
                        <select
                          name="rewardModel"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">Select Model</option>
                          <option value="FIXED_CURRENCY">Fixed Amount ($)</option>
                          <option value="PERCENTAGE">Percentage (%)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reward Value</label>
                        <input
                          type="number"
                          name="rewardValue"
                          placeholder="10.00"
                          step="0.01"
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reward Cap (Optional)</label>
                        <input
                          type="number"
                          name="rewardCap"
                          placeholder="100.00"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button type="submit" size="sm">Create Campaign</Button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => setShowNewCampaignForm(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                <div className="space-y-4">
                  {analytics.campaigns.map((campaign) => (
                    <div key={campaign.campaignId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{campaign.campaignName}</h4>
                          <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'default'} size="sm" className="mt-1">
                            {campaign.status}
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Referrals</div>
                          <div className="font-semibold text-gray-900">{campaign.totalReferrals}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Clicks</div>
                          <div className="font-semibold text-gray-900">{campaign.totalClicks}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Conversions</div>
                          <div className="font-semibold text-gray-900">{campaign.totalConversions}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Conv. Rate</div>
                          <div className="font-semibold text-gray-900">{campaign.conversionRate.toFixed(1)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Rewards</div>
                          <div className="font-semibold text-gray-900">${campaign.totalRewardValue.toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {analytics.campaigns.length === 0 && !showNewCampaignForm && (
                    <div className="text-center py-8 text-gray-500">
                      No campaigns yet. Create one to start tracking referrals!
                    </div>
                  )}
                </div>
              </CardBody>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
