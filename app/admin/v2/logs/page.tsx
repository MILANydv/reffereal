'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Search, Trash2, Filter, RefreshCw, Terminal, Info, AlertTriangle, XCircle, Bug } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeaderSkeleton, StatCardSkeleton, TableSkeleton, Skeleton } from '@/components/ui/Skeleton';
import { useAdminStore } from '@/lib/store';

interface SystemLog {
  id: string;
  level: string;
  message: string;
  source: string | null;
  metadata: string | null;
  createdAt: string;
}

interface LogResponse {
  logs: SystemLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const levelColors: Record<string, string> = {
  INFO: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  WARN: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
  ERROR: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  DEBUG: 'bg-gray-100 dark:bg-gray-900/30 text-gray-700 dark:text-gray-400',
};

const levelIcons: Record<string, React.ReactNode> = {
  INFO: <Info size={14} />,
  WARN: <AlertTriangle size={14} />,
  ERROR: <XCircle size={14} />,
  DEBUG: <Bug size={14} />,
};

export default function AdminLogsPage() {
  const { logs, fetchLogs: fetchStoreLogs, isLoading, invalidate } = useAdminStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [level, setLevel] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      await fetchStoreLogs({ page, level, search });
    } finally {
      setLoading(false);
    }
  }, [page, level, search, fetchStoreLogs]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleDeleteOld = async () => {
    const days = prompt('Delete logs older than how many days?');
    if (!days || isNaN(parseInt(days))) return;

    try {
      const date = new Date();
      date.setDate(date.getDate() - parseInt(days));

      const response = await fetch(`/api/admin/logs?before=${date.toISOString()}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        invalidate('logs');
        fetchLogs();
      }
    } catch (error) {
      console.error('Error deleting logs:', error);
    }
  };

  const getLevelColor = (level: string) => levelColors[level] || levelColors.DEBUG;
  const getLevelIcon = (level: string) => levelIcons[level] || levelIcons.DEBUG;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Logs</h1>
            <p className="text-gray-500 mt-1">View and monitor platform activity and events.</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={fetchLogs}>
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
            <Button variant="ghost" onClick={handleDeleteOld}>
              <Trash2 size={16} className="mr-2" />
              Clean Old
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-900/30">
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <Info size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-700 dark:text-blue-400">
                  {logs.filter((l: any) => l.level === 'INFO').length}
                </div>
                <div className="text-xs text-blue-600 dark:text-blue-400 uppercase font-semibold">Info</div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-900/30">
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 rounded-lg">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                  {logs.filter((l: any) => l.level === 'WARN').length}
                </div>
                <div className="text-xs text-yellow-600 dark:text-yellow-400 uppercase font-semibold">Warnings</div>
              </div>
            </CardBody>
          </Card>
          <Card className="bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30">
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg">
                <XCircle size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                  {logs.filter((l: any) => l.level === 'ERROR').length}
                </div>
                <div className="text-xs text-red-600 dark:text-red-400 uppercase font-semibold">Errors</div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4 flex items-center space-x-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-900 text-gray-600 rounded-lg">
                <Terminal size={18} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-700 dark:text-gray-300">{total}</div>
                <div className="text-xs text-gray-500 uppercase font-semibold">Total Logs</div>
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
                placeholder="Search logs..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={level}
                onChange={(e) => { setLevel(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Levels</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
                <option value="debug">Debug</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 w-24">Level</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Message</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 w-32">Source</th>
                  <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400 w-48">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-16 rounded" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-full" /></td>
                      <td className="px-6 py-3"><Skeleton className="h-4 w-20" /></td>
                      <td className="px-6 py-3 text-right"><Skeleton className="h-4 w-24 ml-auto" /></td>
                    </tr>
                  ))
                ) : logs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">No logs found</td>
                  </tr>
                ) : (
                  logs.map((log: any) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getLevelColor(log.level)}`}>
                          <span className="mr-1">{getLevelIcon(log.level)}</span>
                          {log.level}
                        </span>
                      </td>
                      <td className="px-6 py-3 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {log.message}
                        {log.metadata && (
                          <div className="text-gray-400 mt-1 truncate max-w-md">{log.metadata}</div>
                        )}
                      </td>
                      <td className="px-6 py-3 text-gray-500">{log.source || '-'}</td>
                      <td className="px-6 py-3 text-gray-500 text-xs">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Page {page} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
