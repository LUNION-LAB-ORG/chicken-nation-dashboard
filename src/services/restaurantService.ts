 

export interface Schedule {
  [day: string]: string;
}

 
export interface Restaurant {
  id?: string;
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  phone: string;
  email: string;
  schedule: Schedule[];
  managerFullname?: string;
  managerEmail?: string;
  managerPhone?: string;
  manager?: string | {  
    id?: string;
    email: string;
    password: string;
    fullname?: string;
    phone?: string;
  };
  image?: string;
  active?: boolean;
  entity_status?: string; 
  created_at?: string;
  updated_at?: string;
  createdAt?: string; 
}

interface RestaurantsResponse {
  data: Restaurant[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface RestaurantResponse {
  data: Restaurant;
}

import { getAuthToken, handleAuthError, fetchWithAuth } from '@/utils/authUtils';
import { formatImageUrl } from '@/utils/imageHelpers';

const API_URL = process.env.NEXT_PUBLIC_API_PREFIX;
 
const RESTAURANTS_URL =   API_URL + '/restaurants';

 
export async function getAllRestaurants(): Promise<Restaurant[]> {
  try {
    const response = await fetchWithAuth<{data: any[]}>(`${RESTAURANTS_URL}`);
    
    return response.data.map((restaurant: any) => ({
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at,
      image: formatImageUrl(restaurant?.image)
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des restaurants:', error);
    throw error;
  }
}

 
export async function getRestaurantById(id: string): Promise<Restaurant> {
  try {
    const response = await fetchWithAuth<{data?: any}>(`${RESTAURANTS_URL}/${id}`);
    
    let restaurantData;
    if (response && response.data) {
      restaurantData = response.data;
    } else if (response && typeof response === 'object') {
       restaurantData = response;
    } else {
      throw new Error('Format de réponse API inattendu');
    }
    
    
    if (restaurantData.schedule && typeof restaurantData.schedule === 'string') {
      try {
        restaurantData.schedule = JSON.parse(restaurantData.schedule);
        console.log('Schedule parsé avec succès:', restaurantData.schedule);
      } catch (error) {
        console.error('Erreur lors du parsing du schedule:', error);
         restaurantData.schedule = [];
      }
    }
    
    return {
      ...restaurantData,
      active: restaurantData?.entity_status === 'ACTIVE',
      createdAt: restaurantData?.created_at,
      image: formatImageUrl(restaurantData?.image)
    };
  } catch (error) {
    console.error('Erreur lors de la récupération du restaurant:', error);
    throw error;
  }
}

/**
 * Crée un nouveau restaurant
 */
export async function createRestaurant(formData: FormData): Promise<Restaurant> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Vérifier que le FormData contient les champs obligatoires
    if (!formData.has('name')) {
      throw new Error('Le nom du restaurant est obligatoire');
    }
    
    if (!formData.has('description')) {
      throw new Error('La description du restaurant est obligatoire');
    }
    
    if (!formData.has('address')) {
      throw new Error('L\'adresse du restaurant est obligatoire');
    }
    
    if (!formData.has('phone')) {
      throw new Error('Le téléphone du restaurant est obligatoire');
    }
    
    if (!formData.has('email')) {
      throw new Error('L\'email du restaurant est obligatoire');
    }
    
 
    const response = await fetchWithAuth<{data: any}>(`${RESTAURANTS_URL}`, {
      method: 'POST',
      body: formData
    });
    
    if (!response || !response.data) {
      throw new Error('Réponse API invalide');
    }
    
    const restaurant = response.data;
    
    return {
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at,
      image: formatImageUrl(restaurant?.image)
    };
  } catch (error) {
    console.error(` Erreur:`, error);
    throw error;
  }
}

 
export async function createRestaurantJSON(restaurantData: any): Promise<Restaurant> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    // Vérifier les champs obligatoires
    if (!restaurantData.name) {
      throw new Error('Le nom du restaurant est obligatoire');
    }
    
    const response = await fetchWithAuth<{data: any}>(`${RESTAURANTS_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(restaurantData)
    });
    
    if (!response || !response.data) {
      throw new Error('Réponse API invalide');
    }
    
    const restaurant = response.data;
    
    // Si des informations de manager sont fournies, récupérer le manager
    if (restaurant && restaurant.id && (restaurantData.managerEmail || restaurantData.managerFullname)) {
      try {
         const managerResponse = await fetchWithAuth<{data: any}>(`${RESTAURANTS_URL}/${restaurant.id}/manager`);
        
        if (managerResponse && managerResponse.data) {
          const managerData = managerResponse.data;
          restaurant.manager = managerData;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération du manager:', error);
      }
    }
    
    return {
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at,
      image: formatImageUrl(restaurant?.image)
    };
  } catch (error) {
    console.error('Erreur lors de la création du restaurant (JSON):', error);
    throw error;
  }
}
 
export async function updateRestaurant(id: string, formData: FormData): Promise<Restaurant> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    console.log('Envoi de la requête PATCH avec FormData');
    
    const response = await fetchWithAuth<{data: any}>(`${RESTAURANTS_URL}/${id}`, {
      method: 'PATCH',
      body: formData
    });
    
    if (!response || !response.data) {
      throw new Error('Réponse API invalide');
    }
    
    const restaurant = response.data;
    
    return {
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at,
      image: formatImageUrl(restaurant?.image)
    };
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du restaurant:`, error);
    throw error;
  }
}

/**
 * Met à jour le statut actif/inactif d'un restaurant
 */
export async function updateRestaurantStatus(id: string, active: boolean): Promise<Restaurant> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetchWithAuth<{data: any}>(`${RESTAURANTS_URL}/${id}/activateDeactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ active })
    });
    
    if (!response || !response.data) {
      throw new Error('Réponse API invalide');
    }
    
    const restaurant = response.data;
    
    return {
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at,
      image: formatImageUrl(restaurant?.image)
    };  
  } catch (error) {
    throw error;
  }
}

/**
 * Supprime un restaurant
 */
export async function deleteRestaurant(id: string): Promise<void> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetchWithAuth<void>(`${RESTAURANTS_URL}/${id}`, {
      method: 'DELETE'
    });
 
    console.log('Restaurant supprimé avec succès');
  } catch (error) {
    console.error(`Erreur lors de la suppression du restaurant ${id}:`, error);
    throw error;
  }
}

/**
 * Récupère le manager d'un restaurant
 */
export async function getRestaurantManager(id: string): Promise<any> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetchWithAuth<{data: any}>(`${RESTAURANTS_URL}/${id}/manager`);
    
    if (!response || !response.data) {
      throw new Error('Réponse API invalide');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du manager du restaurant ${id}:`, error);
    throw error;
  }
}

 
export async function getRestaurantUsers(id: string): Promise<any[]> {
  try {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetchWithAuth<{data: any[]}>(`${RESTAURANTS_URL}/${id}/users`);
    
    if (!response || !response.data) {
      throw new Error('Réponse API invalide');
    }
    
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des utilisateurs du restaurant ${id}:`, error);
    throw error;
  }
}
