'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Users, Search, Filter, MoreHorizontal, TrendingUp, Mail, ExternalLink } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

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

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<PartnerData[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Partners</h1>
            <p className="text-gray-500 mt-1">Manage all platform partners and their subscriptions.</p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm">
            Invite Partner
          </button>
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
                <div className="text-2xl font-bold">85%</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Active Rate</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                <Mail size={20} />
              </div>
              <div>
                <div className="text-2xl font-bold">12</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Pending Invites</div>
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
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">Loading partners...</td>
                  </tr>
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
                          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
                            <ExternalLink size={16} />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <MoreHorizontal size={16} />
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
    </DashboardLayout>
  );
}

function CardBody({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return <div className={`p-6 ${className}`}>{children}</div>;
}
