'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ArrowLeft, Users, TrendingUp, DollarSign, Gift, Code, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeaderSkeleton, StatCardSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

interface UserStats {
  userId: string;
  referralsMade: {
    total: number;
    clicked: number;
    converted: number;
  };
  referralsReceived: {
    total: number;
    referrerId: string;
    referralCode: string;
    campaignId: string;
    campaignName: string;
    appId: string;
    appName: string;
    partnerId: string;
    partnerName: string;
    converted: boolean;
    receivedAt: string;
  } | null;
  rewardsEarned: {
    total: number;
    pending: number;
    paid: number;
  };
  referralCodesGenerated: Array<{
    referralCode: string;
    campaignId: string;
    campaignName: string;
    appId: string;
    appName: string;
    partnerId: string;
    partnerName: string;
    status: string;
    createdAt: string;
    clicks: number;
    conversions: number;
    rewardAmount: number;
  }>;
  referralCodesUsed: Array<{
    referralCode: string;
    referrerId: string;
    campaignId: string;
    campaignName: string;
    appId: string;
    appName: string;
    partnerId: string;
    partnerName: string;
    status: string;
    usedAt: string;
    rewardEarned: number;
  }>;
}

export default function AdminUserDetailPage() {
  const router = useRouter();
  const { userId } = useParams();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [appFilter, setAppFilter] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');

  useEffect(() => {
    loadUserStats();
  }, [userId, appFilter, partnerFilter]);

  const loadUserStats = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (appFilter) {
        params.append('appId', appFilter);
      }
      if (partnerFilter) {
        params.append('partnerId', partnerFilter);
      }
      const response = await fetch(`/api/admin/users/${userId}/stats?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
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
          <CardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-gray-500">User not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold tracking-tight">User: {stats.userId}</h1>
            <p className="text-gray-500 mt-1">Detailed referral statistics across all apps and partners</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Filter by App ID..."
              value={appFilter}
              onChange={(e) => setAppFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Filter by Partner ID..."
              value={partnerFilter}
              onChange={(e) => setPartnerFilter(e.target.value)}
              className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Referrals Made</p>
                <Users size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.referralsMade.total}</p>
              <p className="text-sm text-gray-500 mt-1">
                {stats.referralsMade.converted} converted
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Click Rate</p>
                <TrendingUp size={20} className="text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.referralsMade.total > 0
                  ? ((stats.referralsMade.clicked / stats.referralsMade.total) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">{stats.referralsMade.clicked} clicked</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Conversion Rate</p>
                <CheckCircle size={20} className="text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {stats.referralsMade.clicked > 0
                  ? ((stats.referralsMade.converted / stats.referralsMade.clicked) * 100).toFixed(1)
                  : 0}%
              </p>
              <p className="text-sm text-gray-500 mt-1">{stats.referralsMade.converted} converted</p>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Rewards Earned</p>
                <DollarSign size={20} className="text-yellow-600 dark:text-yellow-400" />
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                ${stats.rewardsEarned.total.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                ${stats.rewardsEarned.pending.toFixed(2)} pending
              </p>
            </CardBody>
          </Card>
        </div>

        {stats.referralsReceived && (
          <Card>
            <CardHeader>
              <CardTitle>Referral Received</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="space-y-2">
                <p>
                  <span className="font-medium">Referred by:</span> {stats.referralsReceived.referrerId}
                </p>
                <p>
                  <span className="font-medium">Referral Code:</span>{' '}
                  <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{stats.referralsReceived.referralCode}</code>
                </p>
                <p>
                  <span className="font-medium">Campaign:</span> {stats.referralsReceived.campaignName}
                </p>
                <p>
                  <span className="font-medium">App:</span> {stats.referralsReceived.appName} ({stats.referralsReceived.partnerName})
                </p>
                <Badge variant={stats.referralsReceived.converted ? 'success' : 'default'}>
                  {stats.referralsReceived.converted ? 'Converted' : 'Pending'}
                </Badge>
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Referral Codes Generated</CardTitle>
          </CardHeader>
          <CardBody>
            {stats.referralCodesGenerated.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No referral codes generated yet</p>
            ) : (
              <div className="space-y-4">
                {stats.referralCodesGenerated.map((code) => (
                  <div
                    key={code.referralCode}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Code size={16} className="text-gray-400" />
                        <code className="font-mono text-sm font-semibold">{code.referralCode}</code>
                        <Badge variant={code.status === 'CONVERTED' ? 'success' : code.status === 'CLICKED' ? 'info' : 'default'}>
                          {code.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(code.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Campaign</p>
                        <p className="font-medium">{code.campaignName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">App</p>
                        <p className="font-medium">{code.appName}</p>
                        <p className="text-xs text-gray-400">{code.partnerName}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Clicks</p>
                        <p className="font-medium">{code.clicks}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Conversions</p>
                        <p className="font-medium">{code.conversions}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reward</p>
                        <p className="font-medium">${code.rewardAmount.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referral Codes Used</CardTitle>
          </CardHeader>
          <CardBody>
            {stats.referralCodesUsed.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No referral codes used yet</p>
            ) : (
              <div className="space-y-4">
                {stats.referralCodesUsed.map((code) => (
                  <div
                    key={code.referralCode}
                    className="p-4 border border-gray-200 dark:border-gray-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Gift size={16} className="text-gray-400" />
                        <code className="font-mono text-sm font-semibold">{code.referralCode}</code>
                        <Badge variant={code.status === 'CONVERTED' ? 'success' : code.status === 'CLICKED' ? 'info' : 'default'}>
                          {code.status}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(code.usedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 text-sm">
                      <div>
                        <p className="text-gray-500">Referred by</p>
                        <p className="font-medium">{code.referrerId}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Campaign</p>
                        <p className="font-medium">{code.campaignName}</p>
                        <p className="text-xs text-gray-400">{code.appName} ({code.partnerName})</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Reward Earned</p>
                        <p className="font-medium">${code.rewardEarned.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
