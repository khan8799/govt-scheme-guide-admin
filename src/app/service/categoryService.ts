// src/services/categoryService.ts
import { getAuthHeaders } from '@/config/api';
import { CategoryApiResponse, CategoryListItem } from '../types/category';
import apiClient from './apiClient'; // Make sure this import path is correct

export const fetchCategories = async (token?: string): Promise<CategoryListItem[]> => {
  try {
    const response = await apiClient.get<unknown>(
      'user/getSchemesByCategory',
      token
    );
    const data = Array.isArray(response)
      ? response
      : (response as { data?: unknown })?.data
        ? (response as { data?: unknown }).data
        : [];

    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from API');
    }

    return (data as CategoryApiResponse[]).map((item) => ({
      id: item.categoryId || item._id || '',
      name: item.name || 'Untitled',
      image: item.image || '',
      totalSchemes: item.totalSchemes || 0,
      description: item.description || '',
    }));
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const createCategory = async (
  formData: FormData,
  token?: string
): Promise<void> => {
  const authToken = token || (getAuthHeaders().Authorization ?? '');
  await apiClient.post('admin/registerCategory', formData, authToken);
};

export const updateCategory = async (
  id: string,
  formData: FormData,
  token?: string
): Promise<void> => {
  const authToken = token || (getAuthHeaders().Authorization ?? '');
  await apiClient.put(`admin/updateCategoryById/${id}`, formData, authToken);
};

export const deleteCategory = async (
  id: string,
  token?: string
): Promise<void> => {
  const authToken = token || (getAuthHeaders().Authorization ?? '');
  await apiClient.delete(`admin/deleteCategoryById/${id}`, authToken);
};