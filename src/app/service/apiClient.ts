// src/services/apiClient.ts

import { API_BASE_URL } from "@/config/api";

const apiClient = {
  get: async <T>(endpoint: string, token?: string): Promise<T> => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    };

    if (token) {
      headers['Authorization'] = token;
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, { 
      headers,
      cache: 'no-store'
    });
    
    if (!response.ok && response.status !== 304) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Handle 304 Not Modified - return cached data or empty response
    if (response.status === 304) {
      console.log('Response not modified, using cached data');
      // You might want to return cached data here if you have it
      throw new Error('Data not modified');
    }
    
    return response.json();
  },

  post: async <T>(endpoint: string, body: unknown, token: string): Promise<T> => {
    const headers: Record<string, string> = {
      'Authorization': token,
    };

    const isFormData = body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  put: async <T>(endpoint: string, body: unknown, token: string): Promise<T> => {
    const headers: Record<string, string> = {
      'Authorization': token,
    };

    const isFormData = body instanceof FormData;
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'PUT',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },

  delete: async <T>(endpoint: string, token: string): Promise<T> => {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': token,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
};

export default apiClient; // Make sure this is a default export