'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { showSuccess, showError, showLoading } from '@/components/SweetAlert';
import { API_BASE_URL } from '@/config/api';
import { getAuthHeaders } from '@/config/api';
import { getSchemeBySlug, deleteSchemeById, updateSchemeById } from '@/app/service/schemeService';
import { parseBulletPoints } from '@/utils/textParsing';
import Label from '@/components/form/Label';

import {
  Scheme,
  State,
  Category,
  SchemeFormData,
  NamedEntity,
} from '@/app/types/scheme';
import Select from '@/components/form/Select';
import SchemeList from '@/components/schemes/SchemeList';
import SchemeForm from '@/components/schemes/SchemeForm';

interface FormField {
  label: string;
  key: keyof SchemeFormData;
  type: 'text' | 'textarea' | 'date' | 'json' | 'select' | 'multi-select' | 'file' | 'toggle' | 'rich-text';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}


const SchemePage = () => {
  const getErrorMessage = (e: unknown, fallback: string) =>
    e instanceof Error ? e.message : fallback;

  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  

  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [states, setStates] = useState<State[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalSchemes, setTotalSchemes] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [schemeToDelete, setSchemeToDelete] = useState<Scheme | null>(null);
  const [showEditConfirmation, setShowEditConfirmation] = useState(false);
  const [formData, setFormData] = useState<SchemeFormData>({
    schemeTitle: '',
    slug: '',
    publishedOn: new Date().toISOString().split('T')[0],
    about: '',
    objectives: '',
    category: '',
    state: [],
    textWithHTMLParsing: { htmlDescription: '' },
    excerpt: '',
    seoTitle: '',
    seoMetaDescription: '',

    salientFeatures: [{ subTitle: '', subDescription: '' }],
    helplineNumber: { 
      tollFreeNumber: '', 
      emailSupport: '', 
      availability: '' 
    },
    frequentlyAskedQuestions: [{ question: '', answer: '' }],
    sourcesAndReferences: [{ sourceName: '', sourceLink: '' }],
    disclaimer: { description: '' },
    bannerImage: null,
    cardImage: null,
    isFeatured: true
  });

  const formFields: FormField[] = [
    { label: 'Scheme Title', key: 'schemeTitle', type: 'text', required: true },
    { label: 'Slug', key: 'slug', type: 'text', required: true },
    { label: 'Published On', key: 'publishedOn', type: 'date', required: true },
    { label: 'About', key: 'about', type: 'textarea', required: true },
    { label: 'Objectives', key: 'objectives', type: 'textarea', required: true },
    { 
      label: 'Category', 
      key: 'category', 
      type: 'select', 
      required: true,
      options: categories.map(cat => ({ value: cat._id, label: cat.name }))
    },
    { 
      label: 'States', 
      key: 'state', 
      type: 'multi-select', 
      required: true,
      options: states.map(state => ({ value: state._id, label: state.name }))
    },
    { label: 'Excerpt', key: 'excerpt', type: 'textarea' },
    { label: 'SEO Title', key: 'seoTitle', type: 'text' },
    { label: 'SEO Meta Description', key: 'seoMetaDescription', type: 'textarea' },
    { label: 'Salient Features', key: 'salientFeatures', type: 'json' },
    { label: 'Helpline Number', key: 'helplineNumber', type: 'json' },
    { label: 'FAQ', key: 'frequentlyAskedQuestions', type: 'json' },
    { label: 'Sources', key: 'sourcesAndReferences', type: 'json' },
    { label: 'Disclaimer', key: 'disclaimer', type: 'json' },
    { label: 'Featured', key: 'isFeatured', type: 'toggle' },
    { label: 'Banner Image', key: 'bannerImage', type: 'file' },
    { label: 'Card Image', key: 'cardImage', type: 'file' },
    { label: 'Rich Text Content', key: 'textWithHTMLParsing', type: 'rich-text' },
  ];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );

  useEffect(() => {
    const loadInitialData = async () => {
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
    };
    loadInitialData();
  }, []);

  const loadSchemes = useCallback(async (page: number = 1, append: boolean = false) => {
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
          setFilteredSchemes([]);
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
        if (append) setFilteredSchemes(prev => [...prev, ...data.data]);
        else setFilteredSchemes(data.data);
        const tp = data.totalPages || 1;
        const total = data.total || data.data.length;
        setTotalPages(tp);
        setTotalSchemes(total);
        setCurrentPage(page);
        setHasMore(page < tp);
      } else if (Array.isArray(data)) {
        if (append) setFilteredSchemes(prev => [...prev, ...data]);
        else setFilteredSchemes(data);
        setHasMore(false);
        setTotalPages(1);
        setTotalSchemes(data.length);
        setCurrentPage(1);
      } else {
        setFilteredSchemes([]);
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
  }, [selectedState, selectedCategory]);

  useEffect(() => {
    setCurrentPage(1);
    setTotalPages(1);
    setTotalSchemes(0);
    setHasMore(true);
    loadSchemes(1, false);
  }, [selectedState, selectedCategory, loadSchemes]);

  const fetchSchemeDetails = async (slug: string) => {
    try {
      const scheme = filteredSchemes.find(s => {
        const schemeIdentifier = s.slug && s.slug.trim() !== '' ? s.slug : s._id;
        return schemeIdentifier === slug;
      });
      
      if (scheme) {
        setSelectedScheme(scheme);
      } else {
        // If not found in filtered schemes, try to fetch from API as fallback
        const loadingAlert = showLoading('Loading scheme details...');
        try {
          const response = await getSchemeBySlug(slug);
          setSelectedScheme(response.data);
          loadingAlert.close();
        } catch (e: unknown) {
          loadingAlert.close();
          await showError(getErrorMessage(e, 'Failed to load scheme details'));
        }
      }
    } catch (e: unknown) {
      await showError(getErrorMessage(e, 'Failed to load scheme details'));
    }
  };

  const resetFilters = () => {
    setSelectedState('');
    setSelectedCategory('');
    setCurrentPage(1);
    setTotalPages(1);
    setTotalSchemes(0);
    setHasMore(true);
    loadSchemes(1, false);
  };

  const handleFormChange = <K extends keyof SchemeFormData>(key: K, value: SchemeFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key: 'bannerImage' | 'cardImage', file: File | null) => {
    setFormData((prev) => ({ ...prev, [key]: file }));
  };

  const extractId = (value: SchemeFormData['category'] | SchemeFormData['state']): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if ('value' in value && typeof value.value === 'string') return value.value;
      if ('_id' in value && typeof (value as { _id?: string })._id === 'string') return (value as { _id?: string })._id ?? '';
    }
    return '';
  };





  const [existingImages, setExistingImages] = useState<{
    bannerImage?: { url: string };
    cardImage?: { url: string };
  }>({});

  const [originalFormData, setOriginalFormData] = useState<SchemeFormData | null>(null);

  const hasFormChanges = () => {
    if (!originalFormData || !isEditMode) return false;
    
    const keyFields: (keyof SchemeFormData)[] = [
      'schemeTitle', 'about', 'objectives', 'category', 'state', 'excerpt',
      'seoTitle', 'seoMetaDescription', 'isFeatured'
    ];
    
    for (const field of keyFields) {
      if (formData[field] !== originalFormData[field]) {
        return true;
      }
    }
    
    const complexFields: (keyof SchemeFormData)[] = [
      'salientFeatures',
      'helplineNumber', 'frequentlyAskedQuestions', 'sourcesAndReferences',
      'disclaimer'
    ];
    
    for (const field of complexFields) {
      if (JSON.stringify(formData[field]) !== JSON.stringify(originalFormData[field])) {
        return true;
      }
    }
    
    if (formData.bannerImage || formData.cardImage) {
      return true;
    }
    
    return false;
  };

  const handleEditScheme = async (id: string) => {
    const loadingAlert = showLoading('Loading scheme for editing...');
    try {
      let scheme = filteredSchemes.find(s => s._id === id);
      
      // If no schemes loaded, try to load them first
      if (!scheme && filteredSchemes.length === 0) {
        await loadSchemes(1, false);
        scheme = filteredSchemes.find(s => s._id === id);
      }
      
      if (!scheme) {
        throw new Error('Scheme not found');
      }
      
      setExistingImages({
        bannerImage: scheme.bannerImage,
        cardImage: scheme.cardImage
      });
      
      const editFormData: SchemeFormData = {
        schemeTitle: scheme.schemeTitle || '',
        slug: scheme.slug || '',
        publishedOn: scheme.publishedOn ? new Date(scheme.publishedOn).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        about: scheme.about || '',
        textWithHTMLParsing: { 
          htmlDescription: typeof scheme.textWithHTMLParsing === 'string' 
            ? scheme.textWithHTMLParsing 
            : (scheme.textWithHTMLParsing?.htmlDescription || '<p>Hello!</p>')
        },
        objectives: scheme.objectives || '',
        category: scheme.category ? (typeof scheme.category === 'string' ? scheme.category : scheme.category._id) : '',
        state: scheme.state && scheme.state.length > 0 ? scheme.state.map((s: string | NamedEntity) => typeof s === 'string' ? s : s._id) : [],
        excerpt: scheme.excerpt || '',
        seoTitle: scheme.seoTitle || '',
        seoMetaDescription: scheme.seoMetaDescription || '',
        salientFeatures: scheme.salientFeatures || [{ subTitle: '', subDescription: '' }],
        helplineNumber: scheme.helplineNumber || { tollFreeNumber: '', emailSupport: '', availability: '' },
        frequentlyAskedQuestions: scheme.frequentlyAskedQuestions || [{ question: '', answer: '' }],
        sourcesAndReferences: scheme.sourcesAndReferences || [{ sourceName: '', sourceLink: '' }],
        disclaimer: scheme.disclaimer || { description: '' },
        bannerImage: null, 
        cardImage: null,   
        isFeatured: scheme.isFeatured ?? true
      };
      
      setFormData(editFormData);
      setEditingSchemeId(id);
      setIsEditMode(true);
      setIsAddMode(true);
      setOriginalFormData(editFormData);
      loadingAlert.close();
    } catch (e: unknown) {
      loadingAlert.close();
      await showError(getErrorMessage(e, 'Failed to load scheme for editing'));
    }
  };

  const resetForm = () => {
    setFormData({
      schemeTitle: '',
      slug: '',
      publishedOn: new Date().toISOString().split('T')[0],
      about: '',
      objectives: '',
      category: '',
      state: '',
      textWithHTMLParsing: { htmlDescription: '' },
      excerpt: '',
      seoTitle: '',
      seoMetaDescription: '',

      salientFeatures: [{ subTitle: '', subDescription: '' }],
      helplineNumber: { tollFreeNumber: '', emailSupport: '', availability: '' },
      frequentlyAskedQuestions: [{ question: '', answer: '' }],
      sourcesAndReferences: [{ sourceName: '', sourceLink: '' }],
      disclaimer: { description: '' },
      bannerImage: null,
      cardImage: null,
      isFeatured: true
    });
    setIsEditMode(false);
    setEditingSchemeId(null);
    setExistingImages({});
    setOriginalFormData(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.schemeTitle?.trim()) return await showError('Scheme Title is required');
    if (!formData.slug?.trim()) return await showError('Slug is required');
    if (!formData.about?.trim()) return await showError('About is required');
    if (!formData.objectives?.trim()) return await showError('Objectives is required');
    if (!formData.category) return await showError('Category is required');
    if (!formData.state) return await showError('State is required');
    if (!formData.textWithHTMLParsing?.htmlDescription?.trim()) return await showError('Rich Text Content is required');

    if (isEditMode) {
      setShowEditConfirmation(true);
      return;
    }

    await submitForm();
  };



  const submitForm = async () => {
    const loadingAlert = showLoading(isEditMode ? 'Updating scheme...' : 'Creating scheme...');
    try {
      const data = new FormData();
      const jsonFields = [
        'salientFeatures',
        'helplineNumber',
        'frequentlyAskedQuestions',
        'sourcesAndReferences',
        'disclaimer',
      ] as const satisfies readonly (keyof SchemeFormData)[];

      for (const key of jsonFields) {
        const value = formData[key] as unknown;
        if (value && (Array.isArray(value) ? value.length > 0 : Object.keys(value as Record<string, unknown>).length > 0)) {
          let filteredValue = value;
          if (Array.isArray(value)) {
            filteredValue = value.filter(item => {
              if (typeof item === 'object' && item !== null) {
                return Object.values(item).some(val => val !== '' && val !== null && val !== undefined);
              }
              return item !== '' && item !== null && item !== undefined;
            });
          } else if (typeof value === 'object' && value !== null) {
            filteredValue = Object.fromEntries(
              Object.entries(value as Record<string, unknown>).filter((entry) => {
                const val = entry[1];
                return val !== '' && val !== null && val !== undefined;
              })
            );
          }
          if (Array.isArray(filteredValue) ? filteredValue.length > 0 : Object.keys(filteredValue as Record<string, unknown>).length > 0) {
            data.append(key, JSON.stringify(filteredValue as unknown));
          } else {
            data.append(key, Array.isArray(value) ? '[]' : '{}');
          }
        } else {
          const defaultValue = Array.isArray(value) ? [] : {};
          data.append(key, JSON.stringify(defaultValue));
        }
      }

      data.append('schemeTitle', String(formData.schemeTitle || ''));
      data.append('publishedOn', String(formData.publishedOn || ''));
      data.append('about', String(formData.about || ''));
      data.append('objectives', String(formData.objectives || ''));
      data.append('excerpt', String(formData.excerpt || ''));
      data.append('seoTitle', String(formData.seoTitle || ''));
      data.append('seoMetaDescription', String(formData.seoMetaDescription || ''));
      data.append('slug', String(formData.slug || ''));

      const categoryId = extractId(formData.category);
      if (categoryId) data.append('category', JSON.stringify(categoryId)); else data.append('category', '""');
      
      // Handle multiple states
      if (Array.isArray(formData.state)) {
        data.append('state', JSON.stringify(formData.state));
      } else {
        const stateId = extractId(formData.state);
        if (stateId) data.append('state', JSON.stringify([stateId])); else data.append('state', '[]');
      }

      if (formData.bannerImage) data.append('bannerImage', formData.bannerImage);
      if (formData.cardImage) data.append('cardImage', formData.cardImage);
      data.append('isFeatured', String(Boolean(formData.isFeatured)));
      data.append('textWithHTMLParsing', String(formData.textWithHTMLParsing?.htmlDescription || ''));
      if (isEditMode) {
        if (!formData.bannerImage && existingImages.bannerImage) {
          data.append('preserveBannerImage', 'true');
        }
        if (!formData.cardImage && existingImages.cardImage) {
          data.append('preserveCardImage', 'true');
        }
      }

      const authHeaders = getAuthHeaders();
      
      if (isEditMode && editingSchemeId) {
        await updateSchemeById(editingSchemeId, data);
        loadingAlert.close();
        await showSuccess(`Scheme "${formData.schemeTitle}" updated successfully!`);
      } else {
        const res = await fetch(`${API_BASE_URL}/admin/registerScheme`, { 
          method: 'POST', 
          headers: authHeaders as HeadersInit, 
          body: data,
        });
        if (!res.ok) {
          let message = 'Failed to create scheme';
          try {
            const errorData = await res.json();
            message = errorData.message || message;
          } catch { 
          }
          throw new Error(message);
        }
        loadingAlert.close();
        await showSuccess(`Scheme "${formData.schemeTitle}" created successfully!`);
      }
      
      setIsAddMode(false);
      resetForm();
      resetFilters();
      await loadSchemes(1, false);
    } catch (e: unknown) {
      loadingAlert.close();
      await showError(getErrorMessage(e, isEditMode ? 'Failed to update scheme' : 'Failed to create scheme'));
    }
  };

  const confirmEdit = () => {
    setShowEditConfirmation(false);
    submitForm();
  };

  const cancelEdit = () => {
    setShowEditConfirmation(false);
  };

  const handleDeleteScheme = async (id: string) => {
    const scheme = filteredSchemes.find(s => s._id === id);
    if (scheme) {
      setSchemeToDelete(scheme);
    }
  };

  const confirmDelete = async () => {
    if (!schemeToDelete) return;
    
    const loadingAlert = showLoading('Deleting scheme...');
    try {
      await deleteSchemeById(schemeToDelete._id);
      loadingAlert.close();
      await showSuccess('Scheme deleted successfully!');
      setSchemeToDelete(null);
      await loadSchemes(1, false);
    } catch (e: unknown) {
      loadingAlert.close();
      await showError(getErrorMessage(e, 'Failed to delete scheme'));
    }
  };

  const cancelDelete = () => {
    setSchemeToDelete(null);
  };

  const loadAllSchemes = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE_URL}/user/getAllSchemes?limit=1000`;
      if (selectedState) url += `&stateId=${selectedState}`;
      else if (selectedCategory) url += `&categoryId=${selectedCategory}`;
      const authHeaders = getAuthHeaders();
      const res = await fetch(url, { headers: authHeaders as HeadersInit });
      if (!res.ok) {
        if (res.status === 404) {
          setFilteredSchemes([]);
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
        setFilteredSchemes(data.data);
        setTotalSchemes(data.data.length);
        setHasMore(false);
        setCurrentPage(1);
        setTotalPages(1);
        setError(null);
      } else {
        setFilteredSchemes([]);
        setTotalSchemes(0);
        setHasMore(false);
      }
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Failed to load all schemes'));
    } finally {
      setLoading(false);
    }
  };

  const clearFiltersAndLoadAll = () => {
    resetFilters();
    loadSchemes(1, false);
  };

  const goToPreviousPage = () => loadSchemes(currentPage - 1, false);
  const goToNextPage = () => loadSchemes(currentPage + 1, false);
  const loadMoreSchemes = () => loadSchemes(currentPage + 1, true);
  const closeSchemeModal = () => setSelectedScheme(null);

  const handleCancelForm = () => {
    if (isEditMode && hasFormChanges()) {
      setShowEditConfirmation(true);
      return;
    }
    setIsAddMode(false);
    resetForm();
  };

  const confirmCancel = () => {
    setShowEditConfirmation(false);
    setIsAddMode(false);
    resetForm();
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Schemes</h1>
          {isEditMode && (
            <p className="text-sm text-blue-600 mt-1">Editing scheme: {formData.schemeTitle}</p>
          )}
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50" onClick={handleCancelForm}>
            {isAddMode ? 'Back' : 'View All'}
          </button>
          {!isAddMode && (
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600" onClick={() => setIsAddMode(true)}>
              <PlusIcon className="h-4 w-4" /> Add Scheme
            </button>
          )}
        </div>
      </div>

      {!isAddMode ? (
        <>
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Filter by State</Label>
              <Select
                options={states.map(state => ({ value: state._id, label: state.name }))}
                value={selectedState}
                onChange={(v) => setSelectedState(String(v))}
                placeholder="Select state"
              />
            </div>
            <div>
              <Label>Filter by Category</Label>
              <Select
                options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                value={selectedCategory}
                onChange={(v) => setSelectedCategory(String(v))}
                placeholder="Select category"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Reset Filters
              </button>
              <button
                onClick={() => loadSchemes(1, false)}
                className="px-4 py-2 bg-blue-200 rounded-md hover:bg-blue-300"
              >
                Refresh
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white">
            {!loading && !error && filteredSchemes.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{filteredSchemes.length}</span> schemes loaded
                    {totalSchemes > filteredSchemes.length && (
                      <span> of <span className="font-medium">{totalSchemes}</span> total</span>
                    )}
                  </div>
                  {hasMore && <div className="text-sm text-blue-600">More schemes available</div>}
                </div>
              </div>
            )}

            {loading ? (
              <div className="p-6 text-sm text-gray-600">Loading schemes...</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : filteredSchemes.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">
                {selectedState || selectedCategory ? (
                  <div className="text-center">
                    <p>No schemes found for the selected filters.</p>
                    <button 
                      onClick={clearFiltersAndLoadAll}
                      className="mt-2 px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                    >
                      Clear Filters & Show All Schemes
                    </button>
                  </div>
                ) : (
                  'No schemes found.'
                )}
              </div>
            ) : (
              <SchemeList schemes={filteredSchemes} onSelect={fetchSchemeDetails} onDelete={handleDeleteScheme} onEdit={handleEditScheme} />
            )}

            {filteredSchemes.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredSchemes.length} of {totalSchemes || filteredSchemes.length} schemes
                  </div>
                  {totalPages > 1 && (
                    <div className="flex gap-2">
                      <button onClick={goToPreviousPage} disabled={currentPage <= 1} className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-600">Page {currentPage} of {totalPages}</span>
                      <button onClick={goToNextPage} disabled={!hasMore} className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                      </button>
                    </div>
                  )}
                </div>
                <div className="mt-3 text-center space-y-2">
                  {hasMore && (
                    <button onClick={loadMoreSchemes} disabled={loading} className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed">
                      {loading ? 'Loading...' : 'Load More Schemes'}
                    </button>
                  )}
                  <div>
                    <button
                      onClick={loadAllSchemes}
                      disabled={loading}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Load All Schemes
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 gap-6">
            <SchemeForm
              formFields={formFields}
              formData={formData}
              onChange={handleFormChange}
              onFileChange={handleFileChange}
              onSubmit={handleSubmit}
              isEditMode={isEditMode}
              existingImages={existingImages}
              loading={loading}
              hasUnsavedChanges={hasFormChanges()}
            />
          </div>

          <div className="flex justify-end mt-6">
            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              onClick={handleCancelForm}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

             {selectedScheme && (
         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
                             <div className="flex justify-between items-start mb-4">
                 <div>
                   <h2 className="text-2xl font-bold">{selectedScheme.schemeTitle}</h2>
                 
                 </div>
                 <button onClick={closeSchemeModal} className="text-gray-500 hover:text-gray-700">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   </svg>
                 </button>
               </div>

                             {selectedScheme.bannerImage && (
                 <div className="mb-6 rounded-lg overflow-hidden relative h-48">
                   <Image src={selectedScheme.bannerImage.url} alt="Banner" fill className="object-cover" sizes="800px" />
                 </div>
               )}

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 {selectedScheme.cardImage && (
                   <div className="rounded-lg overflow-hidden relative h-32">
                     <Image src={selectedScheme.cardImage.url} alt="Card" fill className="object-cover" sizes="400px" />
                   </div>
                 )}
                 <div className="flex flex-col justify-center">
                   {selectedScheme.isFeatured && (
                     <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mb-2">
                       Featured Scheme
                     </span>
                   )}
                   {selectedScheme.isActive !== undefined && (
                     <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                       selectedScheme.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                     }`}>
                       {selectedScheme.isActive ? 'Active' : 'Inactive'}
                     </span>
                   )}
                 </div>
               </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">About</h3>
                  <p className="text-gray-700">{selectedScheme.about}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Objectives</h3>
                  <p className="text-gray-700">{selectedScheme.objectives}</p>
                </div>
              </div>

              {(selectedScheme.excerpt || selectedScheme.seoTitle || selectedScheme.seoMetaDescription) && (
                <Section title="SEO & Content">
                  {selectedScheme.excerpt && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-gray-700">Excerpt</h4>
                      <p className="text-gray-700">{selectedScheme.excerpt}</p>
                    </div>
                  )}
                  {selectedScheme.seoTitle && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-gray-700">SEO Title</h4>
                      <p className="text-gray-700">{selectedScheme.seoTitle}</p>
                    </div>
                  )}
                  {selectedScheme.seoMetaDescription && (
                    <div className="mb-4">
                      <h4 className="font-medium mb-2 text-gray-700">SEO Meta Description</h4>
                      <p className="text-gray-700">{selectedScheme.seoMetaDescription}</p>
                    </div>
                  )}
                </Section>
              )}

              {selectedScheme.salientFeatures?.length > 0 && (
                <Section title="Salient Features">
                  {selectedScheme.salientFeatures.map((item) => {
                    const bulletPoints = parseBulletPoints(item.subDescription);
                    return (
                      <div key={item._id} className="mb-4">
                        {item.subTitle && (
                          <h4 className="font-medium mb-2 text-gray-700">{item.subTitle}</h4>
                        )}
                        {bulletPoints.length > 0 ? (
                          <ul className="list-disc pl-5 space-y-1">
                            {bulletPoints.map((point, index) => (
                              <li key={index} className="text-gray-700">{point}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-gray-700">{item.subDescription}</p>
                        )}
                      </div>
                    );
                  })}
                </Section>
              )}


              {selectedScheme.helplineNumber && (
                <Section title="Helpline Number">
                  <p><strong>Toll Free:</strong> {selectedScheme.helplineNumber.tollFreeNumber || 'N/A'}</p>
                  <p><strong>Email:</strong> {selectedScheme.helplineNumber.emailSupport || 'N/A'}</p>
                  <p><strong>Availability:</strong> {selectedScheme.helplineNumber.availability || 'N/A'}</p>
                </Section>
              )}

              {selectedScheme.frequentlyAskedQuestions?.length > 0 && (
                <Section title="Frequently Asked Questions">
                  <ul className="space-y-2">
                    {selectedScheme.frequentlyAskedQuestions.map((faq) => (
                      <li key={faq._id}>
                        <strong>Q:</strong> {faq.question}
                        <br />
                        <strong>A:</strong> {faq.answer}
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

              {selectedScheme.sourcesAndReferences && selectedScheme.sourcesAndReferences.length > 0 && (
                <Section title="Sources & References">
                  <ul className="list-disc list-inside space-y-2">
                    {selectedScheme.sourcesAndReferences.map((source, index) => (
                      <li key={source._id || index}>
                        <strong>{source.sourceName}</strong>: <a href={source.sourceLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{source.sourceLink}</a>
                      </li>
                    ))}
                  </ul>
                </Section>
              )}

                             {selectedScheme.textWithHTMLParsing?.htmlDescription && (
                 <Section title="Detailed Content">
                   <div 
                     className="html-content"
                     style={{
                       lineHeight: '1.6',
                       fontSize: '16px'
                     }}
                     dangerouslySetInnerHTML={{ __html: selectedScheme.textWithHTMLParsing.htmlDescription }}
                   />

                 </Section>
               )}



               {selectedScheme.author && (
                 <Section title="Author">
                   <p><strong>Name:</strong> {selectedScheme.author.name}</p>
                   <p><strong>Email:</strong> {selectedScheme.author.email}</p>
                 </Section>
               )}

               {(selectedScheme.createdAt || selectedScheme.updatedAt) && (
                 <Section title="Metadata">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                     {selectedScheme.createdAt && (
                       <div>
                         <strong>Created:</strong> {new Date(selectedScheme.createdAt).toLocaleString()}
                         {selectedScheme.createdBy && <span> by {selectedScheme.createdBy.name}</span>}
                       </div>
                     )}
                     {selectedScheme.updatedAt && (
                       <div>
                         <strong>Last Updated:</strong> {new Date(selectedScheme.updatedAt).toLocaleString()}
                         {selectedScheme.updatedBy && <span> by {selectedScheme.updatedBy.name}</span>}
                       </div>
                     )}
                   </div>
                 </Section>
               )}

               {selectedScheme.disclaimer?.description && (
                 <Section title="Disclaimer">
                   <p>{selectedScheme.disclaimer.description}</p>
                 </Section>
               )}

              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                <button 
                  onClick={() => {
                    closeSchemeModal();
                    handleEditScheme(selectedScheme._id);
                  }} 
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Edit Scheme
                </button>
                <button onClick={closeSchemeModal} className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {schemeToDelete && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete the scheme &quot;{schemeToDelete.schemeTitle}&quot;? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Delete
              </button>
              <button
                onClick={cancelDelete}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditConfirmation && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">
              {isEditMode ? 'Confirm Edit' : 'Confirm Cancel'}
            </h3>
            <p className="text-gray-700 mb-4">
              {isEditMode 
                ? `You are about to update the scheme "${formData.schemeTitle}". Are you sure you want to proceed?`
                : `You have unsaved changes for the scheme "${formData.schemeTitle}". Are you sure you want to discard these changes?`
              }
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={isEditMode ? confirmEdit : confirmCancel}
                className={`px-4 py-2 text-white rounded-md hover:opacity-90 ${
                  isEditMode ? 'bg-blue-500 hover:bg-blue-600' : 'bg-red-500 hover:bg-red-600'
                }`}
              >
                {isEditMode ? 'Confirm Edit' : 'Yes, Cancel'}
              </button>
              <button
                onClick={cancelEdit}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                {isEditMode ? 'Cancel' : 'No, Continue Editing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchemePage;