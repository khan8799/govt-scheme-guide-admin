'use client';
import React, { useEffect, useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Image from 'next/image';

interface CategoryApiResponse {
  description: string;
  _id: string;
  name: string;
  image: string;
  totalSchemes: number;
  states: string[];
}

interface CategoryItem {
  id: string | number;
  name: string;
  description: string;
  iconFile?: File | null;
}

interface ListItem {
  id: string | number;
  name: string;
  description: string;
  image: string;
  totalSchemes: number;
  states: string[];
}

const CategoryPage = () => {
  const [category, setCategory] = useState<CategoryItem>({ 
    id: 1, 
    name: '', 
    description: '', 
    iconFile: null 
  });
  const [isAddMode, setIsAddMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [list, setList] = useState<ListItem[]>([]);

  // Fetch categories
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("https://govt-scheme-guide-api.onrender.com/api/getSchemesByCategory");
        const data: CategoryApiResponse[] = await res.json();
        setList(
          (data || []).map((item) => ({
            id: item._id,
            name: item.name || "Untitled",
            description: item.description ?? "No description available",
            image: item.image || "",
            totalSchemes: item.totalSchemes || 0,
            states: item.states || []
          }))
        );
      } catch (e: unknown) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError("Failed to load categories");
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const resetForm = () => {
    setCategory({ id: Date.now(), name: '', description: '', iconFile: null });
  };

  const handleChange = (field: keyof CategoryItem, value: string | File | null) => {
    setCategory(prev => ({ ...prev, [field]: value }));
  };

  // Submit category to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('name', category.name);
      formData.append('description', category.description || '');
      if (category.iconFile) formData.append('image', category.iconFile);
      formData.append('createdBy', '688fbefc8dedecbaf5289c98');
      formData.append('updatedBy', '688fbefc8dedecbaf5289c98');

      const res = await fetch('https://govt-scheme-guide-api.onrender.com/api/registerCategory', {
        method: 'POST',
        headers: {
      Authorization:
        'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4OGZiYjFhYzRhOWNhZTU0MGYzOTZmYSIsInJvbGUiOiIiLCJpYXQiOjE3NTQ4MTgxNjYsImV4cCI6MTc1NDkwNDU2Nn0.IEXBWP4VUWyIgfeAKqpr78jK07mQvxYMEt2aWlCxeHU',
        },
  body: formData,
      });

      if (!res.ok) throw new Error('Failed to save category');
      
      alert('Category saved successfully!');
      resetForm();
      setIsAddMode(false);

      // Reload list with proper typing
      const newRes = await fetch('https://govt-scheme-guide-api.onrender.com/api/getSchemesByCategory');
      const newData: CategoryApiResponse[] = await newRes.json();
      setList(
        newData.map((item, idx) => ({
          id: item._id || idx,
          name: item.name || 'Untitled',
          description: item.description || '',
          image: item.image || '',
          totalSchemes: item.totalSchemes || 0,
          states: item.states || []
        }))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message || 'Error saving category');
      } else {
        alert('Error saving category');
      }
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => {
              setIsAddMode(false);
              resetForm();
            }}
          >
            {isAddMode ? 'Back' : 'View All'}
          </button>
          {!isAddMode && (
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
              onClick={() => {
                setIsAddMode(true);
                resetForm();
              }}
            >
              <PlusIcon className="h-4 w-4" /> Add Category
            </button>
          )}
        </div>
      </div>

      {/* View Mode */}
      {!isAddMode && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          {loading ? (
            <div className="p-6 text-sm text-gray-600">Loading categories...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : list.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No categories found.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {list.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-4">
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={56}
                        height={56}
                        className="object-cover rounded"
                        priority={false}
                      />
                    )}
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">
                        Schemes: {item.totalSchemes} • States:{" "}
                        {item.states.length > 0 ? item.states.join(", ") : "—"}
                      </p>
                    </div>
                  </div>
                  <button className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50">
                    Edit
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Mode - Single Category Form */}
      {isAddMode && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 relative">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label>Category Name</Label>
                <Input
                  value={category.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., Education"
                  required
                />
              </div>

              <div>
                <Label>Category Image</Label>
                <input
                  className='cursor-pointer'
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    handleChange('iconFile', e.target.files?.[0] || null)
                  }
                />
              </div>

              <div>
                <Label>Description</Label>
                <TextArea
                  rows={3}
                  value={category.description}
                  onChange={(v) => handleChange('description', v)}
                  placeholder="Explain what this category covers"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                className="px-6 py-2 bg-success-500 text-white rounded-md hover:bg-success-600"
              >
                Save Category
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CategoryPage;