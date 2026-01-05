'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardBody } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { ChevronRight, Check, ArrowLeft, Megaphone, Target, Gift, Shield, Rocket } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const steps = [
  { id: 1, name: 'Basics', icon: <Megaphone size={18} /> },
  { id: 2, name: 'Referral Type', icon: <Target size={18} /> },
  { id: 3, name: 'Reward Logic', icon: <Gift size={18} /> },
  { id: 4, name: 'Rules', icon: <Shield size={18} /> },
  { id: 5, name: 'Review', icon: <Rocket size={18} /> },
];

export default function NewCampaignPage() {
  const { selectedApp } = useAppStore();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    referralType: 'ONE_SIDED',
    rewardModel: 'FIXED_CURRENCY',
    rewardValue: 10,
    firstTimeUserOnly: true,
  });

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!selectedApp) return;
    
    try {
      const response = await fetch('/api/partner/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, appId: selectedApp.id }),
      });
      
      if (response.ok) {
        router.push('/dashboard/v2/campaigns');
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
    }
  };

  if (!selectedApp) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <Megaphone size={32} />
          </div>
          <h2 className="text-xl font-bold">No App Selected</h2>
          <p className="text-gray-500 mt-2">Please select an app to create a campaign.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold">Create New Campaign</h1>
            <p className="text-sm text-gray-500">Define how your referral program will work.</p>
          </div>
        </div>

        {/* Stepper */}
        <nav aria-label="Progress">
          <ol className="flex items-center">
            {steps.map((step, stepIdx) => (
              <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                <div className="flex items-center group">
                  <span className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors
                    ${currentStep > step.id ? 'bg-blue-600 border-blue-600' : currentStep === step.id ? 'border-blue-600 text-blue-600 font-bold' : 'border-gray-300 text-gray-400'}
                  `}>
                    {currentStep > step.id ? <Check size={20} className="text-white" /> : step.id}
                  </span>
                  <span className={`ml-4 text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500'}`}>
                    {step.name}
                  </span>
                </div>
                {stepIdx !== steps.length - 1 && (
                  <div className="absolute top-5 left-10 w-full h-0.5 bg-gray-200 dark:bg-gray-800 -z-10" />
                )}
              </li>
            ))}
          </ol>
        </nav>

        <Card>
          <CardBody className="p-8">
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                    <Megaphone size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Campaign Basics</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Summer Referral Program 2024"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <p className="mt-1 text-xs text-gray-500">Internal name to identify this campaign.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Campaign Description (Optional)</label>
                    <textarea 
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 rounded-lg">
                    <Target size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Referral Type</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button 
                    onClick={() => setFormData({ ...formData, referralType: 'ONE_SIDED' })}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${formData.referralType === 'ONE_SIDED' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-800'}`}
                  >
                    <div className="font-bold text-lg mb-1">One-sided</div>
                    <p className="text-sm text-gray-500">Only the referrer receives a reward when someone signs up.</p>
                  </button>
                  <button 
                    onClick={() => setFormData({ ...formData, referralType: 'TWO_SIDED' })}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${formData.referralType === 'TWO_SIDED' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-800'}`}
                  >
                    <div className="font-bold text-lg mb-1">Two-sided</div>
                    <p className="text-sm text-gray-500">Both the referrer and the referee receive rewards.</p>
                  </button>
                  <button 
                    onClick={() => setFormData({ ...formData, referralType: 'MULTI_LEVEL' })}
                    className={`p-4 border-2 rounded-xl text-left transition-all ${formData.referralType === 'MULTI_LEVEL' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-800'}`}
                  >
                    <div className="font-bold text-lg mb-1 flex items-center">
                      Multi-level
                      <span className="ml-2 text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-wider">Pro</span>
                    </div>
                    <p className="text-sm text-gray-500">Rewards are distributed across multiple levels of referrals.</p>
                  </button>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 text-green-600 rounded-lg">
                    <Gift size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Reward Logic</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Reward Model</label>
                    <div className="flex space-x-4">
                      {['FIXED_CURRENCY', 'PERCENTAGE', 'TIERED'].map((model) => (
                        <button 
                          key={model}
                          onClick={() => setFormData({ ...formData, rewardModel: model as 'FIXED_CURRENCY' | 'PERCENTAGE' | 'TIERED' })}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${formData.rewardModel === model ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                        >
                          {model.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reward Value</label>
                    <div className="relative max-w-[200px]">
                      {formData.rewardModel === 'FIXED_CURRENCY' && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>}
                      <input 
                        type="number" 
                        className={`w-full ${formData.rewardModel === 'FIXED_CURRENCY' ? 'pl-7' : 'pl-4'} pr-10 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500`}
                        value={formData.rewardValue}
                        onChange={(e) => setFormData({ ...formData, rewardValue: parseFloat(e.target.value) })}
                      />
                      {formData.rewardModel === 'PERCENTAGE' && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/30 text-amber-600 rounded-lg">
                    <Shield size={20} />
                  </div>
                  <h2 className="text-xl font-bold">Campaign Rules</h2>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                    <div>
                      <div className="font-bold">First-time users only</div>
                      <p className="text-xs text-gray-500">Only award points if the referee is new to the platform.</p>
                    </div>
                    <button 
                      onClick={() => setFormData({ ...formData, firstTimeUserOnly: !formData.firstTimeUserOnly })}
                      className={`w-12 h-6 rounded-full transition-colors relative ${formData.firstTimeUserOnly ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.firstTimeUserOnly ? 'right-1' : 'left-1'}`} />
                    </button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Conversion Window (Days)</label>
                    <input 
                      type="number" 
                      defaultValue={30}
                      className="w-full max-w-[120px] px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 text-center py-4">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Rocket size={32} />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Ready to Launch!</h2>
                <p className="text-gray-500">Review your campaign settings before activating.</p>
                
                <div className="mt-8 grid grid-cols-2 gap-4 text-left p-6 bg-gray-50 dark:bg-gray-900 rounded-2xl">
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Campaign Name</div>
                    <div className="font-medium">{formData.name || 'Unnamed Campaign'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Type</div>
                    <div className="font-medium capitalize">{formData.referralType.toLowerCase().replace('_', ' ')}</div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Reward</div>
                    <div className="font-medium">
                      {formData.rewardModel === 'FIXED_CURRENCY' ? `$${formData.rewardValue}` : `${formData.rewardValue}%`}
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 uppercase font-bold tracking-wider">Status</div>
                    <div className="font-medium text-green-600">Active upon launch</div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-12 flex items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800">
              <button 
                onClick={handleBack}
                disabled={currentStep === 1}
                className={`px-6 py-2 rounded-lg font-medium text-sm transition-colors ${currentStep === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
              >
                Back
              </button>
              {currentStep < 5 ? (
                <button 
                  onClick={handleNext}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors flex items-center"
                >
                  Continue
                  <ChevronRight size={16} className="ml-1" />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-colors"
                >
                  Activate Campaign
                </button>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </DashboardLayout>
  );
}
