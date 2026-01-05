'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Search, MoreHorizontal } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

export default function AdminAppsPage() {
  const [loading, setLoading] = useState(true);

  const fetchApps = useCallback(async () => {
    try {
      await fetch('/api/admin/stats'); // Reusing stats for now or imagine an endpoint
      // In a real app we'd have /api/admin/apps
      setLoading(false);
    } catch (error) {
      console.error('Error fetching apps:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApps();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchApps]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600 dark:text-gray-400">Loading apps...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Applications</h1>
            <p className="text-gray-500 mt-1">Global view of all applications created by partners.</p>
          </div>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applications..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Application</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Partner</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Usage</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Created</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900 dark:text-gray-100">Production App</div>
                    <div className="text-xs text-gray-500 font-mono">app_clp123456</div>
                  </td>
                  <td className="px-6 py-4 text-blue-600 hover:underline cursor-pointer">Acme Corp</td>
                  <td className="px-6 py-4"><Badge variant="success">ACTIVE</Badge></td>
                  <td className="px-6 py-4 text-xs font-mono">45,230 hits</td>
                  <td className="px-6 py-4 text-gray-500">Jan 12, 2024</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                      <MoreHorizontal size={16} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
