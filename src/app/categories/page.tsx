// // src/app/categories/page.tsx
// 'use client';
// import { useState } from 'react';
// import { PlusIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
// import Label from '@/components/form/Label';
// import Input from '@/components/form/input/InputField';
// import TextArea from '@/components/form/input/TextArea';
// import Image from 'next/image';
// import useCategories from '@/hooks/useCategories';
// import { CategoryItem, CategoryListItem } from '../types/category';
// import { deleteCategory, updateCategory, createCategory } from '../service/categoryService';

// const CategoryPage = () => {
//   const { categories, loading, error, refreshCategories } = useCategories();
//   const [category, setCategory] = useState<CategoryItem>({ 
//     id: '', 
//     name: '', 
//     description: '', 
//     iconFile: null,
//     existingImage: ''
//   });
//   const [isAddMode, setIsAddMode] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);

//   const resetForm = () => {
//     setCategory({ 
//       id: '', 
//       name: '', 
//       description: '', 
//       iconFile: null,
//       existingImage: ''
//     });
//   };

//   const handleChange = (field: keyof CategoryItem, value: string | File | null) => {
//     setCategory(prev => ({ ...prev, [field]: value }));
//   };

//   const handleEdit = (item: CategoryListItem) => {
//     setCategory({
//       id: item.id,
//       name: item.name,
//       description: item.description || '',
//       iconFile: null,
//       existingImage: item.image
//     });
//     setIsAddMode(true);
//     setIsEditMode(true);
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this category?')) return;
    
//     try {
//       await deleteCategory(id);
//       alert('Category deleted successfully!');
//       refreshCategories();
//     } catch (err) {
//       alert(err instanceof Error ? err.message : 'Error deleting category');
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       const formData = new FormData();
//       formData.append('name', category.name);
//       if (category.description) formData.append('description', category.description);
//       if (category.iconFile) formData.append('image', category.iconFile);
//       formData.append('createdBy', '688fbefc8dedecbaf5289c98');
//       formData.append('updatedBy', '688fbefc8dedecbaf5289c98');

//       if (isEditMode) {
//         await updateCategory(category.id, formData);
//       } else {
//         await createCategory(formData);
//       }
      
//       alert(`Category ${isEditMode ? 'updated' : 'saved'} successfully!`);
//       resetForm();
//       setIsAddMode(false);
//       setIsEditMode(false);
//       refreshCategories();
//     } catch (err) {
//       alert(err instanceof Error ? err.message : `Error ${isEditMode ? 'updating' : 'saving'} category`);
//     }
//   };

//   return (
//     <div className="p-6">
//       {/* Header */}
//       <div className="mb-6 flex items-center justify-between">
//         <h1 className="text-2xl font-bold">Categories</h1>
//         <div className="flex gap-2">
//           <button
//             type="button"
//             className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
//             onClick={() => {
//               setIsAddMode(false);
//               setIsEditMode(false);
//               resetForm();
//             }}
//           >
//             {isAddMode ? 'Back' : 'View All'}
//           </button>
//           {!isAddMode && (
//             <button
//               type="button"
//               className="inline-flex items-center gap-2 rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600"
//               onClick={() => {
//                 setIsAddMode(true);
//                 setIsEditMode(false);
//                 resetForm();
//               }}
//             >
//               <PlusIcon className="h-4 w-4" /> Add Category
//             </button>
//           )}
//         </div>
//       </div>

//       {/* View Mode */}
//       {!isAddMode && (
//         <div className="rounded-2xl border border-gray-200 bg-white">
//           {loading ? (
//             <div className="p-6 text-sm text-gray-600">Loading categories...</div>
//           ) : error ? (
//             <div className="p-6 text-sm text-red-600">{error}</div>
//           ) : categories.length === 0 ? (
//             <div className="p-6 text-sm text-gray-600">No categories found.</div>
//           ) : (
//             <div className="divide-y divide-gray-200">
//               {categories.map((item) => (
//                 <div key={item.id} className="flex items-center justify-between p-4">
//                   <div className="flex items-center gap-4">
//                     {item.image && (
//                       <Image
//                         src={item.image}
//                         alt={item.name}
//                         width={56}
//                         height={56}
//                         className="object-cover rounded"
//                         priority={false}
//                       />
//                     )}
//                     <div>
//                       <p className="font-medium">{item.name}</p>
//                       <p className="text-sm text-gray-500">
//                         Schemes: {item.totalSchemes}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex gap-2">
//                     <button 
//                       type="button"
//                       onClick={() => handleEdit(item)}
//                       className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
//                     >
//                       <PencilIcon className="h-4 w-4 text-gray-600" />
//                     </button>
//                     <button 
//                       type="button"
//                       onClick={() => handleDelete(item.id)}
//                       className="rounded-lg border border-gray-200 p-1.5 hover:bg-gray-50"
//                     >
//                       <TrashIcon className="h-4 w-4 text-red-600" />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       )}

//       {/* Add/Edit Mode - Category Form */}
//       {(isAddMode || isEditMode) && (
//         <form onSubmit={handleSubmit}>
//           <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 relative">
//             <div className="grid grid-cols-1 gap-6">
//               <div>
//                 <Label>Category Name</Label>
//                 <Input
//                   value={category.name}
//                   onChange={(e) => handleChange('name', e.target.value)}
//                   placeholder="e.g., Education"
//                   required
//                 />
//               </div>

//               <div>
//                 <Label>Category Image</Label>
//                 {category.existingImage && (
//                   <div className="mb-2">
//                     <Image
//                       src={category.existingImage}
//                       alt="Current category image"
//                       width={100}
//                       height={100}
//                       className="object-cover rounded"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">Current image</p>
//                   </div>
//                 )}
//                 <input
//                   className='cursor-pointer'
//                   type="file"
//                   accept="image/*"
//                   onChange={(e) =>
//                     handleChange('iconFile', e.target.files?.[0] || null)
//                   }
//                 />
//               </div>

//               <div>
//                 <Label>Description (Optional)</Label>
//                 <TextArea
//                   rows={3}
//                   value={category.description || ''}
//                   onChange={(v) => handleChange('description', v)}
//                   placeholder="Explain what this category covers"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end mt-6 gap-2">
//               <button
//                 type="button"
//                 className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
//                 onClick={() => {
//                   setIsAddMode(false);
//                   setIsEditMode(false);
//                   resetForm();
//                 }}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-6 py-2 bg-success-500 text-white rounded-md hover:bg-success-600"
//               >
//                 {isEditMode ? 'Update' : 'Save'} Category
//               </button>
//             </div>
//           </div>
//         </form>
//       )}
//     </div>
//   );
// };

// export default CategoryPage;

export default function CategoriesPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Categories</h1>
      <p className="mt-2 text-gray-600">This page is under construction.</p>
    </div>
  );
}