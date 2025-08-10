// src/types/category.ts
export interface CategoryApiResponse {
  name: string;
  image: string;
  totalSchemes: number;
  categoryId?: string;
  _id?: string;
  description?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  iconFile?: File | null;
  existingImage?: string;
}

export interface CategoryListItem {
  id: string;
  name: string;
  image: string;
  totalSchemes: number;
  description?: string;
}