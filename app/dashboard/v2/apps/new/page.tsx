'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Rocket, ArrowLeft, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export default function NewAppPage() {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setSelectedApp } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/partner/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newApp = await response.json();
        setSelectedApp(newApp);
        router.push('/dashboard/v2');
      }
    } catch (error) {
      console.error('Error creating app:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Dashboard
        </button>

        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Rocket size={32} />
          </div>
          <h1 className="text-3xl font-bold">Create New Application</h1>
          <p className="text-gray-500 mt-2">Applications help you organize your campaigns and API keys.</p>
        </div>

        <Card>
          <CardBody className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Application Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. My SaaS Platform"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-1 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <p className="ml-3 text-sm text-gray-600 dark:text-gray-400">Separate API keys and webhook configurations.</p>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <p className="ml-3 text-sm text-gray-600 dark:text-gray-400">Isolated referral data and analytics.</p>
                </div>
                <div className="flex items-start">
                  <div className="mt-1 w-5 h-5 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check size={12} />
                  </div>
                  <p className="ml-3 text-sm text-gray-600 dark:text-gray-400">Independent campaign management.</p>
                </div>
              </div>

              <button 
                type="submit"
                disabled={loading || !name}
                className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating...' : 'Create Application'}
              </button>
            </form>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
