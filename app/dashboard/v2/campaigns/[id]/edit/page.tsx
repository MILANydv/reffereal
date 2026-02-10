'use client';

import Link from 'next/link';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { ArrowLeft, Megaphone, Gift, Shield, Save } from 'lucide-react';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  type CampaignFormData,
  campaignApiToFormData,
  campaignFormToPatchPayload,
  validateCampaignPatchForm,
  REWARD_VALUE_MAX,
  REWARD_VALUE_MIN,
  PAYOUT_TYPE_OPTIONS,
} from '@/lib/campaign-form';

const initialFormState: CampaignFormData = {
  name: '',
  status: 'ACTIVE',
  rewardValue: 10,
  rewardCap: null,
  firstTimeUserOnly: true,
  startDate: '',
  endDate: '',
  conversionWindow: null,
  rewardExpiration: null,
  level1Reward: null,
  level2Reward: null,
  level1Cap: null,
  level2Cap: null,
  tierConfig: '',
  referralCodePrefix: '',
  referralCodeFormat: 'RANDOM',
  payoutType: null,
};

export default function EditCampaignPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const mounted = useRef(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<string | null>(null);
  const [formData, setFormData] = useState<CampaignFormData>(initialFormState);

  const updateField = useCallback(<K extends keyof CampaignFormData>(key: K, value: CampaignFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!id) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(`/api/partner/campaigns/${id}`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('Campaign not found');
        return res.json();
      })
      .then((data) => {
        const next = campaignApiToFormData(data);
        setFormData(next);
        setInitialData(JSON.stringify(next));
      })
      .catch((err) => {
        if (err.name !== 'AbortError' && mounted.current) {
          setError(err.message || 'Failed to load campaign');
        }
      })
      .finally(() => {
        if (mounted.current) setLoading(false);
      });
    return () => controller.abort();
  }, [id]);

  const isDirty = useMemo(() => {
    if (initialData == null) return false;
    return JSON.stringify(formData) !== initialData;
  }, [formData, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    const validationError = validateCampaignPatchForm(formData);
    if (validationError) {
      setError(validationError);
      return;
    }
    setSaving(true);
    setError(null);
    const payload = campaignFormToPatchPayload(formData);
    try {
      const res = await fetch(`/api/partner/campaigns/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error || 'Failed to update campaign');
      }
      if (mounted.current) router.push(`/dashboard/v2/campaigns/${id}`);
    } catch (err) {
      if (mounted.current) {
        setError(err instanceof Error ? err.message : 'Failed to update campaign');
      }
    } finally {
      if (mounted.current) setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-12 flex items-center justify-center">
          <div className="text-gray-500">Loading campaign…</div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !formData.name) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto py-12 text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/dashboard/v2/campaigns" className="text-blue-600 hover:underline">Back to campaigns</Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <Link
            href={`/dashboard/v2/campaigns/${id}`}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Edit campaign</h1>
            <p className="text-sm text-gray-500">Change rules, rewards, and other details.</p>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card>
            <CardBody className="p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                  <Megaphone size={20} />
                </div>
                <h2 className="text-xl font-bold">Basics</h2>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Campaign name</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select
                  className="w-full max-w-[200px] px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.status}
                  onChange={(e) => updateField('status', e.target.value as CampaignFormData['status'])}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="PAUSED">Paused</option>
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="EXPIRED">Expired</option>
                </select>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                  <Gift size={20} />
                </div>
                <h2 className="text-xl font-bold">Rewards</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reward value</label>
                  <input
                    type="number"
                    min={REWARD_VALUE_MIN}
                    max={REWARD_VALUE_MAX}
                    step={0.01}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.rewardValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateField('rewardValue', val === '' ? 0 : Number(val));
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-500">Between {REWARD_VALUE_MIN} and {REWARD_VALUE_MAX}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reward cap (optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="None"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.rewardCap ?? ''}
                    onChange={(e) => updateField('rewardCap', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level 1 reward ($, optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="Uses main"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
                    value={formData.level1Reward ?? ''}
                    onChange={(e) => updateField('level1Reward', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level 1 cap ($, optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
                    value={formData.level1Cap ?? ''}
                    onChange={(e) => updateField('level1Cap', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level 2 reward ($, optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    placeholder="e.g. 5"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
                    value={formData.level2Reward ?? ''}
                    onChange={(e) => updateField('level2Reward', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Level 2 cap ($, optional)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.01}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg"
                    value={formData.level2Cap ?? ''}
                    onChange={(e) => updateField('level2Cap', e.target.value === '' ? null : Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tier config (JSON, optional)</label>
                <textarea
                  rows={5}
                  placeholder='{"tiers": [{"minConversions": 0, "rewardValue": 10}]}'
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg font-mono text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.tierConfig}
                  onChange={(e) => updateField('tierConfig', e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500">Tiers ordered by minConversions; first matching tier applies. Leave empty to clear.</p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Payout Type</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {PAYOUT_TYPE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => updateField('payoutType', opt.value === '' ? null : opt.value as CampaignFormData['payoutType'])}
                      className={`p-3 border-2 rounded-xl text-left transition-all ${
                        (formData.payoutType ?? '') === opt.value
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10'
                          : 'border-gray-100 dark:border-gray-800'
                      }`}
                    >
                      <div className="font-medium text-sm">{opt.label}</div>
                      <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardBody className="p-6 space-y-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                  <Shield size={20} />
                </div>
                <h2 className="text-xl font-bold">Rules &amp; referral code</h2>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                <div>
                  <div className="font-bold">First-time users only</div>
                  <p className="text-xs text-gray-500">Only award if the referee is new to the platform.</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateField('firstTimeUserOnly', !formData.firstTimeUserOnly)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${formData.firstTimeUserOnly ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.firstTimeUserOnly ? 'right-1' : 'left-1'}`} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Start date (optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.startDate}
                    onChange={(e) => updateField('startDate', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">End date (optional)</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.endDate}
                    onChange={(e) => updateField('endDate', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Conversion window (days)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="e.g. 30"
                    className="w-full max-w-[140px] px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.conversionWindow ?? ''}
                    onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') updateField('conversionWindow', null);
                    else {
                      const n = parseInt(v, 10);
                      if (!Number.isNaN(n) && n >= 0) updateField('conversionWindow', n);
                    }
                  }}
                  />
                  <p className="mt-1 text-xs text-gray-500">0 = no limit.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Reward expiration (days, optional)</label>
                  <input
                    type="number"
                    min={0}
                    placeholder="None"
                    className="w-full max-w-[140px] px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.rewardExpiration ?? ''}
                    onChange={(e) => {
                    const v = e.target.value;
                    if (v === '') updateField('rewardExpiration', null);
                    else {
                      const n = parseInt(v, 10);
                      if (!Number.isNaN(n) && n >= 0) updateField('rewardExpiration', n);
                    }
                  }}
                  />
                </div>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-4">
                <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">Referral code generation</h4>
                <p className="text-xs text-gray-500">Optional prefix and format for generated codes (e.g. firir_john_abc).</p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Code prefix (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. firir_ or myapp_ref"
                    maxLength={24}
                    className="w-full max-w-[280px] px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm"
                    value={formData.referralCodePrefix}
                    onChange={(e) => updateField('referralCodePrefix', e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Code format</label>
                  <div className="flex flex-wrap gap-2">
                    {(['RANDOM', 'USERNAME', 'EMAIL_PREFIX'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => updateField('referralCodeFormat', fmt)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.referralCodeFormat === fmt ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                      >
                        {fmt === 'RANDOM' ? 'Random' : fmt === 'USERNAME' ? 'Username' : 'Email prefix'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          <div className="flex items-center justify-between pt-4">
            <Link
              href={`/dashboard/v2/campaigns/${id}`}
              className="px-6 py-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium text-sm transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !isDirty}
              className="flex items-center px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Save size={18} className="mr-2" />
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
