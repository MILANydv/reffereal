'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { DateRangeFilter, DateRange } from '@/components/ui/DateRangeFilter';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { Users, CheckCircle, DollarSign, AlertCircle, ArrowRight, Zap, Webhook } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';
import { Skeleton, StatCardSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function AppOverviewPage() {
  const { data: session, status: sessionStatus } = useSession();
  const params = useParams();
  const router = useRouter();
  const appId = params.appId as string;
  
  const {
    apps,
    selectedApp,
    stats,
    activeCampaigns,
    webhookDeliveries,
    metrics: metricChanges,
    fetchStats,
    fetchActiveCampaigns,
    fetchWebhookDeliveries,
    fetchMetrics,
    setSelectedApp,
    isLoading
  } = useAppStore();

  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });

  const [onboardingStatus, setOnboardingStatus] = useState<{ completed: boolean; loading: boolean }>({
    completed: false,
    loading: true
  });

  // Set selected app when component mounts
  useEffect(() => {
    if (apps.length > 0 && appId) {
      const app = apps.find(a => a.id === appId);
      if (app) {
        setSelectedApp(app);
      } else {
        router.push('/dashboard/v2/apps');
      }
    }
  }, [apps, appId, setSelectedApp, router]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      if (session?.user?.role === 'SUPER_ADMIN') {
        setOnboardingStatus({ completed: true, loading: false });
      } else {
        checkOnboardingStatus();
      }
    }
  }, [sessionStatus, session?.user?.role]);

  useEffect(() => {
    if (onboardingStatus.completed && appId) {
      // Fetch app-specific data
      fetchStats(appId, dateRange);
      fetchActiveCampaigns(appId);
      fetchWebhookDeliveries(appId);
      fetchMetrics();
    }
  }, [appId, onboardingStatus.completed, dateRange, fetchStats, fetchActiveCampaigns, fetchWebhookDeliveries, fetchMetrics]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/partner/onboarding-status');
      if (response.ok) {
        const data = await response.json();
        setOnboardingStatus({ completed: data.onboardingCompleted, loading: false });
        if (!data.onboardingCompleted) {
          router.push('/onboarding');
          return;
        }
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setOnboardingStatus({ completed: false, loading: false });
    }
  };

  const isLoadingAny = Object.values(isLoading).some(Boolean) || onboardingStatus.loading;

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

  if (!selectedApp) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
            <Zap size={40} />
          </div>
          <h1 className="text-3xl font-bold mb-2">App Not Found</h1>
          <p className="text-gray-500 max-w-md mb-8">The requested application could not be found.</p>
          <Link
            href="/dashboard/v2/apps"
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20"
          >
            View All Apps
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
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedApp.name} Overview
            </h1>
            <p className="text-gray-500 mt-1">
              Real-time performance for this application.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <DateRangeFilter value={dateRange} onChange={setDateRange} />
            <div className="flex space-x-2">
              <Badge variant="success" className="h-6">Healthy</Badge>
              <span className="text-xs text-gray-400 mt-1 font-mono">v1.2.0</span>
            </div>
          </div>
        </div>

        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="space-y-2">
            {stats.alerts.map((alert: any) => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-start ${
                  alert.type === 'error'
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
            value={stats?.totalReferrals?.toLocaleString() || '0'}
            icon={<Users size={24} />}
            change={metricChanges?.referrals ? `${metricChanges.referrals > 0 ? '+' : ''}${metricChanges.referrals.toFixed(1)}%` : undefined}
          />
          <StatCard
            title="Conversions"
            value={stats?.totalConversions?.toLocaleString() || '0'}
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
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats?.apiUsageChart || []}>
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
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Campaigns</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {activeCampaigns.length > 0 ? (
                <>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {activeCampaigns.map((campaign) => (
                      <div key={campaign.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm">{campaign.name}</span>
                          <Badge variant="success" size="sm">Active</Badge>
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
                    <Link href={`/dashboard/v2/campaigns?appId=${appId}`} className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center">
                      View all campaigns <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-sm text-gray-500">
                  No active campaigns yet.
                  <Link href={`/dashboard/v2/campaigns/new?appId=${appId}`} className="block mt-2 text-blue-600 hover:underline font-medium">
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
              <Link href={`/dashboard/v2/webhooks?appId=${appId}`} className="text-xs text-blue-600 hover:underline font-bold">View logs</Link>
            </CardHeader>
            <CardBody className="p-0">
              {webhookDeliveries.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {webhookDeliveries.map((delivery) => (
                    <div key={delivery.id} className="px-6 py-4 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${delivery.success ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="text-sm font-medium">{delivery.eventType}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[200px]">{delivery.url}</p>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-gray-400">{delivery.statusCode}</span>
                    </div>
                  ))}
                </div>
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
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.recentActivity.map((activity: any) => (
                    <div key={activity.id} className="flex items-start justify-between p-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge variant="default" size="sm">{activity.type}</Badge>
                    </div>
                  ))}
                </div>
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
