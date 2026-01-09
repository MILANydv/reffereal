'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { Check, TrendingUp } from 'lucide-react';
import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/Skeleton';

import { useAppStore } from '@/lib/store';

interface Subscription {
  id: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  plan: PricingPlan;
}

interface Invoice {
  id: string;
  amount: number;
  status: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  apiUsage: number;
  overageAmount: number;
  createdAt: string;
  paidAt: string | null;
}

interface BillingData {
  subscription: Subscription | null;
  invoices: Invoice[];
  currentUsage: {
    apiCalls: number;
    overage: number;
    estimatedCost: number;
  };
}

export default function BillingPage() {
  const { billing: billingData, pricing: allPlans, fetchBilling, fetchPricing: loadPricingPlans, isLoading, invalidate } = useAppStore();
  const loading = isLoading['billing'];
  const [showPlans, setShowPlans] = useState(false);

  useEffect(() => {
    fetchBilling();
    loadPricingPlans();
  }, [fetchBilling, loadPricingPlans]);

  const handleUpgrade = async (planId: string) => {
    try {
      const response = await fetch('/api/partner/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (response.ok) {
        invalidate('billing');
        fetchBilling(true);
        setShowPlans(false);
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <CardSkeleton />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Billing & Subscription</h1>
            <p className="mt-2 text-gray-600">Manage your subscription and view billing history</p>
          </div>
          {!showPlans && (
            <Button onClick={() => setShowPlans(true)}>
              <TrendingUp size={16} className="mr-2" />
              Change Plan
            </Button>
          )}
        </div>

        {showPlans && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Choose Your Plan</h2>
              <Button variant="ghost" onClick={() => setShowPlans(false)}>
                Cancel
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {allPlans.map((plan) => {
                const isCurrentPlan = billingData?.subscription?.plan.id === plan.id;
                return (
                  <Card
                    key={plan.id}
                    className={`relative ${isCurrentPlan ? 'ring-2 ring-blue-500' : ''}`}
                  >
                    {isCurrentPlan && (
                      <div className="absolute top-4 right-4">
                        <Badge variant="success">Current</Badge>
                      </div>
                    )}
                    <CardBody>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <div className="mb-4">
                        <span className="text-4xl font-bold text-gray-900">${plan.monthlyPrice}</span>
                        <span className="text-gray-600">/month</span>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start text-sm text-gray-600">
                            <Check size={16} className="mr-2 mt-0.5 text-green-600 flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button
                        onClick={() => handleUpgrade(plan.id)}
                        disabled={isCurrentPlan}
                        className="w-full"
                      >
                        {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
                      </Button>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {billingData?.subscription && (
          <Card>
            <CardHeader>
              <CardTitle>Current Subscription</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Plan</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {billingData.subscription.plan.name}
                  </div>
                  <Badge variant={billingData.subscription.status === 'ACTIVE' ? 'success' : 'default'} size="sm" className="mt-2">
                    {billingData.subscription.status}
                  </Badge>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Monthly Cost</div>
                  <div className="text-lg font-semibold text-gray-900">
                    ${billingData.subscription.plan.monthlyPrice}/month
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Renewal Date</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {new Date(billingData.subscription.currentPeriodEnd).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {billingData?.currentUsage && (
          <Card>
            <CardHeader>
              <CardTitle>Current Period Usage</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">API Calls</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {billingData.currentUsage.apiCalls.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Overage</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {billingData.currentUsage.overage.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Estimated Cost</div>
                  <div className="text-2xl font-bold text-gray-900">
                    ${billingData.currentUsage.estimatedCost.toFixed(2)}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardBody>
            {billingData?.invoices && billingData.invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Period</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">API Usage</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Overage</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billingData.invoices.map((invoice) => (
                      <tr key={invoice.id} className="border-b border-gray-100">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {new Date(invoice.billingPeriodStart).toLocaleDateString()} -{' '}
                          {new Date(invoice.billingPeriodEnd).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {invoice.apiUsage.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-900">
                          ${invoice.overageAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">
                          ${invoice.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={
                              invoice.status === 'paid'
                                ? 'success'
                                : invoice.status === 'pending'
                                  ? 'default'
                                  : 'error'
                            }
                            size="sm"
                          >
                            {invoice.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-8">No invoices yet</p>
            )}
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
