"use client";
import React from 'react';
import Image from 'next/image';
import { Scheme } from '@/app/types/scheme';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface SchemeListProps {
  schemes: Scheme[];
  onSelect: (slug: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;

}

const SchemeList: React.FC<SchemeListProps> = ({ schemes, onSelect, onDelete, onEdit }) => {
  if (schemes.length === 0) return null;
  
  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleEdit = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onEdit(id);
  };

  return (
    <div className="divide-y divide-gray-200">
      {schemes.map((scheme) => (
        <div key={scheme._id} className="p-4 hover:bg-gray-50 cursor-pointer group">
          <div className="flex items-start gap-4">
            <div className="flex-1 flex items-start gap-4" onClick={() => {
              const finalIdentifier = scheme.slug && scheme.slug.trim() !== '' ? scheme.slug : scheme._id;
              onSelect(finalIdentifier);
            }}>
              {scheme.cardImage && (
                <div className="w-24 h-24 flex-shrink-0 relative">
                  <Image src={scheme.cardImage.url} alt={scheme.schemeTitle} fill className="object-cover rounded-lg" sizes="100px" />
                </div>
              )}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{scheme.schemeTitle}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${scheme.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {scheme.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{scheme.about}</p>
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
                  <span className="text-xs px-2 py-1 bg-gray-100 rounded-md">Published: {new Date(scheme.publishedOn).toLocaleDateString()}</span>
                  
                </div>
              </div>
            </div>
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => handleEdit(e, scheme._id)}
                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md"
                title="Edit scheme"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={(e) => handleDelete(e, scheme._id)}
                className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md"
                title="Delete scheme"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SchemeList;


