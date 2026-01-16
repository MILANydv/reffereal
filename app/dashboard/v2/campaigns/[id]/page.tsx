'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Megaphone, Settings, Gift, Shield, BarChart3, Edit3, Trash2, Calendar, Users, MousePointerClick, CheckCircle, TrendingUp, DollarSign } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeaderSkeleton, StatCardSkeleton, CardSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

interface CampaignData {
  id: string;
  name: string;
  status: string;
  referralType: string;
  rewardModel: string;
  rewardValue: number;
  rewardCap?: number | null;
  startDate: string | null;
  endDate: string | null;
  app: {
    id: string;
    name: string;
  };
  _count: {
    referrals: number;
  };
  analytics?: {
    totalReferrals: number;
    totalClicks: number;
    totalConversions: number;
    clickRate: number;
    conversionRate: number;
    totalRewardValue: number;
    averageReward: number;
    revenue: number;
  };
  recentReferrals?: Array<{
    id: string;
    referralCode: string;
    referrerId: string | null;
    status: string;
    clickedAt: string | null;
    convertedAt: string | null;
    rewardAmount: number | null;
    createdAt: string;
  }>;
  dailyStats?: Array<{
    date: string;
    referrals: number;
    conversions: number;
  }>;
}

export default function CampaignDetailPage() {
  const { selectedApp } = useAppStore();
  const router = useRouter();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaign = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/partner/campaigns/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      } else {
        console.error('Failed to fetch campaign');
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <div className="flex space-x-8 border-b border-gray-200 dark:border-gray-800 pb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CardSkeleton />
              <CardSkeleton />
            </div>
            <CardSkeleton />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Campaign not found</h2>
          <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Megaphone size={18} /> },
    { id: 'performance', name: 'Performance', icon: <BarChart3 size={18} /> },
    { id: 'referrals', name: 'Referrals', icon: <Users size={18} /> },
  ];

  const analytics = campaign.analytics || {
    totalReferrals: campaign._count?.referrals || 0,
    totalClicks: 0,
    totalConversions: 0,
    clickRate: 0,
    conversionRate: 0,
    totalRewardValue: 0,
    averageReward: 0,
    revenue: 0,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
                <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'default'}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Campaign ID: {campaign.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium text-sm">
              <Edit3 size={18} className="mr-2" />
              Edit
            </button>
            <button className="flex items-center px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium text-sm">
              <Trash2 size={18} className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="lg:col-span-2 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardBody className="p-6">
                      <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total Referrals</div>
                      <div className="text-3xl font-bold">{analytics.totalReferrals.toLocaleString()}</div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="p-6">
                      <div className="text-gray-500 text-xs font-bold uppercase mb-2">Total Clicks</div>
                      <div className="text-3xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody className="p-6">
                      <div className="text-gray-500 text-xs font-bold uppercase mb-2">Conversions</div>
                      <div className="text-3xl font-bold">{analytics.totalConversions.toLocaleString()}</div>
                    </CardBody>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Referrals</CardTitle>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {campaign.recentReferrals && campaign.recentReferrals.length > 0 ? (
                        campaign.recentReferrals.map((referral) => (
                          <div key={referral.id} className="px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">
                                {referral.referrerId?.charAt(0).toUpperCase() || 'U'}
                              </div>
                              <div>
                                <p className="text-sm font-medium font-mono">{referral.referralCode}</p>
                                <p className="text-xs text-gray-500">
                                  {referral.referrerId || 'Anonymous'} • {new Date(referral.createdAt).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                referral.status === 'CONVERTED' ? 'success' :
                                referral.status === 'CLICKED' ? 'default' : 'default'
                              }>
                                {referral.status}
                              </Badge>
                              {referral.rewardAmount && (
                                <span className="text-sm font-semibold text-green-600">
                                  ${referral.rewardAmount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-6 py-12 text-center text-gray-500">
                          No referrals yet
                        </div>
                      )}
                    </div>
                  </CardBody>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium capitalize">{campaign.referralType.toLowerCase().replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Reward Model</span>
                      <span className="font-medium capitalize">{campaign.rewardModel.toLowerCase().replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Reward Value</span>
                      <span className="font-bold">
                        {campaign.rewardModel === 'FIXED_CURRENCY' ? `$${campaign.rewardValue}` : `${campaign.rewardValue}%`}
                      </span>
                    </div>
                    {campaign.rewardCap && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-500">Reward Cap</span>
                        <span className="font-medium">${campaign.rewardCap}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center text-xs text-gray-500 font-bold uppercase mb-2">
                        <Calendar size={14} className="mr-1" /> Active Dates
                      </div>
                      <p className="text-sm">
                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Indefinite'}
                        {' — '}
                        {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Indefinite'}
                      </p>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Metrics</CardTitle>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Click Rate</span>
                      <span className="text-lg font-bold">{analytics.clickRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Conversion Rate</span>
                      <span className="text-lg font-bold">{analytics.conversionRate.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Avg Reward</span>
                      <span className="text-lg font-bold">${analytics.averageReward.toFixed(2)}</span>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Total Revenue</span>
                        <span className="text-lg font-bold text-green-600">${analytics.revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-gray-500">Total Rewards</span>
                        <span className="text-lg font-bold text-red-600">${analytics.totalRewardValue.toFixed(2)}</span>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardBody className="p-6">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Clicks</div>
                    <div className="text-2xl font-bold">{analytics.totalClicks.toLocaleString()}</div>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="p-6">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Conversions</div>
                    <div className="text-2xl font-bold">{analytics.totalConversions.toLocaleString()}</div>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="p-6">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Conversion Rate</div>
                    <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
                  </CardBody>
                </Card>
                <Card>
                  <CardBody className="p-6">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Revenue</div>
                    <div className="text-2xl font-bold text-green-600">${analytics.revenue.toLocaleString()}</div>
                  </CardBody>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Performance Over Time (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardBody>
                  {campaign.dailyStats && campaign.dailyStats.length > 0 ? (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={campaign.dailyStats}>
                          <defs>
                            <linearGradient id="colorReferrals" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                          <Legend />
                          <Area type="monotone" dataKey="referrals" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorReferrals)" name="Referrals" />
                          <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorConversions)" name="Conversions" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
                      <div className="text-center">
                        <BarChart3 className="mx-auto text-gray-400 mb-2" size={32} />
                        <p className="text-sm text-gray-500">No performance data yet</p>
                      </div>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
          )}

          {activeTab === 'referrals' && (
            <Card className="animate-in fade-in duration-300">
              <CardHeader>
                <CardTitle>All Referrals</CardTitle>
              </CardHeader>
              <CardBody className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Referral Code</th>
                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Referrer</th>
                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Reward</th>
                        <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Created</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {campaign.recentReferrals && campaign.recentReferrals.length > 0 ? (
                        campaign.recentReferrals.map((referral) => (
                          <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs">{referral.referralCode}</td>
                            <td className="px-6 py-4">{referral.referrerId || 'Anonymous'}</td>
                            <td className="px-6 py-4">
                              <Badge variant={
                                referral.status === 'CONVERTED' ? 'success' :
                                referral.status === 'CLICKED' ? 'default' : 'default'
                              }>
                                {referral.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4">
                              {referral.rewardAmount ? `$${referral.rewardAmount.toFixed(2)}` : '-'}
                            </td>
                            <td className="px-6 py-4 text-gray-500 text-xs">
                              {new Date(referral.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                            No referrals found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
