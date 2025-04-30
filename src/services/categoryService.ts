
import { api } from './api';
import { formatImageUrl } from '@/utils/imageHelpers';
import { MenuItem } from '@/types';

// Points d'entrée de l'API pour les catégories
const CATEGORIES_ENDPOINT = '/categories';
 
export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  productCount?: number;  
}

 
export interface CategoryWithDishes extends Category {
  dishes: MenuItem[];
}
 
export interface CreateCategoryDto {
  name: string;
  description?: string;
  image?: string;
}
 
export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  image?: string;
}

/**
 * Récupère toutes les catégories
 */
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get<Category[]>('/categories', false);
    return response;
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories:', error);
    throw error;
  }
};

 
export const getCategoryById = async (id: string): Promise<Category> => {
  return api.get<Category>(`${CATEGORIES_ENDPOINT}/${id}`, false); 
};
 
export const getCategoryWithDishes = async (categoryId: string): Promise<CategoryWithDishes> => {
  try {
    const response = await api.get<CategoryWithDishes>(`${CATEGORIES_ENDPOINT}/${categoryId}`, true);
    const formattedResponse: CategoryWithDishes = {
      ...response as CategoryWithDishes,
      dishes: []
    };
    if (response && (response as CategoryWithDishes).dishes && Array.isArray((response as CategoryWithDishes).dishes)) {
      formattedResponse.dishes = (response as CategoryWithDishes).dishes.map((dish: any) => ({
        ...dish,
        image: formatImageUrl(dish.image)
      }));
    }
    if (response && (response as CategoryWithDishes).image) {
      formattedResponse.image = formatImageUrl((response as CategoryWithDishes).image);
    }
    return formattedResponse;
  } catch (error) {
    console.error('Erreur lors de la récupération de la catégorie avec ses plats:', error);
    throw error;
  }
};
 
export const getMenusByCategoryId = async (categoryId: string): Promise<MenuItem[]> => {
  try {
    const response = await api.get<CategoryWithDishes>(`/categories/${categoryId}`, true);
    if (response && response.dishes && Array.isArray(response.dishes)) {
      const formattedDishes = response.dishes.map(dish => ({
        ...dish,
        image: formatImageUrl(dish.image)
      }));
      return formattedDishes;
    }
    return [];
  } catch (error) {
    console.error(`Erreur lors de la récupération des plats pour la catégorie ${categoryId}:`, error);
    throw error;
  }
};
 
export const createCategory = async (formData: FormData): Promise<Category> => {
  return api.post<Category>(CATEGORIES_ENDPOINT, formData, true);  
};
 
export const updateCategory = async (id: string, formData: FormData): Promise<Category> => {
  if (!formData.has('id')) {
    formData.append('id', id);
  }
  return api.patch<Category>(`${CATEGORIES_ENDPOINT}/${id}`, formData, true); 
};

 
export const deleteCategory = async (id: string): Promise<void> => {
  return api.delete<void>(`${CATEGORIES_ENDPOINT}/${id}`, true); 
};
