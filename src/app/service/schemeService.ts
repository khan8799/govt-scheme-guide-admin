import apiClient from "./apiClient";
import { Scheme } from "@/app/types/scheme";
import { getAuthHeaders, API_BASE_URL } from "@/config/api";

const API_BASE = "user";

export const getAllSchemes = async () => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Scheme[] }>(`${API_BASE}/getAllSchemes`);
    return response;
  } catch (error) {
    console.error('Error fetching schemes:', error);
    throw error;
  }
};

export const getCategoriesWithSchemeCount = async () => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Array<{ _id: string; name: string; schemeCount: number }> }>(`${API_BASE}/categoriesWithSchemeCount`);
    return response;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const getSchemeById = async (id: string) => {
  try {
    const response = await apiClient.get<{ success: boolean; data: Scheme }>(`${API_BASE}/getSchemeById/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching scheme by ID:', error);
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

export const updateSchemeById = async (id: string, formData: FormData) => {
  try {
    const authHeaders = getAuthHeaders();
    const token = authHeaders.Authorization;
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_BASE_URL}/admin/updateSchemeById/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: token,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update scheme');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error updating scheme:', error);
    throw error;
  }
};
