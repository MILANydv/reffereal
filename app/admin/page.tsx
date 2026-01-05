'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/admin/enhanced');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-xl">Redirecting...</div>
    </div>
  );
}

/*
// Legacy admin - kept for reference
'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Partner {
  id: string;
  companyName: string;
  active: boolean;
  user: {
    email: string;
    name: string;
    active: boolean;
  };
  _count: {
    apps: number;
  };
}

interface App {
  id: string;
  name: string;
  status: string;
  monthlyLimit: number;
  currentUsage: number;
  partner: {
    user: {
      email: string;
      name: string;
    };
  };
  _count: {
    campaigns: number;
    apiUsageLogs: number;
  };
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [activeTab, setActiveTab] = useState<'partners' | 'apps'>('partners');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      if (session.user.role !== 'SUPER_ADMIN') {
        router.push('/dashboard');
      } else {
        loadData();
      }
    }
  }, [status, session, router]);

  const loadData = async () => {
    try {
      const [partnersRes, appsRes] = await Promise.all([
        fetch('/api/admin/partners'),
        fetch('/api/admin/apps'),
      ]);

      if (partnersRes.ok) {
        const partnersData = await partnersRes.json();
        setPartners(partnersData);
      }

      if (appsRes.ok) {
        const appsData = await appsRes.json();
        setApps(appsData);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApp = async (appId: string, status: string) => {
    try {
      const response = await fetch('/api/admin/apps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, status }),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating app:', error);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const totalApiUsage = apps.reduce((sum, app) => sum + app._count.apiUsageLogs, 0);
  const totalCampaigns = apps.reduce((sum, app) => sum + app._count.campaigns, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-red-600">Super Admin Dashboard</h1>
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600">Total Partners</div>
            <div className="text-3xl font-bold mt-2">{partners.length}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600">Total Apps</div>
            <div className="text-3xl font-bold mt-2">{apps.length}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600">Total Campaigns</div>
            <div className="text-3xl font-bold mt-2">{totalCampaigns}</div>
          </div>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="text-sm font-medium text-gray-600">Total API Calls</div>
            <div className="text-3xl font-bold mt-2">{totalApiUsage}</div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="border-b">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('partners')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'partners'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Partners
              </button>
              <button
                onClick={() => setActiveTab('apps')}
                className={`px-6 py-4 text-sm font-medium ${
                  activeTab === 'apps'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Apps
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'partners' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Apps
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {partners.map((partner) => (
                      <tr key={partner.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {partner.user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {partner.user.name || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {partner.companyName || '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {partner._count.apps}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            partner.user.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {partner.user.active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'apps' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        App Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Partner
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Limit
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Campaigns
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {apps.map((app) => (
                      <tr key={app.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {app.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {app.partner.user.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {app.currentUsage}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {app.monthlyLimit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {app._count.campaigns}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded ${
                            app.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() =>
                              handleUpdateApp(
                                app.id,
                                app.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                              )
                            }
                            className={`px-3 py-1 rounded text-xs ${
                              app.status === 'ACTIVE'
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-green-100 text-green-700 hover:bg-green-200'
                            }`}
                          >
                            {app.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
*/
