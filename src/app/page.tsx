'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

const roleRedirects: Record<string, string> = {
  admin: '/admin/dashboard',
  agent: '/agent/dashboard',
  designer: '/designer/dashboard',
  merchant: '/merchant/dashboard',
  customer: '/customer/dashboard',
};

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        const redirectPath = roleRedirects[user.role] || '/inbox';
        router.push(redirectPath);
      } else {
        router.push('/login');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
}
