'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, MousePointerClick, CheckCircle, DollarSign, AlertCircle } from 'lucide-react';

interface DashboardStats {
  totalApps: number;
  totalReferrals: number;
  totalClicks: number;
  totalConversions: number;
  totalRewards: number;
  apiUsage: {
    current: number;
    limit: number;
    percentage: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
  alerts: Array<{
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
  }>;
}

export default function DashboardV2Page() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/partner/dashboard-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here&apos;s what&apos;s happening with your referral platform.</p>
        </div>

        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="space-y-2">
            {stats.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-lg border flex items-start ${
                  alert.type === 'error'
                    ? 'bg-red-50 border-red-200 text-red-800'
                    : alert.type === 'warning'
                    ? 'bg-yellow-50 border-yellow-200 text-yellow-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <AlertCircle size={20} className="mr-3 mt-0.5" />
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Applications"
            value={stats?.totalApps.toString() || '0'}
            icon={<TrendingUp size={24} />}
            change="+2 this month"
          />
          <StatCard
            title="Total Referrals"
            value={stats?.totalReferrals.toLocaleString() || '0'}
            icon={<Users size={24} />}
            change="+12.5% from last month"
          />
          <StatCard
            title="Total Clicks"
            value={stats?.totalClicks.toLocaleString() || '0'}
            icon={<MousePointerClick size={24} />}
            change="+8.3% from last month"
          />
          <StatCard
            title="Total Conversions"
            value={stats?.totalConversions.toLocaleString() || '0'}
            icon={<CheckCircle size={24} />}
            change="+5.7% from last month"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>API Usage</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Monthly Usage</span>
                  <span className="text-sm font-medium text-gray-900">
                    {stats?.apiUsage.current.toLocaleString()} / {stats?.apiUsage.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      (stats?.apiUsage.percentage || 0) >= 80
                        ? 'bg-red-600'
                        : (stats?.apiUsage.percentage || 0) >= 60
                        ? 'bg-yellow-600'
                        : 'bg-blue-600'
                    }`}
                    style={{ width: `${Math.min(stats?.apiUsage.percentage || 0, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  {stats?.apiUsage.percentage.toFixed(1)}% of monthly limit used
                </p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Total Rewards Distributed</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-2">
                    <DollarSign size={32} className="text-green-600" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900">
                    ${stats?.totalRewards.toLocaleString() || '0'}
                  </div>
                  <p className="text-sm text-gray-600 mt-2">Lifetime total</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardBody>
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start justify-between py-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                    </div>
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{activity.type}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No recent activity</p>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
