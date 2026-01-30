'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useState, useEffect } from 'react';
import { Search, Filter, ChevronLeft, ChevronRight, Calendar, Download } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Skeleton, TableSkeleton } from '@/components/ui/Skeleton';
import { DateRangeFilter, DateRange } from '@/components/ui/DateRangeFilter';

interface ApiLog {
  id: string;
  endpoint: string;
  statusCode: number;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  app?: {
    id: string;
    name: string;
  };
  campaign?: string | null;
}

export default function ApiActivityPage() {
  const { apps, fetchApps } = useAppStore();
  const [logs, setLogs] = useState<ApiLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [endpointFilter, setEndpointFilter] = useState<string>('all');
  const [appFilter, setAppFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate: new Date(),
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 25;

  useEffect(() => {
    // Fetch apps if not already loaded
    if (apps.length === 0) {
      fetchApps();
    }
    fetchLogs();
  }, [currentPage, endpointFilter, dateRange, searchQuery, appFilter, fetchApps]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      // Only add appId if a specific app is selected
      if (appFilter && appFilter !== 'all') {
        params.append('appId', appFilter);
      }
      params.append('page', currentPage.toString());
      params.append('limit', itemsPerPage.toString());
      
      if (endpointFilter !== 'all') {
        params.append('endpoint', endpointFilter);
      }
      
      if (dateRange.startDate) {
        params.append('startDate', dateRange.startDate.toISOString());
      }
      
      if (dateRange.endDate) {
        params.append('endDate', dateRange.endDate.toISOString());
      }
      
      if (searchQuery) {
        params.append('search', searchQuery);
      }

      const response = await fetch(`/api/partner/usage-stats/activity?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      }
    } catch (error) {
      console.error('Error fetching API activity:', error);
    } finally {
      setLoading(false);
    }
  };


  const uniqueEndpoints = Array.from(new Set(logs.map(log => log.endpoint))).filter(Boolean);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Platform API Activity</h1>
            <p className="text-gray-500 mt-1">View and filter all API calls across all your apps.</p>
          </div>
          <Button variant="ghost" className="flex items-center gap-2">
            <Download size={18} />
            Export CSV
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle className="text-lg">Filters</CardTitle>
              <div className="flex flex-wrap items-center gap-3">
                <DateRangeFilter value={dateRange} onChange={setDateRange} presets={['7d', '30d', '90d', 'custom']} />
              </div>
            </div>
          </CardHeader>
          <CardBody>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search endpoint, IP..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <select
                value={appFilter}
                onChange={(e) => {
                  setAppFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Apps</option>
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>

              <select
                value={endpointFilter}
                onChange={(e) => {
                  setEndpointFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="all">All Endpoints</option>
                {uniqueEndpoints.map((endpoint) => (
                  <option key={endpoint} value={endpoint}>
                    {endpoint}
                  </option>
                ))}
              </select>

              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('');
                  setAppFilter('all');
                  setEndpointFilter('all');
                  setDateRange({
                    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                    endDate: new Date(),
                  });
                  setCurrentPage(1);
                }}
                className="w-full"
              >
                Clear Filters
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">API Calls</CardTitle>
          </CardHeader>
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Endpoint</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">App / Campaign</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">IP Address</th>
                    <th className="px-6 py-3 font-semibold text-gray-600 dark:text-gray-400">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {loading ? (
                    <TableSkeleton rows={10} cols={4} />
                  ) : logs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                        No API activity found
                      </td>
                    </tr>
                  ) : (
                    logs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                          {log.endpoint}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-2">
                            {log.app && (
                              <Badge variant="default" size="sm">
                                {log.app.name}
                              </Badge>
                            )}
                            {log.campaign && (
                              <Badge variant="info" size="sm">
                                {log.campaign}
                              </Badge>
                            )}
                            {!log.app && !log.campaign && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs font-mono">
                          {log.ipAddress || '—'}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs whitespace-nowrap">
                          {new Date(log.timestamp).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            {!loading && logs.length > 0 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
                <div className="text-xs text-gray-500 font-medium">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} results
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
                    Page {currentPage} of {totalPages}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1"
                  >
                    Next
                    <ChevronRight size={16} />
                  </Button>
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
