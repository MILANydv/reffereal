'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';

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
  const [flags, setFlags] = useState<FraudFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('unresolved');

  const loadFraudFlags = useCallback(async () => {
    try {
      const response = await fetch(`/api/partner/fraud?filter=${filter}`);
      if (response.ok) {
        const data = await response.json();
        setFlags(data);
      }
    } catch (error) {
      console.error('Error loading fraud flags:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadFraudFlags();
  }, [loadFraudFlags]);

  const handleResolve = async (flagId: string) => {
    try {
      const response = await fetch(`/api/partner/fraud/${flagId}/resolve`, {
        method: 'POST',
      });

      if (response.ok) {
        loadFraudFlags();
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
    };
    return labels[type] || type;
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

        {flags.length > 0 ? (
          <div className="space-y-4">
            {flags.map((flag) => (
              <Card key={flag.id}>
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {flag.isResolved ? (
                        <CheckCircle size={24} className="text-green-600 mt-1" />
                      ) : (
                        <AlertTriangle size={24} className="text-red-600 mt-1" />
                      )}
                      <div>
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-gray-900">{flag.appName}</h3>
                          <Badge
                            variant={flag.isResolved ? 'success' : 'error'}
                            size="sm"
                          >
                            {getFraudTypeLabel(flag.fraudType)}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{flag.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span>Code: {flag.referralCode}</span>
                          <span>•</span>
                          <span>{new Date(flag.createdAt).toLocaleString()}</span>
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
