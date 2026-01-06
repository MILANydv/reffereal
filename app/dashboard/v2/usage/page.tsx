'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';
import { Zap, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

interface UsageData {
  current: number;
  limit: number;
  overage: number;
  estimatedCost: number;
  dailyUsage: Array<{
    date: string;
    calls: number;
  }>;
}

interface UsageStats {
  apiUsage: UsageData;
  recentLogs: Array<{
    id: string;
    endpoint: string;
    timestamp: string;
    status: string;
  }>;
}

const mockChartData = [
  { date: 'Mon', calls: 120 },
  { date: 'Tue', calls: 180 },
  { date: 'Wed', calls: 150 },
  { date: 'Thu', calls: 220 },
  { date: 'Fri', calls: 190 },
  { date: 'Sat', calls: 80 },
  { date: 'Sun', calls: 60 },
];

export default function UsagePage() {
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsageStats();
  }, []);

  const loadUsageStats = async () => {
    try {
      const response = await fetch('/api/partner/billing');
      if (response.ok) {
        const data = await response.json();
        setStats({
          apiUsage: {
            current: data.currentUsage?.apiCalls || 0,
            limit: data.subscription?.plan?.apiLimit || 10000,
            overage: data.currentUsage?.overage || 0,
            estimatedCost: data.currentUsage?.estimatedCost || 0,
            dailyUsage: mockChartData,
          },
          recentLogs: [
            { id: '1', endpoint: 'POST /api/referrals', timestamp: new Date().toISOString(), status: '200' },
            { id: '2', endpoint: 'GET /api/stats', timestamp: new Date().toISOString(), status: '200' },
            { id: '3', endpoint: 'POST /api/conversions', timestamp: new Date().toISOString(), status: '201' },
          ],
        });
      }
    } catch (error) {
      console.error('Error loading usage stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const usagePercentage = stats ? Math.min((stats.apiUsage.current / stats.apiUsage.limit) * 100, 100) : 0;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">API Usage</h1>
          <p className="text-gray-500 mt-1">Monitor your API consumption and limits.</p>
        </div>

        {usagePercentage > 80 && (
          <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-900/30 flex items-start">
            <AlertTriangle size={20} className="mr-3 mt-0.5 text-yellow-600" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-400">
                You've used {usagePercentage.toFixed(1)}% of your monthly API limit
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                Consider upgrading your plan to avoid overage charges.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="API Calls (30d)"
            value={stats?.apiUsage.current.toLocaleString() || '0'}
            icon={<Zap size={24} />}
            change="+12.5%"
          />
          <StatCard
            title="API Limit"
            value={stats?.apiUsage.limit.toLocaleString() || '0'}
            icon={<TrendingUp size={24} />}
          />
          <StatCard
            title="Overage"
            value={stats?.apiUsage.overage.toLocaleString() || '0'}
            icon={<AlertTriangle size={24} />}
          />
          <StatCard
            title="Est. Overage Cost"
            value={`$${stats?.apiUsage.estimatedCost.toFixed(2) || '0.00'}`}
            icon={<Calendar size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Daily API Calls</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={mockChartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                    <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Usage Breakdown</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Progress</span>
                    <span className="text-sm font-medium">{usagePercentage.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{stats?.apiUsage.current.toLocaleString()} used</span>
                    <span>{stats?.apiUsage.limit.toLocaleString()} total</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Referrals API</span>
                    <span className="text-sm font-medium">45%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Analytics API</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Webhooks</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Other</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent API Activity</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Endpoint</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats?.recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {log.endpoint}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={log.status.startsWith('2') ? 'success' : 'error'} size="sm">
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 text-xs">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
