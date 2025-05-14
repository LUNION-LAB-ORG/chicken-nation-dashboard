import { API_URL } from '@/config';
import { MenuItem } from '@/types';
import { api, apiRequest } from './api';
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
  // Récupérer l'URL de l'image brute pour la stocker séparément
  const imageUrl = apiMenu.image_url || apiMenu.image || null;
  
  return {
    id: apiMenu.id || '',
    name: apiMenu.name || '',
    description: apiMenu.description || '',
    restaurant: apiMenu.restaurant || '',
    restaurantId: apiMenu.restaurant_id || '',
    price: apiMenu.price?.toString() || '0',
    categoryId: apiMenu.category_id || '',
    isAvailable: apiMenu.available !== false,
    isNew: apiMenu.is_new || false,
    ingredients: apiMenu.ingredients || [],
    image: formatImageUrl(apiMenu.image),
    imageUrl: imageUrl, // Stocker l'URL brute de l'image pour les mises à jour futures
    supplements: apiMenu.supplements || {},
    reviews: apiMenu.reviews || [],
    totalReviews: apiMenu.total_reviews || 0,
    is_promotion: apiMenu.is_promotion || false,
    promotion_price: apiMenu.promotion_price?.toString() || undefined
  };
};

const getAuthToken = (): string => {
  const authData = localStorage.getItem('chicken-nation-auth');
  if (!authData) {
    throw new Error('Authentication required');
  }
  
  const parsedData = JSON.parse(authData);
  const token = parsedData?.state?.accessToken;
  
  if (!token) {
    throw new Error('Authentication token not found');
  }
  
  return token;
};

// Récupérer tous les menus
export const getAllMenus = async (): Promise<MenuItem[]> => {
  try {
     const responseData = await apiRequest<any>(
      '/dishes',  
      'GET'
    );
    
     const menus = responseData.data || responseData;
    
    // Formater les menus pour correspondre au type MenuItem
    return menus.map((menu: any) => formatMenuFromApi(menu));
  } catch (error) {
    console.error('Erreur lors de la récupération des menus:', error);
    throw error;
  }
};

export const getMenuById = async (id: string): Promise<any> => {
  try {
     const menuData = await apiRequest<any>(
      `/dishes/${id}`,  
      'GET'
    );
    
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
    console.log('Création d\'un nouveau plat avec FormData');
    
    // Afficher le contenu du FormData pour le débogage
    const formDataEntries: {[key: string]: any} = {};
    menuData.forEach((value, key) => {
      if (formDataEntries[key]) {
        if (Array.isArray(formDataEntries[key])) {
          formDataEntries[key].push(value);
        } else {
          formDataEntries[key] = [formDataEntries[key], value];
        }
      } else {
        formDataEntries[key] = value;
      }
    });
    console.log('Contenu du FormData:', formDataEntries);
    
    const result = await apiRequest<any>(
      '/dishes',  
      'POST',
      menuData
    );
    
    const menuResult = result.data || result;
    console.log('Plat créé avec succès:', menuResult);
    
    return formatMenuFromApi(menuResult);
  } catch (error) {
    console.error('Erreur lors de la création du menu:', error);
    throw error;
  }
};

export const updateMenu = async (id: string, menuData: FormData): Promise<MenuItem> => {
  try {
    console.log(`Mise à jour du plat ${id} avec FormData`);
    
    // Vérifier si une image est présente dans le FormData
    let hasImage = false;
    menuData.forEach((value, key) => {
      if (key === 'image' && value instanceof File && value.size > 0) {
        hasImage = true;
      }
    });
    
    // Si aucune image n'est fournie, récupérer l'image existante
    if (!hasImage) {
      try {
        const existingDish = await getMenuById(id);
        if (existingDish.image_url) {
          // Créer un nouveau FormData avec l'image existante
          const newFormData = new FormData();
          menuData.forEach((value, key) => {
            newFormData.append(key, value);
          });
          newFormData.append('image_url', existingDish.image_url);
          menuData = newFormData;
          console.log('Image existante ajoutée au FormData:', existingDish.image_url);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'image existante:', error);
      }
    }
    
    // Approche DELETE/CREATE qui fonctionne
    try {
      // Supprimer le plat existant
      await deleteMenu(id);
      console.log('Plat supprimé avec succès');
      
      // Créer un nouveau plat avec les données mises à jour
      const newDish = await createMenu(menuData);
      console.log('Nouveau plat créé avec succès:', newDish);
      
      return newDish;
    } catch (error) {
      console.error('Erreur lors de la suppression/recréation:', error);
      throw new Error('Impossible de mettre à jour le plat. Veuillez réessayer plus tard.');
    }
  } catch (error) {
    console.error('Erreur lors de la mise à jour du menu:', error);
    throw error;
  }
};

