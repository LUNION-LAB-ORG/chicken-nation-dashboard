 import { betterApiClient } from './betterApiClient';
import {Dish} from '@/types/dish';

const DISHES_ENDPOINT = '/supplements';

export const createDish = async (formData: FormData): Promise<Dish> => {
  const token = localStorage.getItem('chicken-nation-auth') 
    ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
    : null;
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    console.log('Contenu du FormData envoyé:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    
    return await betterApiClient.postFormData<Dish>(DISHES_ENDPOINT, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Erreur complète:', error);
    throw error;
  }
};

/**
 * Récupère tous les plats
 */
export const getAllDishes = async (): Promise<any> => {
  try {
    return await betterApiClient.get(DISHES_ENDPOINT);
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

 
export const getDishById = async (id: string): Promise<Dish> => {
  try {
    const response = await betterApiClient.get<Dish>(`${DISHES_ENDPOINT}/${id}`);
    return response;
  } catch (error) {
    console.error(`Erreur lors de la récupération du plat ${id}:`, error);
    throw error;
  }
};

 
export const updateDish = async (id: string, data: Partial<Dish>): Promise<Dish> => {
  try {
    const response = await betterApiClient.patch<Dish>(`${DISHES_ENDPOINT}/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du plat ${id}:`, error);
    throw error;
  }
};
 
export const updateSupplementAvailability = async (id: string, available: boolean): Promise<any> => {
  const token = localStorage.getItem('chicken-nation-auth') 
    ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
    : null;
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    return await betterApiClient.patch(`${DISHES_ENDPOINT}/${id}`, { available }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la disponibilité:', error);
    throw error;
  }
};
 
export const deleteDish = async (id: string): Promise<void> => {
  try {
    await betterApiClient.delete(`${DISHES_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du plat ${id}:`, error);
    throw error;
  }
};

 
export const deleteSupplement = async (id: string): Promise<void> => {
  const token = localStorage.getItem('chicken-nation-auth') 
    ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
    : null;
  
  if (!token) {
    throw new Error('Authentication required');
  }

  try {
    await betterApiClient.delete(`${DISHES_ENDPOINT}/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du supplément:', error);
    throw error;
  }
};
