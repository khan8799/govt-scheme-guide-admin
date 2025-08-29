import apiClient from "./apiClient";
import { Scheme } from "@/app/types/scheme";
import { getAuthHeaders, API_BASE_URL } from "@/config/api";

const API_BASE = "user";

export const getAllSchemes = async () => {
  try {
    const authHeaders = getAuthHeaders();
    const token = authHeaders.Authorization;
    if (!token) {
      throw new Error('Authentication token not found');
    }
    const response = await apiClient.get<{ success: boolean; data: Scheme[] }>(`${API_BASE}/getAllSchemes`, token);
    return response;
  } catch (error) {
    console.error('Error fetching schemes:', error);
    throw error;
  }
};

export const getCategoriesWithSchemeCount = async () => {
  try {
    const authHeaders = getAuthHeaders();
    const token = authHeaders.Authorization;
    if (!token) {
      throw new Error('Authentication token not found');
    }
    const response = await apiClient.get<{ success: boolean; data: Array<{ _id: string; name: string; schemeCount: number }> }>(`${API_BASE}/categoriesWithSchemeCount`, token);
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getSchemeBySlug = async (slug: string) => {
  try {
    const authHeaders = getAuthHeaders();
    const token = authHeaders.Authorization;
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/${API_BASE}/getSchemeBySlug/${slug}`, {
      headers: authHeaders as HeadersInit,
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch scheme: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching scheme by slug:', error);
    throw error;
  }
};



export const deleteSchemeById = async (id: string) => {
  try {
    const authHeaders = getAuthHeaders();
    const token = authHeaders.Authorization;
    if (!token) {
      throw new Error('Authentication token not found');
    }
    const response = await apiClient.delete<{ success: boolean; message: string }>(`admin/deleteSchemeById/${id}`, token);
    return response;
  } catch (error) {
    console.error('Error deleting scheme:', error);
    throw error;
  }
};

export const updateSchemeById = async (_id: string, formData: FormData) => {
  if (!_id || typeof _id !== 'string' || _id.trim() === '') {
    throw new Error('Invalid scheme id provided');
  }
  
  if (!formData || !(formData instanceof FormData)) {
    throw new Error('Invalid FormData provided');
  }
  
  try {
    const authHeaders = getAuthHeaders();
    const token = authHeaders.Authorization;
    if (!token) {
      throw new Error('Authentication token not found');
    }

    const response = await fetch(`${API_BASE_URL}/admin/updateSchemeById/${_id}`, {
      method: 'PUT',
      headers: { Authorization: token },
      body: formData,
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update scheme';
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};
