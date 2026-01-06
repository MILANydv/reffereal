'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAppStore } from '@/lib/store';
import { ArrowLeft, Megaphone, Settings, Gift, Shield, BarChart3, Edit3, Trash2, Calendar, Users, MousePointerClick, CheckCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';

interface CampaignData {
  id: string;
  name: string;
  status: string;
  referralType: string;
  rewardModel: string;
  rewardValue: number;
  startDate: string | null;
  endDate: string | null;
  _count: {
    referrals: number;
  };
}

export default function CampaignDetailPage() {
  const { selectedApp } = useAppStore();
  const router = useRouter();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [campaign, setCampaign] = useState<CampaignData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCampaign = useCallback(async () => {
    try {
      const response = await fetch(`/api/partner/campaigns/${id}`);
      if (response.ok) {
        const data = await response.json();
        setCampaign(data);
      }
    } catch (error) {
      console.error('Error fetching campaign:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCampaign();
  }, [fetchCampaign]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!campaign) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Campaign not found</h2>
          <button onClick={() => router.back()} className="mt-4 text-blue-600 hover:underline">Go back</button>
        </div>
      </DashboardLayout>
    );
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: <Megaphone size={18} /> },
    { id: 'rules', name: 'Rules', icon: <Shield size={18} /> },
    { id: 'rewards', name: 'Rewards', icon: <Gift size={18} /> },
    { id: 'performance', name: 'Performance', icon: <BarChart3 size={18} /> },
    { id: 'settings', name: 'Settings', icon: <Settings size={18} /> },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-500"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold">{campaign.name}</h1>
                <Badge variant={campaign.status === 'ACTIVE' ? 'success' : 'default'}>
                  {campaign.status}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1">Campaign ID: {campaign.id}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors font-medium text-sm">
              <Edit3 size={18} className="mr-2" />
              Edit
            </button>
            <button className="flex items-center px-4 py-2 border border-red-200 dark:border-red-900/30 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium text-sm">
              <Trash2 size={18} className="mr-2" />
              Delete
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors
                  ${activeTab === tab.id 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardBody>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-1">
                        <div className="text-gray-500 text-xs font-bold uppercase">Total Referrals</div>
                        <div className="text-3xl font-bold">{campaign._count?.referrals || 0}</div>
                        <div className="text-green-600 text-xs font-bold flex items-center">
                          <TrendingUp size={12} className="mr-1" /> 8.2%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-gray-500 text-xs font-bold uppercase">Conversions</div>
                        <div className="text-3xl font-bold">124</div>
                        <div className="text-green-600 text-xs font-bold flex items-center">
                          <TrendingUp size={12} className="mr-1" /> 12.5%
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-gray-500 text-xs font-bold uppercase">Conversion Rate</div>
                        <div className="text-3xl font-bold">14.8%</div>
                        <div className="text-amber-600 text-xs font-bold flex items-center">
                          <TrendingDown size={12} className="mr-1" /> 2.1%
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardBody className="p-0">
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-full flex items-center justify-center font-bold text-xs">JD</div>
                            <div>
                              <p className="text-sm font-medium">New referral created</p>
                              <p className="text-xs text-gray-500">by john.doe@example.com</p>
                            </div>
                          </div>
                          <div className="text-xs text-gray-400">2 hours ago</div>
                        </div>
                      ))}
                    </div>
                  </CardBody>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Configuration</CardTitle>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Type</span>
                      <span className="font-medium capitalize">{campaign.referralType.toLowerCase().replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Reward Model</span>
                      <span className="font-medium capitalize">{campaign.rewardModel.toLowerCase().replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500">Reward Value</span>
                      <span className="font-bold">
                        {campaign.rewardModel === 'FIXED_CURRENCY' ? `$${campaign.rewardValue}` : `${campaign.rewardValue}%`}
                      </span>
                    </div>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                      <div className="flex items-center text-xs text-gray-500 font-bold uppercase mb-2">
                        <Calendar size={14} className="mr-1" /> Active Dates
                      </div>
                      <p className="text-sm">
                        {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'Indefinite'}
                        {' — '}
                        {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Indefinite'}
                      </p>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'performance' && (
             <div className="space-y-6 animate-in fade-in duration-300">
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                 <StatBox title="Clicks" value="1,240" change="+12%" />
                 <StatBox title="Conversions" value="124" change="+5%" />
                 <StatBox title="CPA" value="$12.50" change="-2%" />
                 <StatBox title="Revenue" value="$45,000" change="+18%" />
               </div>
               <Card>
                 <CardHeader>
                   <CardTitle>Performance over time</CardTitle>
                 </CardHeader>
                 <CardBody>
                   <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-gray-900/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800">
                     <div className="text-center">
                       <BarChart3 className="mx-auto text-gray-400 mb-2" size={32} />
                       <p className="text-sm text-gray-500">Performance charts will be displayed here</p>
                     </div>
                   </div>
                 </CardBody>
               </Card>
             </div>
          )}

          {(activeTab === 'rules' || activeTab === 'rewards' || activeTab === 'settings') && (
            <Card className="animate-in fade-in duration-300">
              <CardBody className="py-12 text-center">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                   <Settings size={32} />
                </div>
                <h3 className="text-xl font-bold">Manage {activeTab}</h3>
                <p className="text-gray-500 max-w-md mx-auto mt-2">
                  Use this section to configure specific details for your campaign {activeTab}.
                </p>
                <button className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm">
                  Update {activeTab}
                </button>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatBox({ title, value, change }: { title: string, value: string, change: string }) {
  const isPositive = change.startsWith('+');
  return (
    <Card>
      <CardBody className="p-4">
        <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{title}</div>
        <div className="flex items-end justify-between">
          <div className="text-2xl font-bold">{value}</div>
          <div className={`${isPositive ? 'text-green-600' : 'text-red-600'} text-xs font-bold flex items-center mb-1`}>
            {isPositive ? <TrendingUp size={12} className="mr-0.5" /> : <TrendingDown size={12} className="mr-0.5" />}
            {change}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function TrendingUp({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  );
}

function TrendingDown({ size, className }: { size: number, className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
  );
}
