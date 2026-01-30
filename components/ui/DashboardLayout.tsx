'use client';

import { Sidebar } from './Sidebar';
import { TopNavbar } from './TopNavbar';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex flex-col">
        <div className="h-16 border-b border-gray-200 dark:border-gray-800" />
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-64 border-r border-gray-200 dark:border-gray-800 p-4 space-y-4 hidden md:block">
            <div className="h-4 w-3/4 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
            <div className="h-4 w-1/2 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-gray-100 dark:bg-gray-800 animate-pulse rounded" />
          </aside>
          <main className="flex-1 p-8 space-y-8 bg-gray-50 dark:bg-zinc-950">
            <div className="h-8 w-1/4 bg-gray-200 dark:bg-gray-800 animate-pulse rounded" />
            <div className="grid grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-white dark:bg-zinc-900 rounded-3xl animate-pulse" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 flex flex-col">
      <TopNavbar />
      <div className="flex flex-1 relative overflow-hidden">
        <aside className="w-64 flex-shrink-0 hidden md:block fixed top-16 bottom-0 border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-y-auto z-20">
          <Sidebar userRole={session.user.role as 'SUPER_ADMIN' | 'PARTNER'} userEmail={session.user.email || ''} />
        </aside>
        <main className="flex-1 md:ml-64 bg-gray-50 dark:bg-slate-950 overflow-y-auto h-[calc(100vh-4rem)]">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
