'use client';
import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import Image from 'next/image';
import { showConfirmation, showSuccess, showError, showLoading } from '@/components/SweetAlert';
import { API_BASE_URL, DEFAULT_AUTH_TOKEN } from '@/config/confiq';

interface Scheme {
  _id: string;
  schemeTitle: string;
  about: string;
  category: string;
  state: Array<{ _id: string; name: string }>;
  publishedOn: string;
  objectives: string;
  keyHighlightsOfTheScheme: Array<{ schemeName: string; launchedBy: string; _id: string }>;
  eligibilityCriteria: Array<{ subTitle: string; subDescription: string; _id: string }>;
  financialBenefits: Array<{ subTitle: string; subDescription: string; _id: string }>;
  requiredDocuments: Array<{ subTitle: string; subDescription: string; _id: string }>;
  importantDates: Array<{ label: string; date: string; _id: string }>;
  salientFeatures: Array<{ subTitle: string; subDescription: string; _id: string }>;
  applicationProcess: Array<{ subTitle: string; subDescription: string; _id: string }>;
  frequentlyAskedQuestions: Array<{ question: string; answer: string; _id: string }>;
  isActive: boolean;
  bannerImage?: { url: string; fileId: string };
  cardImage?: { url: string; fileId: string };
  helplineNumber?: { tollFreeNumber: string; emailSupport: string; availability: string };
  sourcesAndReferences?: { sourceName: string; sourceLink: string };
  disclaimer?: { description: string };
  listCategory?: string[];
}

interface State {
  _id: string;
  name: string;
  image?: string;
}

interface Category {
  _id: string;
  name: string;
  image?: string;
}

interface FormField {
  label: string;
  key: string;
  type: 'text' | 'textarea' | 'date' | 'json' | 'select' | 'multi-select' | 'file';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}


