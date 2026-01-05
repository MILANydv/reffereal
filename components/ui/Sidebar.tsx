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
  AlertTriangle,
  Code,
  FileText,
  Building2,
  LogOut,
} from 'lucide-react';
import { signOut } from 'next-auth/react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const partnerNavigation: NavSection[] = [
  {
    title: 'Overview',
    items: [
      { name: 'Dashboard', href: '/dashboard/v2', icon: <LayoutDashboard size={20} /> },
      { name: 'Analytics', href: '/dashboard/v2/analytics', icon: <BarChart3 size={20} /> },
    ],
  },
  {
    title: 'Platform',
    items: [
      { name: 'Applications', href: '/dashboard/v2/apps', icon: <Building2 size={20} /> },
      { name: 'Webhooks', href: '/dashboard/v2/webhooks', icon: <Webhook size={20} /> },
      { name: 'Fraud Alerts', href: '/dashboard/v2/fraud', icon: <AlertTriangle size={20} /> },
    ],
  },
  {
    title: 'Account',
    items: [
      { name: 'Billing', href: '/dashboard/v2/billing', icon: <CreditCard size={20} /> },
      { name: 'Team', href: '/dashboard/v2/team', icon: <Users size={20} /> },
      { name: 'Settings', href: '/dashboard/v2/settings', icon: <Settings size={20} /> },
    ],
  },
  {
    title: 'Developer',
    items: [
      { name: 'API Keys', href: '/dashboard/v2/api-keys', icon: <Code size={20} /> },
      { name: 'Documentation', href: '/docs', icon: <FileText size={20} /> },
    ],
  },
];

const adminNavigation: NavSection[] = [
  {
    title: 'Admin',
    items: [
      { name: 'Dashboard', href: '/admin/v2', icon: <LayoutDashboard size={20} /> },
      { name: 'Partners', href: '/admin/v2/partners', icon: <Users size={20} /> },
      { name: 'Pricing Plans', href: '/admin/v2/pricing', icon: <CreditCard size={20} /> },
      { name: 'Feature Flags', href: '/admin/v2/features', icon: <Settings size={20} /> },
      { name: 'Fraud Monitoring', href: '/admin/v2/fraud', icon: <AlertTriangle size={20} /> },
    ],
  },
];

interface SidebarProps {
  userRole: 'SUPER_ADMIN' | 'PARTNER';
  userEmail?: string;
}

export function Sidebar({ userRole, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const navigation = userRole === 'SUPER_ADMIN' ? adminNavigation : partnerNavigation;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200">
      <div className="flex items-center h-16 px-6 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Referral Platform</h1>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {navigation.map((section) => (
          <div key={section.title} className="mb-6">
            <h3 className="px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-6 py-2 text-sm font-medium transition-colors
                      ${
                        isActive
                          ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
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

      <div className="border-t border-gray-200 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-gray-700 truncate">{userEmail}</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </button>
      </div>
    </div>
  );
}
