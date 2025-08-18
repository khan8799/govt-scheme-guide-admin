"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback = <div>Loading...</div> 
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  useEffect(() => {
    // Only redirect if we've completed the auth check and user is not authenticated
    if (hasCheckedAuth && !isLoading && !isAuthenticated) {
      router.push('/signin');
    }
  }, [isAuthenticated, isLoading, hasCheckedAuth, router]);

  useEffect(() => {
    // Mark that we've completed the initial auth check
    if (!isLoading) {
      setHasCheckedAuth(true);
    }
  }, [isLoading]);

  // Show loading only when we're actually checking authentication
  if (isLoading && !hasCheckedAuth) {
    return <>{fallback}</>;
  }

  // Don't render anything while redirecting
  if (hasCheckedAuth && !isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

