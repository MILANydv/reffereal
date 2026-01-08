'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, Search, Filter, Edit, Trash2, Eye, TrendingUp, Mail } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeaderSkeleton, StatCardSkeleton, TableSkeleton, Skeleton } from '@/components/ui/Skeleton';

interface PartnerData {
  id: string;
  companyName: string | null;
  active: boolean;
  user: {
    email: string;
  };
  subscription: {
    plan: {
      type: string;
    };
  } | null;
  apps: Array<{
    currentUsage: number;
  }>;
  invoices: Array<{
    status: string;
    amount: number;
  }>;
  _count: {
    apps: number;
  };
}

interface ViewModalData extends PartnerData {
  apps: Array<{
    id: string;
    name: string;
    status: string;
    currentUsage: number;
    monthlyLimit: number;
  }>;
  invoices: Array<{
    id: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  _count: {
    apps: number;
    teamMembers: number;
  };
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewModal, setViewModal] = useState<ViewModalData | null>(null);
  const [editModal, setEditModal] = useState<PartnerData | null>(null);
  const [editFormData, setEditFormData] = useState({ companyName: '', active: true });

  const fetchPartners = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/partners');
      if (response.ok) {
        const data = await response.json();
        setPartners(data);
      }
    } catch (error) {
      console.error('Error fetching partners:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleView = async (partnerId: string) => {
    try {
      const response = await fetch(`/api/admin/partners?id=${partnerId}`);
      if (response.ok) {
        const data = await response.json();
        setViewModal(data);
      }
    } catch (error) {
      console.error('Error fetching partner details:', error);
    }
  };

  const handleEdit = (partner: PartnerData) => {
    setEditModal(partner);
    setEditFormData({
      companyName: partner.companyName || '',
      active: partner.active,
    });
  };

  const handleSaveEdit = async () => {
    if (!editModal) return;

    try {
      const response = await fetch('/api/admin/partners', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          partnerId: editModal.id,
          companyName: editFormData.companyName,
          active: editFormData.active,
        }),
      });

      if (response.ok) {
        setEditModal(null);
        fetchPartners();
      }
    } catch (error) {
      console.error('Error updating partner:', error);
    }
  };

  const handleDelete = async (partnerId: string, email: string) => {
    if (!confirm(`Are you sure you want to delete partner "${email}"? This action cannot be undone and will delete all associated data.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/partners?id=${partnerId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPartners();
      }
    } catch (error) {
      console.error('Error deleting partner:', error);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
            <p className="text-gray-500 mt-1">Manage all platform partners and their subscriptions.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardBody className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Users size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">{partners.length}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Total Partners</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                <TrendingUp size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {partners.filter(p => p.active).length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Active</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <Mail size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {partners.filter(p => !p.active).length}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Suspended</div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search partners..."
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
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Partner</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Plan</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Apps</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Usage</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Revenue</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : partners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">No partners found.</td>
                  </tr>
                ) : (
                  partners.map((partner) => (
                    <tr key={partner.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded flex items-center justify-center font-bold text-xs">
                            {partner.companyName?.charAt(0) || partner.user.email.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{partner.companyName || 'Unnamed Company'}</div>
                            <div className="text-xs text-gray-500">{partner.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="default">{partner.subscription?.plan?.type || 'FREE'}</Badge>
                      </td>
                      <td className="px-6 py-4 font-medium">{partner._count.apps}</td>
                      <td className="px-6 py-4 text-xs font-mono">
                        {partner.apps?.reduce((acc: number, app: { currentUsage: number }) => acc + (app.currentUsage || 0), 0).toLocaleString()} hits
                      </td>
                      <td className="px-6 py-4 font-medium">
                        ${partner.invoices?.reduce((acc: number, inv: { status: string, amount: number }) => acc + (inv.status === 'paid' ? (inv.amount || 0) : 0), 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={partner.active ? 'success' : 'error'}>
                          {partner.active ? 'ACTIVE' : 'SUSPENDED'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => handleView(partner.id)}
                            className="p-2 text-blue-600 hover:text-blue-700 transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleEdit(partner)}
                            className="p-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                            title="Edit Partner"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(partner.id, partner.user.email)}
                            className="p-2 text-red-600 hover:text-red-700 transition-colors"
                            title="Delete Partner"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {viewModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold">Partner Details</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Company Name</label>
                  <div className="text-lg font-medium">{viewModal.companyName || 'Not set'}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <div className="text-lg font-medium">{viewModal.user.email}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Plan</label>
                  <div><Badge variant="default">{viewModal.subscription?.plan?.type || 'FREE'}</Badge></div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <div><Badge variant={viewModal.active ? 'success' : 'error'}>{viewModal.active ? 'ACTIVE' : 'SUSPENDED'}</Badge></div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Total Apps</label>
                  <div className="text-lg font-medium">{viewModal._count.apps}</div>
                </div>
                <div>
                  <label className="text-sm text-gray-500">Team Members</label>
                  <div className="text-lg font-medium">{viewModal._count.teamMembers}</div>
                </div>
              </div>

              {viewModal.apps && viewModal.apps.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Applications</h3>
                  <div className="space-y-2">
                    {viewModal.apps.map(app => (
                      <div key={app.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-medium">{app.name}</div>
                          <div className="text-xs text-gray-500">{app.currentUsage} / {app.monthlyLimit} calls</div>
                        </div>
                        <Badge variant={app.status === 'ACTIVE' ? 'success' : 'error'}>{app.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {viewModal.invoices && viewModal.invoices.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Recent Invoices</h3>
                  <div className="space-y-2">
                    {viewModal.invoices.map(invoice => (
                      <div key={invoice.id} className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg flex justify-between items-center">
                        <div>
                          <div className="font-medium">${invoice.amount}</div>
                          <div className="text-xs text-gray-500">{new Date(invoice.createdAt).toLocaleDateString()}</div>
                        </div>
                        <Badge variant={invoice.status === 'paid' ? 'success' : invoice.status === 'pending' ? 'warning' : 'error'}>
                          {invoice.status.toUpperCase()}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end">
              <button
                onClick={() => setViewModal(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {editModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold">Edit Partner</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Company Name</label>
                <input
                  type="text"
                  value={editFormData.companyName}
                  onChange={(e) => setEditFormData({ ...editFormData, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={editFormData.active}
                    onChange={(e) => setEditFormData({ ...editFormData, active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">Active</span>
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-2">
              <button
                onClick={() => setEditModal(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

function CardBody({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
