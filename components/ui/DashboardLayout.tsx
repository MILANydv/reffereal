'use client';

import { Sidebar } from './Sidebar';
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 flex-shrink-0">
        <Sidebar userRole={session.user.role} userEmail={session.user.email || ''} />
      </div>
      <div className="flex-1 overflow-auto">
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
