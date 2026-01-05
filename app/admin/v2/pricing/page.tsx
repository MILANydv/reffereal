'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit3, Trash2, Check, Zap, Users, Box } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';

interface PricingPlan {
  id: string;
  name: string;
  type: string;
  monthlyPrice: number;
  apiLimit: number;
  maxApps: number;
  overagePrice: number;
  features: string;
}

export default function AdminPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPlans = useCallback(async () => {
    try {
      const response = await fetch('/api/partner/pricing-plans');
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pricing Plans</h1>
            <p className="text-gray-500 mt-1">Configure and manage platform subscription tiers.</p>
          </div>
          <button className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-bold text-sm">
            <Plus size={18} className="mr-2" />
            Create New Plan
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-4 text-center py-12 text-gray-500">Loading plans...</div>
          ) : plans.map((plan) => (
            <Card key={plan.id} className="flex flex-col h-full border-t-4 border-t-blue-600">
              <CardBody className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <Badge variant="secondary">{plan.type}</Badge>
                  <div className="flex space-x-1">
                    <button className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors">
                      <Edit3 size={14} />
                    </button>
                    <button className="p-1.5 text-gray-400 hover:text-red-600 transition-colors">
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
                      {JSON.parse(plan.features).map((feature: string, idx: number) => (
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
                    <span>Active Partners</span>
                    <span className="font-bold text-gray-900 dark:text-gray-100">124</span>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
