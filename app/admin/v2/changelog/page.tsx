'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, History, Info, X, Save } from 'lucide-react';
import { useAdminStore, Changelog } from '@/lib/store';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function AdminChangelogPage() {
    const { changelogs, fetchChangelogs, isLoading } = useAdminStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingEntry, setEditingEntry] = useState<Changelog | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        version: '',
        type: 'MINOR' as 'MAJOR' | 'MINOR' | 'PATCH',
        title: '',
        content: '',
        status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
        releaseDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchChangelogs();
    }, [fetchChangelogs]);

    useEffect(() => {
        if (editingEntry) {
            setFormData({
                version: editingEntry.version,
                type: editingEntry.type,
                title: editingEntry.title,
                content: editingEntry.content,
                status: editingEntry.status,
                releaseDate: new Date(editingEntry.releaseDate).toISOString().split('T')[0]
            });
        } else {
            setFormData({
                version: '',
                type: 'MINOR',
                title: '',
                content: '',
                status: 'DRAFT',
                releaseDate: new Date().toISOString().split('T')[0]
            });
        }
    }, [editingEntry]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const method = editingEntry ? 'PATCH' : 'POST';
            const response = await fetch('/api/admin/changelog', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingEntry ? { id: editingEntry.id, ...formData } : formData),
            });
            if (response.ok) {
                fetchChangelogs(true);
                setIsModalOpen(false);
                setEditingEntry(null);
            }
        } catch (error) {
            console.error('Error saving changelog:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/changelog?id=${deleteId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchChangelogs(true);
                setDeleteId(null);
            }
        } catch (error) {
            console.error('Error deleting changelog:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const getBadgeVariant = (type: string) => {
        switch (type) {
            case 'MAJOR': return 'default';
            case 'MINOR': return 'info';
            case 'PATCH': return 'warning';
            default: return 'default';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Changelog Management</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage system updates, version history, and public changelog entries.</p>
                    </div>
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => {
                            setEditingEntry(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={18} />
                        Draft New Version
                    </Button>
                </div>

                {/* Informational Note */}
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl flex items-start gap-4">
                    <Info className="text-primary mt-0.5" size={20} />
                    <p className="text-sm text-navy dark:text-slate-300">
                        Entries published here will immediately reflect on the public timeline.
                    </p>
                </div>

                {/* Timeline Table */}
                <Card>
                    <CardBody className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800">
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Version</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Entry Title</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Type</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Release Date</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {isLoading['changelogs'] ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-500">Loading changelogs...</td>
                                        </tr>
                                    ) : changelogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-500">No entries found</td>
                                        </tr>
                                    ) : (
                                        changelogs.map((entry) => (
                                            <tr key={entry.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <span className="font-mono font-bold text-primary">{entry.version}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="font-bold text-gray-900 dark:text-gray-100">{entry.title}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge variant={getBadgeVariant(entry.type)} size="sm">
                                                        {entry.type}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm text-gray-500 font-mono">{new Date(entry.releaseDate).toLocaleDateString()}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`size-1.5 rounded-full ${entry.status === 'PUBLISHED' ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                                                        <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{entry.status}</span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 text-gray-400 hover:text-navy transition-colors"
                                                            onClick={() => {
                                                                setEditingEntry(entry);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            onClick={() => setDeleteId(entry.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>

                {/* Deployment History Placeholder */}
                <div className="pt-8 space-y-4">
                    <h3 className="text-sm font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                        <History size={16} />
                        Internal Git Sync Status
                    </h3>
                    <div className="p-6 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <div className="size-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                <History size={20} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-navy dark:text-white">HEAD is synchronized with Main</p>
                                <p className="text-xs text-slate-500 font-mono">Sync complete</p>
                            </div>
                        </div>
                        <Button size="sm" variant="secondary">Sync Metadata</Button>
                    </div>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
                        <form onSubmit={handleSave}>
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                                <h3 className="text-xl font-bold text-navy dark:text-white">
                                    {editingEntry ? 'Edit Entry' : 'New Changelog Entry'}
                                </h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Version Tag</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.version}
                                            onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                            placeholder="v1.0.0"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Update Type</label>
                                        <select
                                            value={formData.type}
                                            onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                        >
                                            <option value="MAJOR">Major</option>
                                            <option value="MINOR">Minor</option>
                                            <option value="PATCH">Patch</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Entry Title</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Major Security Patch"
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Release Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.releaseDate}
                                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Status</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={formData.status === 'DRAFT'}
                                                onChange={() => setFormData({ ...formData, status: 'DRAFT' })}
                                            />
                                            <span className="text-sm">Draft</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="status"
                                                checked={formData.status === 'PUBLISHED'}
                                                onChange={() => setFormData({ ...formData, status: 'PUBLISHED' })}
                                            />
                                            <span className="text-sm">Published</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Markdown Content</label>
                                    <textarea
                                        required
                                        rows={8}
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="### Changes in this version..."
                                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                                    <Save size={18} />
                                    {isSaving ? 'Saving...' : 'Save Entry'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Changelog Entry"
                message="Are you sure you want to delete this version? This will remove it from the public timeline permanently."
                isLoading={isDeleting}
            />
        </DashboardLayout>
    );
}
