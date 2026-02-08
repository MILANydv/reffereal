'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DateRangeFilter, DateRange } from '@/components/ui/DateRangeFilter';
import { CreditCard, ChevronLeft, ChevronRight, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { useEffect, useState, useCallback } from 'react';
import { Skeleton } from '@/components/ui/Skeleton';
import { toast } from 'react-hot-toast';

type RewardStatus = 'PENDING' | 'APPROVED' | 'PAID' | 'CANCELLED';
type FulfillmentType = 'CASH' | 'STORE_CREDIT' | 'THIRD_PARTY_OFFER' | 'OTHER';

interface RewardRow {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: RewardStatus;
  level: number;
  paidAt: string | null;
  payoutReference: string | null;
  fulfillmentType: FulfillmentType | null;
  fulfillmentReference: string | null;
  createdAt: string;
  Referral: {
    referralCode: string;
    campaignId: string;
    Campaign: { name: string };
  };
  App: {
    id: string;
    name: string;
    Partner: { id: string; companyName: string | null };
  };
}

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<RewardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [userIdSearch, setUserIdSearch] = useState('');
  const [partnerIdFilter, setPartnerIdFilter] = useState('');
  const [appIdFilter, setAppIdFilter] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({ startDate: null, endDate: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number; totalItems: number; limit: number } | null>(null);
  const [markPaidModal, setMarkPaidModal] = useState<{ isOpen: boolean; reward: RewardRow | null }>({ isOpen: false, reward: null });
  const [payoutRef, setPayoutRef] = useState('');
  const [fulfillmentType, setFulfillmentType] = useState('');
  const [fulfillmentRef, setFulfillmentRef] = useState('');
  const [updating, setUpdating] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const itemsPerPage = 25;

  const loadRewards = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(currentPage));
      params.set('limit', String(itemsPerPage));
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (partnerIdFilter.trim()) params.set('partnerId', partnerIdFilter.trim());
      if (appIdFilter.trim()) params.set('appId', appIdFilter.trim());
      if (userIdSearch.trim()) params.set('userId', userIdSearch.trim());
      if (dateRange.startDate) params.set('startDate', dateRange.startDate);
      if (dateRange.endDate) params.set('endDate', dateRange.endDate);
      const res = await fetch(`/api/admin/rewards?${params}`);
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Request failed (${res.status})`);
      }
      const data = await res.json();
      setRewards(data.rewards ?? []);
      setPagination(data.pagination ?? null);
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load rewards';
      setLoadError(message);
      setRewards([]);
      setPagination(null);
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, userIdSearch, partnerIdFilter, appIdFilter, dateRange.startDate, dateRange.endDate]);

  useEffect(() => {
    loadRewards();
  }, [loadRewards]);

  const updateStatus = async (rewardId: string, status: RewardStatus, extra?: { payoutReference?: string; fulfillmentType?: string; fulfillmentReference?: string }) => {
    setUpdating(true);
    try {
      const res = await fetch(`/api/admin/rewards/${rewardId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, ...extra }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setMarkPaidModal({ isOpen: false, reward: null });
      setPayoutRef('');
      setFulfillmentType('');
      setFulfillmentRef('');
      toast.success(status === 'PAID' ? 'Reward marked as paid' : 'Reward approved');
      await loadRewards();
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to update reward';
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const statusVariant = (s: RewardStatus) =>
    s === 'PAID' ? 'success' : s === 'CANCELLED' ? 'error' : s === 'APPROVED' ? 'default' : 'warning';

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Rewards (Admin)</h1>
          <p className="text-gray-500 mt-1">View and manage all rewards across partners and apps.</p>
        </div>

        {loadError && (
          <div className="rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/10 px-4 py-3 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200">
              <AlertCircle size={20} aria-hidden />
              <span className="text-sm font-medium">{loadError}</span>
            </div>
            <Button variant="outline" size="sm" onClick={() => loadRewards()} className="flex items-center gap-2 shrink-0" aria-label="Retry loading rewards">
              <RefreshCw size={16} />
              Retry
            </Button>
          </div>
        )}

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="User ID..."
                  value={userIdSearch}
                  onChange={(e) => { setUserIdSearch(e.target.value); setCurrentPage(1); }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <input
                  type="text"
                  placeholder="Partner ID"
                  value={partnerIdFilter}
                  onChange={(e) => { setPartnerIdFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm w-40"
                />
                <input
                  type="text"
                  placeholder="App ID"
                  value={appIdFilter}
                  onChange={(e) => { setAppIdFilter(e.target.value); setCurrentPage(1); }}
                  className="px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm w-40"
                />
              </div>
              <DateRangeFilter value={dateRange} onChange={setDateRange} presets={['7d', '30d', '90d', 'custom']} />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <Button variant="ghost" onClick={() => { setUserIdSearch(''); setStatusFilter('all'); setPartnerIdFilter(''); setAppIdFilter(''); setDateRange({ startDate: null, endDate: null }); setCurrentPage(1); }}>
                Clear Filters
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Partner / App</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Referral Code</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">User ID</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Campaign</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Level</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Fulfillment</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Date</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-14" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-16 rounded-full" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4" />
                    </tr>
                  ))
                ) : rewards.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3 text-gray-500">
                        <CreditCard size={40} className="text-gray-300 dark:text-gray-600" aria-hidden />
                        <p className="font-medium">No rewards found</p>
                        <p className="text-sm max-w-sm">No rewards match your filters. Try adjusting filters or check partner apps for converted referrals.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rewards.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium">{r.App?.Partner?.companyName ?? '—'}</div>
                          <div className="text-xs text-gray-500">{r.App?.name}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-mono text-blue-600">{r.Referral?.referralCode ?? '—'}</td>
                      <td className="px-6 py-4">
                        <Link href={`/admin/v2/users/${r.userId}`} className="font-mono text-xs text-blue-600 hover:underline" onClick={(e) => e.stopPropagation()}>
                          {r.userId}
                        </Link>
                      </td>
                      <td className="px-6 py-4">{r.Referral?.Campaign?.name ?? '—'}</td>
                      <td className="px-6 py-4 font-medium">{r.currency} {r.amount}</td>
                      <td className="px-6 py-4">L{r.level}</td>
                      <td className="px-6 py-4">
                        <Badge variant={statusVariant(r.status)}>{r.status}</Badge>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {r.fulfillmentType ? (
                          <span className="text-gray-600 dark:text-gray-400">
                            {r.fulfillmentType}
                            {r.fulfillmentReference ? `: ${r.fulfillmentReference}` : ''}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td className="px-6 py-4 text-right">
                        {r.status === 'PENDING' && (
                          <>
                            <Button variant="ghost" size="sm" className="mr-1" onClick={() => updateStatus(r.id, 'APPROVED')} disabled={updating} aria-label={`Approve reward ${r.Referral?.referralCode ?? r.id}`}>Approve</Button>
                            <Button variant="ghost" size="sm" onClick={() => setMarkPaidModal({ isOpen: true, reward: r })} disabled={updating} aria-label={`Mark reward ${r.Referral?.referralCode ?? r.id} as paid`}>Mark paid</Button>
                          </>
                        )}
                        {r.status === 'APPROVED' && (
                          <Button variant="ghost" size="sm" onClick={() => setMarkPaidModal({ isOpen: true, reward: r })} disabled={updating} aria-label={`Mark reward ${r.Referral?.referralCode ?? r.id} as paid`}>Mark paid</Button>
                        )}
                        {r.status !== 'PENDING' && r.status !== 'APPROVED' && '—'}
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
                Showing {(pagination.page - 1) * pagination.limit + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of {pagination.totalItems} rewards
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft size={16} /> Previous</Button>
                <span className="text-xs text-gray-500">Page {pagination.page} of {pagination.totalPages}</span>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))} disabled={currentPage === pagination.totalPages}>Next <ChevronRight size={16} /></Button>
              </div>
            </div>
          )}
        </Card>

        {markPaidModal.isOpen && markPaidModal.reward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => !updating && setMarkPaidModal({ isOpen: false, reward: null })} role="presentation">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="admin-mark-paid-title">
              <h3 id="admin-mark-paid-title" className="text-lg font-semibold mb-4">Mark reward as paid</h3>
              <p className="text-sm text-gray-500 mb-4">Amount: {markPaidModal.reward.currency} {markPaidModal.reward.amount}</p>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Payout reference (optional)</label>
                  <input type="text" placeholder="e.g. Batch #123" value={payoutRef} onChange={(e) => setPayoutRef(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fulfillment type (optional)</label>
                  <select value={fulfillmentType} onChange={(e) => setFulfillmentType(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800">
                    <option value="">—</option>
                    <option value="CASH">Cash</option>
                    <option value="STORE_CREDIT">Store credit</option>
                    <option value="THIRD_PARTY_OFFER">Third-party offer</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Fulfillment reference (optional)</label>
                  <input type="text" placeholder="e.g. 10% Restaurant X" value={fulfillmentRef} onChange={(e) => setFulfillmentRef(e.target.value)} className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800" />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="ghost" onClick={() => setMarkPaidModal({ isOpen: false, reward: null })} disabled={updating}>Cancel</Button>
                <Button onClick={() => updateStatus(markPaidModal.reward.id, 'PAID', { payoutReference: payoutRef || undefined, fulfillmentType: fulfillmentType || undefined, fulfillmentReference: fulfillmentRef || undefined })} disabled={updating}>
                  {updating ? 'Saving…' : 'Mark paid'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
