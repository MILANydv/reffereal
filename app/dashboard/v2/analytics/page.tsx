'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { BarChart3, TrendingUp, TrendingDown, Users, DollarSign, ArrowRight, Download, Calendar } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell 
} from 'recharts';

const data = [
  { name: 'Mon', clicks: 400, conversions: 240 },
  { name: 'Tue', clicks: 300, conversions: 139 },
  { name: 'Wed', clicks: 200, conversions: 980 },
  { name: 'Thu', clicks: 278, conversions: 390 },
  { name: 'Fri', clicks: 189, conversions: 480 },
  { name: 'Sat', clicks: 239, conversions: 380 },
  { name: 'Sun', clicks: 349, conversions: 430 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AnalyticsPage() {
  const { selectedApp } = useAppStore();

  if (!selectedApp) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <BarChart3 size={32} />
          </div>
          <h2 className="text-xl font-bold">No App Selected</h2>
          <p className="text-gray-500 mt-2">Please select an app to view analytics.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-gray-500 mt-1">Detailed performance metrics for {selectedApp.name}.</p>
          </div>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
              <Calendar size={16} className="mr-2" />
              Last 30 Days
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm">
              <Download size={18} className="mr-2" />
              Export Reports
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Referrals</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">2,543</div>
                <div className="text-green-600 text-xs font-bold flex items-center mb-1">
                  <TrendingUp size={12} className="mr-0.5" /> 12%
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Conversion Rate</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">18.2%</div>
                <div className="text-green-600 text-xs font-bold flex items-center mb-1">
                  <TrendingUp size={12} className="mr-0.5" /> 3.1%
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Revenue</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">$45,200</div>
                <div className="text-green-600 text-xs font-bold flex items-center mb-1">
                  <TrendingUp size={12} className="mr-0.5" /> 24%
                </div>
              </div>
            </CardBody>
          </Card>
          <Card>
            <CardBody className="p-4">
              <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Reward Cost</div>
              <div className="flex items-end justify-between">
                <div className="text-2xl font-bold">$4,820</div>
                <div className="text-amber-600 text-xs font-bold flex items-center mb-1">
                  <TrendingUp size={12} className="mr-0.5" /> 8%
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Conversion Funnel</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data}>
                    <defs>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorClicks)" />
                    <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Referral Status Distribution</CardTitle>
            </CardHeader>
            <CardBody>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Converted', value: 450 },
                        { name: 'Clicked', value: 300 },
                        { name: 'Pending', value: 200 },
                        { name: 'Flagged', value: 50 },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {[
                        { name: 'Converted', value: 450 },
                        { name: 'Clicked', value: 300 },
                        { name: 'Pending', value: 200 },
                        { name: 'Flagged', value: 50 },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mr-2" />
                    <span className="text-gray-500">Converted</span>
                  </div>
                  <span className="font-bold">45%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2" />
                    <span className="text-gray-500">Clicked</span>
                  </div>
                  <span className="font-bold">30%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2" />
                    <span className="text-gray-500">Pending</span>
                  </div>
                  <span className="font-bold">20%</span>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
