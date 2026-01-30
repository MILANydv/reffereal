'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAppStore } from '@/lib/store';
import { Plus, Search, Settings, Trash2, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function AppsPage() {
  const { apps, selectedApp, setSelectedApp, fetchApps, isLoading } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; appId: string | null; appName: string }>({
    isOpen: false,
    appId: null,
    appName: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const loading = isLoading['apps'];

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectApp = (app: typeof apps[0]) => {
    setSelectedApp(app);
    // Navigate to app overview
    window.location.href = `/dashboard/v2/app/${app.id}`;
  };

  const handleDeleteClick = (appId: string, appName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, appId, appName });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.appId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/partner/apps/${deleteModal.appId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchApps(true);
        if (selectedApp?.id === deleteModal.appId) {
          setSelectedApp(null);
        }
        setDeleteModal({ isOpen: false, appId: null, appName: '' });
      }
    } catch (error) {
      console.error('Error deleting app:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading && apps.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Skeleton className="h-8 w-48 mb-2" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-slate-100">Applications</h1>
            <p className="text-gray-500 dark:text-slate-400 mt-1">Manage your applications and API keys.</p>
          </div>
          <Link href="/dashboard/v2/apps/new">
            <Button>
              <Plus size={18} className="mr-2" />
              Create App
            </Button>
          </Link>
        </div>

        {apps.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap size={32} className="text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">No applications yet</h3>
              <p className="text-gray-500 mb-6">Create your first application to start managing referral campaigns.</p>
              <Link href="/dashboard/v2/apps/new">
                <Button>
                  <Plus size={18} className="mr-2" />
                  Create Your First App
                </Button>
              </Link>
            </CardBody>
          </Card>
        ) : (
          <>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search apps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredApps.map((app) => (
                <Card
                  key={app.id}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    selectedApp?.id === app.id ? 'ring-2 ring-blue-500' : ''
                  }`}
                  onClick={() => handleSelectApp(app)}
                >
                  <CardHeader className="flex flex-row items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{app.name}</CardTitle>
                      <p className="text-xs text-gray-500 font-mono truncate">{app.id}</p>
                    </div>
                    <Badge
                      variant={app.status === 'ACTIVE' ? 'success' : 'default'}
                      size="sm"
                    >
                      {app.status}
                    </Badge>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-slate-400">API Usage</span>
                        <span className="font-medium text-gray-900 dark:text-slate-100">
                          {app.currentUsage.toLocaleString()} / {app.monthlyLimit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            (app.currentUsage / app.monthlyLimit) * 100 > 90
                              ? 'bg-red-500'
                              : (app.currentUsage / app.monthlyLimit) * 100 > 70
                              ? 'bg-yellow-500'
                              : 'bg-blue-500'
                          }`}
                          style={{
                            width: `${Math.min((app.currentUsage / app.monthlyLimit) * 100, 100)}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                      <Link
                        href={`/dashboard/v2/app/${app.id}/settings`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex-1"
                      >
                        <Button variant="ghost" size="sm" className="w-full">
                          <Settings size={16} className="mr-2" />
                          Settings
                        </Button>
                      </Link>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(app.id, app.name, e)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
            </div>

            {filteredApps.length === 0 && searchQuery && (
              <Card>
                <CardBody className="text-center py-8">
                  <p className="text-gray-500 dark:text-slate-400">No apps found matching "{searchQuery}"</p>
                </CardBody>
              </Card>
            )}
          </>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, appId: null, appName: '' })}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message={`Are you sure you want to delete "${deleteModal.appName}"? This action cannot be undone and will delete all associated campaigns and data.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}

