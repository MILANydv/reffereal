'use client';

import { AppSwitcher } from './AppSwitcher';
import { NotificationDropdown } from './NotificationDropdown';
import { Search, LayoutGrid, Zap, Sun, Moon, LogOut, UserCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useAppStore, useThemeStore } from '@/lib/store';
import { useEffect, useState, useCallback } from 'react';

export function TopNavbar() {
  const { data: session } = useSession();
  const { selectedApp } = useAppStore();
  const { theme, mounted, toggleTheme, initializeTheme } = useThemeStore();
  const [usage, setUsage] = useState({ current: 0, limit: 10000 });
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isAdmin = session?.user?.role === 'SUPER_ADMIN';

  // Initialize theme on mount
  useEffect(() => {
    console.log('[TopNavbar] Component mounted, initializing theme');
    initializeTheme();
  }, [initializeTheme]);

  // Listen for theme changes and force re-render
  useEffect(() => {
    const handleThemeChange = () => {
      console.log('[TopNavbar] Theme change event received, forcing re-render');
      // Force component to re-render by accessing the store
      const currentTheme = useThemeStore.getState().theme;
      console.log('[TopNavbar] Current theme from store:', currentTheme);
      // Force a state update to trigger re-render
      setUsage(prev => ({ ...prev }));
    };

    window.addEventListener('themechange', handleThemeChange as EventListener);

    return () => {
      window.removeEventListener('themechange', handleThemeChange as EventListener);
    };
  }, []);

  // Log theme changes
  useEffect(() => {
    console.log('[TopNavbar] Theme changed to:', theme);
    console.log('[TopNavbar] Mounted state:', mounted);
    console.log('[TopNavbar] DocumentElement has dark class:', document.documentElement.classList.contains('dark'));
  }, [theme, mounted]);

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


  const usagePercentage = Math.min((usage.current / usage.limit) * 100, 100);

  return (
    <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-4 sticky top-0 z-30">
      <div className="flex items-center space-x-4">
        <Link href={isAdmin ? "/admin/v2" : "/dashboard/v2"} className="flex items-center space-x-2 mr-4">
          <img src="/logos/logo.png" alt="Incenta Logo" className="h-11 w-auto" />
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
          onClick={() => {
            console.log('[TopNavbar] Theme toggle button clicked');
            console.log('[TopNavbar] Current theme from store:', theme);
            toggleTheme();
          }}
          className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          aria-label="Toggle theme"
          type="button"
          suppressHydrationWarning
        >
          {mounted ? (theme === 'light' ? <Moon size={20} /> : <Sun size={20} />) : <Moon size={20} />}
        </button>

        <NotificationDropdown />

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
                    onClick={async () => {
                      setShowProfileMenu(false);
                      try {
                        // Call backend logout route
                        await fetch('/api/auth/logout', {
                          method: 'POST',
                          credentials: 'include',
                        });
                        // Then sign out from NextAuth client-side
                        await signOut({ callbackUrl: '/login', redirect: true });
                      } catch (error) {
                        console.error('Logout error:', error);
                        // Fallback to client-side signout
                        await signOut({ callbackUrl: '/login', redirect: true });
                      }
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