const SchemePage = () => {
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [states, setStates] = useState<State[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<any>({
    schemeTitle: '',
    publishedOn: new Date().toISOString().split('T')[0],
    about: '',
    objectives: '',
    category: '',
    state: [],
    keyHighlightsOfTheScheme: JSON.stringify([{ schemeName: '', launchedBy: '' }]),
    eligibilityCriteria: JSON.stringify([{ subTitle: '', subDescription: '' }]),
    financialBenefits: JSON.stringify([{ subTitle: '', subDescription: '' }]),
    requiredDocuments: JSON.stringify([{ subTitle: '', subDescription: '' }]),
    importantDates: JSON.stringify([{ label: '', date: '' }]),
    salientFeatures: JSON.stringify([{ subTitle: '', subDescription: '' }]),
    applicationProcess: JSON.stringify([{ subTitle: '', subDescription: '' }]),
    helplineNumber: JSON.stringify({ 
      tollFreeNumber: '', 
      emailSupport: '', 
      availability: '' 
    }),
    frequentlyAskedQuestions: JSON.stringify([{ question: '', answer: '' }]),
    sourcesAndReferences: JSON.stringify({ sourceName: '', sourceLink: '' }),
    disclaimer: JSON.stringify({ description: '' }),
    listCategory: JSON.stringify([]),
    bannerImage: null,
    cardImage: null
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
      type: 'multi-select', 
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
    { label: 'Banner Image', key: 'bannerImage', type: 'file' },
    { label: 'Card Image', key: 'cardImage', type: 'file' }
  ];

  // Fetch all states and categories
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      try {
        const [statesRes, categoriesRes] = await Promise.all([
          fetch(`${API_BASE_URL}/user/getAllStates`, {
            headers: {
              'Authorization': DEFAULT_AUTH_TOKEN
            }
          }),
          fetch(`${API_BASE_URL}/user/allCategories`, {
            headers: {
              'Authorization': DEFAULT_AUTH_TOKEN
            }
          })
        ]);

        if (!statesRes.ok) throw new Error('Failed to load states');
        if (!categoriesRes.ok) throw new Error('Failed to load categories');

        const statesData = await statesRes.json();
        const categoriesData = await categoriesRes.json();

        setStates(statesData.data || []);
        setCategories(categoriesData.data || []);
      } catch (e: unknown) {
        setError(e.message || 'Failed to load initial data');
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  // Fetch all schemes or filtered schemes
  useEffect(() => {
    const loadSchemes = async () => {
      setLoading(true);
      setError(null);
      try {
        let url = `${API_BASE_URL}/admin/getSchemesByCategoryregisterScheme`;
        
        if (selectedState) {
          url += `?stateId=${selectedState}`;
        } else if (selectedCategory) {
          url += `?categoryId=${selectedCategory}`;
        } else {
          url = `${API_BASE_URL}/user/getSchemesByCategory`;
        }

        const res = await fetch(url, {
          headers: {
            'Authorization': DEFAULT_AUTH_TOKEN
          }
        });

        if (!res.ok) throw new Error('Failed to load schemes');
        
        const data = await res.json();
        setFilteredSchemes(data.data || data);
      } catch (e: unknown) {
        setError(e.message || 'Failed to load schemes');
      } finally {
        setLoading(false);
      }
    };
    loadSchemes();
  }, [selectedState, selectedCategory]);

  const fetchSchemeDetails = async (id: string) => {
    const loadingAlert = showLoading('Loading scheme details...');
    try {
      const res = await fetch(`${API_BASE_URL}/user/getSchemeById/${id}`, {
        headers: {
          'Authorization': DEFAULT_AUTH_TOKEN
        }
      });
      
      if (!res.ok) throw new Error('Failed to load scheme details');
      
      const data = await res.json();
      setSelectedScheme(data);
      loadingAlert.close();
    } catch (e: unknown) {
      loadingAlert.close();
      await showError(e.message || 'Failed to load scheme details');
    }
  };

  const resetFilters = () => {
    setSelectedState('');
    setSelectedCategory('');
  };

  const handleFormChange = (key: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleFileChange = (key: string, file: File | null) => {
    setFormData(prev => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingAlert = showLoading('Creating scheme...');
    
    try {
      const data = new FormData();
      
      // Add all form fields to FormData
      Object.keys(formData).forEach(key => {
        if (key === 'bannerImage' || key === 'cardImage') {
          if (formData[key]) {
            data.append(key, formData[key]);
          }
        } else if (key === 'state') {
          formData.state.forEach((state: string) => data.append('state[]', state));
        } else {
          data.append(key, formData[key]);
        }
      });

      const res = await fetch(`${API_BASE_URL}/admin/registerScheme`, {
        method: 'POST',
        headers: {
          'Authorization': DEFAULT_AUTH_TOKEN
        },
        body: data
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to create scheme');
      }

      loadingAlert.close();
      await showSuccess('Scheme created successfully!');
      setIsAddMode(false);
      resetFilters();
      // Reset form data
      setFormData({
        schemeTitle: '',
        publishedOn: new Date().toISOString().split('T')[0],
        about: '',
        objectives: '',
        category: '',
        state: [],
        keyHighlightsOfTheScheme: JSON.stringify([{ schemeName: '', launchedBy: '' }]),
        eligibilityCriteria: JSON.stringify([{ subTitle: '', subDescription: '' }]),
        financialBenefits: JSON.stringify([{ subTitle: '', subDescription: '' }]),
        requiredDocuments: JSON.stringify([{ subTitle: '', subDescription: '' }]),
        importantDates: JSON.stringify([{ label: '', date: '' }]),
        salientFeatures: JSON.stringify([{ subTitle: '', subDescription: '' }]),
        applicationProcess: JSON.stringify([{ subTitle: '', subDescription: '' }]),
        helplineNumber: JSON.stringify({ 
          tollFreeNumber: '', 
          emailSupport: '', 
          availability: '' 
        }),
        frequentlyAskedQuestions: JSON.stringify([{ question: '', answer: '' }]),
        sourcesAndReferences: JSON.stringify({ sourceName: '', sourceLink: '' }),
        disclaimer: JSON.stringify({ description: '' }),
        listCategory: JSON.stringify([]),
        bannerImage: null,
        cardImage: null
      });
    } catch (err: any) {
      loadingAlert.close();
      await showError(err.message || 'Failed to create scheme');
    }
  };

  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input
            value={formData[field.key] || ''}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'textarea':
        return (
          <TextArea
            rows={3}
            value={formData[field.key] || ''}
            onChange={(v) => handleFormChange(field.key, v)}
            placeholder={`Enter ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'date':
        return (
          <Input
            type="date"
            value={formData[field.key] || ''}
            onChange={(e) => handleFormChange(field.key, e.target.value)}
            required={field.required}
          />
        );
      case 'select':
        return (
          <Select
            options={field.options || []}
            value={formData[field.key] || ''}
            onChange={(v) => handleFormChange(field.key, v)}
            placeholder={`Select ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'multi-select':
        return (
          <Select
            isMulti
            options={field.options || []}
            value={formData[field.key] || []}
            onChange={(v) => handleFormChange(field.key, v)}
            placeholder={`Select ${field.label.toLowerCase()}`}
            required={field.required}
          />
        );
      case 'json':
        return (
          <TextArea
            rows={3}
            value={formData[field.key] || ''}
            onChange={(v) => handleFormChange(field.key, v)}
            placeholder={`Enter ${field.label} as JSON`}
          />
        );
      case 'file':
        return (
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange(field.key, e.target.files?.[0] || null)}
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
                onChange={setSelectedState}
                placeholder="Select state"
                isLoading={loading && states.length === 0}
              />
            </div>
            <div>
              <Label>Filter by Category</Label>
              <Select
                options={categories.map(cat => ({ value: cat._id, label: cat.name }))}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Select category"
                isLoading={loading && categories.length === 0}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Reset Filters
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white">
            {loading ? (
              <div className="p-6 text-sm text-gray-600">Loading schemes...</div>
            ) : error ? (
              <div className="p-6 text-sm text-red-600">{error}</div>
            ) : filteredSchemes.length === 0 ? (
              <div className="p-6 text-sm text-gray-600">No schemes found.</div>
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
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                            {scheme.category}
                          </span>
                          <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">
                            {/* {scheme.state.map(s => s.name).join(', ')} */}
                          </span>
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
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">{selectedScheme.schemeTitle}</h2>
                <button 
                  onClick={() => setSelectedScheme(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

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

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Eligibility Criteria</h3>
                <ul className="space-y-2">
                  {selectedScheme.eligibilityCriteria?.map((criteria) => (
                    <li key={criteria._id} className="text-gray-700">
                      <strong>{criteria.subTitle}:</strong> {criteria.subDescription}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6">
                <h3 className="font-semibold mb-2">Financial Benefits</h3>
                <ul className="space-y-2">
                  {selectedScheme.financialBenefits?.map((benefit) => (
                    <li key={benefit._id} className="text-gray-700">
                      <strong>{benefit.subTitle}:</strong> {benefit.subDescription}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
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