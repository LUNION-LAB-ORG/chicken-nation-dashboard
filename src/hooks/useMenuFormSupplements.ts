import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getAllSupplements, convertSupplementsToOptions } from '@/services/supplementService';

// Fonction utilitaire pour extraire les IDs de suppléments
const extractSupplementIds = (supplements: any, type: string): string[] => {
  if (!supplements || !supplements[type]) return [];
  
  return Object.keys(supplements[type])
    .filter(id => id && id !== 'undefined' && id !== 'null')
    .map(id => id);
};

 const extractSupplementQuantities = (supplements: any, type: string): Record<string, number> => {
  if (!supplements || !supplements[type]) return {};
  
  return Object.entries(supplements[type])
    .filter(([id]) => id && id !== 'undefined' && id !== 'null')
    .reduce((acc: Record<string, number>, [id, quantity]: [string, any]) => {
      acc[id] = Number(quantity) || 1;
      return acc;
    }, {});
};

export const useMenuFormSupplements = (initialData?: any) => { 
 
  const extractSupplementsFromInitialData = () => {
    if (!initialData?.dish_supplements || !Array.isArray(initialData.dish_supplements)) {
   
      return {
        accessoryIds: [],
        foodIds: [],
        drinkIds: []
      };
    }
    
 
    const accessoryIds = initialData.dish_supplements
      .filter((relation: any) => {
        const isAccessory = relation.supplement?.type === 'ACCESSORY' || relation.type === 'ACCESSORY';
      
        return isAccessory;
      })
      .map((relation: any) => {
        const id = relation.supplement_id || (relation.supplement?.id || '');
     
        return id;
      })
      .filter(Boolean);
    
    const foodIds = initialData.dish_supplements
      .filter((relation: any) => {
        const isFood = relation.supplement?.type === 'FOOD' || relation.type === 'FOOD';
        
        return isFood;
      })
      .map((relation: any) => {
        const id = relation.supplement_id || (relation.supplement?.id || '');
      
        return id;
      })
      .filter(Boolean);
    
    const drinkIds = initialData.dish_supplements
      .filter((relation: any) => {
        const isDrink = relation.supplement?.type === 'DRINK' || relation.type === 'DRINK';
   
        return isDrink;
      })
      .map((relation: any) => {
        const id = relation.supplement_id || (relation.supplement?.id || '');
       
        return id;
      })
      .filter(Boolean);
   
    
    return {
      accessoryIds,
      foodIds,
      drinkIds
    };
  };
  
   const { accessoryIds, foodIds, drinkIds } = extractSupplementsFromInitialData();
  
   const [selectedIngredients, setSelectedIngredients] = useState<string[]>(accessoryIds);
  const [selectedAccompagnements, setSelectedAccompagnements] = useState<string[]>(foodIds);
  const [selectedBoissons, setSelectedBoissons] = useState<string[]>(drinkIds);
  
   const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>(() => {
     if (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements)) {
      console.log(' Initialisation des quantités d\'ingrédients depuis dish_supplements');
      return initialData.dish_supplements
        .filter((relation: any) => 
          relation.supplement?.type === 'ACCESSORY' || 
          (relation.type === 'ACCESSORY')
        )
        .reduce((acc: Record<string, number>, relation: any) => {
          const id = relation.supplement_id || (relation.supplement?.id || '');
          if (id) {
            acc[id] = relation.quantity || 1;
          }
          return acc;
        }, {});
    }
    
     if (initialData?.supplements?.ACCESSORY) {
      console.log(' Initialisation des quantités d\'ingrédients depuis supplements.ACCESSORY');
      return extractSupplementQuantities(initialData.supplements, 'ACCESSORY');
    }
    
    return {};
  });
  
  const [accompagnementQuantities, setAccompagnementQuantities] = useState<Record<string, number>>(() => {
     if (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements)) {
      console.log(' Initialisation des quantités d\'accompagnements depuis dish_supplements');
      return initialData.dish_supplements
        .filter((relation: any) => 
          relation.supplement?.type === 'FOOD' || 
          (relation.type === 'FOOD')
        )
        .reduce((acc: Record<string, number>, relation: any) => {
          const id = relation.supplement_id || (relation.supplement?.id || '');
          if (id) {
            acc[id] = relation.quantity || 1;
          }
          return acc;
        }, {});
    }
    
     if (initialData?.supplements?.FOOD) {
      console.log(' Initialisation des quantités d\'accompagnements depuis supplements.FOOD');
      return extractSupplementQuantities(initialData.supplements, 'FOOD');
    }
    
    return {};
  });
  
  const [boissonQuantities, setBoissonQuantities] = useState<Record<string, number>>(() => {
     if (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements)) {
      console.log(' Initialisation des quantités de boissons depuis dish_supplements');
      return initialData.dish_supplements
        .filter((relation: any) => 
          relation.supplement?.type === 'DRINK' || 
          (relation.type === 'DRINK')
        )
        .reduce((acc: Record<string, number>, relation: any) => {
          const id = relation.supplement_id || (relation.supplement?.id || '');
          if (id) {
            acc[id] = relation.quantity || 1;
          }
          return acc;
        }, {});
    }
    
     if (initialData?.supplements?.DRINK) {
      console.log(' Initialisation des quantités de boissons depuis supplements.DRINK');
      return extractSupplementQuantities(initialData.supplements, 'DRINK');
    }
    
    return {};
  });
  
  // États pour les options de suppléments
  const [ingredientOptions, setIngredientOptions] = useState<any[]>([]);
  const [accompagnementOptions, setAccompagnementOptions] = useState<any[]>([]);
  const [boissonOptions, setBoissonOptions] = useState<any[]>([]);
  
  // État de chargement
  const [isLoadingSupplements, setIsLoadingSupplements] = useState(true);
  const [supplementsLoaded, setSupplementsLoaded] = useState(false);
  
   useEffect(() => {
     if (supplementsLoaded) return;
    
    const fetchSupplements = async () => {
      setIsLoadingSupplements(true);
      
      try {
        console.log(' Chargement de TOUS les suppléments depuis l\'API...');
        const data = await getAllSupplements();
        
        // Convertir les suppléments en options pour les sélecteurs
        if (data.ACCESSORY) {
          const accessoryOptions = convertSupplementsToOptions(data.ACCESSORY);
          setIngredientOptions(accessoryOptions);
          
          // Vérifier si les ingrédients sélectionnés existent dans les options
          if (selectedIngredients.length > 0) {
            console.log(' Vérification des ingrédients sélectionnés:', selectedIngredients);
            
            // Ajouter les suppléments manquants aux options si nécessaire
            if (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements)) {
              const missingIngredients = initialData.dish_supplements
                .filter((relation: any) => 
                  (relation.supplement?.type === 'ACCESSORY' || relation.type === 'ACCESSORY') &&
                  relation.supplement &&
                  !accessoryOptions.some(opt => opt.value === (relation.supplement_id || relation.supplement.id))
                )
                .map((relation: any) => relation.supplement);
              
              if (missingIngredients.length > 0) {
                console.log(' Ajout des ingrédients manquants aux options:', missingIngredients);
                const additionalOptions = convertSupplementsToOptions(missingIngredients);
                setIngredientOptions([...accessoryOptions, ...additionalOptions]);
              }
            }
            
             const validIngredientIds = selectedIngredients.filter(id => 
              accessoryOptions.some(option => option.value === id) || 
              (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements) && 
               initialData.dish_supplements.some(relation => 
                 (relation.supplement_id === id || relation.supplement?.id === id) && 
                 (relation.supplement?.type === 'ACCESSORY' || relation.type === 'ACCESSORY')
               ))
            );
            
            if (validIngredientIds.length !== selectedIngredients.length) {
              console.warn(' Certains ingrédients sélectionnés n\'existent pas dans les options:', 
                selectedIngredients.filter(id => !validIngredientIds.includes(id))
              );
              setSelectedIngredients(validIngredientIds);
            }
          }
        }
        
        if (data.FOOD) {
          const foodOptions = convertSupplementsToOptions(data.FOOD);
          setAccompagnementOptions(foodOptions);
          
           if (selectedAccompagnements.length > 0) {
             
             if (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements)) {
              const missingAccompagnements = initialData.dish_supplements
                .filter((relation: any) => 
                  (relation.supplement?.type === 'FOOD' || relation.type === 'FOOD') &&
                  relation.supplement &&
                  !foodOptions.some(opt => opt.value === (relation.supplement_id || relation.supplement.id))
                )
                .map((relation: any) => relation.supplement);
              
              if (missingAccompagnements.length > 0) {
                console.log(' Ajout des accompagnements manquants aux options:', missingAccompagnements);
                const additionalOptions = convertSupplementsToOptions(missingAccompagnements);
                setAccompagnementOptions([...foodOptions, ...additionalOptions]);
              }
            }
            
            // Vérifier si les IDs sélectionnés existent dans les options
            const validAccompagnementIds = selectedAccompagnements.filter(id => 
              foodOptions.some(option => option.value === id) || 
              (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements) && 
               initialData.dish_supplements.some(relation => 
                 (relation.supplement_id === id || relation.supplement?.id === id) && 
                 (relation.supplement?.type === 'FOOD' || relation.type === 'FOOD')
               ))
            );
            
            if (validAccompagnementIds.length !== selectedAccompagnements.length) {
              console.warn(' Certains accompagnements sélectionnés n\'existent pas dans les options:', 
                selectedAccompagnements.filter(id => !validAccompagnementIds.includes(id))
              );
              setSelectedAccompagnements(validAccompagnementIds);
            }
          }
        }
        
        if (data.DRINK) {
          const drinkOptions = convertSupplementsToOptions(data.DRINK);
          setBoissonOptions(drinkOptions);
          
          // Vérifier si les boissons sélectionnées existent dans les options
          if (selectedBoissons.length > 0) {
            console.log(' Vérification des boissons sélectionnées:', selectedBoissons);
            
            // Ajouter les suppléments manquants aux options si nécessaire
            if (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements)) {
              const missingBoissons = initialData.dish_supplements
                .filter((relation: any) => 
                  (relation.supplement?.type === 'DRINK' || relation.type === 'DRINK') &&
                  relation.supplement &&
                  !drinkOptions.some(opt => opt.value === (relation.supplement_id || relation.supplement.id))
                )
                .map((relation: any) => relation.supplement);
              
              if (missingBoissons.length > 0) {
                console.log(' Ajout des boissons manquantes aux options:', missingBoissons);
                const additionalOptions = convertSupplementsToOptions(missingBoissons);
                setBoissonOptions([...drinkOptions, ...additionalOptions]);
              }
            }
            
            // Vérifier si les IDs sélectionnés existent dans les options
            const validBoissonIds = selectedBoissons.filter(id => 
              drinkOptions.some(option => option.value === id) || 
              (initialData?.dish_supplements && Array.isArray(initialData.dish_supplements) && 
               initialData.dish_supplements.some(relation => 
                 (relation.supplement_id === id || relation.supplement?.id === id) && 
                 (relation.supplement?.type === 'DRINK' || relation.type === 'DRINK')
               ))
            );
            
            if (validBoissonIds.length !== selectedBoissons.length) {
              console.warn(' Certaines boissons sélectionnées n\'existent pas dans les options:', 
                selectedBoissons.filter(id => !validBoissonIds.includes(id))
              );
              setSelectedBoissons(validBoissonIds);
            }
          }
        }
        
        // Marquer les suppléments comme chargés
        setSupplementsLoaded(true);
        console.log(' Tous les suppléments chargés avec succès');
      } catch (error) {
        console.error(' Erreur lors du chargement des suppléments:', error);
        toast.error('Impossible de charger les suppléments');
      } finally {
        setIsLoadingSupplements(false);
      }
    };

    fetchSupplements();
  }, [supplementsLoaded, selectedIngredients, selectedAccompagnements, selectedBoissons, initialData]);
  
   useEffect(() => {
    
  }, [
    selectedIngredients, 
    selectedAccompagnements, 
    selectedBoissons,
    ingredientQuantities,
    accompagnementQuantities,
    boissonQuantities
  ]);
  
  // Fonctions de gestion des changements
  const handleIngredientChange = (selected: string[]) => {
    // Limiter à 3 éléments maximum
    const limitedSelection = selected.slice(0, 3);
    setSelectedIngredients(limitedSelection);
  };
  
  const handleAccompagnementChange = (selected: string[]) => {
    // Limiter à 3 éléments maximum
    const limitedSelection = selected.slice(0, 3);
    setSelectedAccompagnements(limitedSelection);
  };
  
  const handleBoissonChange = (selected: string[]) => {
    // Limiter à 3 éléments maximum
    const limitedSelection = selected.slice(0, 3);
    setSelectedBoissons(limitedSelection);
  };
  
  // Fonction pour gérer le changement de quantité
  const handleProductQuantityChange = (category: 'ingredients' | 'accompagnements' | 'boissons', productId: string, change: number) => {
    if (category === 'ingredients') {
      setIngredientQuantities(prev => ({
        ...prev,
        [productId]: Math.max(0, (prev[productId] || 0) + change)
      }));
    } else if (category === 'accompagnements') {
      setAccompagnementQuantities(prev => ({
        ...prev,
        [productId]: Math.max(0, (prev[productId] || 0) + change)
      }));
    } else if (category === 'boissons') {
      setBoissonQuantities(prev => ({
        ...prev,
        [productId]: Math.max(0, (prev[productId] || 0) + change)
      }));
    }
  };
  
  // Fonction pour ajouter les suppléments au FormData
  const addSupplementsToFormData = (formData: FormData) => {
    // Ajouter les ingrédients
    selectedIngredients.forEach(id => {
      formData.append('supplements[ACCESSORY][' + id + ']', (ingredientQuantities[id] || 1).toString());
    });
    
    // Ajouter les accompagnements
    selectedAccompagnements.forEach(id => {
      formData.append('supplements[FOOD][' + id + ']', (accompagnementQuantities[id] || 1).toString());
    });
    
    // Ajouter les boissons
    selectedBoissons.forEach(id => {
      formData.append('supplements[DRINK][' + id + ']', (boissonQuantities[id] || 1).toString());
    });
  };
  
  return {
    selectedIngredients,
    selectedAccompagnements,
    selectedBoissons,
    ingredientQuantities,
    accompagnementQuantities,
    boissonQuantities,
    ingredientOptions,
    accompagnementOptions,
    boissonOptions,
    isLoadingSupplements,
    supplementsLoaded,
    handleIngredientChange,
    handleAccompagnementChange,
    handleBoissonChange,
    handleProductQuantityChange,
    addSupplementsToFormData
  };
};
