'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, Users, TrendingUp, DollarSign, ChevronRight, Filter } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';

interface UserSummary {
  userId: string;
  referralsMade: number;
  referralsConverted: number;
  rewardsEarned: number;
  appsUsed?: number;
  apps?: Array<{
    id: string;
    name: string;
    partnerId: string;
    partnerName: string;
  }>;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [appFilter, setAppFilter] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<{ page: number; totalPages: number; totalItems: number } | null>(null);
  const itemsPerPage = 25;

  useEffect(() => {
    loadUsers();
  }, [currentPage, searchQuery, appFilter, partnerFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
      });
      if (searchQuery) {
        params.append('search', searchQuery);
      }
      if (appFilter) {
        params.append('appId', appFilter);
      }
      if (partnerFilter) {
        params.append('partnerId', partnerFilter);
      }

      const response = await fetch(`/api/admin/users?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Users</h1>
            <p className="text-gray-500 mt-1">View referral statistics for all users across all apps and partners.</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-sm">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by user ID..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <input
                  type="text"
                  placeholder="App ID..."
                  value={appFilter}
                  onChange={(e) => {
                    setAppFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Partner ID..."
                  value={partnerFilter}
                  onChange={(e) => {
                    setPartnerFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3].map((i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No users found</h3>
              <p className="text-gray-500">No users have created referrals yet.</p>
            </div>
          ) : (
            <>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => router.push(`/admin/v2/users/${user.userId}`)}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{user.userId}</h3>
                          {user.appsUsed !== undefined && (
                            <Badge variant="info">{user.appsUsed} app{user.appsUsed !== 1 ? 's' : ''}</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{user.referralsMade} referrals</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <TrendingUp size={14} />
                            <span>{user.referralsConverted} converted</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign size={14} />
                            <span>${user.rewardsEarned.toFixed(2)} earned</span>
                          </div>
                        </div>
                        {user.apps && user.apps.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-2">
                            {user.apps.slice(0, 3).map((app) => (
                              <Badge key={app.id} variant="default" className="text-xs">
                                {app.name} ({app.partnerName})
                              </Badge>
                            ))}
                            {user.apps.length > 3 && (
                              <Badge variant="default" className="text-xs">
                                +{user.apps.length - 3} more
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight size={20} className="text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, pagination.totalItems)} of {pagination.totalItems} users
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
                      disabled={currentPage === pagination.totalPages}
                      className="px-3 py-1 text-sm border border-gray-200 dark:border-gray-800 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
