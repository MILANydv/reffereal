'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ActionDropdown } from '@/components/ui/ActionDropdown';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { DateRangeFilter, DateRange } from '@/components/ui/DateRangeFilter';
import { useAppStore, Referral } from '@/lib/store';
import { Search, Filter, Download, UserPlus, ShieldAlert, MousePointerClick, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton, CardSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';

export default function ReferralsPage() {
  const { referrals, fetchReferrals, isLoading } = useAppStore();
  const router = useRouter();
  const loading = isLoading['referrals-platform'];
  const [markSuspiciousModal, setMarkSuspiciousModal] = useState<{ isOpen: boolean; referralId: string | null; referralCode: string }>({
    isOpen: false,
    referralId: null,
    referralCode: '',
  });
  const [isMarking, setIsMarking] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: null,
    endDate: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number; totalItems: number } | null>(null);
  const itemsPerPage = 25;

  useEffect(() => {
    loadReferrals();
  }, [currentPage, statusFilter, searchQuery, dateRange]);

  const loadReferrals = async () => {
    // Fetch platform-level referrals (no appId = all apps)
    const result = await fetchReferrals('platform', {
      page: currentPage,
      limit: itemsPerPage,
      status: statusFilter !== 'all' ? statusFilter : undefined,
      search: searchQuery || undefined,
      startDate: dateRange.startDate || undefined,
      endDate: dateRange.endDate || undefined,
    });
    if (result.pagination) {
      setPagination(result.pagination);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform Referrals</h1>
            <p className="text-gray-500 mt-1">Track and manage all referral instances across all your apps.</p>
          </div>
          <button className="flex items-center justify-center px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium text-sm">
            <Download size={18} className="mr-2" />
            Export CSV
          </button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by code or ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center space-x-2">
                <DateRangeFilter value={dateRange} onChange={setDateRange} presets={['7d', '30d', '90d', 'custom']} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="CLICKED">Clicked</option>
                <option value="CONVERTED">Converted</option>
                <option value="FLAGGED">Flagged</option>
              </select>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                  setDateRange({ startDate: null, endDate: null });
                  setCurrentPage(1);
                }}
              >
                Clear Filters
              </Button>
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
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
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
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      No referrals found for this app.
                    </td>
                  </tr>
                ) : (
                  referrals.map((referral: Referral) => (
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="font-medium">{referral.campaign?.name || 'Unknown Campaign'}</div>
                          {referral.campaign?.app && (
                            <div className="text-xs text-gray-500 mt-0.5">{referral.campaign.app.name}</div>
                          )}
                        </div>
                      </td>
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
                      <td className="px-6 py-4 text-right">
                        <ActionDropdown
                          onMarkSuspicious={() => {
                            setMarkSuspiciousModal({
                              isOpen: true,
                              referralId: referral.id,
                              referralCode: referral.referralCode,
                            });
                          }}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {!loading && pagination && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
              <div className="text-xs text-gray-500 font-medium">
                Showing {(pagination.page - 1) * itemsPerPage + 1} to {Math.min(pagination.page * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} referrals
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft size={16} />
                  Previous
                </Button>
                <div className="text-xs text-gray-500 font-medium">
                  Page {pagination.page} of {pagination.totalPages}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
                  disabled={currentPage === pagination.totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight size={16} />
                </Button>
              </div>
            </div>
          )}
        </Card>

        <ConfirmModal
          isOpen={markSuspiciousModal.isOpen}
          onClose={() => setMarkSuspiciousModal({ isOpen: false, referralId: null, referralCode: '' })}
          onConfirm={async () => {
            if (!markSuspiciousModal.referralId) return;
            setIsMarking(true);
              try {
              const response = await fetch(`/api/partner/referrals/${markSuspiciousModal.referralId}/flag`, {
                method: 'POST',
              });
              if (response.ok) {
                loadReferrals();
                setMarkSuspiciousModal({ isOpen: false, referralId: null, referralCode: '' });
              }
            } catch (error) {
              console.error('Error marking referral as suspicious:', error);
            } finally {
              setIsMarking(false);
            }
          }}
          title="Mark as Suspicious"
          message={`Are you sure you want to mark referral "${markSuspiciousModal.referralCode}" as suspicious? This will flag it for review.`}
          confirmText="Mark Suspicious"
          cancelText="Cancel"
          variant="warning"
          isLoading={isMarking}
        />
      </div>
    </DashboardLayout>
  );
}
