"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Helper function to set cookie
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

// Helper function to remove cookie
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;`;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Check if token exists in localStorage
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        setUser(null);
        setToken(null);
        removeCookie('token');
        return false;
      }

      // Validate token with backend (optional but recommended)
      try {
        const response = await fetch('https://govt-scheme-guide-api.onrender.com/api/user/verifyToken', {
          method: 'GET',
          headers: {
            'Authorization': storedToken,
          },
        });

        if (response.ok) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          setCookie('token', storedToken);
          return true;
        } else {
          // Token is invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          removeCookie('token');
          setUser(null);
          setToken(null);
          return false;
        }
      } catch {
        // If verification fails, still use stored data (fallback)
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setToken(storedToken);
        setCookie('token', storedToken);
        return true;
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setToken(null);
      removeCookie('token');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookie('token', newToken);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('token');
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
