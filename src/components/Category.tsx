'use client';
import React, { useState } from 'react';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Scheme {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'draft';
}

const SchemesPage = () => {
  const [schemes, setSchemes] = useState<Scheme[]>([
    { 
      id: 1, 
      name: '', 
      description: '', 
      startDate: '', 
      endDate: '', 
      status: 'active' 
    }
  ]);

  const addScheme = (): void => {
    setSchemes([...schemes, { 
      id: schemes.length + 1, 
      name: '', 
      description: '', 
      startDate: '', 
      endDate: '', 
      status: 'active' 
    }]);
  };

  const deleteScheme = (id: number): void => {
    setSchemes(schemes.filter(scheme => scheme.id !== id));
  };

  const handleChange = (id: number, field: keyof Scheme, value: string): void => {
    setSchemes(schemes.map(scheme => 
      scheme.id === id ? { ...scheme, [field]: value } : scheme
    ));
  };

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    console.log('Submitted schemes:', schemes);
    alert('Schemes saved successfully!');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Manage Schemes</h1>
      
      <form onSubmit={handleSubmit}>
        {schemes.map((scheme) => (
          <div key={scheme.id} className="bg-white rounded-lg shadow p-6 mb-6 relative">
            <button
              type="button"
              onClick={() => deleteScheme(scheme.id)}
              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
              title="Delete Scheme"
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Scheme Name</label>
                <input
                  type="text"
                  value={scheme.name}
                  onChange={(e) => handleChange(scheme.id, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={scheme.status}
                  onChange={(e) => handleChange(scheme.id, 'status', e.target.value as Scheme['status'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={scheme.description}
                  onChange={(e) => handleChange(scheme.id, 'description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={scheme.startDate}
                  onChange={(e) => handleChange(scheme.id, 'startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={scheme.endDate}
                  onChange={(e) => handleChange(scheme.id, 'endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        ))}
        
        <div className="flex justify-between mt-6">
          <button
            type="button"
            onClick={addScheme}
            className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Scheme
          </button>
          
          <button
            type="submit"
            className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
          >
            Save All Schemes
          </button>
        </div>
      </form>
    </div>
  );
};

export default SchemesPage;