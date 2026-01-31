'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ShieldAlert, Search, Filter, AlertTriangle, CheckCircle, XCircle, Info, ExternalLink } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeaderSkeleton, StatCardSkeleton, TableSkeleton, Skeleton } from '@/components/ui/Skeleton';

import { useAdminStore } from '@/lib/store';

export default function AdminFraudPage() {
  const { fraud: flags, fetchFraud: fetchFlags, isLoading } = useAdminStore();
  const loading = isLoading['fraud'];

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Fraud & Abuse</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Review and resolve suspicious activities across all partners.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Unresolved Flags</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{flags.filter((f: any) => !f.isResolved).length}</div>
            </CardBody>
          </Card>
          <Card className="border-l-4 border-l-orange-500">
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Manual Flags</div>
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">{flags.filter((f: any) => f.isManual && !f.isResolved).length}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Partner flagged</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Auto-Detected</div>
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{flags.filter((f: any) => !f.isManual && !f.isResolved).length}</div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider mb-1">Resolved (30d)</div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{flags.filter((f: any) => f.isResolved).length}</div>
            </CardBody>
          </Card>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative max-w-sm flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by app, code or IP..."
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
                <button className="px-3 py-1 text-xs font-bold rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 shadow-sm">All</button>
                <button className="px-3 py-1 text-xs font-bold rounded-md text-gray-500 dark:text-gray-400">Unresolved</button>
              </div>
            </div>
            <button className="flex items-center px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <Filter size={16} className="mr-2" />
              More Filters
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Type</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Application</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Details</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-32" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-48" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : flags.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">No fraud flags detected.</td></tr>
                ) : (
                  flags.map((flag: any) => (
                    <tr 
                      key={flag.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors ${
                        flag.isManual ? 'bg-orange-50 dark:bg-orange-900/10 border-l-4 border-l-orange-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {flag.isManual ? (
                            <ShieldAlert size={16} className="mr-2 text-orange-500" />
                          ) : (
                            <AlertTriangle size={16} className="mr-2 text-red-500" />
                          )}
                          <span className="font-medium capitalize">
                            {flag.fraudType.toLowerCase().replace('_', ' ')}
                            {flag.isManual && <span className="ml-2 text-xs text-orange-600 dark:text-orange-400">(Manual)</span>}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-900 dark:text-gray-100 font-medium">{flag.App?.name || 'Unknown App'}</div>
                        <div className="text-xs text-gray-500 font-mono">ID: {flag.appId}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">{flag.description}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          Code: <span className="font-mono">{flag.referralCode}</span>
                          {flag.isManual && flag.App?.Partner?.User && (
                            <span className="ml-2 text-orange-600 dark:text-orange-400">
                              • Flagged by: {flag.App?.Partner?.User?.name || flag.App?.Partner?.User?.email}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {flag.isResolved ? (
                          <Badge variant="success">RESOLVED</Badge>
                        ) : (
                          <Badge variant="error">PENDING</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {!flag.isResolved && (
                            <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Resolve">
                              <CheckCircle size={18} />
                            </button>
                          )}
                          <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                            <Info size={18} />
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
