'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Activity, TrendingUp, Users, Zap } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeaderSkeleton, StatCardSkeleton, CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

interface UsageData {
  totalApiCalls: number;
  topApps: Array<{
    appId: string;
    appName: string;
    calls: number;
    currentUsage: number;
    monthlyLimit: number;
    partner: {
      companyName: string | null;
      user: {
        email: string;
      };
    };
  }>;
  topPartners: Array<{
    partnerId: string;
    companyName: string;
    email: string;
    usage: number;
    plan: {
      type: string;
      apiLimit: number;
    } | null;
  }>;
  recentLogs: Array<{
    id: string;
    endpoint: string;
    timestamp: string;
    app: {
      name: string;
      partner: {
        companyName: string | null;
        user: {
          email: string;
        };
      };
    };
  }>;
}

export default function AdminUsagePage() {
  const [data, setData] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/usage');
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton cols={4} rows={5} />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-500">Failed to load usage data</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Usage</h1>
          <p className="text-gray-500 mt-1">Monitor API usage and activity across the platform.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Activity size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.totalApiCalls.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Total API Calls</div>
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
                  {data.topApps.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Active Apps</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <Users size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.topPartners.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Active Partners</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 rounded-lg">
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.recentLogs.length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Recent Logs</div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Top Apps by Usage</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.topApps.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No data available</div>
              ) : (
                data.topApps.map((app) => (
                  <div key={app.appId} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">{app.appName}</div>
                        <div className="text-xs text-gray-500">
                          {app.partner.companyName || app.partner.user.email}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900 dark:text-gray-100">
                          {app.currentUsage.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">
                          / {app.monthlyLimit.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${(app.currentUsage / app.monthlyLimit) * 100 > 90
                            ? 'bg-red-500'
                            : 'bg-blue-500'
                          }`}
                        style={{
                          width: `${Math.min((app.currentUsage / app.monthlyLimit) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Top Partners by Usage</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {data.topPartners.length === 0 ? (
                <div className="p-8 text-center text-gray-500">No data available</div>
              ) : (
                data.topPartners.map((partner) => (
                  <div key={partner.partnerId} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {partner.companyName}
                        </div>
                        <div className="text-xs text-gray-500">{partner.email}</div>
                        <div className="mt-1">
                          <Badge variant="default" size="sm">
                            {partner.plan?.type || 'FREE'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                          {partner.usage.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">API calls</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Recent API Activity</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Endpoint</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">App</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Partner</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                      No recent activity
                    </td>
                  </tr>
                ) : (
                  data.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {log.endpoint}
                      </td>
                      <td className="px-6 py-3 text-gray-900 dark:text-gray-100">{log.app.name}</td>
                      <td className="px-6 py-3 text-gray-500">
                        {log.app.partner.companyName || log.app.partner.user.email}
                      </td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleString()}
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
