'use client';
import { useEffect, useState } from 'react';
import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import TextArea from '@/components/form/input/TextArea';
import Image from 'next/image';
import { showConfirmation, showSuccess, showError, showLoading } from '@/components/SweetAlert';
import { getAuthHeaders } from '@/config/api';

interface StateApiResponse {
  _id: string;
  name: string;
  image: string | null;
  totalSchemes: number;
}

interface StateItem {
  id: string;
  name: string;
  description?: string;
  iconFile?: File | null;
  existingImage?: string | null;
}

interface StateListItem {
  id: string;
  name: string;
  image: string | null;
  totalSchemes: number;
}

const API_BASE_URL = 'https://govt-scheme-guide-api.onrender.com/api';

const StatePage = () => {
  const [states, setStates] = useState<StateListItem[]>([]);
  const [state, setState] = useState<StateItem>({ 
    id: '', 
    name: '', 
    description: '', 
    iconFile: null,
    existingImage: null
  });
  const [isAddMode, setIsAddMode] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch statesfSchemes
  const loadStates = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/user/getAllStates`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid data format received from API');
      }
      
      setStates(
        data.data.map((item: StateApiResponse) => ({
          id: item._id,
          name: item.name || "Untitled",
          image: item.image,
          totalSchemes: item.totalSchemes || 0
        }))
      );
    } catch (e: unknown) {
      if (e instanceof Error) {
        setError(e.message);
      } else {
        setError("Failed to load states");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStates();
  }, []);

  const resetForm = () => {
    setState({ 
      id: '', 
      name: '', 
      description: '', 
      iconFile: null,
      existingImage: null
    });
  };

  const handleChange = (field: keyof StateItem, value: string | File | null) => {
    setState(prev => ({ ...prev, [field]: value }));
  };

  const handleEdit = (item: StateListItem) => {
    setState({
      id: item.id,
      name: item.name,
      description: '',
      iconFile: null,
      existingImage: item.image
    });
    setIsAddMode(true);
    setIsEditMode(true);
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirmation({
      title: 'Delete State?',
      text: 'Are you sure you want to delete this state? This action cannot be undone.',
    });

    if (result.isConfirmed) {
      const loadingAlert = showLoading('Deleting state...');
      try {
      const response = await fetch(`${API_BASE_URL}/admin/deleteStateById/${id}`, {
          method: 'DELETE',
        headers: getAuthHeaders() as HeadersInit,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete state');
        }
        
        loadingAlert.close();
        await showSuccess('State deleted successfully!');
        loadStates();
      } catch (err) {
        loadingAlert.close();
        const message = err instanceof Error ? err.message : 'Error deleting state';
        await showError(message);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingAlert = showLoading(isEditMode ? 'Saving changes...' : 'Creating state...');
    
    try {
      const formData = new FormData();
      formData.append('name', state.name);
      if (state.description) formData.append('description', state.description);
      if (state.iconFile) formData.append('image', state.iconFile);

      const url = isEditMode 
        ? `${API_BASE_URL}/admin/updateStateById/${state.id}`
        : `${API_BASE_URL}/admin/createState`;

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: getAuthHeaders() as HeadersInit,
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${isEditMode ? 'update' : 'save'} state`);
      }
      
      loadingAlert.close();
      await showSuccess(`State ${isEditMode ? 'updated' : 'created'} successfully!`);
      resetForm();
      setIsAddMode(false);
      setIsEditMode(false);
      loadStates();
    } catch (err) {
      loadingAlert.close();
      const message = err instanceof Error ? err.message : `Error ${isEditMode ? 'updating' : 'creating'} state`;
      await showError(message);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">States</h1>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            onClick={() => {
              setIsAddMode(false);
              setIsEditMode(false);
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
                setIsEditMode(false);
                resetForm();
              }}
            >
              <PlusIcon className="h-4 w-4" /> Add State
            </button>
          )}
        </div>
      </div>

      {/* View Mode */}
      {!isAddMode && (
        <div className="rounded-2xl border border-gray-200 bg-white">
          {loading ? (
            <div className="p-6 text-sm text-gray-600">Loading states...</div>
          ) : error ? (
            <div className="p-6 text-sm text-red-600">{error}</div>
          ) : states.length === 0 ? (
            <div className="p-6 text-sm text-gray-600">No states found.</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {states.map((item) => (
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
                      {/* <p className="text-sm text-gray-500">
                        Schemes: {item.totalSchemes}
                      </p> */}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-600" />
                    </button>
                    <button 
                      type="button"
                      onClick={() => handleDelete(item.id)}
                      className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
                    >
                      <TrashIcon className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Mode - State Form */}
      {(isAddMode || isEditMode) && (
        <form onSubmit={handleSubmit}>
          <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 relative">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <Label>State Name</Label>
                <Input
                  value={state.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g., California"
                  required
                />
              </div>

              <div>
                <Label>State Image</Label>
                {state.existingImage && (
                  <div className="mb-2">
                    <Image
                      src={state.existingImage}
                      alt="Current state image"
                      width={100}
                      height={100}
                      className="object-cover rounded"
                    />
                    <p className="text-xs text-gray-500 mt-1">Current image</p>
                  </div>
                )}
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
                <Label>Description (Optional)</Label>
                <TextArea
                  rows={3}
                  value={state.description || ''}
                  onChange={(v) => handleChange('description', v)}
                  placeholder="Explain about this state"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6 gap-2">
              <button
                type="button"
                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                onClick={() => {
                  setIsAddMode(false);
                  setIsEditMode(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-success-500 text-white rounded-md hover:bg-success-600"
              >
                {isEditMode ? 'Update' : 'Save'} State
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default StatePage;