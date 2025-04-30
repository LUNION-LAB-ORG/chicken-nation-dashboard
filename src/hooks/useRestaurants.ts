import { useState, useEffect } from 'react';
import { getAllRestaurants } from '@/services/restaurantService';
import { toast } from 'react-hot-toast';

export interface RestaurantOption {
  value: string;
  label: string;
}
 
export const useRestaurants = (initialSelectedIds: string[] = []) => {
  const defaultRestaurants = [
    { value: 'zone4', label: 'Chicken Nation Zone 4' },
    { value: 'angre', label: 'Chicken Nation Angré' },
  ];
  
  // États pour les restaurants
  const [restaurants, setRestaurants] = useState<RestaurantOption[]>(defaultRestaurants);
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>(initialSelectedIds);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fonction pour gérer la sélection des restaurants
  const handleRestaurantChange = (selectedIds: string[]) => {
 
    const uniqueIds = [...new Set(selectedIds)];
    setSelectedRestaurants(uniqueIds);
  };
  
   const isRestaurantSelected = (id: string): boolean => {
    return selectedRestaurants.includes(id);
  };
  
   const validateRestaurants = (): boolean => {
    return selectedRestaurants.length > 0;
  };
  
   const addRestaurantsToFormData = (formData: FormData): FormData => {
     selectedRestaurants.forEach(id => {
      formData.append('restaurant_ids[]', id);
    });
    
    return formData;
  };
  
   useEffect(() => {
    const fetchRestaurants = async () => {
      setIsLoading(true);
      
      try {
        const restaurantsData = await getAllRestaurants();
        
        if (restaurantsData && Array.isArray(restaurantsData) && restaurantsData.length > 0) {
          const formattedRestaurants = restaurantsData.map(restaurant => ({
            value: restaurant.id || '',
            label: restaurant.name
          })); 
          setRestaurants(formattedRestaurants);
          
           if (selectedRestaurants.length > 0) {
            const validRestaurantIds = selectedRestaurants.filter(id => 
              formattedRestaurants.some(r => r.value === id)
            ); 
            if (validRestaurantIds.length !== selectedRestaurants.length) { 
              setSelectedRestaurants(validRestaurantIds);
            }
          }
        } else {
          console.warn('Aucun restaurant trouvé ou format invalide');
        }
      } catch (error) {
        console.error('Erreur lors du chargement des restaurants:', error);
        toast.error('Erreur lors du chargement des restaurants');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRestaurants();
  }, []);
  
  return {
    restaurants,
    selectedRestaurants, 
    handleRestaurantChange,
    setSelectedRestaurants, 
    isRestaurantSelected,
    addRestaurantsToFormData,
    validateRestaurants,
    isLoading
  };
};
