'use client';

import { AppSwitcher } from './AppSwitcher';
import { Search, Bell, LayoutGrid, Zap, Sun, Moon, LogOut, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState, useCallback } from 'react';

export function TopNavbar() {
  const { data: session } = useSession();
  const { selectedApp } = useAppStore();
  const [usage, setUsage] = useState({ current: 0, limit: 10000 });
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        return savedTheme;
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const isAdmin = session?.user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme]);

  const fetchUsage = useCallback(async () => {
    try {
      const response = await fetch(`/api/partner/apps`);
      if (response.ok) {
        const apps = await response.json();
        const currentApp = apps.find((a: { id: string, currentUsage: number, monthlyLimit: number }) => a.id === selectedApp?.id);
        if (currentApp) {
          setUsage({
            current: currentApp.currentUsage,
            limit: currentApp.monthlyLimit
          });
        }
      }
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  }, [selectedApp]);

  useEffect(() => {
    if (selectedApp) {
      const timer = setTimeout(() => {
        fetchUsage();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedApp, fetchUsage]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', newTheme);
      const root = document.documentElement;
      if (newTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  };

  const usagePercentage = Math.min((usage.current / usage.limit) * 100, 100);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <Link href={isAdmin ? "/admin/v2" : "/dashboard/v2"} className="flex items-center space-x-2 mr-4">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
            R
          </div>
          <span className="font-bold text-lg hidden md:block">Referral</span>
        </Link>

        {!isAdmin && (
          <>
            <div className="h-6 w-px bg-gray-200 dark:bg-slate-800 hidden md:block" />
            <AppSwitcher />
          </>
        )}

        <div className="hidden lg:flex items-center relative ml-4">
          <Search size={16} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-slate-800 border-transparent rounded-full text-sm w-64 focus:bg-white dark:focus:bg-slate-900 focus:ring-1 focus:ring-blue-500 transition-all outline-none text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {!isAdmin && selectedApp && (
          <div className="hidden md:flex flex-col items-end mr-2">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Zap size={12} className="mr-1 text-yellow-500 fill-yellow-500" />
              <span>{usage.current.toLocaleString()} / {usage.limit.toLocaleString()} API hits</span>
            </div>
            <div className="w-32 h-1 bg-gray-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${usagePercentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}

        {isAdmin && (
          <div className="hidden md:flex flex-col items-end mr-2">
            <div className="flex items-center text-xs text-gray-500">
              <Zap size={12} className="mr-1 text-yellow-500 fill-yellow-500" />
              <span>Platform API Usage</span>
            </div>
          </div>
        )}

        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900" />
        </button>

        <button className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <LayoutGrid size={20} />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity"
          >
            {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
          </button>

          {showProfileMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowProfileMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-lg shadow-lg border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-slate-100">
                    {session?.user?.email}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">
                    {session?.user?.role}
                  </div>
                </div>
                <div className="py-1">
                  <Link
                    href="/profile"
                    onClick={() => setShowProfileMenu(false)}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <UserCircle size={16} className="mr-3" />
                    Profile Settings
                  </Link>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      signOut({ callbackUrl: '/login' });
                    }}
                    className="w-full flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <LogOut size={16} className="mr-3" />
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
