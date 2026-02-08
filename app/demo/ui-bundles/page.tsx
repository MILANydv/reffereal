'use client';

import { useState } from 'react';
import { DashboardLayout } from '@/components/ui/DashboardLayout';
import { Card, CardHeader, CardBody, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAppStore } from '@/lib/store';
import { Box, Code, Copy, Check, Layers, Layout, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

const WIDGETS_SCRIPT_BASE = 'https://reffereal.vercel.app/widgets.js';

const WIDGETS = [
  {
    id: 'referral-share',
    name: 'Referral Share Widget',
    tag: 'referral-share',
    description: 'A pre-built widget for users to copy their referral code and share it on social media.',
    features: ['Copy referral code', 'Share links (Twitter, LinkedIn, Email)', 'Fully responsive'],
  },
  {
    id: 'referral-status',
    name: 'Referral Status Widget',
    tag: 'referral-status',
    description: 'Shows how many people the user has referred and their earned rewards.',
    features: ['Referrals count', 'Rewards earned', 'Customizable theme'],
  },
  {
    id: 'leaderboard',
    name: 'Leaderboard Widget',
    tag: 'referral-leaderboard',
    description: 'Display top referrers to encourage competition among your users.',
    features: ['Top N referrers', 'Anonymous or named', 'Refresh interval'],
  },
];

function buildEmbedCode(
  tag: string,
  appId: string,
  opts: { primaryColor?: string; borderRadius?: string; fontFamily?: string }
): string {
  const attrs = [`app-id="${appId}"`];
  if (opts.primaryColor) attrs.push(`primary-color="${opts.primaryColor}"`);
  if (opts.borderRadius) attrs.push(`border-radius="${opts.borderRadius}"`);
  if (opts.fontFamily) attrs.push(`font-family="${opts.fontFamily}"`);
  return `<script src="${WIDGETS_SCRIPT_BASE}"></script>\n<${tag} ${attrs.join(' ')}></${tag}>`;
}

const fontFamilyMap: Record<string, string> = {
  system: 'system-ui, sans-serif',
  Inter: '"Inter", sans-serif',
  Roboto: '"Roboto", sans-serif',
  monospace: 'monospace',
};

function WidgetPreview({
  widgetId,
  title,
  appId,
  primaryColor,
  borderRadius,
  fontFamily,
}: {
  widgetId: string;
  title: string;
  appId: string;
  primaryColor: string;
  borderRadius: string;
  fontFamily: string;
}) {
  const font = fontFamilyMap[fontFamily] || fontFamilyMap.system;
  const baseStyle: React.CSSProperties = {
    boxSizing: 'border-box',
    fontFamily: font,
    borderRadius,
    background: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '1rem 1.25rem',
    color: '#334155',
    fontSize: '14px',
    lineHeight: 1.5,
  };

  if (widgetId === 'referral-status') {
    return (
      <div style={baseStyle} className="dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200">
        <div style={{ fontWeight: 700, color: primaryColor, marginBottom: '0.5rem' }}>{title}</div>
        <p style={{ margin: '0 0 0.5rem' }}>
          App: <code style={{ fontSize: '12px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }} className="dark:bg-slate-700 dark:text-slate-300">{appId || '—'}</code>
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }} className="dark:text-slate-400">
          To show live referrals and rewards, pass <code style={{ fontSize: '11px' }}>user-id</code> and use our API to load data into your own UI.
        </p>
      </div>
    );
  }

  if (widgetId === 'referral-share') {
    return (
      <div style={baseStyle} className="dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200">
        <div style={{ fontWeight: 700, color: primaryColor, marginBottom: '0.5rem' }}>{title}</div>
        <p style={{ margin: '0 0 0.5rem' }}>
          App: <code style={{ fontSize: '12px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }} className="dark:bg-slate-700 dark:text-slate-300">{appId || '—'}</code>
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }} className="dark:text-slate-400">
          Generate a code via <code style={{ fontSize: '11px' }}>POST /api/v1/referrals</code>, then display and share it from your app.
        </p>
      </div>
    );
  }

  if (widgetId === 'leaderboard') {
    return (
      <div style={baseStyle} className="dark:bg-slate-800/50 dark:border-slate-700 dark:text-slate-200">
        <div style={{ fontWeight: 700, color: primaryColor, marginBottom: '0.5rem' }}>{title}</div>
        <p style={{ margin: '0 0 0.5rem' }}>
          App: <code style={{ fontSize: '12px', background: '#e2e8f0', padding: '2px 6px', borderRadius: '4px' }} className="dark:bg-slate-700 dark:text-slate-300">{appId || '—'}</code>
        </p>
        <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }} className="dark:text-slate-400">
          Build a leaderboard using partner analytics or your backend.
        </p>
      </div>
    );
  }

  return null;
}

