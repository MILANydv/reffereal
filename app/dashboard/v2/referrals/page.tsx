'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/store';
import { Search, Filter, Download, UserPlus, ShieldAlert, MousePointerClick, CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { Skeleton, CardSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';

interface Referral {
  id: string;
  referralCode: string;
  referrerId: string;
  status: string;
  clickedAt: string | null;
  convertedAt: string | null;
  rewardAmount: number | null;
  isFlagged: boolean;
  createdAt: string;
  campaign: {
    name: string;
  };
}

export default function ReferralsPage() {
  const { selectedApp, referrals, fetchReferrals, isLoading } = useAppStore();
  const loading = isLoading[`referrals-${selectedApp?.id}`];

  useEffect(() => {
    if (selectedApp) {
      fetchReferrals(selectedApp.id);
    }
  }, [selectedApp, fetchReferrals]);

  if (!selectedApp) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <UserPlus size={32} />
          </div>
          <h2 className="text-xl font-bold">No App Selected</h2>
          <p className="text-gray-500 mt-2">Please select an app from the switcher above to view referrals.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Referrals</h1>
            <p className="text-gray-500 mt-1">Track and manage individual referral instances.</p>
          </div>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium text-sm">
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by code or ID..."
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
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Referral Code</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Referrer ID</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Campaign</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Reward</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Activity</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24 font-mono" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32 font-mono" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4 whitespace-nowrap"><Skeleton className="h-4 w-20" /></td>
                    </tr>
                  ))
                ) : referrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No referrals found for this app.
                    </td>
                  </tr>
                ) : (
                  referrals.map((referral: any) => (
                    <tr key={referral.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors group">
                      <td className="px-6 py-4 font-mono font-medium text-blue-600">
                        <div className="flex items-center">
                          {referral.referralCode}
                          {referral.isFlagged && (
                            <ShieldAlert size={14} className="ml-2 text-red-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs">{referral.referrerId}</td>
                      <td className="px-6 py-4 whitespace-nowrap">{referral.campaign.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            referral.status === 'CONVERTED' ? 'success' :
                              referral.status === 'FLAGGED' ? 'error' :
                                referral.status === 'PENDING' ? 'warning' : 'default'
                          }
                        >
                          {referral.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {referral.rewardAmount ? `$${referral.rewardAmount}` : '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3 text-gray-400">
                          <MousePointerClick
                            size={16}
                            className={referral.clickedAt ? 'text-blue-500' : ''}
                          />
                          <CheckCircle
                            size={16}
                            className={referral.convertedAt ? 'text-green-500' : ''}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(referral.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
            <div className="text-xs text-gray-500 font-medium">
              Showing {referrals.length} referrals
            </div>
            <div className="flex items-center space-x-2">
              <button disabled className="px-3 py-1.5 rounded bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400">Previous</button>
              <button disabled className="px-3 py-1.5 rounded bg-white dark:bg-black border border-gray-200 dark:border-gray-800 text-xs font-bold text-gray-400">Next</button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
