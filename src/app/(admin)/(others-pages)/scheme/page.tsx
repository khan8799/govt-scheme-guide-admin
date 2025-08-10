'use client';
import React, { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import MultiSelect from '@/components/form/MultiSelect';
import TextArea from '@/components/form/input/TextArea';
import FileInput from '@/components/form/input/FileInput';
import Switch from '@/components/form/switch/Switch';
import { INDIAN_STATES } from '@/config/states';
import { API_PATHS, fetchJson, postJson } from '@/config/api';
import Image from 'next/image';

type SchemeStatus = 'active' | 'inactive' | 'draft';

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
  isActive: boolean;
  bannerImage?: { url: string; fileId: string };
  cardImage?: { url: string; fileId: string };
  helplineNumber?: { tollFreeNumber: string; emailSupport: string; availability: string };
}

interface SchemeFormItem {
  id: number;
  name: string;
  description: string;
  category: string;
  state: string;
  department: string;
  audience: string[];
  eligibility: string;
  benefits: string;
  requiredDocs: string[];
  applyUrl: string;
  contactEmail: string;
  contactPhone: string;
  isCentral: boolean;
  allowComments: boolean;
  budget: string;
  tags: string[];
  startDate: string;
  endDate: string;
  status: SchemeStatus;
  coverImageName?: string;
}

const CATEGORY_OPTIONS = [
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'agriculture', label: 'Agriculture' },
  { value: 'employment', label: 'Employment' },
  { value: 'housing', label: 'Housing' },
  { value: 'social-welfare', label: 'Social Welfare' },
  { value: 'business', label: 'Business' },
];


