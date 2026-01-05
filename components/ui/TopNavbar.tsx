'use client';

import { AppSwitcher } from './AppSwitcher';
import { Search, Bell, User, LayoutGrid, Zap, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useAppStore } from '@/lib/store';
import { useEffect, useState, useCallback } from 'react';

export function TopNavbar() {
  const { data: session } = useSession();
  const { selectedApp } = useAppStore();
  const [usage, setUsage] = useState({ current: 0, limit: 10000 });
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      return savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
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
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const usagePercentage = Math.min((usage.current / usage.limit) * 100, 100);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-black flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/v2" className="flex items-center space-x-2 mr-4">
          <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center text-white font-bold">
            R
          </div>
          <span className="font-bold text-lg hidden md:block">Referral</span>
        </Link>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-800 hidden md:block" />

        <AppSwitcher />

        <div className="hidden lg:flex items-center relative ml-4">
          <Search size={16} className="absolute left-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources..."
            className="pl-10 pr-4 py-1.5 bg-gray-100 dark:bg-gray-900 border-transparent rounded-full text-sm w-64 focus:bg-white dark:focus:bg-black focus:ring-1 focus:ring-blue-500 transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        {selectedApp && (
          <div className="hidden md:flex flex-col items-end mr-2">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <Zap size={12} className="mr-1 text-yellow-500 fill-yellow-500" />
              <span>{usage.current.toLocaleString()} / {usage.limit.toLocaleString()} API hits</span>
            </div>
            <div className="w-32 h-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${usagePercentage > 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        )}

        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>

        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-black" />
        </button>

        <button className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
          <LayoutGrid size={20} />
        </button>

        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          {session?.user?.email?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
