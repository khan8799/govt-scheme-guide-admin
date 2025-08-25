"use client";
import React from 'react';
import Label from '@/components/form/Label';
import Input from '@/components/form/input/InputField';
import Select from '@/components/form/Select';
import TextArea from '@/components/form/input/TextArea';
import { SchemeFormData, SchemeKeyHighlight, SchemeSubSection, SchemeDateEntry, SchemeFAQ, SchemeHelplineNumber, SchemeSourcesAndReferences } from '@/app/types/scheme';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic';
const Tiptap  = dynamic(() => import("@/components/Tiptap"), {
  ssr: false,
});
interface FormField {
  label: string;
  key: keyof SchemeFormData;
  type: 'text' | 'textarea' | 'date' | 'json' | 'select' | 'multi-select' | 'file' | 'toggle';
  required?: boolean;
  options?: Array<{ value: string; label: string }>;
}

interface SchemeFormProps {
  formFields: FormField[];
  formData: SchemeFormData;
  onChange: <K extends keyof SchemeFormData>(key: K, value: SchemeFormData[K]) => void;
  onFileChange: (key: 'bannerImage' | 'cardImage', file: File | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  isEditMode?: boolean;
  existingImages?: {
    bannerImage?: { url: string };
    cardImage?: { url: string };
  };
  loading?: boolean;
  hasUnsavedChanges?: boolean;
}

const SchemeForm: React.FC<SchemeFormProps> = ({ formFields, formData, onChange, onFileChange, onSubmit, isEditMode = false, existingImages = {}, loading = false, hasUnsavedChanges = false, textWithHTMLParsing}) => {
  const extractId = (value: SchemeFormData['category'] | SchemeFormData['state']): string => {
    if (!value) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
      if ('value' in value && typeof value.value === 'string') return value.value;
      if ('_id' in value && typeof (value as { _id?: string })._id === 'string') return (value as { _id?: string })._id ?? '';
    }
    return '';
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
                  <Input placeholder="Scheme Name" value={item.schemeName || ''} onChange={(e) => {
                    const newValue = [...(value as SchemeKeyHighlight[])];
                    newValue[index] = { ...item, schemeName: e.target.value };
                    onChange('keyHighlightsOfTheScheme', newValue);
                  }} />
                </div>
                <div className="flex-1">
                  <Input placeholder="Launched By" value={item.launchedBy || ''} onChange={(e) => {
                    const newValue = [...(value as SchemeKeyHighlight[])];
                    newValue[index] = { ...item, launchedBy: e.target.value };
                    onChange('keyHighlightsOfTheScheme', newValue);
                  }} />
                </div>
                <button type="button" onClick={() => {
                  const newValue = (value as SchemeKeyHighlight[]).filter((_, i) => i !== index);
                  onChange('keyHighlightsOfTheScheme', newValue);
                }} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const newValue = ([...(value as SchemeKeyHighlight[]), { schemeName: '', launchedBy: '' }] as SchemeKeyHighlight[]);
              onChange('keyHighlightsOfTheScheme', newValue);
            }} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
              <PlusIcon className="h-4 w-4" />
              Add Highlight
            </button>
          </div>
        );
     case 'eligibilityCriteria':
  return (
    <Tiptap
      content={formData.textWithHTMLParsing || '<p>Hello!</p>'} // Use textWithHTMLParsing
      onChange={(html: string) => onChange('textWithHTMLParsing', html)} // Update textWithHTMLParsing
    />
  );
      case 'financialBenefits':
      case 'requiredDocuments':
      case 'salientFeatures':
      case 'applicationProcess':
        return (
          <div className="space-y-3">
            {Array.isArray(value) && (value as SchemeSubSection[]).map((item, index) => (
              <div key={index} className="space-y-2">
                <Input placeholder="Sub Title" value={item.subTitle || ''} onChange={(e) => {
                  const newValue = ([...(value as SchemeSubSection[])]);
                  newValue[index] = { ...item, subTitle: e.target.value };
                  onChange(field.key, newValue as SchemeFormData[typeof field.key]);
                }} />
                <TextArea rows={2} placeholder="Sub Description" value={item.subDescription || ''} onChange={(v) => {
                  const newValue = ([...(value as SchemeSubSection[])]);
                  newValue[index] = { ...item, subDescription: v };
                  onChange(field.key, newValue as SchemeFormData[typeof field.key]);
                }} />
                <button type="button" onClick={() => {
                  const newValue = (value as SchemeSubSection[]).filter((_, i) => i !== index);
                  onChange(field.key, newValue as SchemeFormData[typeof field.key]);
                }} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const newValue = ([...(value as SchemeSubSection[]), { subTitle: '', subDescription: '' }] as SchemeSubSection[]);
              onChange(field.key, newValue as SchemeFormData[typeof field.key]);
            }} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
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
                  <Input placeholder="Label (e.g., Start Date, End Date)" value={item.label || ''} onChange={(e) => {
                    const newValue = ([...(value as SchemeDateEntry[])]);
                    newValue[index] = { ...item, label: e.target.value };
                    onChange('importantDates', newValue);
                  }} />
                </div>
                <div className="flex-1">
                  <Input type="date" value={item.date || ''} onChange={(e) => {
                    const newValue = ([...(value as SchemeDateEntry[])]);
                    newValue[index] = { ...item, date: e.target.value };
                    onChange('importantDates', newValue);
                  }} />
                </div>
                <button type="button" onClick={() => {
                  const newValue = (value as SchemeDateEntry[]).filter((_, i) => i !== index);
                  onChange('importantDates', newValue);
                }} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const newValue = ([...(value as SchemeDateEntry[]), { label: '', date: '' }]);
              onChange('importantDates', newValue);
            }} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
              <PlusIcon className="h-4 w-4" />
              Add Date
            </button>
          </div>
        );
      case 'helplineNumber':
        return (
          <div className="space-y-3">
            <Input placeholder="Toll Free Number" value={(value as SchemeHelplineNumber).tollFreeNumber || ''} onChange={(e) => {
              const v = value as SchemeHelplineNumber;
              onChange('helplineNumber', { ...v, tollFreeNumber: e.target.value });
            }} />
            <Input placeholder="Email Support" value={(value as SchemeHelplineNumber).emailSupport || ''} onChange={(e) => {
              const v = value as SchemeHelplineNumber;
              onChange('helplineNumber', { ...v, emailSupport: e.target.value });
            }} />
            <Input placeholder="Availability (e.g., 9 AM - 5 PM)" value={(value as SchemeHelplineNumber).availability || ''} onChange={(e) => {
              const v = value as SchemeHelplineNumber;
              onChange('helplineNumber', { ...v, availability: e.target.value });
            }} />
          </div>
        );
      case 'frequentlyAskedQuestions':
        return (
          <div className="space-y-3">
            {Array.isArray(value) && (value as SchemeFAQ[]).map((item, index) => (
              <div key={index} className="space-y-2">
                <Input placeholder="Question" value={item.question || ''} onChange={(e) => {
                  const newValue = ([...(value as SchemeFAQ[])]);
                  newValue[index] = { ...item, question: e.target.value };
                  onChange('frequentlyAskedQuestions', newValue);
                }} />
                <TextArea rows={2} placeholder="Answer" value={item.answer || ''} onChange={(v) => {
                  const newValue = ([...(value as SchemeFAQ[])]);
                  newValue[index] = { ...item, answer: v };
                  onChange('frequentlyAskedQuestions', newValue);
                }} />
                <button type="button" onClick={() => {
                  const newValue = (value as SchemeFAQ[]).filter((_, i) => i !== index);
                  onChange('frequentlyAskedQuestions', newValue);
                }} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const newValue = ([...(value as SchemeFAQ[]), { question: '', answer: '' }] as SchemeFAQ[]);
              onChange('frequentlyAskedQuestions', newValue);
            }} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
              <PlusIcon className="h-4 w-4" />
              Add FAQ
            </button>
          </div>
        );
      case 'sourcesAndReferences':
        return (
          <div className="space-y-3">
            <Input placeholder="Source Name" value={(value as SchemeSourcesAndReferences).sourceName || ''} onChange={(e) => {
              const v = value as SchemeSourcesAndReferences;
              onChange('sourcesAndReferences', { ...v, sourceName: e.target.value });
            }} />
            <Input placeholder="Source Link" value={(value as SchemeSourcesAndReferences).sourceLink || ''} onChange={(e) => {
              const v = value as SchemeSourcesAndReferences;
              onChange('sourcesAndReferences', { ...v, sourceLink: e.target.value });
            }} />
          </div>
        );
      case 'disclaimer':
        return (
          <TextArea rows={3} placeholder="Disclaimer description" value={(value as { description: string }).description || ''} onChange={(v) => {
            const current = value as { description: string };
            onChange('disclaimer', { ...current, description: v });
          }} />
        );
      case 'listCategory':
        return (
          <div className="space-y-3">
            {Array.isArray(value) && (value as string[]).map((item, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input placeholder="Category name" value={item || ''} onChange={(e) => {
                  const newValue = ([...(value as string[])]);
                  newValue[index] = e.target.value;
                  onChange('listCategory', newValue);
                }} />
                <button type="button" onClick={() => {
                  const newValue = (value as string[]).filter((_, i) => i !== index);
                  onChange('listCategory', newValue);
                }} className="px-2 py-1 text-red-600 hover:bg-red-50 rounded">
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => {
              const newValue = ([...(value as string[]), '']);
              onChange('listCategory', newValue);
            }} className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-700">
              <PlusIcon className="h-4 w-4" />
              Add Category
            </button>
          </div>
        );
      default:
        return (
          <div className="space-y-2">
            <TextArea rows={3} value={JSON.stringify(value ?? '', null, 2)} onChange={(v) => {
              try {
                const parsed = JSON.parse(v);
                onChange(field.key, parsed as SchemeFormData[typeof field.key]);
              } catch {
                
              }
            }} placeholder={`Enter ${field.label} as JSON`} className="font-mono text-sm" />
            <p className="text-xs text-gray-500">Enter valid JSON format for {field.label.toLowerCase()}</p>
          </div>
        );
    }
  };

  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case 'text':
        return (
          <Input value={(formData[field.key] as string) || ''} onChange={(e) => onChange(field.key, e.target.value as unknown as SchemeFormData[keyof SchemeFormData])} placeholder={`Enter ${field.label.toLowerCase()}`} required={field.required} />
        );
      case 'textarea':
        return (
          <TextArea rows={3} value={(formData[field.key] as string) || ''} onChange={(v) => onChange(field.key, v as unknown as SchemeFormData[keyof SchemeFormData])} placeholder={`Enter ${field.label.toLowerCase()}`} />
        );
      case 'date':
        return (
          <Input type="date" value={(formData[field.key] as string) || ''} onChange={(e) => onChange(field.key, e.target.value as unknown as SchemeFormData[keyof SchemeFormData])} required={field.required} />
        );
      case 'select':
        return (
          <Select options={field.options || []} value={field.key === 'category' ? extractId(formData.category) : field.key === 'state' ? extractId(formData.state) : ''} onChange={(v) => onChange(field.key, String(v) as unknown as SchemeFormData[keyof SchemeFormData])} placeholder={`Select ${field.label.toLowerCase()}`} required={field.required} />
        );
      case 'toggle':
        return (
          <div className="flex items-center gap-2">
            <input type="checkbox" checked={Boolean(formData.isFeatured)} onChange={(e) => onChange('isFeatured', e.target.checked)} className="h-4 w-4" />
            <span className="text-sm text-gray-600">Mark as featured</span>
          </div>
        );
      case 'multi-select':
        return (
          <Select isMulti options={field.options || []} value={Array.isArray(formData[field.key]) ? (formData[field.key] as string[]) : []} onChange={(v) => onChange(field.key, (Array.isArray(v) ? v : [String(v)]) as unknown as SchemeFormData[keyof SchemeFormData])} placeholder={`Select ${field.label.toLowerCase()}`} required={field.required} />
        );
      case 'json':
        return renderJsonField(field);
      case 'file':
        return (
          <div className="space-y-2">
            {isEditMode && existingImages[field.key as keyof typeof existingImages] && (
              <div className="mb-2">
                <p className="text-sm text-gray-600 mb-2">Current image:</p>
                <img 
                  src={existingImages[field.key as keyof typeof existingImages]?.url} 
                  alt={`Current ${field.key}`}
                  className="w-32 h-24 object-cover rounded border"
                />
              </div>
            )}
            <input type="file" accept="image/*" onChange={(e) => {
              const file = e.target.files?.[0] || null;
              if (field.key === 'bannerImage' || field.key === 'cardImage') onFileChange(field.key, file);
            }} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100" />
            {isEditMode && (
              <p className="text-xs text-gray-500">
                Leave empty to keep the current image, or select a new image to replace it.
              </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={onSubmit} className="bg-white rounded-2xl border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {isEditMode ? 'Edit Scheme' : 'Create New Scheme'}
        </h2>
        {isEditMode && (
          <div className="mt-2 space-y-1">
            <p className="text-sm text-gray-600">
              Update the scheme details below. Leave image fields empty to keep the current images.
            </p>
            {hasUnsavedChanges && (
              <p className="text-sm text-orange-600 font-medium">
                ⚠️ You have unsaved changes
              </p>
            )}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {formFields.map((field) => (
          <div key={field.key} className={field.type === 'textarea' || field.type === 'json' ? 'md:col-span-2' : ''}>
            <Label>
              {field.label}
              {field.required && '*'}
            </Label>
            {renderFormField(field)}
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-6">
        <button type="submit" className="px-6 py-2 bg-success-500 text-white rounded-md hover:bg-success-600 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
          {loading ? 'Processing...' : (isEditMode ? 'Update Scheme' : 'Create Scheme')}
        </button>
      </div>
    </form>
  );
};

export default SchemeForm;


