'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardBody } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

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

export default function EnhancedAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [apps, setApps] = useState<App[]>([]);
  const [activeTab, setActiveTab] = useState<'partners' | 'apps'>('partners');
  const [loading, setLoading] = useState(true);
  const [editingLimit, setEditingLimit] = useState<string | null>(null);
  const [newLimit, setNewLimit] = useState<number>(0);

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

  const handleToggleAppStatus = async (appId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
      const response = await fetch('/api/admin/apps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, status: newStatus }),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating app:', error);
    }
  };

  const handleTogglePartnerStatus = async (partnerId: string, currentActive: boolean) => {
    try {
      const response = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ partnerId, active: !currentActive }),
      });

      if (response.ok) {
        loadData();
      }
    } catch (error) {
      console.error('Error updating partner:', error);
    }
  };

  const handleUpdateLimit = async (appId: string) => {
    try {
      const response = await fetch('/api/admin/apps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, monthlyLimit: newLimit }),
      });

      if (response.ok) {
        setEditingLimit(null);
        loadData();
      }
    } catch (error) {
      console.error('Error updating limit:', error);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  const totalApiUsage = apps.reduce((sum, app) => sum + app._count.apiUsageLogs, 0);
  const totalCampaigns = apps.reduce((sum, app) => sum + app._count.campaigns, 0);
  const activePartners = partners.filter(p => p.user.active).length;
  const suspendedApps = apps.filter(a => a.status === 'SUSPENDED').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center">
                <span className="text-2xl">🛡️</span>
                <h1 className="ml-2 text-2xl font-bold">Super Admin</h1>
              </div>
              <div className="hidden md:flex space-x-4">
                <a href="/admin/enhanced" className="text-white border-b-2 border-white px-3 py-2 text-sm font-medium">
                  Dashboard
                </a>
                <a href="/docs" className="text-red-100 hover:text-white px-3 py-2 text-sm font-medium">
                  API Docs
                </a>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-red-100 text-sm">{session?.user?.email}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="text-white hover:bg-red-800"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Partners"
            value={partners.length}
            icon={<span className="text-2xl">👥</span>}
          />
          <StatCard
            title="Active Partners"
            value={activePartners}
            icon={<span className="text-2xl">✅</span>}
          />
          <StatCard
            title="Total Apps"
            value={apps.length}
            icon={<span className="text-2xl">📱</span>}
          />
          <StatCard
            title="Total API Calls"
            value={totalApiUsage.toLocaleString()}
            icon={<span className="text-2xl">📊</span>}
          />
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-600 mb-1">Total Campaigns</div>
              <div className="text-3xl font-bold text-gray-900">{totalCampaigns}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-600 mb-1">Suspended Apps</div>
              <div className="text-3xl font-bold text-red-600">{suspendedApps}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <div className="text-sm font-medium text-gray-600 mb-1">Suspended Partners</div>
              <div className="text-3xl font-bold text-red-600">{partners.length - activePartners}</div>
            </CardBody>
          </Card>
        </div>

        {/* Tabs */}
        <Card>
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('partners')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'partners'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Partners Management
              </button>
              <button
                onClick={() => setActiveTab('apps')}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'apps'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Applications Management
              </button>
            </nav>
          </div>

          <CardBody>
            {activeTab === 'partners' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">All Partners</h3>
                  <div className="text-sm text-gray-600">
                    {activePartners} active / {partners.length} total
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Partner Info
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
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {partners.map((partner) => (
                        <tr key={partner.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{partner.user.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{partner.user.email}</div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {partner.companyName || '-'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <Badge variant="info">{partner._count.apps} apps</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={partner.user.active ? 'success' : 'error'}>
                              {partner.user.active ? 'Active' : 'Suspended'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant={partner.user.active ? 'danger' : 'primary'}
                              onClick={() => handleTogglePartnerStatus(partner.id, partner.user.active)}
                            >
                              {partner.user.active ? 'Suspend' : 'Activate'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'apps' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">All Applications</h3>
                  <div className="text-sm text-gray-600">
                    {apps.filter(a => a.status === 'ACTIVE').length} active / {apps.length} total
                  </div>
                </div>
                
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
                          Monthly Limit
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
                        <tr key={app.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{app.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{app.partner.user.name || 'N/A'}</div>
                            <div className="text-sm text-gray-500">{app.partner.user.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">{app.currentUsage.toLocaleString()}</div>
                            <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                              <div 
                                className={`h-1.5 rounded-full ${
                                  (app.currentUsage / app.monthlyLimit) >= 0.9 ? 'bg-red-600' :
                                  (app.currentUsage / app.monthlyLimit) >= 0.7 ? 'bg-yellow-600' :
                                  'bg-green-600'
                                }`}
                                style={{ width: `${Math.min((app.currentUsage / app.monthlyLimit) * 100, 100)}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            {editingLimit === app.id ? (
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={newLimit}
                                  onChange={(e) => setNewLimit(parseInt(e.target.value))}
                                  className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
                                />
                                <Button size="sm" onClick={() => handleUpdateLimit(app.id)}>
                                  Save
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setEditingLimit(null)}>
                                  Cancel
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-900">{app.monthlyLimit.toLocaleString()}</span>
                                <button
                                  onClick={() => {
                                    setEditingLimit(app.id);
                                    setNewLimit(app.monthlyLimit);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 text-xs"
                                >
                                  Edit
                                </button>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="info">{app._count.campaigns}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={app.status === 'ACTIVE' ? 'success' : 'error'}>
                              {app.status}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              size="sm"
                              variant={app.status === 'ACTIVE' ? 'danger' : 'primary'}
                              onClick={() => handleToggleAppStatus(app.id, app.status)}
                            >
                              {app.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
