'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';
import { Users, Building2, DollarSign, TrendingUp, AlertTriangle, Zap } from 'lucide-react';
import { PageHeaderSkeleton, StatCardSkeleton, CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

interface AdminStats {
  totalPartners: number;
  totalApps: number;
  totalRevenue: number;
  totalApiCalls: number;
  avgDailyCalls: number;
  totalAppsUsage: number;
  endpointUsage: Array<{ endpoint: string; count: number }>;
  activeSubscriptions: number;
  unresolvedFraudFlags: number;
  recentPartners: Array<{
    id: string;
    companyName: string;
    userEmail: string;
    planType: string;
    createdAt: string;
  }>;
}

export default function AdminV2Page() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton cols={4} rows={5} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Platform-wide overview and management</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Partners"
            value={stats?.totalPartners.toString() || '0'}
            icon={<Users size={24} />}
          />
          <StatCard
            title="Total Applications"
            value={stats?.totalApps.toString() || '0'}
            icon={<Building2 size={24} />}
          />
          <StatCard
            title="Monthly Revenue"
            value={`$${stats?.totalRevenue.toLocaleString() || '0'}`}
            icon={<DollarSign size={24} />}
          />
          <StatCard
            title="API Calls (30d)"
            value={stats?.totalApiCalls.toLocaleString() || '0'}
            icon={<TrendingUp size={24} />}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap size={18} className="mr-2 text-blue-500" />
                API Hit Rate
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                    {stats?.avgDailyCalls.toLocaleString() || 0}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">avg. calls / day</p>
                </div>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Top Endpoints</div>
                  <div className="space-y-2">
                    {stats?.endpointUsage.map((ep, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400 font-mono truncate max-w-[150px]">
                          {ep.endpoint}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium">
                          {ep.count.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats?.activeSubscriptions || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">partners with active billing</p>
                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-center text-sm text-gray-500">
                    <Building2 size={14} className="mr-1" />
                    {stats?.totalApps || 0} total apps
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle size={18} className="mr-2 text-red-500" />
                Fraud Alerts
              </CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <AlertTriangle size={32} className={`mx-auto mb-2 ${(stats?.unresolvedFraudFlags || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                <div className="text-4xl font-bold text-gray-900 dark:text-gray-100">{stats?.unresolvedFraudFlags || 0}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">unresolved flags</p>
                {(stats?.unresolvedFraudFlags || 0) > 0 && (
                  <Badge variant="error" size="sm" className="mt-2">Requires attention</Badge>
                )}
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Partners</CardTitle>
          </CardHeader>
          <CardBody>
            {stats?.recentPartners && stats.recentPartners.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPartners.map((partner) => (
                      <tr key={partner.id} className="border-b border-gray-100 dark:border-gray-800">
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{partner.companyName || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900 dark:text-gray-100">{partner.userEmail}</td>
                        <td className="py-3 px-4">
                          <Badge variant="default" size="sm">{partner.planType}</Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-400">
                          {new Date(partner.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No partners yet</p>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
