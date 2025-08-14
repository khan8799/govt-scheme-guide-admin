'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import Image from 'next/image';
import { showSuccess, showError, showLoading } from '@/components/SweetAlert';
import { API_BASE_URL } from '@/config/api';
import { getAuthHeaders } from '@/config/api';
import {
  Scheme,
  State,
  Category,
  SchemeFormData,
  SchemeKeyHighlight,
  SchemeSubSection,
  SchemeDateEntry,
  SchemeFAQ,
  SchemeHelplineNumber,
  SchemeSourcesAndReferences,
} from '@/app/types/scheme';

interface FormField {
  label: string;
  key: keyof SchemeFormData;
  type: 'text' | 'textarea' | 'date' | 'json' | 'select' | 'multi-select' | 'file' | 'toggle';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}


const SchemePage = () => {
  const getErrorMessage = (e: unknown, fallback: string) =>
    e instanceof Error ? e.message : fallback;

  const [isAddMode, setIsAddMode] = useState(false);
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
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [formData, setFormData] = useState<SchemeFormData>({
    schemeTitle: '',
    publishedOn: new Date().toISOString().split('T')[0],
    about: '',
    objectives: '',
    category: '',
    state: '',
    keyHighlightsOfTheScheme: [{ schemeName: '', launchedBy: '' }],
    eligibilityCriteria: [{ subTitle: '', subDescription: '' }],
    financialBenefits: [{ subTitle: '', subDescription: '' }],
    requiredDocuments: [{ subTitle: '', subDescription: '' }],
    importantDates: [{ label: '', date: '' }],
    salientFeatures: [{ subTitle: '', subDescription: '' }],
    applicationProcess: [{ subTitle: '', subDescription: '' }],
    helplineNumber: { 
      tollFreeNumber: '', 
      emailSupport: '', 
      availability: '' 
    },
    frequentlyAskedQuestions: [{ question: '', answer: '' }],
    sourcesAndReferences: { sourceName: '', sourceLink: '' },
    disclaimer: { description: '' },
    listCategory: [],
    bannerImage: null,
    cardImage: null,
    isFeatured: true
  });

  const formFields: FormField[] = [
    { label: 'Scheme Title', key: 'schemeTitle', type: 'text', required: true },
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
      type: 'select', 
      required: true,
      options: states.map(state => ({ value: state._id, label: state.name }))
    },
    { label: 'Key Highlights', key: 'keyHighlightsOfTheScheme', type: 'json' },
    { label: 'Eligibility Criteria', key: 'eligibilityCriteria', type: 'json' },
    { label: 'Financial Benefits', key: 'financialBenefits', type: 'json' },
    { label: 'Required Documents', key: 'requiredDocuments', type: 'json' },
    { label: 'Important Dates', key: 'importantDates', type: 'json' },
    { label: 'Salient Features', key: 'salientFeatures', type: 'json' },
    { label: 'Application Process', key: 'applicationProcess', type: 'json' },
    { label: 'Helpline Number', key: 'helplineNumber', type: 'json' },
    { label: 'FAQ', key: 'frequentlyAskedQuestions', type: 'json' },
    { label: 'Sources', key: 'sourcesAndReferences', type: 'json' },
    { label: 'Disclaimer', key: 'disclaimer', type: 'json' },
    { label: 'List Category', key: 'listCategory', type: 'json' },
    { label: 'Featured', key: 'isFeatured', type: 'toggle' },
    { label: 'Banner Image', key: 'bannerImage', type: 'file' },
    { label: 'Card Image', key: 'cardImage', type: 'file' }
  ];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="my-6">
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div>{children}</div>
    </div>
  );

  // Fetch all states and categories
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const authHeaders = getAuthHeaders();
        
        const [statesRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/user/getAllStates`, {
            headers: authHeaders as HeadersInit
          }),
          fetch(`${API_BASE_URL}/user/allCategories`, {
            headers: authHeaders as HeadersInit
          })
        ]);

        if (!statesRes.ok) {
          throw new Error(`Failed to load states: ${statesRes.status} ${statesRes.statusText}`);
        }
        if (!categoriesRes.ok) {
          throw new Error(`Failed to load categories: ${categoriesRes.status} ${categoriesRes.statusText}`);
        }

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
      
      if (selectedState) {
        url += `&stateId=${selectedState}`;
      } else if (selectedCategory) {
        url += `&categoryId=${selectedCategory}`;
      }

      const authHeaders2 = getAuthHeaders();
      const res = await fetch(url, { headers: authHeaders2 as HeadersInit });

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
        if (append) {
          setFilteredSchemes(prev => [...prev, ...data.data]);
        } else {
          setFilteredSchemes(data.data);
        }
        

        const totalPages = data.totalPages || 1;
        const total = data.total || data.data.length;
        const hasMoreData = page < totalPages;
        
        setTotalPages(totalPages);
        setTotalSchemes(total);
        setCurrentPage(page);
        setHasMore(hasMoreData);
        

        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } else if (Array.isArray(data)) {
        if (append) {
          setFilteredSchemes(prev => [...prev, ...data]);
        } else {
          setFilteredSchemes(data);
        }
        setHasMore(false);
        setTotalPages(1);
        setTotalSchemes(data.length);
        setCurrentPage(1);
        
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
      } else {
        setFilteredSchemes([]);
        setHasMore(false);
        setTotalPages(1);
        setTotalSchemes(0);
        setCurrentPage(1);
        
        if (isInitialLoad) {
          setIsInitialLoad(false);
        }
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

  const fetchSchemeDetails = async (id: string) => {
    const loadingAlert = showLoading('Loading scheme details...');
    try {
      const authHeaders3 = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/user/getSchemeById/${id}`, { headers: authHeaders3 as HeadersInit });
      
      if (!res.ok) throw new Error('Failed to load scheme details');
      
      const data = await res.json();
      setSelectedScheme(data.data || data);
      loadingAlert.close();
    } catch (e: unknown) {
      loadingAlert.close();
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
    setIsInitialLoad(true);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    

    if (!formData.schemeTitle?.trim()) {
      await showError('Scheme Title is required');
      return;
    }
    if (!formData.about?.trim()) {
      await showError('About is required');
      return;
    }
    if (!formData.objectives?.trim()) {
      await showError('Objectives is required');
      return;
    }
    if (!formData.category) {
      await showError('Category is required');
      return;
    }
    if (!formData.state) {
      await showError('State is required');
      return;
    }
    
    const loadingAlert = showLoading('Creating scheme...');
    
    try {
      const data = new FormData();

      const jsonFields = [
        'keyHighlightsOfTheScheme',
        'eligibilityCriteria',
        'financialBenefits',
        'requiredDocuments',
        'importantDates',
        'salientFeatures',
        'applicationProcess',
        'helplineNumber',
        'frequentlyAskedQuestions',
        'sourcesAndReferences',
        'disclaimer',
        'listCategory',
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

      const categoryId = extractId(formData.category);
      if (categoryId) data.append('category', JSON.stringify(categoryId));
      else data.append('category', '""');

      const stateId = extractId(formData.state);
      if (stateId) data.append('state', JSON.stringify([stateId]));
      else data.append('state', '[]');


      if (formData.bannerImage) {
        data.append('bannerImage', formData.bannerImage);
      }
      if (formData.cardImage) {
        data.append('cardImage', formData.cardImage);
      }


      data.append('isFeatured', String(Boolean(formData.isFeatured)));



      const authHeaders4 = getAuthHeaders();
      const res = await fetch(`${API_BASE_URL}/admin/registerScheme`, {
        method: 'POST',
        headers: authHeaders4 as HeadersInit,
        body: data
      });

      if (!res.ok) {
        let message = 'Failed to create scheme';
        try {
          const errorData = await res.json();
          message = errorData.message || message;
        } catch {}
        throw new Error(message);
      }

      loadingAlert.close();
      await showSuccess('Scheme created successfully!');
      setIsAddMode(false);
      resetFilters();
      await loadSchemes();
      setFormData({
        schemeTitle: '',
        publishedOn: new Date().toISOString().split('T')[0],
        about: '',
        objectives: '',
        category: '',
        state: '',
        keyHighlightsOfTheScheme: [{ schemeName: '', launchedBy: '' }],
        eligibilityCriteria: [{ subTitle: '', subDescription: '' }],
        financialBenefits: [{ subTitle: '', subDescription: '' }],
        requiredDocuments: [{ subTitle: '', subDescription: '' }],
        importantDates: [{ label: '', date: '' }],
        salientFeatures: [{ subTitle: '', subDescription: '' }],
        applicationProcess: [{ subTitle: '', subDescription: '' }],
        helplineNumber: { 
          tollFreeNumber: '', 
          emailSupport: '', 
          availability: '' 
        },
        frequentlyAskedQuestions: [{ question: '', answer: '' }],
        sourcesAndReferences: { sourceName: '', sourceLink: '' },
        disclaimer: { description: '' },
        listCategory: [],
        bannerImage: null,
        cardImage: null,
        isFeatured: true
      });
    } catch (e: unknown) {
      loadingAlert.close();
      await showError(getErrorMessage(e, 'Failed to create scheme'));
    }
  };

  const renderJsonField = (field: FormField) => {
    const value = formData[field.key] as unknown;
    
    switch (field.key) {
      case 'keyHighlightsOfTheScheme':
        return (
          <div className="space-y-3">
            {Array.isArray(value) && (value as SchemeKeyHighlight[]).map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Scheme Name"
                    value={item.schemeName || ''}
                    onChange={(e) => {
                      const newValue = [...value];
                      newValue[index] = { ...item, schemeName: e.target.value };
                      handleFormChange(field.key, newValue);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    placeholder="Launched By"
                    value={item.launchedBy || ''}
                    onChange={(e) => {
                      const newValue = [...value];
                      newValue[index] = { ...item, launchedBy: e.target.value };
                      handleFormChange(field.key, newValue);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newValue = (value as SchemeKeyHighlight[]).filter((_, i) => i !== index);
                    handleFormChange('keyHighlightsOfTheScheme', newValue);
                  }}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newValue = ([...(value as SchemeKeyHighlight[]), { schemeName: '', launchedBy: '' }] as SchemeKeyHighlight[]);
                handleFormChange('keyHighlightsOfTheScheme', newValue);
              }}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Highlight
            </button>
          </div>
        );
      
      case 'eligibilityCriteria':
      case 'financialBenefits':
      case 'requiredDocuments':
      case 'salientFeatures':
      case 'applicationProcess':
        return (
          <div className="space-y-3">
            {Array.isArray(value) && (value as SchemeSubSection[]).map((item, index) => (
              <div key={index} className="space-y-2">
                <Input
                  placeholder="Sub Title"
                  value={item.subTitle || ''}
                  onChange={(e) => {
                    const newValue = ([...(value as SchemeSubSection[])]);
                    newValue[index] = { ...item, subTitle: e.target.value };
                    handleFormChange(field.key as keyof SchemeFormData, newValue as SchemeFormData[typeof field.key]);
                  }}
                />
                <TextArea
                  rows={2}
                  placeholder="Sub Description"
                  value={item.subDescription || ''}
                  onChange={(v) => {
                    const newValue = ([...(value as SchemeSubSection[])]);
                    newValue[index] = { ...item, subDescription: v };
                    handleFormChange(field.key as keyof SchemeFormData, newValue as SchemeFormData[typeof field.key]);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newValue = (value as SchemeSubSection[]).filter((_, i) => i !== index);
                    handleFormChange(field.key as keyof SchemeFormData, newValue as SchemeFormData[typeof field.key]);
                  }}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newValue = ([...(value as SchemeSubSection[]), { subTitle: '', subDescription: '' }] as SchemeSubSection[]);
                handleFormChange(field.key as keyof SchemeFormData, newValue as SchemeFormData[typeof field.key]);
              }}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add {field.label}
            </button>
          </div>
        );
      
      case 'importantDates':
        return (
          <div className="space-y-3">
            {Array.isArray(value) && (value as SchemeDateEntry[]).map((item, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="Label (e.g., Start Date, End Date)"
                    value={item.label || ''}
                    onChange={(e) => {
                      const newValue = ([...(value as SchemeDateEntry[])]);
                      newValue[index] = { ...item, label: e.target.value };
                      handleFormChange('importantDates', newValue);
                    }}
                  />
                </div>
                <div className="flex-1">
                  <Input
                    type="date"
                    value={item.date || ''}
                    onChange={(e) => {
                      const newValue = ([...(value as SchemeDateEntry[])]);
                      newValue[index] = { ...item, date: e.target.value };
                      handleFormChange('importantDates', newValue);
                    }}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const newValue = (value as SchemeDateEntry[]).filter((_, i) => i !== index);
                    handleFormChange('importantDates', newValue);
                  }}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newValue = ([...(value as SchemeDateEntry[]), { label: '', date: '' }]);
                handleFormChange('importantDates', newValue);
              }}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Date
            </button>
          </div>
        );
      
      case 'helplineNumber':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Toll Free Number"
              value={(value as SchemeHelplineNumber).tollFreeNumber || ''}
              onChange={(e) => {
                const v = value as SchemeHelplineNumber;
                handleFormChange('helplineNumber', { ...v, tollFreeNumber: e.target.value });
              }}
            />
            <Input
              placeholder="Email Support"
              value={(value as SchemeHelplineNumber).emailSupport || ''}
              onChange={(e) => {
                const v = value as SchemeHelplineNumber;
                handleFormChange('helplineNumber', { ...v, emailSupport: e.target.value });
              }}
            />
            <Input
              placeholder="Availability (e.g., 9 AM - 5 PM)"
              value={(value as SchemeHelplineNumber).availability || ''}
              onChange={(e) => {
                const v = value as SchemeHelplineNumber;
                handleFormChange('helplineNumber', { ...v, availability: e.target.value });
              }}
            />
          </div>
        );
      
      case 'frequentlyAskedQuestions':
        return (
          <div className="space-y-3">
            {Array.isArray(value) && (value as SchemeFAQ[]).map((item, index) => (
              <div key={index} className="space-y-2">
                <Input
                  placeholder="Question"
                  value={item.question || ''}
                  onChange={(e) => {
                    const newValue = ([...(value as SchemeFAQ[])]);
                    newValue[index] = { ...item, question: e.target.value };
                    handleFormChange('frequentlyAskedQuestions', newValue);
                  }}
                />
                <TextArea
                  rows={2}
                  placeholder="Answer"
                  value={item.answer || ''}
                  onChange={(v) => {
                    const newValue = ([...(value as SchemeFAQ[])]);
                    newValue[index] = { ...item, answer: v };
                    handleFormChange('frequentlyAskedQuestions', newValue);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newValue = (value as SchemeFAQ[]).filter((_, i) => i !== index);
                    handleFormChange('frequentlyAskedQuestions', newValue);
                  }}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newValue = ([...(value as SchemeFAQ[]), { question: '', answer: '' }] as SchemeFAQ[]);
                handleFormChange('frequentlyAskedQuestions', newValue);
              }}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add FAQ
            </button>
          </div>
        );
      
      case 'sourcesAndReferences':
        return (
          <div className="space-y-3">
            <Input
              placeholder="Source Name"
              value={(value as SchemeSourcesAndReferences).sourceName || ''}
              onChange={(e) => {
                const v = value as SchemeSourcesAndReferences;
                handleFormChange('sourcesAndReferences', { ...v, sourceName: e.target.value });
              }}
            />
            <Input
              placeholder="Source Link"
              value={(value as SchemeSourcesAndReferences).sourceLink || ''}
              onChange={(e) => {
                const v = value as SchemeSourcesAndReferences;
                handleFormChange('sourcesAndReferences', { ...v, sourceLink: e.target.value });
              }}
            />
          </div>
        );
      
      case 'disclaimer':
        return (
          <TextArea
            rows={3}
            placeholder="Disclaimer description"
            value={(value as { description: string }).description || ''}
            onChange={(v) => {
              const current = value as { description: string };
              handleFormChange('disclaimer', { ...current, description: v });
            }}
          />
        );
      
      case 'listCategory':
        return (
          <div className="space-y-3">
            {Array.isArray(value) && (value as string[]).map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder="Category name"
                  value={item || ''}
                  onChange={(e) => {
                    const newValue = ([...(value as string[])]);
                    newValue[index] = e.target.value;
                    handleFormChange('listCategory', newValue);
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const newValue = (value as string[]).filter((_, i) => i !== index);
                    handleFormChange('listCategory', newValue);
                  }}
                  className="px-2 py-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newValue = ([...(value as string[]), '']);
                handleFormChange('listCategory', newValue);
              }}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700"
            >
              <PlusIcon className="h-4 w-4" />
              Add Category
            </button>
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <TextArea
              rows={3}
              value={JSON.stringify(value ?? '', null, 2)}
              onChange={(v) => {
                try {
                  const parsed = JSON.parse(v);
                  handleFormChange(field.key as keyof SchemeFormData, parsed as SchemeFormData[typeof field.key]);
                } catch {
                  // Ignore invalid JSON edits
                }
              }}
              placeholder={`Enter ${field.label} as JSON`}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-500">
              Enter valid JSON format for {field.label.toLowerCase()}
            </p>
          </div>
        );
    }
  };

  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={(formData[field.key] as string) || ''}
            onChange={(e) => handleFormChange(field.key as keyof SchemeFormData, e.target.value as unknown as SchemeFormData[keyof SchemeFormData])}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <TextArea
            rows={3}
            value={(formData[field.key] as string) || ''}
            onChange={(v) => handleFormChange(field.key as keyof SchemeFormData, v as unknown as SchemeFormData[keyof SchemeFormData])}
            placeholder={`Enter ${field.label.toLowerCase()}`}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={(formData[field.key] as string) || ''}
            onChange={(e) => handleFormChange(field.key as keyof SchemeFormData, e.target.value as unknown as SchemeFormData[keyof SchemeFormData])}
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select
            options={field.options || []}
            value={field.key === 'category' ? extractId(formData.category) : field.key === 'state' ? extractId(formData.state) : ''}
            onChange={(v) => handleFormChange(field.key as keyof SchemeFormData, String(v) as unknown as SchemeFormData[keyof SchemeFormData])}
            placeholder={`Select ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'toggle':
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={Boolean(formData.isFeatured)}
              onChange={(e) => handleFormChange('isFeatured', e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm text-gray-600">Mark as featured</span>
          </div>
        );
      case 'multi-select':
        return (
          <Select
            isMulti
            options={field.options || []}
            value={Array.isArray(formData[field.key]) ? (formData[field.key] as string[]) : []}
            onChange={(v) => handleFormChange(field.key as keyof SchemeFormData, (Array.isArray(v) ? v : [String(v)]) as unknown as SchemeFormData[keyof SchemeFormData])}
            placeholder={`Select ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'json':
        return renderJsonField(field);
      case 'file':
        return (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (field.key === 'bannerImage' || field.key === 'cardImage') {
                handleFileChange(field.key, file);
              }
            }}
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-brand-50 file:text-brand-700
              hover:file:bg-brand-100"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Schemes</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => setIsAddMode(false)}
          >
            {isAddMode ? 'Back' : 'View All'}
          </button>
          {!isAddMode && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              onClick={() => setIsAddMode(true)}
            >
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
            {/* Summary */}
            {!loading && !error && filteredSchemes.length > 0 && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{filteredSchemes.length}</span> schemes loaded
                    {totalSchemes > filteredSchemes.length && (
                      <span> of <span className="font-medium">{totalSchemes}</span> total</span>
                    )}
                  </div>
                  {hasMore && (
                    <div className="text-sm text-blue-600">
                      More schemes available
                    </div>
                  )}
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
                      onClick={() => {
                        resetFilters();
                        loadSchemes(1, false);
                      }}
                      className="mt-2 px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                    >
                      Clear Filters & Show All Schemes
                    </button>
                  </div>
                ) : (
                  "No schemes found."
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredSchemes.map((scheme) => (
                  <div key={scheme._id} className="p-4 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-start gap-4" onClick={() => fetchSchemeDetails(scheme._id)}>
                      {scheme.cardImage && (
                        <div className="w-24 h-24 flex-shrink-0 relative">
                          <Image
                            src={scheme.cardImage.url}
                            alt={scheme.schemeTitle}
                            fill
                            className="object-cover rounded-lg"
                            sizes="100px"
                          />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">{scheme.schemeTitle}</h3>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            scheme.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {scheme.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {scheme.about}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {scheme.category && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                              {typeof scheme.category === 'string' ? scheme.category : scheme.category.name || 'Unknown Category'}
                            </span>
                          )}
                          {scheme.state && scheme.state.length > 0 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                              {scheme.state.map((s) => (typeof s === 'string' ? s : s.name)).join(', ')}
                            </span>
                          )}
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                            Published: {new Date(scheme.publishedOn).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination Controls */}
            {filteredSchemes.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Showing {filteredSchemes.length} of {totalSchemes || filteredSchemes.length} schemes
                  </div>
                  {totalPages > 1 && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => loadSchemes(currentPage - 1, false)}
                        disabled={currentPage <= 1}
                        className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm text-gray-600">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => loadSchemes(currentPage + 1, false)}
                        disabled={!hasMore}
                        className="px-3 py-1 text-sm bg-gray-200 rounded-md hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="mt-3 text-center space-y-2">
                  {hasMore && (
                    <button
                      onClick={() => loadSchemes(currentPage + 1, true)}
                      disabled={loading}
                      className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Loading...' : 'Load More Schemes'}
                    </button>
                  )}
                  
                  {/* Load All Button */}
                  <div>
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          let url = `${API_BASE_URL}/user/getAllSchemes?limit=1000`;
                          
                          if (selectedState) {
                            url += `&stateId=${selectedState}`;
                          } else if (selectedCategory) {
                            url += `&categoryId=${selectedCategory}`;
                          }

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
                      }}
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
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formFields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' || field.type === 'json' ? 'md:col-span-2' : ''}>
                <Label>{field.label}{field.required && '*'}</Label>
                {renderFormField(field)}
              </div>
            ))}
          </div>

          <div className="flex justify-end mt-6">

            <button
              type="button"
              className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 mr-4"
              onClick={() => setIsAddMode(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-success-500 text-white rounded-md hover:bg-success-600"
            >
              Create Scheme
            </button>
          </div>
        </form>
      )}

