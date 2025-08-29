"use client";
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface Option {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: Option[];
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const MultiSelect: React.FC<MultiSelectProps> = ({
  options,
  value = [],
  onChange,
  placeholder = "Select options",
  required = false,
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectAll = () => {
    if (value.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map(option => option.value));
    }
  };

  const handleOptionToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onChange(newValue);
  };

  const handleRemoveOption = (optionValue: string) => {
    onChange(value.filter(v => v !== optionValue));
  };

  const getSelectedLabels = () => {
    return value.map(v => options.find(opt => opt.value === v)?.label).filter(Boolean);
  };

  const isAllSelected = value.length === options.length && options.length > 0;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Selected Values Display */}
      <div className="min-h-[38px] border border-gray-300 rounded-md bg-white p-2">
        {value.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {getSelectedLabels().map((label, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-md"
              >
                {label}
                <button
                  type="button"
                  onClick={() => handleRemoveOption(value[index])}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500">{placeholder}</span>
        )}
      </div>

      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-gray-600"
      >
        <ChevronDownIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Search options..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Select All Option */}
          <div className="p-2 border-b border-gray-200">
            <button
              type="button"
              onClick={handleSelectAll}
              className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded-md flex items-center gap-2"
            >
              <div className={`w-4 h-4 border-2 rounded ${isAllSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                {isAllSelected && <CheckIcon className="w-3 h-3 text-white" />}
              </div>
              <span className="font-medium">
                {isAllSelected ? 'Deselect All' : 'Select All'}
              </span>
              <span className="text-sm text-gray-500">
                ({value.length}/{options.length})
              </span>
            </button>
          </div>

          {/* Options List */}
          <div className="max-h-40 overflow-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => {
                const isSelected = value.includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionToggle(option.value)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <div className={`w-4 h-4 border-2 rounded ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-300'}`}>
                      {isSelected && <CheckIcon className="w-3 h-3 text-white" />}
                    </div>
                    <span className={isSelected ? 'font-medium' : ''}>
                      {option.label}
                    </span>
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-2 text-gray-500 text-sm">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        value={JSON.stringify(value)}
        required={required}
      />
    </div>
  );
};

export default MultiSelect;
