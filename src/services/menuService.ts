import { API_URL } from '@/config';
import { MenuItem } from '@/types';
import { betterApiClient } from './betterApiClient';
import { formatImageUrl } from '@/utils/imageHelpers';
import { API_ENDPOINTS } from '@/constants/menuConstants';

// Types pour les menus
export interface Menu {
  id: string;
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  restaurantId: string;
  image?: string;
  available?: boolean;
  supplements?: {
    ingredients?: SupplementItem[];
    accompagnements?: SupplementItem[];
    boissons?: SupplementItem[];
  };
}

export interface SupplementItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity?: number;
  category: string;
}

export const formatMenuFromApi = (apiMenu: any): MenuItem => {
  return {
    id: apiMenu.id || '',
    name: apiMenu.name || '',
    description: apiMenu.description || '',
    restaurant: apiMenu.restaurant || '',
    restaurantId: apiMenu.restaurant_id || '',
    price: apiMenu.price?.toString() || '0',
    rating: apiMenu.rating || 0,
    categoryId: apiMenu.category_id || '',
    isAvailable: apiMenu.available !== false,
    isNew: apiMenu.is_new || false,
    ingredients: apiMenu.ingredients || [],
    image: formatImageUrl(apiMenu.image),
    supplements: apiMenu.supplements || {},
    reviews: apiMenu.reviews || [],
    totalReviews: apiMenu.total_reviews || 0,
    discountedPrice: apiMenu.promotion_price?.toString(),
    originalPrice: apiMenu.price?.toString(),
    isPromotion: apiMenu.is_promotion || false
  };
};

// Récupérer tous les menus
export const getAllMenus = async (): Promise<MenuItem[]> => {
  try {
    const responseData = await betterApiClient.get<{data: any[]}>('/dishes');
    
    const menus = Array.isArray(responseData) ? responseData : (responseData.data || []);
    
    // Formater les menus pour correspondre au type MenuItem
    return menus.map((menu: any) => formatMenuFromApi(menu));
  } catch (error) {
    console.error('Erreur lors de la récupération des menus:', error);
    throw error;
  }
};

export const getMenuById = async (id: string): Promise<any> => {
  try {
    const menuData = await betterApiClient.get<any>(`/dishes/${id}`);
    
    const data = menuData.data || menuData;
    
    return data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du menu ${id}:`, error);
    throw error;
  }
};

// Créer un nouveau menu
export const createMenu = async (menuData: FormData): Promise<MenuItem> => {
  try {
    const result = await betterApiClient.postFormData<any>(`/dishes`, menuData);
    
    const menuResult = result.data || result;
    
    return formatMenuFromApi(menuResult);
  } catch (error) {
    console.error('Erreur lors de la création du menu:', error);
    throw error;
  }
};

export const updateMenu = async (id: string, menuData: FormData): Promise<MenuItem> => {
  try {
    const result = await betterApiClient.postFormData<any>(`/dishes/${id}`, menuData);
    
    const menuResult = result.data || result;
    return formatMenuFromApi(menuResult);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du menu:', error);
    throw error;
  }
};

// Supprimer un menu
export const deleteMenu = async (id: string): Promise<void> => {
  try {
    await betterApiClient.delete(`/dishes/${id}`);
    
    console.log('Plat supprimé avec succès');
  } catch (error) {
    console.error(`Erreur lors de la suppression du plat ${id}:`, error);
    throw error;
  }
};

export const getAllMenuCategories = async (): Promise<any[]> => {
  try {
    const data = await betterApiClient.get<{data: any[]}>(`/menu-categories`);
    
    return data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories de plat:', error);
    throw error;
  }
};

export const updateMenuAvailability = async (id: string, available: boolean): Promise<MenuItem> => {
  try {
    const formData = new FormData();
    formData.append('available', available.toString());
    
    const result = await betterApiClient.postFormData<any>(`/dishes/${id}`, formData);
    
    const menuResult = result.data || result;
    
    return formatMenuFromApi(menuResult);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la disponibilité du menu ${id}:`, error);
    throw error;
  }
};

export const menuToFormData = (menu: MenuItem): FormData => {
  const formData = new FormData();
  
  formData.append('name', menu.name);
  formData.append('description', menu.description || '');
  formData.append('price', menu.price.toString());
  formData.append('category_id', menu.categoryId);
  
  // Gérer l'image
  if (menu.image && typeof menu.image === 'object') {
    // Si c'est un objet File
    formData.append('image', menu.image as any);
  } else if (menu.image && typeof menu.image === 'string' && menu.image.startsWith('data:image')) {
    // Convertir l'image base64 en Blob
    const blob = dataURLtoBlob(menu.image);
    formData.append('image', blob, 'image.jpg');
  }
  
  if (menu.isPromotion) {
    formData.append('is_promotion', 'true');
    if (menu.discountedPrice) {
      formData.append('promotion_price', menu.discountedPrice);
    }
  }
  
  return formData;
};

const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  
  return new Blob([u8arr], { type: mime });
};
