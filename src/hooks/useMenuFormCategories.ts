import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getAllCategories } from '@/services/categoryService';
import { getAllRestaurants } from '@/services/restaurantService';

// ✅ TYPES POUR LES OPTIONS
interface OptionItem {
  value: string;
  label: string;
}

interface RestaurantData {
  id: string;
  name: string;
}

 
const convertRestaurantsToOptions = (restaurants: RestaurantData[]): OptionItem[] => {
  return restaurants.map((restaurant) => ({
    value: restaurant.id,
    label: restaurant.name
  }));
};

// const convertCategoriesToOptions = (categories: CategoryData[]): OptionItem[] => { // Non utilisé actuellement
//   return categories.map((category) => ({
//     value: category.id,
//     label: category.name
//   }));
// };

 const defaultRestaurants = [
  { value: 'zone4', label: 'Chicken Nation Zone 4' },
  { value: 'angre', label: 'Chicken Nation Angré' },
];

// ✅ TYPE POUR LES DONNÉES INITIALES
interface InitialMenuData {
  dish_restaurants?: Array<{
    restaurant_id?: string;
    restaurant?: {
      id: string;
      name: string;
    };
  }>;
  restaurantId?: string | string[];
  restaurant?: string | string[];
  category?: {
    id: string;
    name: string;
  };
  category_id?: string;
}

export const useMenuFormCategories = (initialData?: InitialMenuData) => {
  console.log(' [useMenuFormCategories] Initialisation avec:', initialData);

  // États pour les restaurants sélectionnés
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>(() => {
     if (initialData?.dish_restaurants && Array.isArray(initialData.dish_restaurants)) {
      console.log(' Initialisation des restaurants depuis dish_restaurants');
      return initialData.dish_restaurants
        .map((relation) => relation.restaurant_id || (relation.restaurant?.id || ''))
        .filter(Boolean);
    }

     const restaurantIds = initialData?.restaurantId
      ? (Array.isArray(initialData.restaurantId)
          ? initialData.restaurantId
          : [initialData.restaurantId])
      : (initialData?.restaurant
          ? (Array.isArray(initialData.restaurant)
              ? initialData.restaurant
              : [initialData.restaurant])
          : []);

    console.log(' Initialisation des restaurants depuis les anciennes propriétés:', restaurantIds);
    return restaurantIds;
  });

  // États pour les catégories et restaurants
  const [categories, setCategories] = useState<OptionItem[]>([]);
  const [restaurants, setRestaurants] = useState<OptionItem[]>(defaultRestaurants);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(true);

   useEffect(() => {
    if (initialData?.category && typeof initialData.category === 'object') {
      console.log(' Catégorie actuelle trouvée dans initialData.category:', initialData.category);

      setCategories(prev => {
         const categoryExists = prev.some(cat => cat.value === initialData.category?.id);

        if (!categoryExists) {
           return [
            {
              value: initialData.category?.id || '',
              label: initialData.category?.name || ''
            },
            ...prev
          ];
        }

        return prev;
      });

      setIsLoadingCategories(false);
    }
    // Si le menu a un ID de catégorie
    else if (initialData?.category_id) {


       setIsLoadingCategories(true);
    }
  }, [initialData]);

  // Charger les catégories et restaurants au chargement du composant
  useEffect(() => {
    const fetchCategoriesAndRestaurants = async () => {
      // Charger les catégories
      setIsLoadingCategories(true);
      try {
        console.log(' Chargement de TOUTES les catégories depuis l\'API...');
        const categoriesData = await getAllCategories();

        if (categoriesData && Array.isArray(categoriesData)) {
          if (categoriesData.length > 0) {
            const formattedCategories = categoriesData.map(cat => ({
              value: cat.id || cat.name,
              label: cat.name
            }));
            setCategories(formattedCategories);
            console.log(' Toutes les catégories chargées avec succès');
          } else {
            toast.error('Aucune catégorie disponible');
          }
        } else {
          toast.error('Format de données de catégories invalide');
        }
      } catch (error) {
        console.error(' Erreur lors du chargement des catégories:', error);
        toast.error('Erreur lors du chargement des catégories');
      } finally {
        setIsLoadingCategories(false);
      }

      // Charger les restaurants
      setIsLoadingRestaurants(true);

      try {

        const restaurantsData = await getAllRestaurants();

        if (restaurantsData && Array.isArray(restaurantsData) && restaurantsData.length > 0) {
          const formattedRestaurants = restaurantsData.map(restaurant => ({
            value: restaurant.id || '',
            label: restaurant.name
          }));
          setRestaurants(formattedRestaurants);
          console.log(' Tous les restaurants chargés avec succès');

          // Vérifier si les restaurants sélectionnés existent dans les données chargées
          if (selectedRestaurants.length > 0) {
            const validRestaurantIds = selectedRestaurants.filter(id =>
              formattedRestaurants.some(r => r.value === id)
            );
            if (validRestaurantIds.length !== selectedRestaurants.length) {
              setSelectedRestaurants(validRestaurantIds);
            }
          }
        } else {
          console.warn(' Aucun restaurant trouvé ou format invalide');
        }
      } catch (error) {
        console.error(' Erreur lors du chargement des restaurants:', error);
        // Garder les restaurants par défaut
      } finally {
        setIsLoadingRestaurants(false);
      }
    };

    fetchCategoriesAndRestaurants();
  }, []);


  useEffect(() => {
    // Initialiser les restaurants à partir de dish_restaurants
    if (initialData?.dish_restaurants && Array.isArray(initialData.dish_restaurants)) {
      console.log('📂 Extraction des restaurants depuis dish_restaurants');

      // Extraire tous les restaurants uniques
      const restaurantsList = initialData.dish_restaurants
        .map((relation) => relation.restaurant)
        .filter((restaurant): restaurant is NonNullable<typeof restaurant> => restaurant != null);

      if (restaurantsList.length > 0) {
        setRestaurants(convertRestaurantsToOptions(restaurantsList));
        setIsLoadingRestaurants(false);
      }
    }

    // Initialiser la catégorie à partir de category
    if (initialData?.category) {
      console.log('📂 Extraction de la catégorie depuis initialData.category');

      // Si la catégorie est déjà un objet complet
      if (typeof initialData.category === 'object' && initialData.category !== null) {
        setCategories([{
          value: initialData.category.id,
          label: initialData.category.name
        }]);
      }

      setIsLoadingCategories(false);
    }
     
  }, [initialData]); // eslint-disable-next-line react-hooks/exhaustive-deps

  // Fonction pour ajouter les restaurants au FormData
  const addRestaurantsToFormData = (formData: FormData) => {
    // Ajouter les restaurants sélectionnés
    selectedRestaurants.forEach(id => {
      formData.append('restaurant_ids[]', id);
    });
  };

  return {
    selectedRestaurants,
    setSelectedRestaurants,
    categories,
    restaurants,
    isLoadingCategories,
    isLoadingRestaurants,
    addRestaurantsToFormData
  };
};
