'use client';

import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { useAppStore } from '@/lib/store';
import { Box, Code, Eye, Layers, Palette, Layout, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export default function UiBundlesPage() {
  const { selectedApp } = useAppStore();
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!selectedApp) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 mb-4">
            <Box size={32} />
          </div>
          <h2 className="text-xl font-bold">No App Selected</h2>
          <p className="text-gray-500 mt-2">Please select an app to view its UI bundles.</p>
        </div>
      </DashboardLayout>
    );
  }

  const widgets = [
    {
      id: 'referral-share',
      name: 'Referral Share Widget',
      description: 'A pre-built widget for users to copy their referral code and share it on social media.',
      preview: 'https://placehold.co/600x400/f3f4f6/3b82f6?text=Referral+Share+Preview',
      code: `<script src="https://cdn.referral.com/widgets.js"></script>\n<referral-share app-id="${selectedApp.id}"></referral-share>`
    },
    {
      id: 'referral-status',
      name: 'Referral Status Widget',
      description: 'Allows users to see how many people they have referred and their earned rewards.',
      preview: 'https://placehold.co/600x400/f3f4f6/10b981?text=Referral+Status+Preview',
      code: `<script src="https://cdn.referral.com/widgets.js"></script>\n<referral-status app-id="${selectedApp.id}"></referral-status>`
    },
    {
      id: 'leaderboard',
      name: 'Leaderboard Widget',
      description: 'Display top referrers to encourage competition among your users.',
      preview: 'https://placehold.co/600x400/f3f4f6/f59e0b?text=Leaderboard+Preview',
      code: `<script src="https://cdn.referral.com/widgets.js"></script>\n<referral-leaderboard app-id="${selectedApp.id}"></referral-leaderboard>`
    }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">UI Bundles</h1>
          <p className="text-gray-500 mt-1">Embed ready-to-use referral components directly into your application.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {widgets.map((widget) => (
              <Card key={widget.id} className="overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{widget.name}</CardTitle>
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500">
                        <Eye size={18} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-500">
                        <Palette size={18} />
                      </button>
                    </div>
                  </div>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 p-6 border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{widget.description}</p>
                      <div className="mt-6 space-y-3">
                        <div className="flex items-center text-xs text-gray-500 font-bold uppercase tracking-wider">
                          <Layers size={14} className="mr-2" /> Features
                        </div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2">
                          <li className="flex items-center"><Check size={12} className="mr-2 text-green-500" /> Fully responsive</li>
                          <li className="flex items-center"><Check size={12} className="mr-2 text-green-500" /> Customizable CSS</li>
                          <li className="flex items-center"><Check size={12} className="mr-2 text-green-500" /> Multi-language support</li>
                        </ul>
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold flex items-center">
                            <Code size={16} className="mr-2 text-blue-500" /> Embed Code
                          </label>
                          <button 
                            onClick={() => copyToClipboard(widget.code, widget.id)}
                            className="text-xs font-bold text-blue-600 flex items-center hover:underline"
                          >
                            {copied === widget.id ? <><Check size={12} className="mr-1" /> Copied</> : <><Copy size={12} className="mr-1" /> Copy Code</>}
                          </button>
                        </div>
                        <pre className="bg-zinc-900 text-zinc-300 p-4 rounded-lg text-xs font-mono overflow-x-auto">
                          {widget.code}
                        </pre>
                      </div>
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start">
                          <Layout size={14} className="mr-2 mt-0.5 flex-shrink-0" />
                          Tip: You can customize the look and feel of this widget in the Settings tab using custom CSS variables.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm text-gray-500 uppercase font-bold tracking-wider">Configuration</CardTitle>
              </CardHeader>
              <CardBody className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Primary Color</label>
                  <div className="flex items-center space-x-2">
                    <input type="color" defaultValue="#3b82f6" className="w-10 h-10 rounded border-0 p-0 overflow-hidden" />
                    <input type="text" defaultValue="#3b82f6" className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Border Radius</label>
                  <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm">
                    <option>None (0px)</option>
                    <option>Small (4px)</option>
                    <option selected>Medium (8px)</option>
                    <option>Large (16px)</option>
                    <option>Full (999px)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Font Family</label>
                  <select className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm">
                    <option selected>Sans-serif (System)</option>
                    <option>Inter</option>
                    <option>Roboto</option>
                    <option>Monospace</option>
                  </select>
                </div>
                <button className="w-full py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-lg font-bold text-sm hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </CardBody>
            </Card>

            <Card className="bg-zinc-900 text-white">
              <CardBody className="p-6">
                <h3 className="font-bold mb-2">Custom SDK</h3>
                <p className="text-zinc-400 text-sm mb-4">Building a custom UI? Use our React, Vue or Flutter SDKs for deeper integration.</p>
                <button className="text-sm font-bold text-blue-400 hover:text-blue-300 flex items-center">
                  View SDK Documentation
                </button>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
