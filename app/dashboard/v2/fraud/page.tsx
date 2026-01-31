'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, ShieldAlert } from 'lucide-react';
import { PageHeaderSkeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { useAppStore } from '@/lib/store';

interface FraudFlag {
  id: string;
  referralCode: string;
  fraudType: string;
  description: string;
  metadata: string | null;
  isResolved: boolean;
  createdAt: string;
  appName: string;
}

export default function FraudPage() {
  const { selectedApp, fraud: flags, fetchFraud: loadFraudFlags, isLoading, invalidate } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');
  const loading = isLoading[`fraud-${selectedApp?.id || 'all'}`];

  useEffect(() => {
    if (selectedApp) {
      loadFraudFlags(selectedApp.id);
    }
  }, [selectedApp, loadFraudFlags]);

  const handleResolve = async (flagId: string) => {
    try {
      const response = await fetch(`/api/partner/fraud/${flagId}/resolve`, {
        method: 'POST',
      });

      if (response.ok) {
        invalidate(`fraud-${selectedApp?.id}`);
        if (selectedApp) {
          loadFraudFlags(selectedApp.id);
        }
      }
    } catch (error) {
      console.error('Error resolving flag:', error);
    }
  };

  const getFraudTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      DUPLICATE_IP: 'Duplicate IP',
      SELF_REFERRAL: 'Self Referral',
      RATE_LIMIT_EXCEEDED: 'Rate Limit',
      SUSPICIOUS_PATTERN: 'Suspicious Pattern',
      VELOCITY_CHECK: 'Velocity Check',
      DEVICE_FINGERPRINT: 'Device Fingerprint',
      MANUAL_FLAG: 'Manual Flag',
      VPN_PROXY_DETECTED: 'VPN/Proxy Detected',
    };
    return labels[type] || type;
  };

  const filteredFlags = flags.filter(flag => {
    if (filter === 'unresolved') return !flag.isResolved;
    if (filter === 'resolved') return flag.isResolved;
    return true;
  });

  if (loading && flags.length === 0) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <PageHeaderSkeleton />
          <div className="flex space-x-2">
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            <div className="h-9 w-24 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
          </div>
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Fraud Detection</h1>
          <p className="mt-2 text-gray-600">Monitor and manage suspicious referral activity</p>
        </div>

        <div className="flex space-x-2">
          <Button
            variant={filter === 'unresolved' ? 'primary' : 'ghost'}
            onClick={() => setFilter('unresolved')}
            size="sm"
          >
            Unresolved
          </Button>
          <Button
            variant={filter === 'resolved' ? 'primary' : 'ghost'}
            onClick={() => setFilter('resolved')}
            size="sm"
          >
            Resolved
          </Button>
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setFilter('all')}
            size="sm"
          >
            All
          </Button>
        </div>

        {filteredFlags.length > 0 ? (
          <div className="space-y-4">
            {filteredFlags.map((flag: any) => (
              <Card 
                key={flag.id}
                className={flag.isManual ? 'border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-900/10' : ''}
              >
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {flag.isResolved ? (
                        <CheckCircle size={24} className="text-green-600 mt-1" />
                      ) : flag.isManual ? (
                        <ShieldAlert size={24} className="text-orange-600 mt-1" />
                      ) : (
                        <AlertTriangle size={24} className="text-red-600 mt-1" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{flag.appName}</h3>
                          <Badge
                            variant={flag.isResolved ? 'success' : flag.isManual ? 'warning' : 'error'}
                            size="sm"
                          >
                            {getFraudTypeLabel(flag.fraudType)}
                            {flag.isManual && ' (Manual)'}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{flag.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <span>Code: {flag.referralCode}</span>
                          <span>•</span>
                          <span>{new Date(flag.createdAt).toLocaleString()}</span>
                          {flag.isManual && (
                            <>
                              <span>•</span>
                              <span className="text-orange-600 dark:text-orange-400 font-medium">Manually Flagged</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    {!flag.isResolved && (
                      <Button size="sm" onClick={() => handleResolve(flag.id)}>
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardBody className="text-center py-12">
              <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
              <p className="text-gray-500">
                {filter === 'unresolved'
                  ? 'No unresolved fraud alerts'
                  : 'No fraud alerts found'}
              </p>
            </CardBody>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
