// src/hooks/useCategories.ts
import { fetchCategories } from '@/app/service/categoryService';
import { CategoryListItem } from '@/app/types/category';
import { useState, useEffect } from 'react';

const useCategories = () => {
  const [categories, setCategories] = useState<CategoryListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async (token?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCategories(token);
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refreshCategories: loadCategories,
  };
};

export default useCategories;