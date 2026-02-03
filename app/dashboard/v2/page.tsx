'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { TrendingUp, Users, CheckCircle, DollarSign, AlertCircle, ArrowRight, Zap, Webhook } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Link from 'next/link';
import { Skeleton, StatCardSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { DateRangeFilter, DateRange } from '@/components/ui/DateRangeFilter';



export default function DashboardV2Page() {
  const { data: session, status: sessionStatus } = useSession();
  const {
    selectedApp,
    stats,
    activeCampaigns,
    webhookDeliveries,
    metrics: metricChanges,
    fetchStats,
    fetchActiveCampaigns,
    fetchWebhookDeliveries,
    fetchMetrics,
    isLoading
  } = useAppStore();

  const [onboardingStatus, setOnboardingStatus] = useState<{ completed: boolean; loading: boolean }>({
    completed: false,
    loading: true
  });

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      if (session?.user?.role === 'SUPER_ADMIN') {
        setOnboardingStatus({ completed: true, loading: false });
      } else {
        checkOnboardingStatus();
      }
    } else if (sessionStatus === 'unauthenticated') {
      // If unauthenticated, stop loading
      setOnboardingStatus({ completed: false, loading: false });
    }
  }, [sessionStatus, session?.user?.role]);

  // Timeout fallback to prevent infinite loading
  useEffect(() => {
    if (onboardingStatus.loading) {
      const timeout = setTimeout(() => {
        console.warn('Onboarding status check timed out, setting loading to false');
        setOnboardingStatus({ completed: false, loading: false });
      }, 10000); // 10 second timeout

      return () => clearTimeout(timeout);
    }
  }, [onboardingStatus.loading]);

  useEffect(() => {
    if (onboardingStatus.completed) {
      // Always fetch platform-level data (independent of apps)
      fetchStats('global', dateRange);
      fetchActiveCampaigns();
      fetchWebhookDeliveries();
      fetchMetrics();
    }
  }, [onboardingStatus.completed, dateRange, fetchStats, fetchActiveCampaigns, fetchWebhookDeliveries, fetchMetrics]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/partner/onboarding-status');
      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus({ completed: data.onboardingCompleted, loading: false });
        if (!data.onboardingCompleted) {
          // Redirect to onboarding if not completed
          window.location.href = '/onboarding';
          return;
        }
      } else {
        // If response is not OK, still set loading to false to prevent infinite loading
        console.error('Failed to check onboarding status:', response.status);
        setOnboardingStatus({ completed: false, loading: false });
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingStatus({ completed: false, loading: false });
    }
  };


  const isLoadingAny = Object.values(isLoading).some(Boolean) || onboardingStatus.loading;

  // Show loading only if we're actually loading and don't have data yet
  // But also show content if we have stats even if some things are still loading
  if (onboardingStatus.loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (isLoadingAny && !stats) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If no app is selected, show a "Global Overview" or prompt to select/create an app
  if (!selectedApp && stats?.totalApps === 0) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
            <Zap size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2">Welcome to Incenta</h1>
          <p className="text-gray-500 max-w-md mb-8">Nepal's leading growth engine. Get started by creating your first application.</p>
          <Link
            href="/dashboard/v2/apps/new"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            Create Your First App
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Overview</h1>
            <p className="text-gray-500 mt-1">
              Aggregated performance across all your applications.
            </p>
          </div>
          <DateRangeFilter value={dateRange} onChange={setDateRange} />
        </div>

        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="space-y-2">
            {stats.alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-start ${alert.type === 'error'
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-800 dark:text-red-400'
                  : alert.type === 'warning'
                    ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                    : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30 text-blue-800 dark:text-blue-400'
                  }`}
              >
                <AlertCircle size={20} className="mr-3 mt-0.5" />
                <p className="text-sm font-medium">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="API Requests (30d)"
            value={stats?.apiUsage?.current?.toLocaleString() || '0'}
            icon={<Zap size={24} />}
            change={metricChanges?.apiCalls ? `${metricChanges.apiCalls > 0 ? '+' : ''}${metricChanges.apiCalls.toFixed(1)}%` : undefined}
          />
          <StatCard
            title="Referrals Created"
            value={stats?.totalReferrals.toLocaleString() || '0'}
            icon={<Users size={24} />}
            change={metricChanges?.referrals ? `${metricChanges.referrals > 0 ? '+' : ''}${metricChanges.referrals.toFixed(1)}%` : undefined}
          />
          <StatCard
            title="Conversions"
            value={stats?.totalConversions.toLocaleString() || '0'}
            icon={<CheckCircle size={24} />}
            change={metricChanges?.conversions ? `${metricChanges.conversions > 0 ? '+' : ''}${metricChanges.conversions.toFixed(1)}%` : undefined}
          />
          <StatCard
            title="Revenue Attributed"
            value={`${(stats?.totalConversions ? stats.totalConversions * 45 : 0).toLocaleString()}`}
            icon={<DollarSign size={24} />}
            change={metricChanges?.revenue ? `${metricChanges.revenue > 0 ? '+' : ''}${metricChanges.revenue.toFixed(1)}%` : undefined}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">API Usage Chart</CardTitle>
              <DateRangeFilter value={dateRange} onChange={setDateRange} presets={['7d', '30d', '90d', 'custom']} />
            </CardHeader>
            <CardBody>
              {(() => {
                // Handle both new format (with apps) and old format (array)
                const chartData = stats?.apiUsageChart && 'data' in stats.apiUsageChart
                  ? stats.apiUsageChart.data
                  : Array.isArray(stats?.apiUsageChart)
                    ? stats.apiUsageChart
                    : [];
                const chartApps = stats?.apiUsageChart && 'apps' in stats.apiUsageChart
                  ? stats.apiUsageChart.apps
                  : [];

                if (chartData.length > 0 && chartApps.length > 0) {
                  return (
                    <div className="h-[350px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            {chartApps.map((app: any, index: number) => {
                              const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
                              const color = colors[index % colors.length];
                              return (
                                <linearGradient key={app.id} id={`color-${app.id}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                                  <stop offset="95%" stopColor={color} stopOpacity={0} />
                                </linearGradient>
                              );
                            })}
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-slate-700" />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            className="dark:text-slate-400"
                          />
                          <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fontSize: 12, fill: '#9ca3af' }}
                            className="dark:text-slate-400"
                          />
                          <Tooltip
                            contentStyle={{
                              borderRadius: '12px',
                              border: 'none',
                              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                              backgroundColor: 'white',
                            }}
                            formatter={(value: any, name: string) => {
                              if (value === 0 || value === null || value === undefined) return null;
                              return [`${value} calls`, name];
                            }}
                            labelFormatter={(label) => `Date: ${label}`}
                          />
                          <Legend
                            wrapperStyle={{ paddingTop: '20px' }}
                            iconType="circle"
                            formatter={(value) => value}
                            iconSize={8}
                          />
                          {chartApps.map((app: any, index: number) => {
                            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4'];
                            const color = colors[index % colors.length];
                            return (
                              <Area
                                key={app.id}
                                type="monotone"
                                dataKey={app.name}
                                stroke={color}
                                strokeWidth={2}
                                fillOpacity={0.6}
                                fill={`url(#color-${app.id})`}
                                name={app.name}
                              />
                            );
                          })}
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  );
                } else if (Array.isArray(stats?.apiUsageChart) && stats.apiUsageChart.length > 0) {
                  // Fallback to old single-line format
                  return (
                    <div className="h-[300px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={stats.apiUsageChart}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  );
                } else {
                  return (
                    <div className="h-[350px] w-full flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <p className="text-sm">No API usage data available</p>
                        <p className="text-xs mt-1">API calls will appear here once you start using the API</p>
                      </div>
                    </div>
                  );
                }
              })()}
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Active Campaigns</CardTitle>
              {activeCampaigns.length > 4 && (
                <Link href="/dashboard/v2/campaigns" className="text-xs text-blue-600 hover:underline font-bold">
                  View all ({activeCampaigns.length})
                </Link>
              )}
            </CardHeader>
            <CardBody className="p-0">
              {activeCampaigns.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {activeCampaigns.slice(0, 4).map((campaign: any) => (
                      <div key={campaign.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{campaign.name}</span>
                          <Badge variant="success" size="sm">Active</Badge>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          {(campaign.App || campaign.app) && (
                            <Badge variant="default" size="sm">{(campaign.App || campaign.app)?.name}</Badge>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <Users size={12} className="mr-1" /> {campaign.totalReferrals} referrals
                          <span className="mx-2">•</span>
                          <DollarSign size={12} className="mr-1" /> ${campaign.totalRewardCost.toFixed(2)} reward cost
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                    <Link href="/dashboard/v2/campaigns" className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center">
                      View all campaigns <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">
                  No active campaigns yet.
                  <Link href="/dashboard/v2/campaigns/new" className="block mt-2 text-blue-600 hover:underline font-medium">
                    Create your first campaign
                  </Link>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Webhook size={20} className="mr-2 text-purple-500" />
                Recent Webhook Events
              </CardTitle>
              <Link href="/dashboard/v2/webhooks" className="text-xs text-blue-600 hover:underline font-bold">View logs</Link>
            </CardHeader>
            <CardBody className="p-0">
              {webhookDeliveries.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {webhookDeliveries.slice(0, 5).map((delivery: any) => (
                      <div key={delivery.id} className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-2 h-2 rounded-full ${delivery.success ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-medium">{delivery.eventType}</p>
                              {delivery.app && (
                                <Badge variant="default" size="sm">{delivery.app.name}</Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate max-w-[200px]">{delivery.url}</p>
                          </div>
                        </div>
                        <span className="text-xs font-mono text-gray-400">{delivery.statusCode}</span>
                      </div>
                    ))}
                  </div>
                  {webhookDeliveries.length > 5 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                      <Link href="/dashboard/v2/webhooks" className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center">
                        View all webhook deliveries ({webhookDeliveries.length}) <ArrowRight size={14} className="ml-1" />
                      </Link>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">
                  No webhook deliveries yet
                </div>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {stats.recentActivity.slice(0, 5).map((activity: any) => (
                      <div key={activity.id} className="flex items-start justify-between p-4 px-6">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.description}</p>
                            {activity.app && (
                              <Badge variant="default" size="sm">{activity.app.name}</Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                        </div>
                        <Badge variant="default" size="sm">{activity.type}</Badge>
                      </div>
                    ))}
                  </div>
                  {stats.recentActivity.length > 5 && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 text-center">
                        Showing 5 of {stats.recentActivity.length} activities
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <p className="text-sm text-gray-500 text-center py-12">No recent activity</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
