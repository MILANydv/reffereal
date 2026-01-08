'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Edit3, Trash2, Search, Check, Zap, Users, Box, X } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

import { useAdminStore } from '@/lib/store';

interface PricingPlan {
  id: string;
  name: string;
  type: string;
  monthlyPrice: number;
  yearlyPrice: number;
  apiLimit: number;
  maxApps: number;
  overagePrice: number;
  features: string[];
  isActive: boolean;
}

export default function AdminPricingPage() {
  const { pricing: plans, fetchPricing: fetchPlans, isLoading, invalidate } = useAdminStore();
  const loading = isLoading['pricing'];
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    apiLimit: 10000,
    maxApps: 1,
    overagePrice: 0.01,
    features: [''],
    isActive: true,
  });

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingPlan ? '/api/admin/pricing-plans' : '/api/admin/pricing-plans';
      const method = editingPlan ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingPlan ? { id: editingPlan.id, ...formData } : formData),
      });

      if (response.ok) {
        invalidate('pricing');
        fetchPlans(true);
        setShowModal(false);
        resetForm();
      }
      else {
        const error = await response.json();
        alert(error.error || 'Error saving plan');
      }
    } catch (error) {
      console.error('Error saving pricing plan:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pricing plan?')) return;

    try {
      const response = await fetch(`/api/admin/pricing-plans?id=${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        fetchPlans();
      } else {
        const error = await response.json();
        alert(error.error || 'Error deleting plan');
      }
    } catch (error) {
      console.error('Error deleting pricing plan:', error);
    }
  };

  const handleToggleActive = async (plan: any) => {
    try {
      const response = await fetch('/api/admin/pricing-plans', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: plan.id, isActive: !plan.isActive }),
      });
      if (response.ok) {
        invalidate('pricing');
        fetchPlans(true);
      }
    } catch (error) {
      console.error('Error toggling plan status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      monthlyPrice: 0,
      yearlyPrice: 0,
      apiLimit: 10000,
      maxApps: 1,
      overagePrice: 0.01,
      features: [''],
      isActive: true,
    });
    setEditingPlan(null);
  };

  const openEditModal = (plan: PricingPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      type: plan.type,
      monthlyPrice: plan.monthlyPrice,
      yearlyPrice: plan.yearlyPrice,
      apiLimit: plan.apiLimit,
      maxApps: plan.maxApps,
      overagePrice: plan.overagePrice,
      features: plan.features,
      isActive: plan.isActive,
    });
    setShowModal(true);
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const removeFeature = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures });
  };

  const filteredPlans = plans.filter(
    (plan) =>
      plan.name.toLowerCase().includes(search.toLowerCase()) ||
      plan.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
            <p className="text-gray-500 mt-1">Configure and manage platform subscription tiers.</p>
          </div>
          <Button onClick={() => { resetForm(); setShowModal(true); }}>
            <Plus size={18} className="mr-2" />
            Create Plan
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <CardSkeleton key={i} />
            ))
          ) : filteredPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`flex flex-col h-full border-t-4 ${plan.isActive ? 'border-t-blue-600' : 'border-t-gray-400'}`}
            >
              <CardBody className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant={plan.isActive ? 'default' : 'warning'}>
                    {plan.type}
                  </Badge>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleToggleActive(plan)}
                      className={`p-1.5 rounded transition-colors ${plan.isActive
                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                    >
                      {plan.isActive ? <Check size={14} /> : <X size={14} />}
                    </button>
                    <button
                      onClick={() => openEditModal(plan)}
                      className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-3xl font-bold">${plan.monthlyPrice}</span>
                  <span className="text-gray-500 text-sm">/mo</span>
                </div>

                <div className="space-y-3 flex-1">
                  <div className="flex items-center text-sm">
                    <Zap size={14} className="mr-2 text-yellow-500" />
                    <span className="text-gray-600 dark:text-gray-400">{plan.apiLimit.toLocaleString()} API hits</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Box size={14} className="mr-2 text-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">Up to {plan.maxApps} Apps</span>
                  </div>
                  <div className="flex items-center text-sm">
                    <Users size={14} className="mr-2 text-green-500" />
                    <span className="text-gray-600 dark:text-gray-400">Overage: ${plan.overagePrice}/1k hits</span>
                  </div>
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Features</div>
                    <ul className="space-y-2">
                      {(plan.features || []).map((feature: any, idx: number) => (
                        <li key={idx} className="flex items-start text-xs text-gray-600 dark:text-gray-400">
                          <Check size={12} className="mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{plan.isActive ? 'Active' : 'Inactive'}</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">
                      {plan.isActive ? '✓' : '○'}
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-auto py-8">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle>{editingPlan ? 'Edit Pricing Plan' : 'Create Pricing Plan'}</CardTitle>
            </CardHeader>
            <CardBody>
              <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Pro Plan"
                      required
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Type *
                    </label>
                    <input
                      type="text"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value.toUpperCase().replace(/\s/g, '_') })}
                      placeholder="e.g., PRO"
                      required
                      disabled={!!editingPlan}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Price *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.monthlyPrice}
                      onChange={(e) => setFormData({ ...formData, monthlyPrice: parseFloat(e.target.value) })}
                      required
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Yearly Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.yearlyPrice}
                      onChange={(e) => setFormData({ ...formData, yearlyPrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      API Limit *
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.apiLimit}
                      onChange={(e) => setFormData({ ...formData, apiLimit: parseInt(e.target.value) })}
                      required
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Max Apps *
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxApps}
                      onChange={(e) => setFormData({ ...formData, maxApps: parseInt(e.target.value) })}
                      required
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Overage Price
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      value={formData.overagePrice}
                      onChange={(e) => setFormData({ ...formData, overagePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Features
                  </label>
                  <div className="space-y-2">
                    {formData.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => handleFeatureChange(index, e.target.value)}
                          placeholder="e.g., Unlimited campaigns"
                          className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        {formData.features.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeFeature(index)}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                    <Button type="button" variant="ghost" size="sm" onClick={addFeature}>
                      <Plus size={14} className="mr-1" /> Add Feature
                    </Button>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700 dark:text-gray-300">
                    Plan is active
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingPlan ? 'Save Changes' : 'Create Plan'}
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
