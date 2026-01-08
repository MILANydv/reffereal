'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/store';
import { Plus, Search, Filter, MoreHorizontal, Megaphone, Users, MousePointerClick, CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Skeleton, CardSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';


export default function CampaignsPage() {
  const { selectedApp, campaigns, fetchCampaigns, isLoading } = useAppStore();


  useEffect(() => {
    if (selectedApp) {
      fetchCampaigns(selectedApp.id);
    }
  }, [selectedApp, fetchCampaigns]);

  const loading = isLoading[`campaigns-${selectedApp?.id}`];

  if (!selectedApp) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <Megaphone size={32} />
          </div>
          <h2 className="text-xl font-bold">No App Selected</h2>
          <p className="text-gray-500 mt-2">Please select an app from the switcher above to view campaigns.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Campaigns</h1>
            <p className="text-gray-500 mt-1">Create and manage referral campaigns for {selectedApp.name}.</p>
          </div>
          <Link
            href="/dashboard/v2/campaigns/new"
            className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
          >
            <Plus size={18} className="mr-2" />
            Create Campaign
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <Card>
                <CardBody className="p-4 flex items-center space-x-4">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <Megaphone size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{campaigns.length}</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Total Campaigns</div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4 flex items-center space-x-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                    <Users size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">
                      {campaigns?.reduce((acc, curr) => acc + (curr._count?.referrals || 0), 0) || 0}
                    </div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Total Referrals</div>
                  </div>
                </CardBody>
              </Card>
              <Card>
                <CardBody className="p-4 flex items-center space-x-4">
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                    <CheckCircle size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">124</div>
                    <div className="text-xs text-gray-500 uppercase font-semibold">Active Participants</div>
                  </div>
                </CardBody>
              </Card>
            </>
          )}
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <button className="flex items-center px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                <Filter size={16} className="mr-2" />
                Filter
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Name</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Reward</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Referrals</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-8 ml-auto" /></td>
                    </tr>
                  ))
                ) : campaigns.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-gray-500 mb-4">No campaigns found for this app.</div>
                      <Link
                        href="/dashboard/v2/campaigns/new"
                        className="text-blue-600 font-medium hover:underline"
                      >
                        Create your first campaign
                      </Link>
                    </td>
                  </tr>
                ) : (
                  campaigns.map((campaign) => (
                    <tr key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/v2/campaigns/${campaign.id}`} className="font-medium text-blue-600 hover:underline">
                          {campaign.name}
                        </Link>
                        {campaign.startDate && (
                          <div className="text-xs text-gray-500 mt-1">
                            Starts {new Date(campaign.startDate).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="capitalize">{campaign.referralType.toLowerCase().replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900 dark:text-gray-100">
                        {campaign.rewardModel === 'FIXED_CURRENCY' ? `$${campaign.rewardValue}` : `${campaign.rewardValue}%`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'default'}>
                          {campaign.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium">
                        {campaign._count.referrals}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
