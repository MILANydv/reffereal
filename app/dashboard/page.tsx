'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/enhanced');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Redirecting...</div>
    </div>
  );
}

/*
// Legacy dashboard - kept for reference
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

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

interface Campaign {
  id: string;
  name: string;
  status: string;
  referralType: string;
  rewardModel: string;
  rewardValue: number;
  _count: {
    referrals: number;
  };
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [apps, setApps] = useState<App[]>([]);
  const [selectedApp, setSelectedApp] = useState<App | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
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
          loadCampaigns(data[0].id);
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
  }, [status, session, router]);

  const loadCampaigns = async (appId: string) => {
    try {
      const response = await fetch(`/api/partner/campaigns?appId=${appId}`);
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data);
      }
    } catch (error) {
      console.error('Error loading campaigns:', error);
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
        loadCampaigns(selectedApp!.id);
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  const handleAppSelect = (app: App) => {
    setSelectedApp(app);
    loadCampaigns(app.id);
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold">Partner Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{session?.user?.email}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Your Apps</h2>
                <button
                  onClick={() => setShowNewAppForm(true)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  + New App
                </button>
              </div>

              {showNewAppForm && (
                <form onSubmit={handleCreateApp} className="mb-4 p-4 border rounded">
                  <input
                    type="text"
                    name="name"
                    placeholder="App Name"
                    required
                    className="w-full px-3 py-2 border rounded mb-2"
                  />
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                    >
                      Create
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewAppForm(false)}
                      className="px-3 py-1 bg-gray-300 text-sm rounded"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              <div className="space-y-2">
                {apps.map((app) => (
                  <div
                    key={app.id}
                    onClick={() => handleAppSelect(app)}
                    className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                      selectedApp?.id === app.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium">{app.name}</div>
                    <div className="text-sm text-gray-600">
                      {app._count.campaigns} campaigns
                    </div>
                    <div className="text-sm text-gray-600">
                      Usage: {app.currentUsage} / {app.monthlyLimit}
                    </div>
                  </div>
                ))}
                {apps.length === 0 && !showNewAppForm && (
                  <div className="text-center text-gray-500 py-4">
                    No apps yet. Create one to get started!
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedApp ? (
              <>
                <div className="bg-white shadow rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">App Details: {selectedApp.name}</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">API Key</label>
                      <div className="mt-1 flex items-center">
                        <code className="flex-1 px-3 py-2 bg-gray-100 rounded text-sm font-mono break-all">
                          {selectedApp.apiKey}
                        </code>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Status</label>
                        <div className={`mt-1 px-3 py-2 rounded text-sm ${
                          selectedApp.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {selectedApp.status}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Current Usage</label>
                        <div className="mt-1 px-3 py-2 bg-gray-100 rounded text-sm">
                          {selectedApp.currentUsage}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Monthly Limit</label>
                        <div className="mt-1 px-3 py-2 bg-gray-100 rounded text-sm">
                          {selectedApp.monthlyLimit}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold">Campaigns</h2>
                    <button
                      onClick={() => setShowNewCampaignForm(true)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      + New Campaign
                    </button>
                  </div>

                  {showNewCampaignForm && (
                    <form onSubmit={handleCreateCampaign} className="mb-4 p-4 border rounded space-y-3">
                      <input
                        type="text"
                        name="name"
                        placeholder="Campaign Name"
                        required
                        className="w-full px-3 py-2 border rounded"
                      />
                      <select
                        name="referralType"
                        required
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select Referral Type</option>
                        <option value="ONE_SIDED">One-Sided</option>
                        <option value="TWO_SIDED">Two-Sided</option>
                      </select>
                      <select
                        name="rewardModel"
                        required
                        className="w-full px-3 py-2 border rounded"
                      >
                        <option value="">Select Reward Model</option>
                        <option value="FIXED_CURRENCY">Fixed Currency</option>
                        <option value="PERCENTAGE">Percentage</option>
                      </select>
                      <input
                        type="number"
                        name="rewardValue"
                        placeholder="Reward Value"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 border rounded"
                      />
                      <input
                        type="number"
                        name="rewardCap"
                        placeholder="Reward Cap (Optional)"
                        step="0.01"
                        className="w-full px-3 py-2 border rounded"
                      />
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 text-white text-sm rounded"
                        >
                          Create
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowNewCampaignForm(false)}
                          className="px-3 py-1 bg-gray-300 text-sm rounded"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="space-y-3">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 border rounded">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{campaign.name}</h3>
                            <div className="text-sm text-gray-600 mt-1">
                              Type: {campaign.referralType.replace('_', ' ')}
                            </div>
                            <div className="text-sm text-gray-600">
                              Reward: {campaign.rewardModel === 'PERCENTAGE' ? `${campaign.rewardValue}%` : `$${campaign.rewardValue}`}
                            </div>
                            <div className="text-sm text-gray-600">
                              Referrals: {campaign._count.referrals}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded text-sm ${
                            campaign.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {campaign.status}
                          </div>
                        </div>
                      </div>
                    ))}
                    {campaigns.length === 0 && !showNewCampaignForm && (
                      <div className="text-center text-gray-500 py-4">
                        No campaigns yet. Create one to start tracking referrals!
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white shadow rounded-lg p-6">
                <div className="text-center text-gray-500 py-8">
                  Select an app to view details and campaigns
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
*/