const SchemePage = () => {
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [schemes, setSchemes] = useState<SchemeFormItem[]>([]);
  const [filteredSchemes, setFilteredSchemes] = useState<Scheme[]>([]);
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Fetch all schemes
  useEffect(() => {
    const loadSchemes = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchJson<Scheme[]>(API_PATHS.getAllSchemes);
        setFilteredSchemes(data);
      } catch (e: any) {
        setError(e.message || 'Failed to load schemes');
      } finally {
        setLoading(false);
      }
    };
    loadSchemes();
  }, []);

  // Filter schemes by state or category
  useEffect(() => {
    const filterSchemes = async () => {
      if (!selectedState && !selectedCategory) return;
      
      setLoading(true);
      try {
        let data: Scheme[] = [];
        if (selectedState && selectedCategory) {
          const stateData = await fetchJson<Scheme[]>(`${API_PATHS.getSchemesByState}/${selectedState}`);
          data = stateData.filter(scheme => 
            scheme.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        } else if (selectedState) {
          data = await fetchJson<Scheme[]>(`${API_PATHS.getSchemesByState}/${selectedState}`);
        } else if (selectedCategory) {
          data = await fetchJson<Scheme[]>(`${API_PATHS.getSchemesByCategory}/${selectedCategory}`);
        }
        setFilteredSchemes(data);
      } catch (e: any) {
        setError(e.message || 'Failed to filter schemes');
      } finally {
        setLoading(false);
      }
    };
    filterSchemes();
  }, [selectedState, selectedCategory]);

  const fetchSchemeDetails = async (id: string) => {
    try {
      const data = await fetchJson<Scheme>(`${API_PATHS.getSchemeById}/${id}`);
      setSelectedScheme(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load scheme details');
    }
  };

  const resetFilters = () => {
    setSelectedState('');
    setSelectedCategory('');
    // Reload all schemes
    setLoading(true);
    fetchJson<Scheme[]>(API_PATHS.getAllSchemes)
      .then(data => setFilteredSchemes(data))
      .catch(e => setError(e.message || 'Failed to reset filters'))
      .finally(() => setLoading(false));
  };

  const addScheme = (): void => {
    setSchemes([
      ...schemes,
      {
        id: schemes.length + 1,
        name: '',
        description: '',
        category: '',
        state: '',
        department: '',
        audience: [],
        eligibility: '',
        benefits: '',
        requiredDocs: [],
        applyUrl: '',
        contactEmail: '',
        contactPhone: '',
        isCentral: false,
        allowComments: true,
        budget: '',
        tags: [],
        startDate: '',
        endDate: '',
        status: 'active',
        coverImageName: undefined,
      },
    ]);
  };

  const deleteScheme = (id: number): void => {
    setSchemes(schemes.filter((scheme) => scheme.id !== id));
  };

  const handleChange = (
    id: number,
    field: keyof SchemeFormItem,
    value: string | boolean | string[]
  ): void => {
    setSchemes((prev) =>
      prev.map((scheme) => (scheme.id === id ? { ...scheme, [field]: value } : scheme))
    );
  };

  const handleTagsChange = (id: number, value: string) => {
    const tags = value
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    handleChange(id, 'tags', tags);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validation logic
    const errors: string[] = [];
    schemes.forEach((s, idx) => {
      if (!s.name.trim()) errors.push(`Scheme #${idx + 1}: Name is required`);
      if (!s.category) errors.push(`Scheme #${idx + 1}: Category is required`);
      if (!s.state) errors.push(`Scheme #${idx + 1}: State is required`);
      if (!s.description.trim()) errors.push(`Scheme #${idx + 1}: Description is required`);
      if (s.applyUrl && !/^https?:\/\//i.test(s.applyUrl)) errors.push(`Scheme #${idx + 1}: Apply URL must start with http or https`);
      if (s.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.contactEmail)) errors.push(`Scheme #${idx + 1}: Contact Email is invalid`);
      if (s.endDate && s.startDate && s.endDate < s.startDate) errors.push(`Scheme #${idx + 1}: End date cannot be before start date`);
    });
    if (errors.length) {
      alert(errors.join('\n'));
      return;
    }

    try {
      await postJson(API_PATHS.registerScheme, schemes);
      alert('Schemes saved successfully!');
      setIsAddMode(false);
      // Refresh list
      const data = await fetchJson<Scheme[]>(API_PATHS.getAllSchemes);
      setFilteredSchemes(data);
    } catch (err: any) {
      alert(err.message || 'Failed to save schemes');
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
                options={INDIAN_STATES}
                value={selectedState}
                onChange={setSelectedState}
                placeholder="Select state"
              />
            </div>
            <div>
              <Label>Filter by Category</Label>
              <Select
                options={CATEGORY_OPTIONS}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Select category"
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
                            {scheme.state.map(s => s.name).join(', ')}
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
        <form onSubmit={handleSubmit}>
          {schemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-semibold">Scheme #{scheme.id}</h2>
                <button
                  type="button"
                  onClick={() => deleteScheme(scheme.id)}
                  className="text-red-500 hover:text-red-600"
                  title="Delete Scheme"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Scheme Name</Label>
                  <Input
                    value={scheme.name}
                    onChange={(e) => handleChange(scheme.id, 'name', e.target.value)}
                    placeholder="e.g., PM Kisan Samman Nidhi"
                    required
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    options={[
                      { value: 'active', label: 'Active' },
                      { value: 'inactive', label: 'Inactive' },
                      { value: 'draft', label: 'Draft' },
                    ]}
                    value={scheme.status}
                    onChange={(v) => handleChange(scheme.id, 'status', v as SchemeStatus)}
                  />
                </div>

                <div>
                  <Label>Category</Label>
                  <Select
                    options={CATEGORY_OPTIONS}
                    value={scheme.category}
                    onChange={(v) => handleChange(scheme.id, 'category', v)}
                    placeholder="Select category"
                  />
                </div>

                <div>
                  <Label>State</Label>
                  <Select
                    options={INDIAN_STATES}
                    value={scheme.state}
                    onChange={(v) => handleChange(scheme.id, 'state', v)}
                    placeholder="Select state"
                  />
                </div>

                {/* Add all other form fields similarly */}
              </div>

              <div className="mt-6">
                <Label>Description</Label>
                <TextArea
                  rows={4}
                  value={scheme.description}
                  onChange={(v) => handleChange(scheme.id, 'description', v)}
                  placeholder="Describe the scheme's purpose and overview"
                />
              </div>

              <div className="flex justify-between mt-6">
                <button
                  type="button"
                  onClick={addScheme}
                  className="flex items-center px-4 py-2 bg-brand-500 text-white rounded-md hover:bg-brand-600"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Another Scheme
                </button>

                <button
                  type="submit"
                  className="px-6 py-2 bg-success-500 text-white rounded-md hover:bg-success-600"
                >
                  Save All Schemes
                </button>
              </div>
            </div>
          ))}
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