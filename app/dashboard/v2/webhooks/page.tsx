'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ConfirmModal } from '@/components/ui/ConfirmModal';
import { useEffect, useState } from 'react';
import { Webhook as WebhookIcon, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

export default function WebhooksPage() {
  const { selectedApp, webhooks, fetchWebhooks: loadWebhooks, isLoading, invalidate } = useAppStore();
  const loading = isLoading[`webhooks-${selectedApp?.id || 'all'}`];
  const [showForm, setShowForm] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; webhookId: string | null }>({
    isOpen: false,
    webhookId: null,
  });
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (selectedApp) {
      loadWebhooks(selectedApp.id);
    }
  }, [selectedApp, loadWebhooks]);

  const handleCreateWebhook = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const events = [];
    if (formData.get('event_referral_created')) events.push('REFERRAL_CREATED');
    if (formData.get('event_referral_clicked')) events.push('REFERRAL_CLICKED');
    if (formData.get('event_referral_converted')) events.push('REFERRAL_CONVERTED');
    if (formData.get('event_reward_created')) events.push('REWARD_CREATED');
    if (formData.get('event_usage_limit_exceeded')) events.push('USAGE_LIMIT_EXCEEDED');

    const webhookData = {
      appId: selectedApp?.id,
      url: formData.get('url') as string,
      events,
    };

    if (!webhookData.appId) return;

    try {
      const response = await fetch('/api/partner/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        invalidate(`webhooks-${selectedApp?.id}`);
        setShowForm(false);
        loadWebhooks(selectedApp!.id);
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const handleDeleteClick = (webhookId: string) => {
    setDeleteModal({ isOpen: true, webhookId });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.webhookId || !selectedApp) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/partner/webhooks/${deleteModal.webhookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        invalidate(`webhooks-${selectedApp.id}`);
        loadWebhooks(selectedApp.id);
        setDeleteModal({ isOpen: false, webhookId: null });
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggleWebhook = async (webhookId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/partner/webhooks/${webhookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        invalidate(`webhooks-${selectedApp?.id}`);
        loadWebhooks(selectedApp!.id);
      }
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  if (loading && webhooks.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <div className="space-y-4">
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
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Webhooks</h1>
            <p className="mt-2 text-gray-600">Receive real-time notifications for referral events</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} className="mr-2" />
            Add Webhook
          </Button>
        </div>

        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Webhook</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleCreateWebhook} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Application</label>
                  <div className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                    {selectedApp?.name || 'No application selected'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    name="url"
                    placeholder="https://your-domain.com/webhook"
                    required
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Events</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input type="checkbox" name="event_referral_created" className="mr-2" />
                      <span className="text-sm text-gray-700">Referral Created</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="event_referral_clicked" className="mr-2" />
                      <span className="text-sm text-gray-700">Referral Clicked</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="event_referral_converted" className="mr-2" />
                      <span className="text-sm text-gray-700">Referral Converted</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="event_reward_created" className="mr-2" />
                      <span className="text-sm text-gray-700">Reward Created</span>
                    </label>
                    <label className="flex items-center">
                      <input type="checkbox" name="event_usage_limit_exceeded" className="mr-2" />
                      <span className="text-sm text-gray-700">Usage Limit Exceeded</span>
                    </label>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button type="submit">Create Webhook</Button>
                  <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {webhooks.length > 0 ? (
          <div className="space-y-4">
            {webhooks.map((webhook: any) => (
              <Card key={webhook.id}>
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <WebhookIcon size={24} className="text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{webhook.appName}</h3>
                        <code className="text-sm text-gray-600 break-all">{webhook.url}</code>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {webhook.events.map((event: string) => (
                            <Badge key={event} variant="default" size="sm">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={webhook.isActive ? 'success' : 'default'}>
                        {webhook.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <button
                        onClick={() => handleToggleWebhook(webhook.id, webhook.isActive)}
                        className="text-gray-600 hover:text-gray-900"
                      >
                        {webhook.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => handleDeleteClick(webhook.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                    <div>
                      <div className="text-sm text-gray-600">Total Deliveries</div>
                      <div className="text-lg font-semibold text-gray-900">
                        {webhook.deliveryStats.total}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <CheckCircle size={14} className="mr-1 text-green-600" />
                        Successful
                      </div>
                      <div className="text-lg font-semibold text-green-600">
                        {webhook.deliveryStats.successful}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 flex items-center">
                        <XCircle size={14} className="mr-1 text-red-600" />
                        Failed
                      </div>
                      <div className="text-lg font-semibold text-red-600">
                        {webhook.deliveryStats.failed}
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <WebhookIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 mb-4">No webhooks configured yet</p>
              <Button onClick={() => setShowForm(true)}>Create Your First Webhook</Button>
            </CardBody>
          </Card>
        )}
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, webhookId: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Webhook"
        message="Are you sure you want to delete this webhook? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </DashboardLayout>
  );
}
