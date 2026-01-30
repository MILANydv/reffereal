'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  CreditCard,
  Webhook,
  Users,
  BarChart3,
  Code,
  Building2,
  LogOut,
  Megaphone,
  UserPlus,
  Box,
  Terminal,
  ShieldAlert,
  Flag,
  Zap,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useAppStore } from '@/lib/store';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const getPartnerNavigation = (appId: string | null): NavSection[] => {
  if (!appId) {
    return [
      {
        title: 'Global',
        items: [
          { name: 'Home', href: '/dashboard/v2', icon: <LayoutDashboard size={20} /> },
          { name: 'Applications', href: '/dashboard/v2/apps', icon: <Building2 size={20} /> },
          { name: 'API Usage', href: '/dashboard/v2/usage', icon: <Zap size={20} /> },
          { name: 'Billing', href: '/dashboard/v2/billing', icon: <CreditCard size={20} /> },
          { name: 'Team', href: '/dashboard/v2/team', icon: <Users size={20} /> },
          { name: 'Settings', href: '/dashboard/v2/settings', icon: <Settings size={20} /> },
        ],
      },
    ];
  }

  return [
    {
      title: 'App Context',
      items: [
        { name: 'Overview', href: `/dashboard/v2`, icon: <LayoutDashboard size={20} /> },
        { name: 'API Usage', href: '/dashboard/v2/usage', icon: <Zap size={20} /> },
        { name: 'API & Keys', href: `/dashboard/v2/api-keys`, icon: <Code size={20} /> },
        { name: 'Campaigns', href: `/dashboard/v2/campaigns`, icon: <Megaphone size={20} /> },
        { name: 'Referrals', href: `/dashboard/v2/referrals`, icon: <UserPlus size={20} /> },
        { name: 'Analytics', href: `/dashboard/v2/analytics`, icon: <BarChart3 size={20} /> },
        { name: 'Webhooks', href: `/dashboard/v2/webhooks`, icon: <Webhook size={20} /> },
        { name: 'UI Bundles', href: `/dashboard/v2/ui-bundles`, icon: <Box size={20} /> },
        { name: 'Billing', href: `/dashboard/v2/billing`, icon: <CreditCard size={20} /> },
        { name: 'Settings', href: `/dashboard/v2/settings`, icon: <Settings size={20} /> },
      ],
    },
  ];
};

const adminNavigation: NavSection[] = [
  {
    title: 'Admin',
    items: [
      { name: 'Platform Overview', href: '/admin/v2', icon: <LayoutDashboard size={20} /> },
      { name: 'Partners', href: '/admin/v2/partners', icon: <Users size={20} /> },
      { name: 'Apps', href: '/admin/v2/apps', icon: <Building2 size={20} /> },
      { name: 'Usage', href: '/admin/v2/usage', icon: <Zap size={20} /> },
      { name: 'Billing', href: '/admin/v2/billing', icon: <CreditCard size={20} /> },
      { name: 'Pricing Plans', href: '/admin/v2/pricing', icon: <Box size={20} /> },
      { name: 'Abuse & Fraud', href: '/admin/v2/fraud', icon: <ShieldAlert size={20} /> },
      { name: 'Feature Flags', href: '/admin/v2/features', icon: <Flag size={20} /> },
      { name: 'System Logs', href: '/admin/v2/logs', icon: <Terminal size={20} /> },
    ],
  },
];

interface SidebarProps {
  userRole: 'SUPER_ADMIN' | 'PARTNER';
  userEmail?: string;
}

export function Sidebar({ userRole, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const { selectedApp } = useAppStore();
  const navigation = userRole === 'SUPER_ADMIN' ? adminNavigation : getPartnerNavigation(selectedApp?.id || null);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800">
      <div className="flex-1 overflow-y-auto py-4">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-6 py-2 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-4 border-blue-600'
                          : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-slate-100'
                      }
                    `}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-slate-800 p-4 bg-gray-50 dark:bg-slate-900/50 flex-shrink-0">
        <div className="text-xs font-medium text-gray-400 dark:text-slate-500 uppercase tracking-wider mb-3 px-2">Account</div>
        <div className="px-2 mb-4">
          <div className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{userEmail}</div>
          <div className="text-xs text-gray-500 dark:text-slate-400 capitalize">{userRole.toLowerCase().replace('_', ' ')}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
