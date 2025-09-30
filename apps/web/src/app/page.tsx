'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // Redirect to dashboard based on role
        switch (user.role) {
          case 'ADMIN':
            router.push('/admin/dashboard');
            break;
          case 'SBU_HEAD':
            router.push('/sbu-head/dashboard');
            break;
          case 'SALES':
            router.push('/sales/dashboard');
            break;
          case 'CSE':
            router.push('/cse/dashboard');
            break;
          case 'PRICING':
            router.push('/pricing/dashboard');
            break;
          case 'MGMT':
            router.push('/management/dashboard');
            break;
          default:
            router.push('/dashboard');
        }
      } else {
        router.push('/auth/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return null;
}