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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col">
      <TopNavbar />
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 flex-shrink-0 hidden md:block sticky top-16 h-[calc(100vh-4rem)]">
          <Sidebar userRole={session.user.role as 'SUPER_ADMIN' | 'PARTNER'} userEmail={session.user.email || ''} />
        </aside>
        <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-zinc-950">
          <div className="max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