{selectedScheme && (
  <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{selectedScheme.schemeTitle}</h2>
          <button
            onClick={() => setSelectedScheme(null)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Banner */}
        {selectedScheme.bannerImage && (
          <div className="mb-6 rounded-lg overflow-hidden relative h-48">
            <Image
              src={selectedScheme.bannerImage.url}
              alt="Banner"
              fill
              className="object-cover"
              sizes="800px"
            />
          </div>
        )}

        {/* About & Objectives */}
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

        {/* Key Highlights */}
        {selectedScheme.keyHighlightsOfTheScheme?.length > 0 && (
          <Section title="Key Highlights">
            <ul className="list-disc pl-5 space-y-1">
              {selectedScheme.keyHighlightsOfTheScheme.map((item) => (
                <li key={item._id}>
                  <strong>{item.schemeName}</strong> – {item.launchedBy}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Eligibility Criteria */}
        {selectedScheme.eligibilityCriteria?.length > 0 && (
          <Section title="Eligibility Criteria">
            <ul className="list-disc pl-5 space-y-1">
              {selectedScheme.eligibilityCriteria.map((item) => (
                <li key={item._id}>
                  <strong>{item.subTitle}:</strong> {item.subDescription}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Financial Benefits */}
        {selectedScheme.financialBenefits?.length > 0 && (
          <Section title="Financial Benefits">
            <ul className="list-disc pl-5 space-y-1">
              {selectedScheme.financialBenefits.map((item) => (
                <li key={item._id}>
                  <strong>{item.subTitle}:</strong> {item.subDescription}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Required Documents */}
        {selectedScheme.requiredDocuments?.length > 0 && (
          <Section title="Required Documents">
            <ul className="list-disc pl-5 space-y-1">
              {selectedScheme.requiredDocuments.map((item) => (
                <li key={item._id}>
                  <strong>{item.subTitle}:</strong> {item.subDescription}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Important Dates */}
        {selectedScheme.importantDates?.length > 0 && (
          <Section title="Important Dates">
            <ul className="space-y-1">
              {selectedScheme.importantDates.map((date) => (
                <li key={date._id}>
                  <strong>{date.label}:</strong>{" "}
                  {new Date(date.date).toLocaleDateString()}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Salient Features */}
        {selectedScheme.salientFeatures?.length > 0 && (
          <Section title="Salient Features">
            <ul className="list-disc pl-5 space-y-1">
              {selectedScheme.salientFeatures.map((item) => (
                <li key={item._id}>
                  <strong>{item.subTitle}:</strong> {item.subDescription}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Application Process */}
        {selectedScheme.applicationProcess?.length > 0 && (
          <Section title="Application Process">
            <ul className="list-disc pl-5 space-y-1">
              {selectedScheme.applicationProcess.map((item) => (
                <li key={item._id}>
                  <strong>{item.subTitle}:</strong> {item.subDescription}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {/* Helpline Number */}
        {selectedScheme.helplineNumber && (
          <Section title="Helpline Number">
            <p>
              <strong>Toll Free:</strong>{" "}
              {selectedScheme.helplineNumber.tollFreeNumber || "N/A"}
            </p>
            <p>
              <strong>Email:</strong>{" "}
              {selectedScheme.helplineNumber.emailSupport || "N/A"}
            </p>
            <p>
              <strong>Availability:</strong>{" "}
              {selectedScheme.helplineNumber.availability || "N/A"}
            </p>
          </Section>
        )}

        {/* FAQ */}
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

        {/* Sources */}
        {selectedScheme.sourcesAndReferences && (
          <Section title="Sources & References">
            <p>
              <strong>{selectedScheme.sourcesAndReferences.sourceName}</strong>
              :{" "}
              <a
                href={selectedScheme.sourcesAndReferences.sourceLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {selectedScheme.sourcesAndReferences.sourceLink}
              </a>
            </p>
          </Section>
        )}

        {/* Disclaimer */}
        {selectedScheme.disclaimer?.description && (
          <Section title="Disclaimer">
            <p>{selectedScheme.disclaimer.description}</p>
          </Section>
        )}

        {/* Close Button */}
        <div className="mt-6 pt-6 border-t border-gray-200 text-right">
          <button
            onClick={() => setSelectedScheme(null)}
            className="px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default SchemePage;