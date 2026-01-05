'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { Webhook as WebhookIcon, Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';

interface Webhook {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
  appId: string;
  appName: string;
  createdAt: string;
  deliveryStats: {
    total: number;
    successful: number;
    failed: number;
  };
}

export default function WebhooksPage() {
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [apps, setApps] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadWebhooks();
    loadApps();
  }, []);

  const loadWebhooks = async () => {
    try {
      const response = await fetch('/api/partner/webhooks');
      if (response.ok) {
        const data = await response.json();
        setWebhooks(data);
      }
    } catch (error) {
      console.error('Error loading webhooks:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadApps = async () => {
    try {
      const response = await fetch('/api/partner/apps');
      if (response.ok) {
        const data = await response.json();
        setApps(data);
      }
    } catch (error) {
      console.error('Error loading apps:', error);
    }
  };

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
      appId: formData.get('appId') as string,
      url: formData.get('url') as string,
      events,
    };

    try {
      const response = await fetch('/api/partner/webhooks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      if (response.ok) {
        setShowForm(false);
        loadWebhooks();
      }
    } catch (error) {
      console.error('Error creating webhook:', error);
    }
  };

  const handleDeleteWebhook = async (webhookId: string) => {
    if (!confirm('Are you sure you want to delete this webhook?')) return;

    try {
      const response = await fetch(`/api/partner/webhooks/${webhookId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadWebhooks();
      }
    } catch (error) {
      console.error('Error deleting webhook:', error);
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
        loadWebhooks();
      }
    } catch (error) {
      console.error('Error toggling webhook:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">Application</label>
                  <select
                    name="appId"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select Application</option>
                    {apps.map((app) => (
                      <option key={app.id} value={app.id}>
                        {app.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                  <input
                    type="url"
                    name="url"
                    placeholder="https://your-domain.com/webhook"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>
        )}

        {webhooks.length > 0 ? (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardBody>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                      <WebhookIcon size={24} className="text-blue-600 mt-1" />
                      <div>
                        <h3 className="font-semibold text-gray-900">{webhook.appName}</h3>
                        <code className="text-sm text-gray-600 break-all">{webhook.url}</code>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {webhook.events.map((event) => (
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
                        onClick={() => handleDeleteWebhook(webhook.id)}
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
    </DashboardLayout>
  );
}
