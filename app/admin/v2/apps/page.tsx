'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, MoreHorizontal, Building2, Zap, Calendar } from 'lucide-react';
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
                        <div className="flex items-center justify-end space-x-1">
                          <select
                            value={app.status}
                            onChange={(e) => handleStatusChange(app.id, e.target.value)}
                            className="text-xs px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="ACTIVE">Active</option>
                            <option value="SUSPENDED">Suspended</option>
                          </select>
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <MoreHorizontal size={16} />
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
    </DashboardLayout>
  );
}
