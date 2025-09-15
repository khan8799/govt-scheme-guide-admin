import { useState, useCallback, useEffect, useMemo } from 'react';
import { API_BASE_URL } from '@/config/api';
import { getAuthHeaders } from '@/config/api';
import { getSchemeBySlug, deleteSchemeById } from '@/app/service/schemeService';
import { showSuccess, showError, showLoading } from '@/components/SweetAlert';
import { Scheme, State, Category } from '@/app/types/scheme';

export const useSchemeData = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const getErrorMessage = (e: unknown, fallback: string) =>
    e instanceof Error ? e.message : fallback;

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    try {
      const authHeaders = getAuthHeaders();
      const [statesRes, categoriesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/user/getAllStates`, { 
          headers: authHeaders as HeadersInit,
        }),
        fetch(`${API_BASE_URL}/user/allCategories`, { 
          headers: authHeaders as HeadersInit,
        })
      ]);
      if (!statesRes.ok) throw new Error(`Failed to load states: ${statesRes.status} ${statesRes.statusText}`);
      if (!categoriesRes.ok) throw new Error(`Failed to load categories: ${categoriesRes.status} ${categoriesRes.statusText}`);
      const statesData = await statesRes.json();
      const categoriesData = await categoriesRes.json();
      setStates(statesData.data || []);
      setCategories(categoriesData.data || []);
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load initial data'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadSchemes = useCallback(async (page: number = 1, append: boolean = false, selectedState?: string, selectedCategory?: string) => {
    setLoading(true);
    setError(null);
    try {
      let url = `${API_BASE_URL}/user/getAllSchemes?page=${page}&limit=20`;
      if (selectedState) url += `&stateId=${selectedState}`;
      else if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      const authHeaders = getAuthHeaders();
      const res = await fetch(url, { 
        headers: authHeaders as HeadersInit,
      });
      if (!res.ok) {
        if (res.status === 404) {
          setSchemes([]);
          setTotalSchemes(0);
          setHasMore(false);
          setCurrentPage(1);
          setTotalPages(1);
          setError(null);
          return;
        }
        throw new Error(`Failed to load schemes: ${res.status} ${res.statusText}`);
      }
      const data = await res.json();
      if (data && data.data) {
        if (append) setSchemes(prev => [...prev, ...data.data]);
        else setSchemes(data.data);
        const tp = data.totalPages || 1;
        const total = data.total || data.data.length;
        setTotalPages(tp);
        setTotalSchemes(total);
        setCurrentPage(page);
        setHasMore(page < tp);
      } else if (Array.isArray(data)) {
        if (append) setSchemes(prev => [...prev, ...data]);
        else setSchemes(data);
        setHasMore(false);
        setTotalPages(1);
        setTotalSchemes(data.length);
        setCurrentPage(1);
      } else {
        setSchemes([]);
        setHasMore(false);
        setTotalPages(1);
        setTotalSchemes(0);
        setCurrentPage(1);
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load schemes'));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAllSchemes = useCallback(async (selectedState?: string, selectedCategory?: string) => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/user/getAllSchemes?limit=1000`;
      if (selectedState) url += `&stateId=${selectedState}`;
      else if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      const authHeaders = getAuthHeaders();
      const res = await fetch(url, { headers: authHeaders as HeadersInit });
      if (!res.ok) {
        if (res.status === 404) {
          setSchemes([]);
          setTotalSchemes(0);
          setHasMore(false);
          setCurrentPage(1);
          setTotalPages(1);
          setError(null);
          return;
        }
        throw new Error(`Failed to load all schemes: ${res.status}`);
      }
      const data = await res.json();
      if (data && data.data) {
        setSchemes(data.data);
        setTotalSchemes(data.data.length);
        setHasMore(false);
        setCurrentPage(1);
        setTotalPages(1);
        setError(null);
      } else {
        setSchemes([]);
        setTotalSchemes(0);
        setHasMore(false);
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load all schemes'));
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteScheme = useCallback(async (id: string) => {
    const loadingAlert = showLoading('Deleting scheme...');
    try {
      await deleteSchemeById(id);
      loadingAlert.close();
      await showSuccess('Scheme deleted successfully!');
      return true;
    } catch (e: unknown) {
      loadingAlert.close();
      await showError(getErrorMessage(e, 'Failed to delete scheme'));
      return false;
    }
  }, []);

  const fetchSchemeDetails = useCallback(async (slug: string) => {
    try {
      const scheme = schemes.find(s => {
        const schemeIdentifier = s.slug && s.slug.trim() !== '' ? s.slug : s._id;
        return schemeIdentifier === slug;
      });
      
      if (scheme) {
        return scheme;
      } else {
        // If not found in schemes, try to fetch from API as fallback
        const loadingAlert = showLoading('Loading scheme details...');
        try {
          const response = await getSchemeBySlug(slug);
          loadingAlert.close();
          return response.data;
        } catch (e: unknown) {
          loadingAlert.close();
          await showError(getErrorMessage(e, 'Failed to load scheme details'));
          return null;
        }
      }
    } catch (e: unknown) {
      await showError(getErrorMessage(e, 'Failed to load scheme details'));
      return null;
    }
  }, [schemes]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  return useMemo(() => ({
    schemes,
    states,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalSchemes,
    hasMore,
    loadSchemes,
    loadAllSchemes,
    deleteScheme,
    fetchSchemeDetails,
    setSchemes,
    setError
  }), [
    schemes,
    states,
    categories,
    loading,
    error,
    currentPage,
    totalPages,
    totalSchemes,
    hasMore,
    loadSchemes,
    loadAllSchemes,
    deleteScheme,
    fetchSchemeDetails,
    setSchemes,
    setError
  ]);
};
