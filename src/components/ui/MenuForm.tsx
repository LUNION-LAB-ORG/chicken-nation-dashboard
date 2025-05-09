"use client"

import React, { useState, useRef, useEffect } from 'react'
import Checkbox from '@/components/ui/Checkbox'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { MenuItem } from '@/types' 
import { getAllSupplements, convertSupplementsToOptions } from '@/services/supplementService'
import { getAllCategories } from '@/services/categoryService'
import { getAllRestaurants } from '@/services/restaurantService'
import { toast } from 'react-hot-toast'
import { formatImageUrl } from '@/utils/imageHelpers'
import SelectWithCheckboxes from './SelectWithCheckboxes'
import SelectWithCheckboxesAndImages from './SelectWithCheckboxesAndImages' 
import SimpleSelect from '@/components/ui/SimpleSelect'
import { 
  SupplementType,  
} from '@/utils/supplementHelpers'

const defaultRestaurants = [
  { value: 'zone4', label: 'Chicken Nation Zone 4' },
  { value: 'angre', label: 'Chicken Nation Angré' },
]

interface MenuFormProps {
  initialData?: MenuItem;
  onCancel?: () => void;
  onSubmit: (menuData: MenuItem) => void;
  submitLabel?: string;
}

const MenuForm = ({ initialData, onCancel, onSubmit, submitLabel = 'Enregistrer' }: MenuFormProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState({
    title: initialData?.name || '',
    description: initialData?.description || '',
    price: initialData?.price || '',
    reducedPrice: initialData?.promotion_price || '',
    reduction: initialData?.is_promotion || false,
    category: initialData?.categoryId ? [initialData.categoryId] : [],
    restaurant: typeof initialData?.restaurantId === 'string' ? initialData.restaurantId : '',
    supplements: {
      ingredients: {
        category: '',
        quantity: 0
      },
      accompagnements: {
        category: '',
        quantity: 0
      },
      boissons: {
        category: '',
        quantity: 0
      }
    }
  })
  const [imagePreview, setImagePreview] = useState<string | null>(
    initialData?.image ? formatImageUrl(initialData.image) : null
  )
  const [imageError, setImageError] = useState<string | null>(null)
  const [selectedRestaurants, setSelectedRestaurants] = useState<string[]>([]);
  
  
  const [supplementOptions, setSupplementOptions] = useState<Record<SupplementType, any[]>>({
    [SupplementType.ACCESSORY]: [],
    [SupplementType.FOOD]: [],
    [SupplementType.DRINK]: [],
    [SupplementType.OTHER]: []
  });

   
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [selectedAccompagnements, setSelectedAccompagnements] = useState<string[]>([]);
  const [selectedBoissons, setSelectedBoissons] = useState<string[]>([]);

 
  const [ingredientOptions, setIngredientOptions] = useState<any[]>([]);
  const [accompagnementOptions, setAccompagnementOptions] = useState<any[]>([]);
  const [boissonOptions, setBoissonOptions] = useState<any[]>([]);
  
 
  const [ingredientQuantities, setIngredientQuantities] = useState<Record<string, number>>({});
  const [accompagnementQuantities, setAccompagnementQuantities] = useState<Record<string, number>>({});
  const [boissonQuantities, setBoissonQuantities] = useState<Record<string, number>>({});
  
  const [isLoadingSupplements, setIsLoadingSupplements] = useState(false);
  
 
  const [categories, setCategories] = useState<any[]>([]);
  const [restaurants, setRestaurants] = useState<any[]>(defaultRestaurants);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

 
  const getSafeImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return '/images/burger.png';
    if (imageUrl.startsWith('data:')) return imageUrl;
    return formatImageUrl(imageUrl);
  };

 
  useEffect(() => {
    const fetchCategoriesAndRestaurants = async () => {
      // Charger les catégories
      setIsLoadingCategories(true);
      try {
        const categoriesData = await getAllCategories();
        
        if (categoriesData && Array.isArray(categoriesData)) {
          if (categoriesData.length > 0) {
            const formattedCategories = categoriesData.map(cat => ({
              value: cat.id || cat.name,
              label: cat.name
            }));
            setCategories(formattedCategories);
            
             if (initialData && initialData.categoryId) {
               const categoryExists = formattedCategories.some(cat => cat.value === initialData.categoryId);
              if (!categoryExists) {
                console.warn(`La catégorie ${initialData.categoryId} n'existe pas dans les options disponibles`);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
       } finally {
        setIsLoadingCategories(false);
      }
      
       setIsLoadingRestaurants(true);
      try {
        const restaurantsData = await getAllRestaurants();
        if (restaurantsData && Array.isArray(restaurantsData) && restaurantsData.length > 0) {
          const formattedRestaurants = restaurantsData.map(restaurant => {
             const id = restaurant.id || '';
            return {
              value: id,
              label: restaurant.name || 'Restaurant sans nom'
            };
          }).filter(item => item.value !== ''); 
          
          setRestaurants(formattedRestaurants);
           initializeSelectedRestaurants(formattedRestaurants);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des restaurants:', error);
       } finally {
        setIsLoadingRestaurants(false);
      }
    };
    
    fetchCategoriesAndRestaurants();
  }, [initialData]);

   const initializeSelectedRestaurants = (availableRestaurants: any[]) => {
    const selectedIds: string[] = [];
    
     if (initialData?.dish_restaurants && initialData.dish_restaurants.length > 0) {
      // Extraire les IDs des restaurants
      initialData.dish_restaurants.forEach(relation => {
        let restaurantId = null;
        
         if (relation.restaurant_id) {
          restaurantId = relation.restaurant_id;
        } else if (relation.restaurant && relation.restaurant.id) {
          restaurantId = relation.restaurant.id;
        } else if (typeof relation === 'string') {
          restaurantId = relation;
        } else if (relation.id) {
          restaurantId = relation.id;
        }
        
         if (restaurantId && typeof restaurantId === 'string' && restaurantId.trim() !== '') {
          selectedIds.push(restaurantId);
        }
      });
    }
     else if (initialData?.restaurantId) {
      if (Array.isArray(initialData.restaurantId)) {
        initialData.restaurantId.forEach(id => {
          if (typeof id === 'string' && id.trim() !== '') {
            selectedIds.push(id);
          }
        });
      } else if (typeof initialData.restaurantId === 'string' && initialData.restaurantId.trim() !== '') {
         selectedIds.push(initialData.restaurantId);
      }
    }
    
     if (selectedIds.length === 0 && availableRestaurants.length > 0) {
      availableRestaurants.forEach(restaurant => {
        if (restaurant.value && typeof restaurant.value === 'string') {
          selectedIds.push(restaurant.value);
        }
      });
    }
    
    // Mettre à jour l'état avec les restaurants sélectionnés
    setSelectedRestaurants(selectedIds);
  };

  // Charger les suppléments au chargement du composant
  useEffect(() => {
    const fetchSupplements = async () => {
      setIsLoadingSupplements(true);
      try {
        const data = await getAllSupplements();
        
        // Initialiser les options pour chaque type de supplément
        if (data.ACCESSORY) {
          setIngredientOptions(convertSupplementsToOptions(data.ACCESSORY));
        }
        
        if (data.FOOD) {
          setAccompagnementOptions(convertSupplementsToOptions(data.FOOD));
        }
        
        if (data.DRINK) {
          setBoissonOptions(convertSupplementsToOptions(data.DRINK));
        }

        // Si c'est une création (pas d'initialData), réinitialiser les états
        if (!initialData) {
          setSelectedIngredients([]);
          setIngredientQuantities({});
          setSelectedAccompagnements([]);
          setAccompagnementQuantities({});
          setSelectedBoissons([]);
          setBoissonQuantities({});
        } else if (initialData.dish_supplements && initialData.dish_supplements.length > 0) {
          // Si c'est une modification, initialiser avec les suppléments existants
          setTimeout(() => {
            initializeSupplements(initialData.dish_supplements);
          }, 0);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des suppléments:', error);
        toast.error('Impossible de charger les suppléments');
      } finally {
        setIsLoadingSupplements(false);
      }
    };
    
    fetchSupplements();
  }, [initialData]);

  const initializeSupplements = (dishSupplements: any[]) => {
    if (!dishSupplements || !Array.isArray(dishSupplements) || dishSupplements.length === 0) {
      return;
    }

    // Initialisation des tableaux et objets pour stocker les données
    const ingredients: string[] = [];
    const ingredientsQty: Record<string, number> = {};
    const accompagnements: string[] = [];
    const accompagnementsQty: Record<string, number> = {};
    const boissons: string[] = [];
    const boissonsQty: Record<string, number> = {};

    // Traitement de chaque supplément
    dishSupplements.forEach((item) => {
      const supplementId = item.supplement_id || (item.supplement?.id || '');
      if (!supplementId) return;

      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      let type = item.supplement?.category || item.supplement?.type || item.type;
      
      if (!type && item.supplement?.name) {
        const name = item.supplement.name.toLowerCase();
        if (name.includes('boisson') || name.includes('drink') || name.includes('soda')) {
          type = 'DRINK';
        } else if (name.includes('frite') || name.includes('riz') || name.includes('accompagnement')) {
          type = 'FOOD';
        } else {
          type = 'ACCESSORY';
        }
      }

      switch (type) {
        case 'ACCESSORY':
          ingredients.push(supplementId);
          ingredientsQty[supplementId] = quantity;
          break;
        case 'FOOD':
          accompagnements.push(supplementId);
          accompagnementsQty[supplementId] = quantity;
          break;
        case 'DRINK':
          boissons.push(supplementId);
          boissonsQty[supplementId] = quantity;
          break;
        default:
          if (ingredientOptions.some(opt => opt.value === supplementId)) {
            ingredients.push(supplementId);
            ingredientsQty[supplementId] = quantity;
          } else if (accompagnementOptions.some(opt => opt.value === supplementId)) {
            accompagnements.push(supplementId);
            accompagnementsQty[supplementId] = quantity;
          } else if (boissonOptions.some(opt => opt.value === supplementId)) {
            boissons.push(supplementId);
            boissonsQty[supplementId] = quantity;
          }
      }
    });

    // Log unique avec toutes les données
    console.log("=== ÉTAT DES SUPPLÉMENTS ===", {
      donnéesReçues: dishSupplements,
      optionsDisponibles: {
        ingrédients: ingredientOptions,
        accompagnements: accompagnementOptions,
        boissons: boissonOptions
      },
      supplémentsInitialisés: {
        ingrédients: {
          ids: ingredients,
          quantités: ingredientsQty
        },
        accompagnements: {
          ids: accompagnements,
          quantités: accompagnementsQty
        },
        boissons: {
          ids: boissons,
          quantités: boissonsQty
        }
      }
    });

    // Mise à jour des états
    setSelectedIngredients(ingredients);
    setIngredientQuantities(ingredientsQty);
    setSelectedAccompagnements(accompagnements);
    setAccompagnementQuantities(accompagnementsQty);
    setSelectedBoissons(boissons);
    setBoissonQuantities(boissonsQty);
  };

  // Mettre à jour les gestionnaires de changement pour maintenir les quantités
  const handleIngredientChange = (selectedIds: string[]) => {
    const limitedSelection = selectedIds.slice(0, 3);
    setSelectedIngredients(limitedSelection);
    
    // Mettre à jour les quantités pour les nouveaux ingrédients
    const newQuantities = { ...ingredientQuantities };
    limitedSelection.forEach(id => {
      if (!newQuantities[id]) {
        newQuantities[id] = 1;
      }
    });
    setIngredientQuantities(newQuantities);
  };

  const handleAccompagnementChange = (selectedIds: string[]) => {
    const limitedSelection = selectedIds.slice(0, 3);
    setSelectedAccompagnements(limitedSelection);
    
    // Mettre à jour les quantités pour les nouveaux accompagnements
    const newQuantities = { ...accompagnementQuantities };
    limitedSelection.forEach(id => {
      if (!newQuantities[id]) {
        newQuantities[id] = 1;
      }
    });
    setAccompagnementQuantities(newQuantities);
  };

  const handleBoissonChange = (selectedIds: string[]) => {
    const limitedSelection = selectedIds.slice(0, 3);
    setSelectedBoissons(limitedSelection);
    
    // Mettre à jour les quantités pour les nouvelles boissons
    const newQuantities = { ...boissonQuantities };
    limitedSelection.forEach(id => {
      if (!newQuantities[id]) {
        newQuantities[id] = 1;
      }
    });
    setBoissonQuantities(newQuantities);
  };

  const handleSupplementCategoryChange = (type: keyof typeof formData.supplements, value: string) => {
    setFormData({
      ...formData,
      supplements: {
        ...formData.supplements,
        [type]: {
          ...formData.supplements[type],
          category: value
        }
      }
    })
  }

  const handleSupplementQuantityChange = (type: keyof typeof formData.supplements, value: number) => {
    setFormData({
      ...formData,
      supplements: {
        ...formData.supplements,
        [type]: {
          ...formData.supplements[type],
          quantity: Math.max(0, value)
        }
      }
    })
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Validation des données
      if (!formData.title || !formData.price) {
        toast.error('Le titre et le prix sont obligatoires');
        setIsSubmitting(false);
        return;
      }

      // Validation de la réduction
      if (formData.reduction && (!formData.reducedPrice || Number(formData.reducedPrice) >= Number(formData.price))) {
        toast.error('Le prix réduit doit être inférieur au prix normal');
        setIsSubmitting(false);
        return;
      }

      // Préparation des suppléments pour l'envoi
      const dishSupplements = [
        ...selectedIngredients.map(id => {
          const option = ingredientOptions.find(opt => opt.value === id);
          return {
            supplement_id: id,
            quantity: ingredientQuantities[id] || 1,
            supplement: {
              id,
              name: option?.label || '',
              type: 'ACCESSORY'
            }
          };
        }),
        ...selectedAccompagnements.map(id => {
          const option = accompagnementOptions.find(opt => opt.value === id);
          return {
            supplement_id: id,
            quantity: accompagnementQuantities[id] || 1,
            supplement: {
              id,
              name: option?.label || '',
              type: 'FOOD'
            }
          };
        }),
        ...selectedBoissons.map(id => {
          const option = boissonOptions.find(opt => opt.value === id);
          return {
            supplement_id: id,
            quantity: boissonQuantities[id] || 1,
            supplement: {
              id,
              name: option?.label || '',
              type: 'DRINK'
            }
          };
        })
      ];

      // Log unique pour la soumission
      console.log("=== SOUMISSION DU FORMULAIRE ===", {
        données: {
          id: initialData?.id || '',
          nom: formData.title,
          prix: formData.price,
          prixReduit: formData.reducedPrice,
          promotion: formData.reduction,
          categorie: formData.category[0],
          restaurants: selectedRestaurants,
        },
        suppléments: {
          ingrédients: {
            sélectionnés: selectedIngredients,
            quantités: ingredientQuantities
          },
          accompagnements: {
            sélectionnés: selectedAccompagnements,
            quantités: accompagnementQuantities
          },
          boissons: {
            sélectionnés: selectedBoissons,
            quantités: boissonQuantities
          }
        }
      });
      
      // Création de l'objet MenuItem à envoyer
      const menuData = {
        id: initialData?.id || '',
        name: formData.title,
        categoryId: formData.category[0],
        price: formData.price,
        description: formData.description,
        image: getSafeImageUrl(imagePreview),
        isAvailable: true,
        isNew: false,
        restaurant: '',
        restaurantId: selectedRestaurants.length > 0 ? selectedRestaurants : formData.restaurant,
        rating: 0,
        supplements: {
          ACCESSORY: selectedIngredients.map(id => {
            const option = ingredientOptions.find(opt => opt.value === id);
            return {
              id,
              name: option?.label || '',
              quantity: ingredientQuantities[id] || 1,
              type: 'ACCESSORY'
            };
          }),
          FOOD: selectedAccompagnements.map(id => {
            const option = accompagnementOptions.find(opt => opt.value === id);
            return {
              id,
              name: option?.label || '',
              quantity: accompagnementQuantities[id] || 1,
              type: 'FOOD'
            };
          }),
          DRINK: selectedBoissons.map(id => {
            const option = boissonOptions.find(opt => opt.value === id);
            return {
              id,
              name: option?.label || '',
              quantity: boissonQuantities[id] || 1,
              type: 'DRINK'
            };
          })
        },
        reviews: [],
        totalReviews: 0,
        is_promotion: formData.reduction,
        promotion_price: formData.reduction ? formData.reducedPrice : undefined,
        dish_supplements: dishSupplements
      };

      onSubmit(menuData);
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      toast.error('Une erreur est survenue lors de la soumission du formulaire');
    } finally {
      setIsSubmitting(false);
    }
  }

  const isEditing = !!initialData;

  return (
    <motion.form 
      onSubmit={handleSubmit} 
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Zone de téléchargement d'image */}
      <motion.div 
        className="w-full lg:w-1/2 bg-[#F5F5F5] rounded-xl flex items-center justify-start min-h-[300px] relative overflow-hidden"
        whileHover={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <AnimatePresence>
          {imagePreview ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative w-full h-[300px] border border-orange-200 hover:border-[#F17922] 
              transition-colors rounded-xl"
            >
              <Image
                src={getSafeImageUrl(imagePreview)}
                alt="Prévisualisation du menu"
                className="w-full rounded-xl h-full object-conain"
                width={140}
                height={120}
              />
              <motion.div 
                onClick={() => setImagePreview(null)}
                className="absolute top-3 right-3 p-1 bg-white cursor-pointer rounded-xl text-[#F17922] 
                 border-[#F17922] border-1 hover:border-[#F17922] text-sm px-[10px]"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
               Modifier
              </motion.div>
            </motion.div>
          ) : (
            <motion.label
              htmlFor="image-upload"
              className="cursor-pointer flex items-center justify-center h-full w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="p-2 px-3 bg-[#D9D9D9] rounded-xl">
                <p className="text-sm text-gray-600">Ajouter une photo du menu</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                id="image-upload"
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (!file) return

                  if (!file.type.startsWith('image/')) {
                    setImageError('Veuillez sélectionner une image valide')
                    return
                  }

                  if (file.size > 5 * 1024 * 1024) {
                    setImageError('L\'image ne doit pas dépasser 5MB')
                    return
                  }

                  const reader = new FileReader()
                  reader.onloadend = () => {
                    setImagePreview(reader.result as string)
                    setImageError(null)
                  }
                  reader.onerror = () => {
                    setImageError('Erreur lors de la lecture du fichier')
                  }
                  reader.readAsDataURL(file)
                }}
              />
            </motion.label>
          )}
        </AnimatePresence>
      </motion.div>

      {imageError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-500 text-sm text-center"
        >
          {imageError}
        </motion.div>
      )}

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {/* Colonne gauche */}
        <div className="space-y-6">
          {/* Titre */}
          <motion.div 
            className='w-full px-3 py-2 border-2 border-[#D9D9D9]/50 rounded-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-[#F17922] focus-within:border-transparent'
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full py-2 text-[13px] focus:outline-none focus:border-transparent text-[#595959] font-semibold"
              placeholder="Ajouter un titre"
            />
          </motion.div>

          {/* Prix de vente */}
          <motion.div 
            className='w-full px-3 py-2 border-2 border-[#D9D9D9]/50 rounded-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-[#F17922] focus-within:border-transparent'
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="relative">
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full py-2 text-[13px] focus:outline-none focus:border-transparent text-[#595959] font-semibold"
                placeholder="0.00"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] text-[#acacac] font-semibold bg-[#D9D9D9] p-1 px-4 rounded-xl">XOF</span>
            </div>
          </motion.div>

          {/* Réduction */}
          <motion.div 
            className="space-y-2 w-full px-3 py-2 border-2 border-[#D9D9D9]/50 rounded-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-[#F17922] focus-within:border-transparent"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <div className="flex items-center">
              <Checkbox
                id="reduction"
                checked={formData.reduction}
                onChange={(checked) => {
                  console.log('🔄 Changement de l\'état de réduction:', checked);
                  setFormData(prev => ({
                    ...prev,
                    reduction: checked,
                    reducedPrice: checked ? prev.reducedPrice || '' : ''
                  }));
                }}
              />
              <label htmlFor="reduction" className="ml-2 text-[13px] font-semibold text-gray-700">
                Réduction
              </label>
            </div>
            <AnimatePresence>
              {formData.reduction && (
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    type="number"
                    value={formData.reducedPrice}
                    onChange={(e) => {
                      const value = e.target.value;
                      console.log('💰 Changement du prix réduit:', value);
                      if (value === '' || (Number(value) >= 0 && Number(value) < Number(formData.price))) {
                        setFormData(prev => ({
                          ...prev,
                          reducedPrice: value
                        }));
                      }
                    }}
                    className="w-full px-2 py-2 text-[13px] focus:outline-none text-[#595959] font-semibold focus:border-transparent"
                    placeholder="0.00"
                    min="0"
                    max={formData.price}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[#acacac] font-semibold bg-[#D9D9D9] p-1 px-4 rounded-xl">XOF</span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Description */}
          <motion.div 
            className=' w-full px-3 py-2 border-2 border-[#D9D9D9]/50 rounded-2xl focus-within:ring-2 focus-within:ring-[#F17922] focus-within:border-transparent'
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full text-[#595959] font-semibold text-[13px] py-2 focus:outline-none 
              focus:border-transparent"
              rows={4}
              placeholder="4 Morceaux,
                       1 Portion, de frites,
                       1 Coleslaw,
                       1 crème à l'ail,
                       1 sauce cheddar"
            />
          </motion.div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-6">
          {/* Catégorie */} 
          <motion.div 
            className="  px-3 py-4 border-2 border-[#D9D9D9]/50 flex items-center justify-between rounded-2xl 
           "
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <span className="text-lg text-[#595959] font-semibold">Catégorie</span>

            <div className="ml-2 min-w-0 w-52 relative z-50">
              <SimpleSelect
                options={categories}
                value={formData.category[0] || ''}
                onChange={(value) => setFormData({ ...formData, category: [value] })}
                placeholder="Choisissez une catégorie"
              />
            </div>
          </motion.div>

          {/* Restaurant */}
          <motion.div 
            className="w-full px-3 py-2 border-2 border-[#d8d8d8] rounded-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-[#F17922] focus-within:border-transparent"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <h3 className="text-lg font-medium text-[#595959] mb-2">Choisissez les restaurants</h3>
            <SelectWithCheckboxes
              value={selectedRestaurants}
              onChange={setSelectedRestaurants}
              options={restaurants}
              placeholder="Sélectionnez les restaurants"
              className=""
            />
          </motion.div>

          {/* Suppléments */}
          <div className="border-2 border-[#D9D9D9]/50 rounded-2xl p-4 space-y-4">
            <h3 className="text-lg font-medium text-[#595959]">Suppléments</h3>
            
            {/* Ingrédients */}
            <motion.div 
              className="w-full px-3 py-2 border-2 border-[#d8d8d8] rounded-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-[#F17922] focus-within:border-transparent relative"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-full flex items-center">
                <div className="flex-grow">
                  <SelectWithCheckboxesAndImages
                    value={selectedIngredients}
                    onChange={handleIngredientChange}
                    options={isLoadingSupplements ? [] : ingredientOptions}
                    placeholder="Sélectionnez une catégorie d'ingrédients"
                  />
                 </div>

                <div className="ml-2 text-[13px] text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {selectedIngredients.length}/3
                </div>
              </div>
              
            </motion.div>

            {/* Accompagnements */}
            <motion.div 
              className="w-full px-3 py-2 border-2 border-[#d8d8d8] rounded-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-[#F17922] focus-within:border-transparent"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-full flex items-center">
                <div className="flex-grow">
                  <SelectWithCheckboxesAndImages
                    value={selectedAccompagnements}
                    onChange={handleAccompagnementChange}
                    options={isLoadingSupplements ? [] : accompagnementOptions}
                    placeholder="Sélectionnez une catégorie d'accompagnements"
                  />
                 </div>

                <div className="ml-2 text-[13px] text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {selectedAccompagnements.length}/3
                </div>
              </div>
            
            </motion.div>

            {/* Boissons */}
            <motion.div 
              className="w-full px-3 py-2 border-2 border-[#d8d8d8] rounded-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-[#F17922] focus-within:border-transparent"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="w-full flex items-center">
                <div className="flex-grow">
                  <SelectWithCheckboxesAndImages
                    value={selectedBoissons}
                    onChange={handleBoissonChange}
                    options={isLoadingSupplements ? [] : boissonOptions}
                    placeholder="Sélectionnez une catégorie de boissons"
                  />
                 </div>

                <div className="ml-2 text-[13px] text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                  {selectedBoissons.length}/3
                </div>
              </div>
            
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Boutons d'action */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <motion.button
          type="button"
          className="h-[32px] text-[#9796A1] px-8 rounded-[10px] bg-[#ECECEC] text-[13px] items-center justify-center hover:bg-gray-100 min-w-[160px]"
          onClick={() => {
            console.log('❌ Annulation du formulaire');
            onCancel?.();
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Annuler
        </motion.button>
        <motion.button
          type="submit"
          className="h-[32px] px-8 rounded-[10px] bg-[#F17922] hover:bg-[#F17922]/90 text-white text-[13px] min-w-[170px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => console.log('🖱️ Bouton submit cliqué')}
        >
          {isEditing ? 'Modifier' : 'Enregistrer'}
        </motion.button>
      </div>
    </motion.form>
  )
}

export default MenuForm