export const menuToFormData = (menu: MenuItem): FormData => {
  console.log('menuToFormData - Données reçues:', {
    name: menu.name,
    image: typeof menu.image === 'object' ? 'File Object' : menu.image,
    imageUrl: menu.imageUrl
  });
  
  const formData = new FormData();
  
  // Informations de base
  formData.append('name', menu.name);
  formData.append('description', menu.description || '');
  formData.append('price', menu.price.toString());
  formData.append('category_id', menu.categoryId);
  
  // Gérer l'image
  if (menu.image && typeof menu.image === 'object') {
    // Si c'est un objet File
    formData.append('image', menu.image as any);
    console.log('Envoi d\'une nouvelle image (objet File)');
  } else if (menu.image && typeof menu.image === 'string') {
    if (menu.image.startsWith('data:image')) {
      // Convertir l'image base64 en Blob
      const blob = dataURLtoBlob(menu.image);
      formData.append('image', blob, 'image.jpg');
      console.log('Envoi d\'une nouvelle image (base64 convertie en Blob)');
    } else if (menu.image.startsWith('http')) {
      // Si c'est une URL directe (cas d'une image existante)
      formData.append('image_url', menu.image);
      console.log('Préservation de l\'image existante via URL directe:', menu.image);
    } else {
      // Autre type de chaîne, peut-être un chemin relatif
      console.log('Image sous forme de chaîne non reconnue:', menu.image);
      if (menu.imageUrl) {
        formData.append('image_url', menu.imageUrl);
        console.log('Utilisation de imageUrl comme fallback:', menu.imageUrl);
      }
    }
  } else if (menu.imageUrl) {
    // Cas où menu.image est null/undefined mais nous avons une URL d'image existante
    formData.append('image_url', menu.imageUrl);
    console.log('Préservation de l\'image existante via imageUrl:', menu.imageUrl);
  } else {
    console.log('Aucune image fournie pour ce plat');
  }
  
  // Gérer les promotions - IMPORTANT: Toujours envoyer is_promotion et promotion_price
  formData.append('is_promotion', menu.is_promotion ? 'true' : 'false');
  if (menu.is_promotion && menu.promotion_price) {
    formData.append('promotion_price', menu.promotion_price.toString());
  } else {
    formData.append('promotion_price', '0');
  }
  
  // Gérer les restaurants - IMPORTANT: Ajouter chaque ID séparément
  if (Array.isArray(menu.restaurantId)) {
    menu.restaurantId.forEach(id => {
      if (id) formData.append('restaurant_ids', id);
    });
  } else if (menu.restaurantId) {
    formData.append('restaurant_ids', menu.restaurantId);
  }
  
  // Gérer les suppléments - IMPORTANT: Éviter les doublons
  // Créer un Set pour stocker les IDs uniques des suppléments
  const supplementIds = new Set<string>();
  
  // Collecter tous les IDs de suppléments depuis les différentes sources
  // 1. Depuis supplements.ACCESSORY
  if (menu.supplements?.ACCESSORY) {
    menu.supplements.ACCESSORY.forEach(supp => {
      if (supp.id) supplementIds.add(supp.id);
    });
  }
  
  // 2. Depuis supplements.FOOD
  if (menu.supplements?.FOOD) {
    menu.supplements.FOOD.forEach(supp => {
      if (supp.id) supplementIds.add(supp.id);
    });
  }
  
  // 3. Depuis supplements.DRINK
  if (menu.supplements?.DRINK) {
    menu.supplements.DRINK.forEach(supp => {
      if (supp.id) supplementIds.add(supp.id);
    });
  }
  
  // 4. Depuis dish_supplements (si présent et non déjà traité)
  if (menu.dish_supplements && Array.isArray(menu.dish_supplements)) {
    menu.dish_supplements.forEach(supp => {
      if (supp.supplement_id) {
        supplementIds.add(supp.supplement_id);
      }
    });
  }
  
  // Ajouter les IDs uniques au FormData
  supplementIds.forEach(id => {
    formData.append('supplement_ids', id);
  });
  
  console.log('FormData créé pour le menu:', {
    name: menu.name,
    restaurants: Array.isArray(menu.restaurantId) ? menu.restaurantId : [menu.restaurantId],
    supplements: {
      count: supplementIds.size,
      ids: Array.from(supplementIds)
    },
    promotion: { is_promotion: menu.is_promotion, price: menu.promotion_price }
  });
  
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

// Supprimer un menu
export const deleteMenu = async (id: string): Promise<void> => {
  try {
   
    await apiRequest<any>(
      `/dishes/${id}`,  
      'DELETE'
    );
    
    console.log('Plat supprimé avec succès');
  } catch (error) {
    console.error(`Erreur lors de la suppression du plat ${id}:`, error);
    throw error;
  }
};

export const getAllMenuCategories = async (): Promise<any[]> => {
  try {
   
    const data = await apiRequest<any>(
      '/menu-categories',  
      'GET'
    );
    
    return data.data || [];
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories de plat:', error);
    throw error;
  }
};

export const updateMenuAvailability = async (id: string, available: boolean): Promise<MenuItem> => {
  try {
    const formData = new FormData();
    formData.append('available', available ? '1' : '0');
    
  
    const result = await apiRequest<any>(
      `/dishes/${id}`, 
      'PATCH',
      formData
    );
    
    const menuResult = result.data || result;
    
    return formatMenuFromApi(menuResult);
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la disponibilité du menu ${id}:`, error);
    throw error;
  }
};
