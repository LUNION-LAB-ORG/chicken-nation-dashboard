 

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

const API_URL = process.env.NEXT_PUBLIC_API_PREFIX;
 
const RESTAURANTS_URL =   API_URL + '/restaurants';

 
export async function getAllRestaurants(): Promise<Restaurant[]> {
  try {
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(RESTAURANTS_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
  
    return data.data.map((restaurant: any) => ({
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des restaurants:', error);
    throw error;
  }
}

 
export async function getRestaurantById(id: string): Promise<Restaurant> {
  try {
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${RESTAURANTS_URL}/${id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
     let restaurantData;
    if (data && data.data) {
      restaurantData = data.data;
    } else if (data && typeof data === 'object') {
       restaurantData = data;
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
      active: restaurantData?.entity_status === 'ACTIVE' || restaurantData?.active === true,
      createdAt: restaurantData?.created_at || restaurantData?.createdAt
    };
  } catch (error) {
    console.error(`Erreur lors de la récupération du restaurant ${id}:`, error);
    throw error;
  }
}

/**
 * Crée un nouveau restaurant
 */
export async function createRestaurant(formData: FormData): Promise<Restaurant> {
  try {
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }

     const scheduleStr = formData.get('schedule');
    if (scheduleStr && typeof scheduleStr === 'string') {
       formData.delete('schedule');
      
      try {
         const scheduleData = JSON.parse(scheduleStr);
        
         if (Array.isArray(scheduleData)) {
           const formattedSchedule = scheduleData.map(item => {
             if (typeof item === 'object' && Object.keys(item).length === 1) {
              return item;
            }
            
      
            return item;
          });
          
           formData.set('schedule', JSON.stringify(formattedSchedule));
        } else {
          console.error('Les données de schedule ne sont pas un tableau:', scheduleData);
        }
      } catch (error) {
        console.error('Erreur lors du parsing du schedule:', error);
      }
    }
    
 
    const response = await fetch(RESTAURANTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
       },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(` Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    
  
    const restaurant = data.restaurant || data.data;
    
     if (data.managerCredentials) {
      restaurant.manager = {
        email: data.managerCredentials.email,
        password: data.managerCredentials.password
      };
      
    }
    
    return {
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at
    };
  } catch (error) {
    console.error(` Erreur:`, error);
    throw error;
  }
}

 
export async function createRestaurantJSON(restaurantData: any): Promise<Restaurant> {
  try {
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
 
    
    const response = await fetch(RESTAURANTS_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(restaurantData)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Erreur API:', response.status, errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    console.log('Réponse API création restaurant (JSON):', data);
    
  
    const restaurant = data.restaurant || data.data;
    
     if (data.managerCredentials) {
      restaurant.manager = {
        email: data.managerCredentials.email,
        password: data.managerCredentials.password
      };
      
      console.log('Identifiants du manager récupérés directement:', restaurant.manager);
      return {
        ...restaurant,
        active: restaurant?.entity_status === 'ACTIVE',
        createdAt: restaurant?.created_at
      };
    }
 
    if (restaurant && restaurant.id && (restaurantData.managerEmail || restaurantData.managerFullname)) {
      try {
         const managerResponse = await fetch(`${RESTAURANTS_URL}/${restaurant.id}/manager`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (managerResponse.ok) {
          const managerData = await managerResponse.json();
          console.log('Identifiants du manager récupérés (JSON):', managerData);
          
          if (managerData.data) {
            restaurant.manager = managerData.data;
          }
        }
      } catch (managerError) {
        console.error('Erreur lors de la récupération des identifiants du manager (JSON):', managerError);
       }
    }
    
    return {
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at
    };
  } catch (error) {
    console.error('Erreur lors de la création du restaurant (JSON):', error);
    throw error;
  }
}
 
export async function updateRestaurant(id: string, formData: FormData): Promise<Restaurant> {
  try {
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
     const scheduleStr = formData.get('schedule');
    if (scheduleStr && typeof scheduleStr === 'string') {
       formData.delete('schedule');
      
      try {
        const scheduleData = JSON.parse(scheduleStr);
        
         if (Array.isArray(scheduleData)) {
           const formattedSchedule = scheduleData.map(item => {
             if (typeof item === 'object' && Object.keys(item).length === 1) {
              return item;
            }
            
            
            return item;
          });
          
           formData.set('schedule', JSON.stringify(formattedSchedule));
        } else {
        
        }
      } catch (error) {
        console.error('Erreur lors du parsing du schedule:', error);
      }
    }
    
     console.log(' Contenu du FormData:');
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${typeof pair[1] === 'object' ? 'File/Object' : pair[1]}`);
    }
    
    console.log(' Envoi de la requête PATCH avec FormData');
    
    const response = await fetch(`${RESTAURANTS_URL}/${id}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`
       },
      body: formData
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(` Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    const restaurant = data.data || data;
    
    return {
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at
    };
  } catch (error) {
    console.error(` Erreur:`, error);
    throw error;
  }
}

/**
 * Met à jour le statut actif/inactif d'un restaurant
 */
export async function updateRestaurantStatus(id: string, active: boolean): Promise<Restaurant> {
  try {
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
     const response = await fetch(`${RESTAURANTS_URL}/${id}/activateDeactivate`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ active })
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    const restaurant = data.data;
    return {
      ...restaurant,
      active: restaurant?.entity_status === 'ACTIVE',
      createdAt: restaurant?.created_at
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
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${RESTAURANTS_URL}/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
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
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${RESTAURANTS_URL}/${id}/manager`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    
     if (data && typeof data === 'object' && data.fullname) {
      return data;
    }
    
     if (data && data.data) {
      return data.data;
    }
    
    throw new Error('Format de réponse API inattendu pour le manager');
  } catch (error) {
    throw error;
  }
}

 
export async function getRestaurantUsers(id: string): Promise<any[]> {
  try {
    const token = localStorage.getItem('chicken-nation-auth') 
      ? JSON.parse(localStorage.getItem('chicken-nation-auth') || '{}')?.state?.accessToken 
      : null;
    
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${RESTAURANTS_URL}/${id}/users`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    
    throw error;
  }
}
