'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useState, useEffect } from 'react';
import { Search, Mail, Eye, Trash2, CheckCircle, Clock, X } from 'lucide-react';
import { useAdminStore, ContactInquiry } from '@/lib/store';
import { ConfirmModal } from '@/components/ui/ConfirmModal';

export default function AdminContactsPage() {
    const { contacts, fetchContacts, isLoading } = useAdminStore();
    const [search, setSearch] = useState('');
    const [selectedInquiry, setSelectedInquiry] = useState<ContactInquiry | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            const response = await fetch('/api/admin/contacts', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, status }),
            });
            if (response.ok) {
                fetchContacts(true);
                if (selectedInquiry?.id === id) {
                    setSelectedInquiry(prev => prev ? { ...prev, status: status as any } : null);
                }
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async () => {
        if (!deleteId) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/contacts?id=${deleteId}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                fetchContacts(true);
                setDeleteId(null);
            }
        } catch (error) {
            console.error('Error deleting inquiry:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredInquiries = contacts.filter(inquiry =>
        inquiry.name.toLowerCase().includes(search.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(search.toLowerCase()) ||
        inquiry.subject?.toLowerCase().includes(search.toLowerCase())
    );

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NEW': return 'error';
            case 'READ': return 'warning';
            case 'REPLIED': return 'success';
            default: return 'default';
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Contact Inquiries</h1>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">Manage incoming technical inquiries and partnership requests.</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by sender or subject..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-800 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                </div>

                {/* Inquiries List */}
                <Card>
                    <CardBody className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-slate-800">
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Sender</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Subject</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                        <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Date</th>
                                        <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                                    {isLoading['contacts'] ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">Loading inquiries...</td>
                                        </tr>
                                    ) : filteredInquiries.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-8 text-center text-gray-500">No inquiries found</td>
                                        </tr>
                                    ) : (
                                        filteredInquiries.map((inquiry) => (
                                            <tr key={inquiry.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div>
                                                        <div className="font-bold text-gray-900 dark:text-gray-100">{inquiry.name}</div>
                                                        <div className="text-xs text-slate-500">{inquiry.email}</div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <div className="text-sm font-medium text-navy dark:text-slate-300">{inquiry.subject}</div>
                                                    <div className="text-xs text-slate-400 truncate max-w-xs">{inquiry.message}</div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <Badge variant={getStatusColor(inquiry.status)} size="sm">
                                                        {inquiry.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-4 px-6">
                                                    <span className="text-sm text-gray-400 font-mono">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 text-gray-400 hover:text-primary transition-colors"
                                                            onClick={() => {
                                                                setSelectedInquiry(inquiry);
                                                                if (inquiry.status === 'NEW') handleStatusUpdate(inquiry.id, 'READ');
                                                            }}
                                                        >
                                                            <Eye size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 text-gray-400 hover:text-green-500 transition-colors"
                                                            onClick={() => handleStatusUpdate(inquiry.id, 'REPLIED')}
                                                            disabled={inquiry.status === 'REPLIED'}
                                                        >
                                                            <CheckCircle size={16} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                            onClick={() => setDeleteId(inquiry.id)}
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
            </div>

            {/* View Inquiry Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedInquiry(null)} />
                    <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden border border-gray-200 dark:border-slate-800">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-slate-800">
                            <h3 className="text-xl font-bold text-navy dark:text-white">Inquiry Details</h3>
                            <button onClick={() => setSelectedInquiry(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Sender</p>
                                    <p className="font-bold text-navy dark:text-white">{selectedInquiry.name}</p>
                                    <p className="text-sm text-slate-500">{selectedInquiry.email}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Date</p>
                                    <p className="font-bold text-navy dark:text-white">{new Date(selectedInquiry.createdAt).toLocaleString()}</p>
                                </div>
                                {selectedInquiry.company && (
                                    <div>
                                        <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Company</p>
                                        <p className="font-bold text-navy dark:text-white">{selectedInquiry.company}</p>
                                    </div>
                                )}
                                <div>
                                    <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Status</p>
                                    <Badge variant={getStatusColor(selectedInquiry.status)} size="sm">
                                        {selectedInquiry.status}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-1">Subject</p>
                                <p className="font-bold text-navy dark:text-white text-lg">{selectedInquiry.subject}</p>
                            </div>
                            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <p className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-3">Message Payload</p>
                                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedInquiry.message}
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-end gap-3">
                            <Button variant="ghost" onClick={() => setSelectedInquiry(null)}>Close</Button>
                            {selectedInquiry.status !== 'REPLIED' && (
                                <Button onClick={() => handleStatusUpdate(selectedInquiry.id, 'REPLIED')}>
                                    Mark as Replied
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <ConfirmModal
                isOpen={!!deleteId}
                onClose={() => setDeleteId(null)}
                onConfirm={handleDelete}
                title="Delete Inquiry"
                message="Are you sure you want to delete this inquiry? This action cannot be undone."
                isLoading={isDeleting}
            />
        </DashboardLayout>
    );
}
