'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { usePartnerStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import { UserPlus, Mail, Trash2 } from 'lucide-react';
import { TableSkeleton, PageHeaderSkeleton } from '@/components/ui/Skeleton';


export default function TeamPage() {
  const { team: members, fetchTeam, isLoading, invalidate } = usePartnerStore();
  const loading = isLoading['team'];
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; memberId: string | null; memberEmail: string }>({
    isOpen: false,
    memberId: null,
    memberEmail: '',
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const handleInviteMember = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const memberData = {
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as string,
    };

    try {
      const response = await fetch('/api/partner/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData),
      });

      if (response.ok) {
        setShowForm(false);
        invalidate('team');
        fetchTeam();
      }
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  const handleRemoveClick = (memberId: string, memberEmail: string) => {
    setDeleteModal({ isOpen: true, memberId, memberEmail });
  };

  const handleRemoveConfirm = async () => {
    if (!deleteModal.memberId) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/partner/team/${deleteModal.memberId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        invalidate('team');
        fetchTeam();
        setDeleteModal({ isOpen: false, memberId: null, memberEmail: '' });
      }
    } catch (error) {
      console.error('Error removing team member:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <TableSkeleton cols={6} rows={5} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Team Members</h1>
            <p className="mt-2 text-gray-600">Collaborate with your team on referral campaigns</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <UserPlus size={16} className="mr-2" />
            Invite Member
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Team Member</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleInviteMember} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="teammate@company.com"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                  <select
                    name="role"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Role</option>
                    <option value="ADMIN">Admin - Full access</option>
                    <option value="ANALYST">Analyst - View analytics</option>
                    <option value="DEVELOPER">Developer - API access</option>
                  </select>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">Send Invite</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardBody>
            {members.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Email</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Role</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Last Login</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {members.map((member: any) => (
                      <tr key={member.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">{member.name || '-'}</td>
                        <td className="py-3 px-4 text-sm text-gray-900">{member.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant="default" size="sm">
                            {member.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          {member.inviteAcceptedAt ? (
                            <Badge variant="success" size="sm">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="default" size="sm">
                              <Mail size={12} className="mr-1" />
                              Pending
                            </Badge>
                          )}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {member.lastLoginAt
                            ? new Date(member.lastLoginAt).toLocaleDateString()
                            : 'Never'}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleRemoveClick(member.id, member.email)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <UserPlus size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">No team members yet</p>
                <Button onClick={() => setShowForm(true)}>Invite Your First Team Member</Button>
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, memberId: null, memberEmail: '' })}
        onConfirm={handleRemoveConfirm}
        title="Remove Team Member"
        message={`Are you sure you want to remove "${deleteModal.memberEmail}" from your team? This action cannot be undone.`}
        confirmText="Remove"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
