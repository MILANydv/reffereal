'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, MoreHorizontal, Building2, Zap, Calendar, Eye, Edit, Trash2 } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface App {
  id: string;
  name: string;
  apiKey: string;
  status: string;
  monthlyLimit: number;
  currentUsage: number;
  createdAt: string;
  partner: {
    companyName: string | null;
    user: {
      email: string;
    };
  };
  _count: {
    campaigns: number;
    apiUsageLogs: number;
  };
}

export default function AdminAppsPage() {
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewModal, setViewModal] = useState<App | null>(null);

  const fetchApps = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/apps');
      if (response.ok) {
        const data = await response.json();
        setApps(data);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApps();
    }, 300);
    return () => clearTimeout(timer);
  }, [fetchApps]);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/apps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, status: newStatus }),
      });
      if (response.ok) {
        fetchApps();
      }
    } catch (error) {
      console.error('Error updating app status:', error);
    }
  };

  const handleDelete = async (appId: string, appName: string) => {
    if (!confirm(`Are you sure you want to delete app "${appName}"? This action cannot be undone and will delete all associated campaigns and data.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/apps?id=${appId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchApps();
      }
    } catch (error) {
      console.error('Error deleting app:', error);
    }
  };

  const filteredApps = apps.filter((app) => {
    const matchesSearch = 
      app.name.toLowerCase().includes(search.toLowerCase()) ||
      app.partner.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      app.partner.user.email.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getUsagePercentage = (app: App) => {
    return Math.min((app.currentUsage / app.monthlyLimit) * 100, 100);
  };

  const getStatusColor = (status: string): 'info' | 'error' | 'default' | 'success' | 'warning' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'SUSPENDED':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-gray-500 mt-1">Global view of all applications created by partners.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Building2 size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{apps.length}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Total Apps</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {apps.filter(a => a.status === 'ACTIVE').length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Active</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {apps.filter(a => a.status === 'SUSPENDED').length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Suspended</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <Zap size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {apps.reduce((sum, a) => sum + a._count.apiUsageLogs, 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Total API Hits</div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Application</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Partner</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">API Usage</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Created</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">Loading apps...</td>
                  </tr>
                ) : filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">No applications found</td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{app.name}</div>
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{app.apiKey}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-gray-100">
                          {app.partner.companyName || 'Unnamed Partner'}
                        </div>
                        <div className="text-xs text-gray-500">{app.partner.user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="text-gray-500">{app.currentUsage.toLocaleString()}</span>
                            <span className="text-gray-500">/ {app.monthlyLimit.toLocaleString()}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                getUsagePercentage(app) > 90 ? 'bg-red-500' : 'bg-blue-500'
                              }`}
                              style={{ width: `${getUsagePercentage(app)}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-400 mt-0.5">
                            {getUsagePercentage(app).toFixed(1)}% used
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={getStatusColor(app.status)} size="sm">
                          {app.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        <div className="flex items-center">
                          <Calendar size={14} className="mr-1.5 text-gray-400" />
                          {new Date(app.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => setViewModal(app)}
                            className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            title="Change Status"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                          </select>
                          <button
                            onClick={() => handleDelete(app.id, app.name)}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            title="Delete App"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold">App Details</h2>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">App Name</label>
                  <div className="text-lg font-medium">{viewModal.name}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div><Badge variant={getStatusColor(viewModal.status)}>{viewModal.status}</Badge></div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">API Key</label>
                  <div className="text-sm font-mono bg-gray-100 dark:bg-gray-900 p-2 rounded break-all">{viewModal.apiKey}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Created</label>
                  <div className="text-lg font-medium">{new Date(viewModal.createdAt).toLocaleDateString()}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Monthly Limit</label>
                  <div className="text-lg font-medium">{viewModal.monthlyLimit.toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Current Usage</label>
                  <div className="text-lg font-medium">{viewModal.currentUsage.toLocaleString()}</div>
                </div>
                <div className="col-span-2">
                  <label className="text-sm text-gray-500">Usage Progress</label>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${
                        getUsagePercentage(viewModal) > 90 ? 'bg-red-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${getUsagePercentage(viewModal)}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{getUsagePercentage(viewModal).toFixed(1)}% used</div>
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Partner Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-500">Company</label>
                    <div className="text-lg font-medium">{viewModal.partner.companyName || 'Unnamed'}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Email</label>
                    <div className="text-lg font-medium">{viewModal.partner.user.email}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Campaigns</label>
                    <div className="text-lg font-medium">{viewModal._count.campaigns}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-500">Total API Calls</label>
                    <div className="text-lg font-medium">{viewModal._count.apiUsageLogs.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setViewModal(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
