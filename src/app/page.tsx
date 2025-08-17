"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthLoading from '@/components/auth/AuthLoading';
import AdminLayout from './(admin)/layout';
import AdminDashboard from './(admin)/page';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => { 
    if (!isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AuthLoading />;
  }

  if (isAuthenticated) {
    return (
      <AdminLayout>
        <AdminDashboard />
      </AdminLayout>
    );
  }

  return null; 
}
