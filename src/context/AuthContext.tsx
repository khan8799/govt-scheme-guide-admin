"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

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

// Token validation cache to avoid repeated API calls
const tokenValidationCache: { [key: string]: { valid: boolean; timestamp: number } } = {};
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes cache

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuth();
  }, []);



  const checkAuth = useCallback(async (): Promise<boolean> => {
    try {
      // Check if token exists in localStorage first
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (!storedToken || !storedUser) {
        setUser(null);
        setToken(null);
        removeCookie('token');
        return false;
      }

      // Check if we have a valid cached validation result
      const now = Date.now();
      const cachedResult = tokenValidationCache[storedToken];
      if (cachedResult && (now - cachedResult.timestamp) < CACHE_DURATION) {
        if (cachedResult.valid) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          setCookie('token', storedToken);
          return true;
        } else {
          // Cached result shows token is invalid
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          removeCookie('token');
          setUser(null);
          setToken(null);
          return false;
        }
      }

      // Set loading only when we need to verify with backend
      setIsLoading(true);
      
      // Try to validate with backend (but don't fail if it doesn't work)
      try {
        const response = await fetch('https://govt-scheme-guide-api.onrender.com/api/user/verifyToken', {
          method: 'GET',
          headers: {
            'Authorization': storedToken,
          },
        });

        if (response.ok) {
          // Token is valid, update cache
          tokenValidationCache[storedToken] = { valid: true, timestamp: now };
        } else if (response.status === 401 || response.status === 403) {
          // Token is actually invalid, clear storage
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          removeCookie('token');
          setUser(null);
          setToken(null);
          tokenValidationCache[storedToken] = { valid: false, timestamp: now };
          return false;
        }
        // For other status codes, continue with stored data
      } catch (error) {
        // Network errors don't invalidate the token
        console.warn('Token validation failed, using stored data:', error);
      }

      // Use stored data (either validated or as fallback)
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setToken(storedToken);
      setCookie('token', storedToken);
      
      // Cache the result
      if (!tokenValidationCache[storedToken]) {
        tokenValidationCache[storedToken] = { valid: true, timestamp: now };
      }
      
      return true;
    } catch (error) {
      console.error('Auth check failed:', error);
      // Even if there's an error, try to use stored data as last resort
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      
      if (storedToken && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setToken(storedToken);
          setCookie('token', storedToken);
          return true;
        } catch (parseError) {
          console.error('Failed to parse stored user data:', parseError);
          setUser(null);
          setToken(null);
          removeCookie('token');
          return false;
        }
      } else {
        setUser(null);
        setToken(null);
        removeCookie('token');
        return false;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setCookie('token', newToken);
    
    // Clear any cached validation results for the old token
    Object.keys(tokenValidationCache).forEach(key => {
      if (key !== newToken) {
        delete tokenValidationCache[key];
      }
    });
  }, []);

  const logout = useCallback(() => {
    const currentToken = token;
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    removeCookie('token');
    
    // Clear cached validation for the current token
    if (currentToken) {
      delete tokenValidationCache[currentToken];
    }
  }, [token]);

  const validateTokenInBackground = useCallback(async () => {
    if (!token) return;
    
    try {
      const response = await fetch('https://govt-scheme-guide-api.onrender.com/api/user/verifyToken', {
        method: 'GET',
        headers: {
          'Authorization': token,
        },
      });

      if (!response.ok) {
        // Only logout on actual authentication failures (401/403)
        if (response.status === 401 || response.status === 403) {
          logout();
        }
      } else {
        // Update cache
        tokenValidationCache[token] = { valid: true, timestamp: Date.now() };
      }
    } catch (error) {
      // Don't logout on network errors, just log the warning
      console.warn('Background token validation failed:', error);
    }
  }, [token, logout]);

  // Background token validation - runs periodically without blocking UI
  useEffect(() => {
    if (token && user) {
      const interval = setInterval(() => {
        validateTokenInBackground();
      }, 15 * 60 * 1000); // Check every 15 minutes

      return () => clearInterval(interval);
    }
  }, [token, user, validateTokenInBackground]);

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
