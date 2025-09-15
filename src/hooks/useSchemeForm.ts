import { useState, useCallback, useMemo } from 'react';
import { API_BASE_URL } from '@/config/api';
import { getAuthHeaders } from '@/config/api';
import { updateSchemeById } from '@/app/service/schemeService';
import { showSuccess, showError, showLoading } from '@/components/SweetAlert';
import { SchemeFormData, Scheme, NamedEntity } from '@/app/types/scheme';

export const useSchemeForm = () => {
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

  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSchemeId, setEditingSchemeId] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<{
    bannerImage?: { url: string };
    cardImage?: { url: string };
  }>({});
  const [originalFormData, setOriginalFormData] = useState<SchemeFormData | null>(null);

  const getErrorMessage = (e: unknown, fallback: string) =>
    e instanceof Error ? e.message : fallback;

  const extractId = (value: SchemeFormData['category'] | SchemeFormData['state']): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if ('value' in value && typeof value.value === 'string') return value.value;
      if ('_id' in value && typeof (value as { _id?: string })._id === 'string') return (value as { _id?: string })._id ?? '';
    }
    return '';
  };

  const hasFormChanges = useCallback(() => {
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
  }, [formData, originalFormData, isEditMode]);

  const handleFormChange = useCallback(<K extends keyof SchemeFormData>(key: K, value: SchemeFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFileChange = useCallback((key: 'bannerImage' | 'cardImage', file: File | null) => {
    setFormData((prev) => ({ ...prev, [key]: file }));
  }, []);

  const resetForm = useCallback(() => {
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
  }, []);

  const prepareSchemeForEdit = useCallback((scheme: Scheme) => {
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
    setOriginalFormData(editFormData);
    setEditingSchemeId(scheme._id);
    setIsEditMode(true);
  }, []);

  const submitForm = useCallback(async (onSuccess?: () => void) => {
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
      
      resetForm();
      onSuccess?.();
    } catch (e: unknown) {
      loadingAlert.close();
      await showError(getErrorMessage(e, isEditMode ? 'Failed to update scheme' : 'Failed to create scheme'));
    }
  }, [formData, isEditMode, editingSchemeId, existingImages, resetForm]);

  const validateForm = useCallback(() => {
    if (!formData.schemeTitle?.trim()) return 'Scheme Title is required';
    if (!formData.slug?.trim()) return 'Slug is required';
    if (!formData.about?.trim()) return 'About is required';
    if (!formData.objectives?.trim()) return 'Objectives is required';
    if (!formData.category) return 'Category is required';
    if (!formData.state) return 'State is required';
    if (!formData.textWithHTMLParsing?.htmlDescription?.trim()) return 'Rich Text Content is required';
    return null;
  }, [formData]);

  return useMemo(() => ({
    formData,
    isEditMode,
    editingSchemeId,
    existingImages,
    hasFormChanges,
    handleFormChange,
    handleFileChange,
    resetForm,
    prepareSchemeForEdit,
    submitForm,
    validateForm,
    setIsEditMode,
    setEditingSchemeId
  }), [
    formData,
    isEditMode,
    editingSchemeId,
    existingImages,
    hasFormChanges,
    handleFormChange,
    handleFileChange,
    resetForm,
    prepareSchemeForEdit,
    submitForm,
    validateForm,
    setIsEditMode,
    setEditingSchemeId
  ]);
};
