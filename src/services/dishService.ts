 import { api } from './api';
import {Dish} from '@/types/dish';

const DISHES_ENDPOINT = '/api/v1/supplements';

export const createDish = async (formData: FormData): Promise<Dish> => {
  const token = localStorage.getItem('chicken-nation-auth') 
    ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
    : null;
  
  if (!token) {
    throw new Error('Authentication required');
  }
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  
  try {
     console.log('Contenu du FormData envoyé:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }
    
    const response = await fetch(`${API_URL}/api/v1/supplements`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur détaillée:', errorText);
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }
    
    return await response.json();
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    
    const response = await fetch(`${API_URL}/api/v1/supplements`, {
      method: 'GET'
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Erreur:', error);
    throw error;
  }
};

 
export const getDishById = async (id: string): Promise<Dish> => {
  try {
    const response = await api.get<Dish>(`${DISHES_ENDPOINT}/${id}`);
    return response;
  } catch (error) {
    console.error(`Erreur lors de la récupération du plat ${id}:`, error);
    throw error;
  }
};

 
export const updateDish = async (id: string, data: Partial<Dish>): Promise<Dish> => {
  try {
    const response = await api.patch<Dish>(`${DISHES_ENDPOINT}/${id}`, data);
    return response;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du plat ${id}:`, error);
    throw error;
  }
};
 
export const updateSupplementAvailability = async (id: string, available: boolean): Promise<any> => {
  try {
    // Utiliser le client API qui gère automatiquement l'authentification et le refresh token
    return await api.patch(`/supplements/${id}`, { available });
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la disponibilité:', error);
    throw error;
  }
};
 
export const deleteDish = async (id: string): Promise<void> => {
  try {
    await api.delete(`${DISHES_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du plat ${id}:`, error);
    throw error;
  }
};

 
export const deleteSupplement = async (id: string): Promise<void> => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL;
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${API_URL}/api/v1/supplements/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur détaillée:', errorText);
      throw new Error(`Erreur ${response.status}: ${errorText}`);
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du supplément:', error);
    throw error;
  }
};
