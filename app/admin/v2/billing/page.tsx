'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DollarSign, TrendingUp, FileText, AlertCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeaderSkeleton, StatCardSkeleton, CardSkeleton, TableSkeleton } from '@/components/ui/Skeleton';

import { useAdminStore } from '@/lib/store';

export default function AdminBillingPage() {
  const { billing: data, fetchBilling, isLoading } = useAdminStore();
  const loading = isLoading['billing'];

  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <TableSkeleton cols={6} rows={5} />
          <TableSkeleton cols={5} rows={5} />
        </div>
      </DashboardLayout>
    );
  }

  if (!data) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl text-gray-500 dark:text-gray-400">Failed to load billing data</div>
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success" size="sm">PAID</Badge>;
      case 'pending':
        return <Badge variant="warning" size="sm">PENDING</Badge>;
      case 'failed':
        return <Badge variant="error" size="sm">FAILED</Badge>;
      default:
        return <Badge variant="default" size="sm">{status.toUpperCase()}</Badge>;
    }
  };

  const getSubscriptionStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="success" size="sm">ACTIVE</Badge>;
      case 'PAST_DUE':
        return <Badge variant="warning" size="sm">PAST DUE</Badge>;
      case 'CANCELED':
        return <Badge variant="error" size="sm">CANCELED</Badge>;
      case 'TRIALING':
        return <Badge variant="info" size="sm">TRIAL</Badge>;
      default:
        return <Badge variant="default" size="sm">{status}</Badge>;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Billing & Payments</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track revenue, invoices, and payment activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                <DollarSign size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${(data.paidRevenue ?? 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Paid Revenue</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <TrendingUp size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${(data.monthlyRecurringRevenue ?? 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">MRR</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                <FileText size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {data.pendingInvoices ?? 0}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Pending Invoices</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                <AlertCircle size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  ${(data.totalOverage ?? 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Total Overage</div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Subscriptions by Plan</h2>
            </div>
            <CardBody className="p-6">
              <div className="space-y-4">
                {Object.entries(data.subscriptionByPlan || {}).map(([plan, count]: [string, any]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge variant="default">{plan}</Badge>
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>

          <Card>
            <div className="p-4 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-lg font-semibold">Revenue Breakdown</h2>
            </div>
            <CardBody className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Revenue</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    ${(data.totalRevenue ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Paid</span>
                  <span className="text-xl font-bold text-green-600">
                    ${(data.paidRevenue ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pending</span>
                  <span className="text-xl font-bold text-yellow-600">
                    ${(data.pendingRevenue ?? 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Overage Fees</span>
                  <span className="text-xl font-bold text-orange-600">
                    ${(data.totalOverage ?? 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <Card>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Recent Invoices</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Partner</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Amount</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">API Usage</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Overage</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Period</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data.invoices ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                ) : (
                  (data.invoices ?? []).map((invoice: any) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {invoice.Partner?.companyName || 'Unnamed Partner'}
                        </div>
                        <div className="text-xs text-gray-500">{invoice.Partner?.User?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-100">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{invoice.apiUsage.toLocaleString()}</td>
                      <td className="px-6 py-3 text-orange-600 font-medium">
                        ${invoice.overageAmount.toLocaleString()}
                      </td>
                      <td className="px-6 py-3">{getStatusBadge(invoice.status)}</td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {new Date(invoice.billingPeriodStart).toLocaleDateString()} -{' '}
                        {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <h2 className="text-lg font-semibold">Active Subscriptions</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Partner</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Plan</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Price</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Period End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {(data.subscriptions ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No subscriptions found
                    </td>
                  </tr>
                ) : (
                  (data.subscriptions ?? []).map((sub: any) => (
                    <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-3">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {sub.Partner?.companyName || 'Unnamed Partner'}
                        </div>
                        <div className="text-xs text-gray-500">{sub.Partner?.User?.email || 'No email'}</div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="default">{sub.PricingPlan?.type || 'FREE'}</Badge>
                      </td>
                      <td className="px-6 py-3 font-semibold text-gray-900 dark:text-gray-100">
                        ${sub.PricingPlan?.monthlyPrice || 0}/mo
                      </td>
                      <td className="px-6 py-3">{getSubscriptionStatusBadge(sub.status)}</td>
                      <td className="px-6 py-3 text-xs text-gray-500">
                        {new Date(sub.currentPeriodEnd).toLocaleDateString()}
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
