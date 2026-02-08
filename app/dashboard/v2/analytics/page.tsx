'use client';

import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { BarChart3, TrendingUp, DollarSign, Download, Calendar } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { useEffect, useState } from 'react';
import { PageHeaderSkeleton, StatCardSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface AnalyticsData {
  appId: string;
  appName: string;
  appTotals: {
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    totalRewardValue: number;
    clickRate: number;
    conversionRate: number;
  };
  campaigns: Array<{
    campaignId: string;
    campaignName: string;
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    clickRate: number;
    conversionRate: number;
  }>;
}

export default function AnalyticsPage() {
  const searchParams = useSearchParams();
  const appIdFromUrl = searchParams.get('appId');
  const { selectedApp, apps, analytics, fetchAnalytics, setSelectedApp, isLoading } = useAppStore();
  const effectiveAppId = appIdFromUrl || selectedApp?.id;
  const loading = isLoading[`analytics-${effectiveAppId}`];

  useEffect(() => {
    if (appIdFromUrl && apps.length > 0 && selectedApp?.id !== appIdFromUrl) {
      const app = apps.find((a) => a.id === appIdFromUrl);
      if (app) setSelectedApp(app);
    }
  }, [appIdFromUrl, apps, selectedApp?.id, setSelectedApp]);

  useEffect(() => {
    if (effectiveAppId) {
      fetchAnalytics(effectiveAppId);
    }
  }, [effectiveAppId, fetchAnalytics]);

  if (!effectiveAppId) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <BarChart3 size={32} />
          </div>
          <h2 className="text-xl font-bold">No App Selected</h2>
          <p className="text-gray-500 mt-2">Please select an app to view analytics.</p>
        </div>
      </DashboardLayout>
    );
  }

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totals = analytics?.appTotals || {
    totalReferrals: 0,
    totalClicks: 0,
    totalConversions: 0,
    totalRewardValue: 0,
    clickRate: 0,
    conversionRate: 0,
  };

  const estimatedRevenue = totals.totalConversions * 45;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-gray-500 mt-1">Detailed performance metrics for {selectedApp.name}.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <Calendar size={16} className="mr-2" />
              Last 30 Days
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              <Download size={18} className="mr-2" />
              Export Reports
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Referrals</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{totals.totalReferrals.toLocaleString()}</div>
                <div className="text-green-600 text-xs font-bold flex items-center mb-1">
                  <TrendingUp size={12} className="mr-0.5" /> {totals.clickRate?.toFixed(1) || '0'}%
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Conversion Rate</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">{totals.conversionRate?.toFixed(1) || '0'}%</div>
                <div className="text-green-600 text-xs font-bold flex items-center mb-1">
                  <TrendingUp size={12} className="mr-0.5" /> {totals.totalConversions}
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Revenue</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">${estimatedRevenue.toLocaleString()}</div>
                <div className="text-green-600 text-xs font-bold flex items-center mb-1">
                  <TrendingUp size={12} className="mr-0.5" /> {totals.totalConversions}
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Reward Cost</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">${totals.totalRewardValue?.toLocaleString() || '0'}</div>
                <div className="text-amber-600 text-xs font-bold flex items-center mb-1">
                  <DollarSign size={12} className="mr-0.5" /> Cost
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Campaign Performance</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.campaigns || []}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="campaignName" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9ca3af' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="totalClicks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="totalConversions" fill="#10b981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referral Status Distribution</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Converted', value: totals.totalConversions || 1 },
                        { name: 'Clicked', value: Math.max(0, totals.totalClicks - totals.totalConversions) || 1 },
                        { name: 'Pending', value: Math.max(0, totals.totalReferrals - totals.totalClicks) || 1 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Converted', value: totals.totalConversions },
                        { name: 'Clicked', value: totals.totalClicks - totals.totalConversions },
                        { name: 'Pending', value: totals.totalReferrals - totals.totalClicks },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                    <span className="text-gray-500">Converted</span>
                  </div>
                  <span className="font-bold">{totals.totalReferrals > 0 ? ((totals.totalConversions / totals.totalReferrals) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <span className="text-gray-500">Clicked</span>
                  </div>
                  <span className="font-bold">{totals.totalReferrals > 0 ? (((totals.totalClicks - totals.totalConversions) / totals.totalReferrals) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                    <span className="text-gray-500">Pending</span>
                  </div>
                  <span className="font-bold">{totals.totalReferrals > 0 ? (((totals.totalReferrals - totals.totalClicks) / totals.totalReferrals) * 100).toFixed(1) : 0}%</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