export default function DemoUiBundlesPage() {
  const { selectedApp } = useAppStore();
  const [appId, setAppId] = useState(selectedApp?.id ?? '');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [borderRadius, setBorderRadius] = useState('8px');
  const [fontFamily, setFontFamily] = useState('system');
  const [copied, setCopied] = useState<string | null>(null);

  const config = {
    primaryColor,
    borderRadius,
    fontFamily,
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copied to clipboard');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              UI Bundles Simulator
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Generate and preview embed code for referral widgets
            </p>
          </div>
          <Link
            href="/dashboard/v2/ui-bundles"
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
          >
            <ExternalLink size={16} />
            Dashboard UI Bundles
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Configuration</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                App ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={appId}
                onChange={(e) => setAppId(e.target.value)}
                placeholder="clxxxxxxxxxxxx"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-mono text-sm"
              />
              {selectedApp && (
                <button
                  type="button"
                  onClick={() => setAppId(selectedApp.id)}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
                >
                  Use current app
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Primary color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border border-gray-300 dark:border-gray-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Border radius
                </label>
                <select
                  value={borderRadius}
                  onChange={(e) => setBorderRadius(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                >
                  <option value="0">None (0px)</option>
                  <option value="4px">Small (4px)</option>
                  <option value="8px">Medium (8px)</option>
                  <option value="16px">Large (16px)</option>
                  <option value="999px">Full (999px)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Font family
                </label>
                <select
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm"
                >
                  <option value="system">Sans-serif (System)</option>
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="monospace">Monospace</option>
                </select>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Widgets</h2>
          {WIDGETS.map((widget) => {
            const code = buildEmbedCode(widget.tag, appId || 'YOUR_APP_ID', config);
            return (
              <Card key={widget.id} className="overflow-hidden">
                <CardHeader className="border-b border-gray-100 dark:border-gray-800">
                  <CardTitle className="text-lg">{widget.name}</CardTitle>
                </CardHeader>
                <CardBody className="p-0">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        {widget.description}
                      </p>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          <Layers size={14} className="mr-2" /> Features
                        </div>
                        <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1.5">
                          {widget.features.map((f) => (
                            <li key={f} className="flex items-center">
                              <Check size={12} className="mr-2 text-green-500 flex-shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="mt-4">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                          Live preview
                        </p>
                        <WidgetPreview
                          widgetId={widget.id}
                          title={widget.name.replace(' Widget', '')}
                          appId={appId || 'YOUR_APP_ID'}
                          primaryColor={config.primaryColor}
                          borderRadius={config.borderRadius}
                          fontFamily={config.fontFamily}
                        />
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                          <Code size={16} className="mr-2 text-blue-500" /> Embed code
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(code, widget.id)}
                        >
                          {copied === widget.id ? (
                            <>
                              <Check size={14} className="mr-1" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy size={14} className="mr-1" /> Copy
                            </>
                          )}
                        </Button>
                      </div>
                      <pre className="bg-zinc-900 dark:bg-zinc-950 text-zinc-300 p-4 rounded-lg text-xs font-mono overflow-x-auto whitespace-pre-wrap break-all">
                        {code}
                      </pre>
                      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                        <p className="text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
                          <Layout size={14} className="mt-0.5 flex-shrink-0" />
                          Tip: Add the script once per page. Widgets use your App ID and optional
                          data attributes for theming (primary-color, border-radius, font-family).
                        </p>
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            );
          })}
        </div>

        <Card className="bg-zinc-900 dark:bg-zinc-950 text-white border-zinc-700">
          <CardBody className="p-6">
            <h3 className="font-bold mb-2">Custom integration</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Building a custom UI? Use the API (Create Referral, Track Click, Track Conversion,
              User Stats) with your API key for full control.
            </p>
            <Link href="/demo" className="text-sm font-bold text-blue-400 hover:text-blue-300">
              Open API Simulator →
            </Link>
          </CardBody>
        </Card>

        <div className="flex flex-wrap gap-2 text-sm">
          <Link
            href="/demo"
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            API Simulator
          </Link>
          <Link
            href="/demo/webhooks"
            className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Webhooks Simulator
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}
