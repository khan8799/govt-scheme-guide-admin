"use client";
import React from 'react';

export const AuthLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mx-auto"></div>
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">Verifying...</p>
      </div>
    </div>
  );
};

export default AuthLoading;

