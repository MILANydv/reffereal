'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useState, useEffect } from 'react';
import { Plus, Search, FileText, Edit, Trash2, ExternalLink, X, Save } from 'lucide-react';
import { useAdminStore, Blog } from '@/lib/store';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function AdminBlogsPage() {
    const { blogs, fetchBlogs, isLoading } = useAdminStore();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        author: '',
        category: '',
        content: '',
        status: 'DRAFT' as 'DRAFT' | 'PUBLISHED'
    });

    useEffect(() => {
        fetchBlogs();
    }, [fetchBlogs]);

    useEffect(() => {
        if (editingBlog) {
            setFormData({
                title: editingBlog.title,
                slug: editingBlog.slug,
                author: editingBlog.author,
                category: editingBlog.category,
                content: editingBlog.content,
                status: editingBlog.status
            });
        } else {
            setFormData({
                title: '',
                slug: '',
                author: '',
                category: '',
                content: '',
                status: 'DRAFT'
            });
        }
    }, [editingBlog]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const method = editingBlog ? 'PATCH' : 'POST';
            const response = await fetch('/api/admin/blogs', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingBlog ? { id: editingBlog.id, ...formData } : formData),
            });
            if (response.ok) {
                fetchBlogs(true);
                setIsModalOpen(false);
                setEditingBlog(null);
            }
        } catch (error) {
            console.error('Error saving blog:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/blogs?id=${deleteId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchBlogs(true);
                setDeleteId(null);
            }
        } catch (error) {
            console.error('Error deleting blog:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)+/g, '');
    };

    const filteredBlogs = blogs.filter(blog => {
        const matchesSearch = blog.title.toLowerCase().includes(search.toLowerCase()) ||
            blog.author.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Content Management</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage blog posts, technical briefings, and guides.</p>
                    </div>
                    <Button
                        className="flex items-center gap-2"
                        onClick={() => {
                            setEditingBlog(null);
                            setIsModalOpen(true);
                        }}
                    >
                        <Plus size={18} />
                        Create Post
                    </Button>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search articles by title or author..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm px-4 py-2 outline-none"
                    >
                        <option value="all">All Status</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                    </select>
                </div>

                {/* Blog List */}
                <Card>
                    <CardBody className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800">
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Article</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Category</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {isLoading['blogs'] ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">Loading blogs...</td>
                                        </tr>
                                    ) : filteredBlogs.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">No articles found</td>
                                        </tr>
                                    ) : (
                                        filteredBlogs.map((blog) => (
                                            <tr key={blog.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="size-10 rounded-lg bg-primary/5 flex items-center justify-center text-primary">
                                                            <FileText size={20} />
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900 dark:text-gray-100">{blog.title}</div>
                                                            <div className="text-xs text-gray-500 font-mono">/{blog.slug}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{blog.category}</span>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge variant={blog.status === 'PUBLISHED' ? 'success' : 'default'} size="sm">
                                                        {blog.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm text-gray-500 font-mono">
                                                        {new Date(blog.publishedAt || blog.createdAt).toLocaleDateString()}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 text-gray-400 hover:text-navy transition-colors"
                                                            onClick={() => {
                                                                setEditingBlog(blog);
                                                                setIsModalOpen(true);
                                                            }}
                                                        >
                                                            <Edit size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            onClick={() => setDeleteId(blog.id)}
                                                        >
                                                            <Trash2 size={16} />
                                                        </Button>
                                                        <Link href={`/blog/${blog.slug}`} target="_blank" className="p-2 text-gray-400 hover:text-primary transition-colors">
                                                            <ExternalLink size={16} />
                                                        </Link>
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
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-4xl overflow-hidden border border-gray-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
                        <form onSubmit={handleSave} className="flex flex-col h-full">
                            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                                <h3 className="text-xl font-bold text-navy dark:text-white">
                                    {editingBlog ? 'Edit Post' : 'Create New Post'}
                                </h3>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto flex-1">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Post Title</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.title}
                                            onChange={(e) => {
                                                const title = e.target.value;
                                                setFormData({
                                                    ...formData,
                                                    title,
                                                    slug: editingBlog ? formData.slug : generateSlug(title)
                                                });
                                            }}
                                            placeholder="Ex: The Future of Referral Marketing"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Slug</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.slug}
                                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                                            placeholder="future-of-referral-marketing"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none font-mono"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Author</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.author}
                                            onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                                            placeholder="Milan Ydv"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Category</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.category}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            placeholder="Engineering"
                                            className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
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
                                <div className="space-y-2 h-full min-h-[300px] flex flex-col">
                                    <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Markdown Content</label>
                                    <textarea
                                        required
                                        value={formData.content}
                                        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                                        placeholder="# Hello World..."
                                        className="w-full flex-1 px-4 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none font-mono resize-none h-64"
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                <Button type="submit" disabled={isSaving} className="flex items-center gap-2">
                                    <Save size={18} />
                                    {isSaving ? 'Saving...' : 'Save Post'}
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
                title="Delete Post"
                message="Are you sure you want to delete this article? This action cannot be undone."
                isLoading={isDeleting}
            />
        </DashboardLayout>
    );
}
