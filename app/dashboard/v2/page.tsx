'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { useEffect, useState } from 'react';
import { TrendingUp, Users, MousePointerClick, CheckCircle, DollarSign, AlertCircle, BarChart3, ArrowRight, Zap, Megaphone, Webhook } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Link from 'next/link';

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

const chartData = [
  { name: 'Jan', value: 400 },
  { name: 'Feb', value: 300 },
  { name: 'Mar', value: 600 },
  { name: 'Apr', value: 800 },
  { name: 'May', value: 500 },
  { name: 'Jun', value: 900 },
  { name: 'Jul', value: 1100 },
];

export default function DashboardV2Page() {
  const { selectedApp } = useAppStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, [selectedApp]);

  const loadDashboardStats = async () => {
    try {
      const url = selectedApp 
        ? `/api/partner/dashboard-stats?appId=${selectedApp.id}`
        : '/api/partner/dashboard-stats';
      const response = await fetch(url);
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
          <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
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
          <h1 className="text-3xl font-bold mb-2">Welcome to Referral Platform</h1>
          <p className="text-gray-500 max-w-md mb-8">Get started by creating your first application to manage your referral campaigns.</p>
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
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedApp ? `${selectedApp.name} Overview` : 'Global Dashboard'}
            </h1>
            <p className="text-gray-500 mt-1">
              {selectedApp ? 'Real-time performance for this application.' : 'Aggregated performance across all your applications.'}
            </p>
          </div>
          {selectedApp && (
            <div className="flex space-x-2">
               <Badge variant="success" className="h-6">Healthy</Badge>
               <span className="text-xs text-gray-400 mt-1 font-mono">v1.2.0</span>
            </div>
          )}
        </div>

        {stats?.alerts && stats.alerts.length > 0 && (
          <div className="space-y-2">
            {stats.alerts.map((alert) => (
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
            title={selectedApp ? "API Requests (30d)" : "Total Applications"}
            value={selectedApp ? (stats?.apiUsage.current.toLocaleString() || '0') : (stats?.totalApps.toString() || '0')}
            icon={selectedApp ? <Zap size={24} /> : <TrendingUp size={24} />}
            change="+12.5%"
          />
          <StatCard
            title="Referrals Created"
            value={stats?.totalReferrals.toLocaleString() || '0'}
            icon={<Users size={24} />}
            change="+15.2%"
          />
          <StatCard
            title="Conversions"
            value={stats?.totalConversions.toLocaleString() || '0'}
            icon={<CheckCircle size={24} />}
            change="+8.3%"
          />
          <StatCard
            title="Revenue Attributed"
            value={`${(stats?.totalConversions ? stats.totalConversions * 45 : 0).toLocaleString()}`}
            icon={<DollarSign size={24} />}
            change="+24%"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">API Usage Chart</CardTitle>
              <select className="bg-transparent text-sm font-medium text-gray-500 outline-none">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
              </select>
            </CardHeader>
            <CardBody>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
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
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm">Summer Promo {i}</span>
                      <Badge variant="success" size="sm">Active</Badge>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Users size={12} className="mr-1" /> 124 referrals
                      <span className="mx-2">•</span>
                      <DollarSign size={12} className="mr-1" /> $1.2k reward cost
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-900/50">
                <Link href="/dashboard/v2/campaigns" className="text-xs font-bold text-blue-600 hover:underline flex items-center justify-center">
                  View all campaigns <ArrowRight size={14} className="ml-1" />
                </Link>
              </div>
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
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${i % 3 === 0 ? 'bg-red-500' : 'bg-green-500'}`} />
                      <div>
                        <p className="text-sm font-medium">referral.converted</p>
                        <p className="text-xs text-gray-500">https://api.myapp.com/webhooks</p>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-gray-400">{i % 3 === 0 ? '500' : '200'} OK</span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardBody className="p-0">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {stats.recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start justify-between p-4 px-6">
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                      </div>
                      <Badge variant="secondary" size="sm">{activity.type}</Badge>
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
