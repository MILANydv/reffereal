'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Edit3, Trash2, Search, Flag, ToggleLeft, ToggleRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeaderSkeleton, TableSkeleton, Skeleton } from '@/components/ui/Skeleton';

import { useAdminStore } from '@/lib/store';

export default function AdminFeaturesPage() {
  const { features: flags, fetchFeatures, isLoading, invalidate } = useAdminStore();
  const loading = isLoading['features'];
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingFlag, setEditingFlag] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    key: '',
    name: '',
    description: '',
    isEnabled: false,
    rolloutPercent: 0,
  });

  useEffect(() => {
    fetchFeatures();
  }, [fetchFeatures]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingFlag ? '/api/admin/feature-flags' : '/api/admin/feature-flags';
      const method = editingFlag ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingFlag ? { id: editingFlag.id, ...formData } : formData),
      });

      if (response.ok) {
        invalidate('features');
        fetchFeatures(true);
        setShowModal(false);
        resetForm();
      }
    } catch (error) {
      console.error('Error saving feature flag:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feature flag?')) return;

    try {
      const response = await fetch(`/api/admin/feature-flags?id=${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchFlags();
      }
    } catch (error) {
      console.error('Error deleting feature flag:', error);
    }
  };

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      const response = await fetch('/api/admin/feature-flags', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: flag.id, isEnabled: !flag.isEnabled }),
      });
      if (response.ok) {
        fetchFlags();
      }
    } catch (error) {
      console.error('Error toggling feature flag:', error);
    }
  };

  const resetForm = () => {
    setFormData({ key: '', name: '', description: '', isEnabled: false, rolloutPercent: 0 });
    setEditingFlag(null);
  };

  const openEditModal = (flag: any) => {
    setEditingFlag(flag);
    setFormData({
      key: flag.key,
      name: flag.name,
      description: flag.description || '',
      isEnabled: flag.isEnabled,
      rolloutPercent: flag.rolloutPercent,
    });
    setShowModal(true);
  };

  const filteredFlags = flags.filter(
    (flag) =>
      flag.name.toLowerCase().includes(search.toLowerCase()) ||
      flag.key.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Feature Flags</h1>
            <p className="text-gray-500 mt-1">Manage platform feature rollouts and experiments.</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={18} className="mr-2" />
            Create Flag
          </Button>
        </div>

        <Card className="overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800">
            <div className="relative max-w-sm">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search feature flags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Flag</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Key</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Rollout</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400">Status</th>
                  <th className="px-6 py-4 font-semibold text-gray-600 dark:text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-40" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                      <td className="px-6 py-4"><Skeleton className="h-6 w-20 rounded-full" /></td>
                      <td className="px-6 py-4 text-right"><Skeleton className="h-4 w-12 ml-auto" /></td>
                    </tr>
                  ))
                ) : filteredFlags.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">No feature flags found</td>
                  </tr>
                ) : (
                  filteredFlags.map((flag: any) => (
                    <tr key={flag.id} className="hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg mr-3">
                            <Flag size={16} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{flag.name}</div>
                            {flag.description && (
                              <div className="text-xs text-gray-500 mt-0.5">{flag.description}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">{flag.key}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-16 h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mr-2">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${flag.rolloutPercent}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{flag.rolloutPercent}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={flag.isEnabled ? 'success' : 'default'}>
                          {flag.isEnabled ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleToggle(flag)}
                            className={`p-2 rounded-lg transition-colors ${flag.isEnabled
                              ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                              : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                              }`}
                          >
                            {flag.isEnabled ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                          </button>
                          <button
                            onClick={() => openEditModal(flag)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(flag.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>{editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Key *
                  </label>
                  <input
                    type="text"
                    value={formData.key}
                    onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                    placeholder="e.g., new_dashboard_v2"
                    required
                    disabled={!!editingFlag}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., New Dashboard V2"
                    required
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what this flag controls..."
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rollout Percentage: {formData.rolloutPercent}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.rolloutPercent}
                    onChange={(e) => setFormData({ ...formData, rolloutPercent: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isEnabled"
                    checked={formData.isEnabled}
                    onChange={(e) => setFormData({ ...formData, isEnabled: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isEnabled" className="text-sm text-gray-700 dark:text-gray-300">
                    Enable feature flag
                  </label>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingFlag ? 'Save Changes' : 'Create Flag'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
}
