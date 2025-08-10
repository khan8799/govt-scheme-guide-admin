// src/services/categoryService.ts
import { DEFAULT_AUTH_TOKEN } from '@/config/confiq';
import { CategoryApiResponse, CategoryListItem } from '../types/category';
import apiClient from './apiClient'; // Make sure this import path is correct

export const fetchCategories = async (token?: string): Promise<CategoryListItem[]> => {
  try {
    const response = await apiClient.get<any>(
      'user/getSchemesByCategory',
      token
    );
    const data = Array.isArray(response)
      ? response
      : response?.data
        ? response.data
        : [];

    if (!Array.isArray(data)) {
      throw new Error('Invalid data format received from API');
    }

    return data.map((item: CategoryApiResponse) => ({
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
  token: string = DEFAULT_AUTH_TOKEN
): Promise<void> => {
  await apiClient.post('admin/registerCategory', formData, token);
};

export const updateCategory = async (
  id: string,
  formData: FormData,
  token: string = DEFAULT_AUTH_TOKEN
): Promise<void> => {
  await apiClient.put(`admin/updateCategoryById/${id}`, formData, token);
};

export const deleteCategory = async (
  id: string,
  token: string = DEFAULT_AUTH_TOKEN
): Promise<void> => {
  await apiClient.delete(`admin/deleteCategoryById/${id}`, token);
};