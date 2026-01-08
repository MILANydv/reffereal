'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore, type App } from '@/lib/store';
import { ChevronDown, Plus, Search, Check } from 'lucide-react';


export function AppSwitcher() {
  const { selectedApp, setSelectedApp } = useAppStore();
  const [apps, setApps] = useState<App[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchApps = useCallback(async () => {
    try {
      const response = await fetch('/api/partner/apps');
      if (response.ok) {
        const data = await response.json();
        setApps(data);
        if (data.length > 0 && !selectedApp) {
          // Check if there's a stored ID that matches one of these apps
          const storedId = useAppStore.getState().selectedAppId;
          const matchedApp = data.find((a: App) => a.id === storedId);
          setSelectedApp(matchedApp || data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    }
  }, [selectedApp, setSelectedApp]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchApps();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchApps]);

  const filteredApps = apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
      >
        <div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
          {selectedApp?.name.charAt(0).toUpperCase() || 'A'}
        </div>
        <span className="max-w-[150px] truncate">{selectedApp?.name || 'Select App'}</span>
        <ChevronDown size={16} className="text-gray-500" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute left-0 mt-2 w-72 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg shadow-lg z-20 overflow-hidden">
            <div className="p-3 border-b border-gray-200 dark:border-gray-800">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search apps..."
                  className="w-full pl-9 pr-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {filteredApps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => {
                    setSelectedApp(app);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {app.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium truncate">{app.name}</span>
                  </div>
                  {selectedApp?.id === app.id && (
                    <Check size={16} className="text-blue-600" />
                  )}
                </button>
              ))}
              {filteredApps.length === 0 && (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No apps found
                </div>
              )}
            </div>

            <div className="p-2 border-t border-gray-200 dark:border-gray-800">
              <button
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-md transition-colors font-medium"
                onClick={() => {
                  window.location.href = '/dashboard/v2/apps/new';
                }}
              >
                <Plus size={16} />
                <span>Create new app</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
