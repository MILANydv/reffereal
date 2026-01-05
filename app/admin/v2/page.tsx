'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { useEffect, useState } from 'react';
import { Users, Building2, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';

interface AdminStats {
  totalPartners: number;
  totalApps: number;
  totalRevenue: number;
  totalApiCalls: number;
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
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="mt-2 text-gray-600">Platform-wide overview and management</p>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Subscriptions</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <div className="text-4xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</div>
                <p className="text-sm text-gray-600 mt-2">partners with active billing</p>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Alerts</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="text-center">
                <AlertTriangle size={32} className={`mx-auto mb-2 ${(stats?.unresolvedFraudFlags || 0) > 0 ? 'text-red-600' : 'text-gray-400'}`} />
                <div className="text-4xl font-bold text-gray-900">{stats?.unresolvedFraudFlags || 0}</div>
                <p className="text-sm text-gray-600 mt-2">unresolved flags</p>
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
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Company</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Plan</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentPartners.map((partner) => (
                      <tr key={partner.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">{partner.companyName || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{partner.userEmail}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{partner.planType}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
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
