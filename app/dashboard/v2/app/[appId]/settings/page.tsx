'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useAppStore } from '@/lib/store';
import { Settings, Globe, Shield, Trash2, Save, RefreshCw, Eye, EyeOff, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function AppSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const appId = params?.appId as string;
  const { apps, invalidate, fetchApps, setSelectedApp } = useAppStore();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    allowedDomains: '',
  });

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showApiKey, setShowApiKey] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Find the app from the apps list
  const app = apps.find(a => a.id === appId);

  useEffect(() => {
    // Fetch apps if not loaded
    if (apps.length === 0) {
      fetchApps();
    }
  }, [apps.length, fetchApps]);

  useEffect(() => {
    if (app) {
      setFormData({
        name: app.name || '',
        description: app.description || '',
        allowedDomains: app.allowedDomains ?? '',
      });
      setLoading(false);
    } else if (apps.length > 0 && !loading) {
      // App not found, redirect to apps page
      router.push('/dashboard/v2/apps');
    }
  }, [app, apps.length, router, loading]);

  const handleSave = async () => {
    if (!app) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/partner/apps/${app.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        invalidate('apps');
        await fetchApps(true);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!app) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/partner/apps/${app.id}`, { method: 'DELETE' });
      if (response.ok) {
        invalidate('apps');
        await fetchApps(true);
        if (useAppStore.getState().selectedApp?.id === app.id) {
          setSelectedApp(null);
        }
        setDeleteModal(false);
        router.push('/dashboard/v2/apps');
      }
    } catch (error) {
      console.error('Error deleting app:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const copyApiKey = () => {
    if (app?.apiKey) {
      navigator.clipboard.writeText(app.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading || !app) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <Settings size={32} />
          </div>
          <h2 className="text-xl font-bold">Loading...</h2>
          <p className="text-gray-500 mt-2">Loading app settings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">App Settings</h1>
          <p className="text-gray-500 mt-1">Configure general settings and security for {app.name}.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Information</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Application Name</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Briefly describe what this app does..."
                  />
                </div>
                <div className="flex justify-end pt-4">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm disabled:opacity-50"
                  >
                    {saving ? <RefreshCw size={18} className="mr-2 animate-spin" /> : <Save size={18} className="mr-2" />}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Globe className="text-blue-500" size={20} />
                  <CardTitle>Security & Access</CardTitle>
                </div>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Allowed Domains</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                    value={formData.allowedDomains}
                    onChange={(e) => setFormData({ ...formData, allowedDomains: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-gray-500">Comma-separated list of domains that can access the referral API. Supports wildcards (e.g. *.example.com).</p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                      <Shield className="mr-2 text-green-500" size={16} /> Webhook Secret
                    </label>
                    <button className="text-xs font-bold text-blue-600 hover:underline flex items-center">
                      <RefreshCw size={12} className="mr-1" /> Regenerate
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex-1 bg-gray-100 dark:bg-gray-900 px-4 py-2 rounded-lg font-mono text-sm border border-gray-200 dark:border-gray-800 truncate text-gray-500">
                      whsec_a8b9c0d1e2f3g4h5i6j7k8l9m0n1o2p3
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card className="border-red-200 dark:border-red-900/30">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center">
                  <Trash2 className="mr-2" size={20} />
                  Danger Zone
                </CardTitle>
              </CardHeader>
              <CardBody>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100">Delete this application</h4>
                    <p className="text-sm text-gray-500 mt-1">Once you delete an application, there is no going back. Please be certain.</p>
                  </div>
                  <button
                    onClick={() => setDeleteModal(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-bold text-sm"
                  >
                    Delete App
                  </button>
                </div>
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500 uppercase font-bold tracking-wider">App Info</CardTitle>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="text-sm">
                  <div className="text-gray-500 mb-1">App ID</div>
                  <div className="font-mono bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded border border-gray-100 dark:border-gray-800 break-all">{app.id}</div>
                </div>
                <div className="text-sm">
                  <div className="text-gray-500 mb-1">API Key</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 font-mono bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded border border-gray-100 dark:border-gray-800 break-all text-xs min-w-0">
                      {showApiKey ? app.apiKey : '•'.repeat(24)}
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded border border-gray-200 dark:border-gray-800 transition-colors shrink-0"
                      aria-label={showApiKey ? 'Hide API key' : 'Show API key'}
                    >
                      {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    <button
                      type="button"
                      onClick={copyApiKey}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-900/30 transition-colors shrink-0"
                      aria-label="Copy API key"
                    >
                      <Copy size={16} />
                    </button>
                  </div>
                  {copied && <p className="text-xs text-green-600 mt-1">Copied</p>}
                </div>
                <div className="text-sm">
                  <div className="text-gray-500 mb-1">Status</div>
                  <div className="flex items-center">
                    <div className={`w-2 h-2 rounded-full mr-2 ${app.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="font-medium capitalize">{app.status.toLowerCase()}</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Application"
        message={`Are you sure you want to delete "${app.name}"? This action cannot be undone and will delete all associated campaigns and data.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
