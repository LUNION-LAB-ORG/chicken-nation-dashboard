 

import { API_URL } from '@/config';
import { API_ENDPOINTS } from '@/constants/menuConstants';
 
export const getRestaurantsByDishId = async (dishId: string): Promise<any[]> => {
  try {

    
    // Récupérer le token d'authentification
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
     const endpoint = `${API_URL}${API_ENDPOINTS.DISH_RESTAURANTS}?dish_id=${dishId}`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur: ${response.status} - ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    const result = data.data || [];
    
    return result;
  } catch (error) {
    throw error;
  }
};
 
export const addRestaurantToDish = async (dishId: string, restaurantId: string): Promise<any> => {
  try {
    // Récupérer le token d'authentification
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
     const endpoint = `${API_URL}${API_ENDPOINTS.DISH_RESTAURANTS}`;
    
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dish_id: dishId,
        restaurant_id: restaurantId
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur: ${response.status} - ${errorText.substring(0, 100)}`);
    }
    
    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

 
export const removeRestaurantFromDish = async (relationId: string): Promise<void> => {
  try {
    // Récupérer le token d'authentification
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
     const response = await fetch(`${API_URL}/api/v1/dish/${relationId}/restaurant/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur: ${response.status} - ${errorText.substring(0, 100)}`);
    }
  } catch (error) {
    throw error;
  }
};
 
export const deleteDishRestaurantRelation = async (relationId: string): Promise<void> => {
  try {
    // Récupérer le token d'authentification
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
     const endpoint = `${API_URL}${API_ENDPOINTS.DISH_RESTAURANTS}/${relationId}`;
    
    const response = await fetch(endpoint, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
     if (response.status === 404) {
      console.log(`Relation restaurant ${relationId} déjà supprimée ou inexistante, considéré comme un succès.`);
      return;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Erreur: ${response.status} - ${errorText.substring(0, 100)}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la relation plat-restaurant ${relationId}:`, error);
    throw error;
  }
};
 
export const updateDishRestaurants = async (
  dishId: string,
  currentRestaurantIds: string[],
  newRestaurantIds: string[]
): Promise<{ added: any[], removed: any[] }> => {
  try {

    
    const currentIds = [...new Set(currentRestaurantIds.filter(Boolean))];
    const newIds = [...new Set(newRestaurantIds.filter(Boolean))];
    
  
    const restaurantsToAdd = newIds.filter(id => !currentIds.includes(id));

   
    const restaurantsToRemove = currentIds.filter(id => !newIds.includes(id));

    
    const existingRelations = await getRestaurantsByDishId(dishId);

     
    const addPromises = restaurantsToAdd.map(restaurantId => 
      addRestaurantToDish(dishId, restaurantId)
    );
    
    
    const removePromises = restaurantsToRemove.map(restaurantId => {
     
      const relation = existingRelations.find(
        r => (r.restaurant_id === restaurantId) || 
             (r.restaurant && r.restaurant.id === restaurantId)
      );
      
      if (relation && relation.id) {
        return deleteDishRestaurantRelation(relation.id);
      } else {
        return Promise.resolve({ error: `Relation non trouvée pour le restaurant ${restaurantId}` });
      }
    });
 
    const [addResults, removeResults] = await Promise.all([
      Promise.all(addPromises),
      Promise.all(removePromises)
    ]);

    return {
      added: addResults,
      removed: removeResults
    };
  } catch (error) {
    throw error;
  }
};
