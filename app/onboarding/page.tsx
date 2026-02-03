'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
  Code,
  Building2,
  GraduationCap,
  Lightbulb,
  ArrowRight,
  Check,
  Zap,
  Users,
  BarChart3
} from 'lucide-react';

interface OnboardingData {
  userType: string;
  companyName: string;
  appName: string;
  appDescription: string;
}

const userTypes = [
  {
    id: 'developer',
    title: 'Developer',
    description: 'Building applications or services',
    icon: <Code size={32} />,
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    id: 'business_owner',
    title: 'Business Owner',
    description: 'Managing a company or organization',
    icon: <Building2 size={32} />,
    color: 'bg-green-50 text-green-600 border-green-200'
  },
  {
    id: 'startup',
    title: 'Startup Founder',
    description: 'Building a new business venture',
    icon: <Lightbulb size={32} />,
    color: 'bg-purple-50 text-purple-600 border-purple-200'
  },
  {
    id: 'student',
    title: 'Student',
    description: 'Learning and experimenting',
    icon: <GraduationCap size={32} />,
    color: 'bg-orange-50 text-orange-600 border-orange-200'
  }
];

const steps = [
  { id: 1, title: 'Account Type', description: 'Tell us about yourself' },
  { id: 2, title: 'Company Info', description: 'Basic company details' },
  { id: 3, title: 'First App', description: 'Create your first application' },
  { id: 4, title: 'Complete', description: 'You\'re all set!' }
];

export default function OnboardingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    userType: '',
    companyName: '',
    appName: '',
    appDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    if (session?.user?.role === 'SUPER_ADMIN') {
      router.push('/admin/v2');
      return;
    }

    loadOnboardingStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, router, session?.user?.role]);

  const loadOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/partner/onboarding-status');
      if (response.ok) {
        const data = await response.json();
        if (data.onboardingCompleted) {
          router.push('/dashboard/v2');
          return;
        }
        setOnboardingData(prev => ({
          ...prev,
          ...(data.data || {})
        }));
        setCurrentStep(data.step || 1);
      }
    } catch (error) {
      console.error('Error loading onboarding status:', error);
    }
  };

  const handleUserTypeSelect = (userType: string) => {
    setOnboardingData({ ...onboardingData, userType });
  };

  const handleNext = async () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      await completeOnboarding();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/partner/complete-onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(onboardingData),
      });

      if (response.ok) {
        router.push('/dashboard/v2');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to complete onboarding');
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return onboardingData.userType !== '';
      case 2:
        return (onboardingData.companyName || '').trim() !== '';
      case 3:
        return (onboardingData.appName || '').trim() !== '' &&
          (onboardingData.appDescription || '').trim() !== '';
      default:
        return true;
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Welcome to Referral Platform</h1>
          <p className="text-xl text-gray-600">Let&apos;s get you set up in just a few steps</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${step.id < currentStep
                  ? 'bg-green-500 border-green-500 text-white'
                  : step.id === currentStep
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                  }`}>
                  {step.id < currentStep ? (
                    <Check size={20} />
                  ) : (
                    <span className="text-sm font-bold">{step.id}</span>
                  )}
                </div>
                <div className="ml-3 hidden sm:block">
                  <p className={`text-sm font-medium ${step.id <= currentStep ? 'text-gray-900' : 'text-gray-500'
                    }`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-0.5 ml-4 ${step.id < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">
              {steps[currentStep - 1].title}
            </CardTitle>
            <p className="text-gray-600">{steps[currentStep - 1].description}</p>
          </CardHeader>
          <CardBody className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Step 1: User Type Selection */}
            {currentStep === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {userTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => handleUserTypeSelect(type.id)}
                    className={`p-6 rounded-lg border-2 transition-all text-left ${onboardingData.userType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    <div className={`w-16 h-16 rounded-lg flex items-center justify-center mb-4 ${type.color}`}>
                      {type.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{type.title}</h3>
                    <p className="text-gray-600 text-sm">{type.description}</p>
                  </button>
                ))}
              </div>
            )}

            {/* Step 2: Company Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Company or Organization Name
                  </label>
                  <input
                    type="text"
                    value={onboardingData.companyName}
                    onChange={(e) => setOnboardingData({ ...onboardingData, companyName: e.target.value })}
                    placeholder="Enter your company name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">What we&apos;ll do with this:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Personalize your dashboard experience</li>
                    <li>• Help you find relevant features</li>
                    <li>• Provide better support</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 3: Create First App */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={onboardingData.appName}
                    onChange={(e) => setOnboardingData({ ...onboardingData, appName: e.target.value })}
                    placeholder="e.g., My Awesome App"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Description
                  </label>
                  <textarea
                    value={onboardingData.appDescription}
                    onChange={(e) => setOnboardingData({ ...onboardingData, appDescription: e.target.value })}
                    placeholder="Briefly describe what your application does..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h4 className="font-medium text-green-900 mb-2">We&apos;ll create:</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li className="flex items-center">
                      <Zap size={16} className="mr-2" />
                      API key for your application
                    </li>
                    <li className="flex items-center">
                      <BarChart3 size={16} className="mr-2" />
                      Analytics dashboard
                    </li>
                    <li className="flex items-center">
                      <Users size={16} className="mr-2" />
                      Referral tracking system
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Step 4: Completion */}
            {currentStep === 4 && (
              <div className="text-center space-y-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <Check size={40} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re all set!</h3>
                  <p className="text-gray-600">
                    Welcome to the Referral Platform. Your dashboard is ready with your first application.
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">What happens next:</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• You&apos;ll be redirected to your dashboard</li>
                    <li>• Your API key will be ready to use</li>
                    <li>• Start creating referral campaigns</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <Button
                variant="secondary"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="px-6"
              >
                Back
              </Button>
              <Button
                onClick={handleNext}
                disabled={!isStepValid() || loading}
                className="px-6"
              >
                {currentStep === 4 ? (
                  loading ? 'Setting up...' : 'Complete Setup'
                ) : (
                  <>
                    Next
                    <ArrowRight size={16} className="ml-2" />
                  </>
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}