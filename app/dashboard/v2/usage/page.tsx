'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useEffect } from 'react';
import { Zap, TrendingUp, AlertTriangle, Calendar, Users, MousePointerClick, CheckCircle, DollarSign } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { PageHeaderSkeleton, StatCardSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';
import Link from 'next/link';

export default function UsagePage() {
  const { usage: stats, fetchUsage: loadUsageStats, metrics, fetchMetrics: loadMetrics, isLoading, invalidate, stats: dashboardStats, fetchStats } = useAppStore();
  const loading = isLoading['usage'];
  const metricChanges = metrics?.changes;

  useEffect(() => {
    invalidate('usage');
    // Fetch platform-level usage (no appId = all apps)
    loadUsageStats(true);
    loadMetrics();
    // Fetch platform-level stats for referrals data
    fetchStats('global');
  }, [loadUsageStats, loadMetrics, invalidate, fetchStats]);

  const usagePercentage = stats?.apiUsage ? Math.min((stats.apiUsage.current / stats.apiUsage.limit) * 100, 100) : 0;

  if (loading && !stats) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
          <CardSkeleton />
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
                You&apos;ve used {usagePercentage.toFixed(1)}% of your monthly API limit
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
            value={stats?.apiUsage?.current?.toLocaleString() || '0'}
            icon={<Zap size={24} />}
            change={metricChanges?.apiCalls ? `${metricChanges.apiCalls > 0 ? '+' : ''}${metricChanges.apiCalls.toFixed(1)}%` : undefined}
          />
          <StatCard
            title="API Limit"
            value={stats?.apiUsage?.limit?.toLocaleString() || '0'}
            icon={<TrendingUp size={24} />}
          />
          <StatCard
            title="Overage"
            value={stats?.apiUsage?.overage?.toLocaleString() || '0'}
            icon={<AlertTriangle size={24} />}
          />
          <StatCard
            title="Est. Overage Cost"
            value={`$${stats?.apiUsage?.estimatedCost?.toFixed(2) || '0.00'}`}
            icon={<Calendar size={24} />}
          />
        </div>

        {stats?.referralStats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Total Referrals (30d)"
                value={stats.referralStats.totalReferrals?.toLocaleString() || '0'}
                icon={<Users size={24} />}
              />
              <StatCard
                title="Total Clicks"
                value={stats.referralStats.totalClicks?.toLocaleString() || '0'}
                icon={<MousePointerClick size={24} />}
              />
              <StatCard
                title="Total Conversions"
                value={stats.referralStats.totalConversions?.toLocaleString() || '0'}
                icon={<CheckCircle size={24} />}
              />
              <StatCard
                title="Total Rewards"
                value={`$${stats.referralStats.totalRewards?.toFixed(2) || '0.00'}`}
                icon={<DollarSign size={24} />}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Referral Performance</CardTitle>
                </CardHeader>
                <CardBody>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Click Rate</span>
                        <span className="text-sm font-medium">{stats.referralStats?.clickRate || 0}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${stats.referralStats?.clickRate || 0}%` }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Conversion Rate</span>
                        <span className="text-sm font-medium">{stats.referralStats?.conversionRate || 0}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${stats.referralStats?.conversionRate || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Daily API Calls</CardTitle>
            </CardHeader>
            <CardBody>
              {stats?.apiUsage?.dailyUsage && stats.apiUsage.dailyUsage.length > 0 ? (
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.apiUsage.dailyUsage}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="calls" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-[300px] w-full flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-sm">No usage data available</p>
                    <p className="text-xs mt-1">API calls will appear here once you start using the API</p>
                  </div>
                </div>
              )}
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
                      className={`h-full rounded-full ${usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                        }`}
                      style={{ width: `${usagePercentage}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>{stats?.apiUsage?.current?.toLocaleString() || '0'} used</span>
                    <span>{stats?.apiUsage?.limit?.toLocaleString() || '0'} total</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 space-y-3">
                  {stats?.endpointBreakdown?.byCategory.map((item: any) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.category}</span>
                      <span className="text-sm font-medium">{item.percentage}%</span>
                    </div>
                  ))}
                  {(!stats?.endpointBreakdown?.byCategory || stats.endpointBreakdown.byCategory.length === 0) && (
                    <div className="text-sm text-gray-500 text-center py-4">No usage data yet</div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent API Activity</CardTitle>
              <Link
                href="/dashboard/v2/usage/activity"
                className="text-xs text-blue-600 hover:underline font-bold"
              >
                View all activity
              </Link>
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
                    {stats?.recentLogs && stats.recentLogs.length > 0 ? (
                      stats.recentLogs.slice(0, 10).map((log: any) => (
                        <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                          <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                            {log.endpoint}
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant={log.status?.startsWith('2') ? 'success' : 'error'} size="sm">
                              {log.status || '200'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-gray-500 text-xs">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                          No API activity yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
      </div>
    </DashboardLayout>
  );
}
