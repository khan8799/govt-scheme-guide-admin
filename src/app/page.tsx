"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import AuthLoading from '@/components/auth/AuthLoading';

export default function RootPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => { 
    if (!isLoading) {
      if (isAuthenticated) {
        router.push('/admin');
      } else {
        router.push('/signin');
      }
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <AuthLoading />;
  }

  return null; 
}
