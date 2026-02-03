'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { Plus, Search, FileText, Edit, Trash2, ExternalLink } from 'lucide-react';

interface BlogPost {
    id: string;
    title: string;
    slug: string;
    author: string;
    status: 'published' | 'draft';
    date: string;
    category: string;
}

export default function AdminBlogsPage() {
    const [blogs, setBlogs] = useState<BlogPost[]>([
        {
            id: '1',
            title: 'Scaling Referral Infrastructure in 2024',
            slug: 'scaling-referral-infrastructure-2024',
            author: 'Milan Ydv',
            status: 'published',
            date: '2024-02-01',
            category: 'Engineering'
        },
        {
            id: '2',
            title: 'Preventing Sybil Attacks in Multi-Level Marketing',
            slug: 'preventing-sybil-attacks-mlm',
            author: 'Milan Ydv',
            status: 'published',
            date: '2024-01-25',
            category: 'Security'
        },
        {
            id: '3',
            title: 'New SDK Support for Go and Ruby',
            slug: 'new-sdk-support-go-ruby',
            author: 'Engineering Team',
            status: 'draft',
            date: '2024-02-03',
            category: 'Product'
        }
    ]);

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Content Management</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage blog posts, technical briefings, and guides.</p>
                    </div>
                    <Button className="flex items-center gap-2">
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
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <select className="bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm px-4 py-2 outline-none">
                        <option>All Status</option>
                        <option>Published</option>
                        <option>Draft</option>
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
                                    {blogs.map((blog) => (
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
                                                <Badge variant={blog.status === 'published' ? 'success' : 'default'} size="sm">
                                                    {blog.status}
                                                </Badge>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className="text-sm text-gray-500 font-mono">{blog.date}</span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="sm" className="p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="p-2 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-600">
                                                        <Trash2 size={16} />
                                                    </Button>
                                                    <Link href={`/blog/${blog.slug}`} className="p-2 text-gray-400 hover:text-primary transition-colors">
                                                        <ExternalLink size={16} />
                                                    </Link>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardBody>
                </Card>

                {/* Stats Placeholder */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Total Reads</p>
                        <p className="text-2xl font-bold text-navy dark:text-white">12,482</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Avg. Engagement</p>
                        <p className="text-2xl font-bold text-navy dark:text-white">4m 22s</p>
                    </div>
                    <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800">
                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Social Shares</p>
                        <p className="text-2xl font-bold text-navy dark:text-white">892</p>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
