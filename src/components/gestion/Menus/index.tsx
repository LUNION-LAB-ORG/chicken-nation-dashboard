"use client"

import React, { useState } from 'react';
import MenuHeader from './MenuHeader';
import BestSellers from './BestSellers';
import MenuCategories from './MenuCategories';  
import AddMenu from './AddMenu';
import EditMenu from './EditMenu';
import DetailsMenu from './DetailsMenu';
import { menuItems, categories as menuCategories } from '@/data/MockedData';
import { MenuItem } from '@/types';
import { getMenuById, updateMenu, menuToFormData } from '@/services/menuService';
import { addRestaurantToDish, deleteDishRestaurantRelation } from '@/services/dishRestaurantService';
import { addSupplementToDish, updateSupplementQuantity, removeSupplementFromDish } from '@/services/dishSupplementService';
import { toast } from 'react-hot-toast';
import MenuRightSide from './MenuRightSide';

interface MenuState {
  view: 'list' | 'create' | 'edit' | 'view';
  selectedMenu?: MenuItem;
  loadingMenu: boolean;
  saving: boolean;
}
 
const Menus = () => {
  const [menuState, setMenuState] = useState<MenuState>({
    view: 'list',
    loadingMenu: false,
    saving: false
  });

  
  const bestSellers = [...menuItems]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  
  const promoMenus = menuItems.filter(item => {
    return item.supplements && 
      Object.values(item.supplements).some(supp => supp.isIncluded) ||
      item.isNew;
  }).slice(0, 5);

  const handleViewChange = (view: 'list' | 'create' | 'edit' | 'view', menu?: MenuItem) => {
    setMenuState({ 
      view, 
      selectedMenu: menu, 
      loadingMenu: false,
      saving: false 
    });
  };

  const handleEditMenu = (menu: MenuItem) => {
    
    setMenuState({ ...menuState, loadingMenu: true });
    
    getMenuById(menu.id)
      .then(menuData => { 
        
        
        if (!menuData.categoryId && menuData.category) {
          menuData.categoryId = menuData.category.id || menuData.category;
         
        }
        
      
        if (menuData.dish_restaurants && menuData.dish_restaurants.length > 0) {
         
          
        
          const restaurantIds = menuData.dish_restaurants
            .map((r: any) => {
             
              const id = r.restaurant_id || 
                        (r.restaurant && r.restaurant.id) || 
                        (typeof r === 'string' ? r : null);
              
              if (!id) {
                
              }
              return id;
            })
            .filter(Boolean);
           
        
           
          if (restaurantIds.length > 0) {
            menuData.restaurantId = restaurantIds;
      
          }
        } else {
        
        }
        
        // Vérifier si dish_supplements est présent et non vide
        if (menuData.dish_supplements && menuData.dish_supplements.length > 0) {
        
          
        
          menuData.dish_supplements = menuData.dish_supplements.map((supp: any, index: number) => {
          
            if (supp.supplement && typeof supp.supplement === 'object') {
              
              if (!supp.supplement.type) {
               
                
             
                if (supp.supplement.name) {
                  const name = supp.supplement.name.toLowerCase();
                  if (name.includes('boisson') || name.includes('drink') || name.includes('soda')) {
                    supp.supplement.type = 'DRINK';
                   
                  } else if (name.includes('frite') || name.includes('riz') || name.includes('accompagnement')) {
                    supp.supplement.type = 'FOOD';
                   
                  } else {
                    supp.supplement.type = 'ACCESSORY';
                   
                  }
                } else {
                  // Type par défaut
                  supp.supplement.type = 'ACCESSORY';
                  
                }
              }
               
              if (!supp.supplement_id && supp.supplement.id) {
                supp.supplement_id = supp.supplement.id;
                
              }
            } 
           
            else if (supp.supplement_id && !supp.supplement) {
              
              supp.supplement = {
                id: supp.supplement_id,
                name: `Supplément #${supp.supplement_id}`,
                type: 'ACCESSORY' // Type par défaut
              };
              
            }
            
      
            if (!supp.quantity) {
              supp.quantity = 1;
             
            }
            
            return supp;
          });
          
          
        } else {
        
       
          menuData.dish_supplements = [];
        }
        
        setMenuState({ 
          view: 'edit', 
          selectedMenu: menuData, 
          loadingMenu: false,
          saving: false 
        });
      })
      .catch(error => {
       
        toast.error('Erreur lors du chargement du menu');
        setMenuState({ 
          ...menuState, 
          loadingMenu: false,
          saving: false 
        });
      });
  };

  const handleViewMenu = (menu: MenuItem) => {
 
    setMenuState({ ...menuState, loadingMenu: true });
    
    getMenuById(menu.id)
      .then(menuData => {
     
        setMenuState({ 
          view: 'view', 
          selectedMenu: menuData, 
          loadingMenu: false,
          saving: false 
        });
      })
      .catch(error => {
        console.error('Erreur lors du chargement du menu:', error);
        toast.error('Erreur lors du chargement du menu');
        setMenuState({ 
          ...menuState, 
          loadingMenu: false,
          saving: false 
        });
      });
  };

  const handleSaveEdit = async (updatedMenu: MenuItem) => {
    if (!menuState.selectedMenu) return;
    
    setMenuState({ ...menuState, saving: true });
    
    try {
      // 1. Mettre à jour les informations de base du menu
      const formData = menuToFormData(updatedMenu);
      const updatedMenuData = await updateMenu(menuState.selectedMenu.id, formData);
      
      // 2. Préparer les données pour la mise à jour des relations
      
      
      // Extraire les IDs et IDs de relation des restaurants actuels
      const currentRestaurants = menuState.selectedMenu.dish_restaurants 
        ? menuState.selectedMenu.dish_restaurants.map(r => ({
            id: r.restaurant_id || (r.restaurant && r.restaurant.id) || '',
            relationId: r.id
          }))
        : [];
      
      // Extraire les IDs des nouveaux restaurants
      const newRestaurantIds = updatedMenu.restaurantId 
        ? (Array.isArray(updatedMenu.restaurantId) 
            ? updatedMenu.restaurantId 
            : [updatedMenu.restaurantId])
        : [];
      
      
  
      // Extraire les suppléments actuels avec leurs quantités et IDs de relation
      const currentSupplements = menuState.selectedMenu.dish_supplements 
        ? menuState.selectedMenu.dish_supplements.map(s => ({
            id: s.supplement_id || (s.supplement && s.supplement.id) || '',
            quantity: s.quantity || 1,
            relationId: s.id
          }))
        : [];
      
      // Extraire les nouveaux suppléments avec leurs quantités
      const newSupplements: Array<{ id: string; quantity: number }> = [];
      
      // Ajouter les ingrédients (ACCESSORY)
      if (updatedMenu.supplements?.ACCESSORY) {
        updatedMenu.supplements.ACCESSORY.forEach(supp => {
          newSupplements.push({
            id: supp.id,
            quantity: supp.quantity || 1
          });
        });
      }
      
      // Ajouter les accompagnements (FOOD)
      if (updatedMenu.supplements?.FOOD) {
        updatedMenu.supplements.FOOD.forEach(supp => {
          newSupplements.push({
            id: supp.id,
            quantity: supp.quantity || 1
          });
        });
      }
      
      // Ajouter les boissons (DRINK)
      if (updatedMenu.supplements?.DRINK) {
        updatedMenu.supplements.DRINK.forEach(supp => {
          newSupplements.push({
            id: supp.id,
            quantity: supp.quantity || 1
          });
        });
      }
      
      
       
      const restaurantPromises = [];
      
      // Ajouter les nouveaux restaurants
      for (const newRestaurantId of newRestaurantIds) {
        // Vérifier si ce restaurant existe déjà
        const exists = currentRestaurants.some(r => r.id === newRestaurantId);
        if (!exists) {
          restaurantPromises.push(
            addRestaurantToDish(menuState.selectedMenu.id, newRestaurantId)
          );
        }
      }
      
      
      for (const currentResto of currentRestaurants) {
        if (currentResto.id && currentResto.relationId) {
          
          const stillExists = newRestaurantIds.includes(currentResto.id);
          if (!stillExists) {
            restaurantPromises.push(
              deleteDishRestaurantRelation(currentResto.relationId)
            );
          }
        }
      }
      
      
      const supplementPromises = [];
      
      
      for (const newSupplement of newSupplements) {
        
        const existingSupp = currentSupplements.find(s => s.id === newSupplement.id);
        if (!existingSupp) {
          supplementPromises.push(
            addSupplementToDish(menuState.selectedMenu.id, newSupplement.id, newSupplement.quantity)
          );
        } else if (existingSupp.quantity !== newSupplement.quantity) {
          // Mettre à jour la quantité si elle a changé
          if (existingSupp.relationId) {
            supplementPromises.push(
              updateSupplementQuantity(existingSupp.relationId, newSupplement.quantity)
            );
          } else {
            
          }
        }
      }
      
 
      for (const currentSupp of currentSupplements) {
        if (currentSupp.id && currentSupp.relationId) {
     
          const stillExists = newSupplements.some(s => s.id === currentSupp.id);
          if (!stillExists) {
            supplementPromises.push(
              removeSupplementFromDish(currentSupp.relationId)
            );
          }
        }
      }
      
 
      const [restaurantResults, supplementResults] = await Promise.all([
        Promise.all(restaurantPromises),
        Promise.all(supplementPromises)
      ]);
      
      
      
      toast.success('Menu mis à jour avec succès !');
      setMenuState({ view: 'list', selectedMenu: undefined, loadingMenu: false, saving: false });
    } catch (error) {
      console.error('Erreur lors de la mise à jour du menu:', error);
      toast.error('Erreur lors de la mise à jour du menu');
      setMenuState({ ...menuState, saving: false });
    }
  };

 
  const similarMenus = menuItems.filter(item => 
    item.categoryId === menuState.selectedMenu?.categoryId && item.id !== menuState.selectedMenu?.id
  ).slice(0, 4);

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-2 2k:pt-2 pb-2 sm:px-4 sm:pb-4 md:px-6 md:pb-6 2k:px-8 2k:pb-8">
        <MenuHeader 
          currentView={menuState.view} 
          onBack={() => handleViewChange('list')}
          onCreateMenu={() => handleViewChange('create')}
        />
        
        {menuState.view === 'list' && (
          <div className='bg-white rounded-xl sm:rounded-2xl overflow-hidden'>
            <BestSellers 
              menus={[]} 
              onEditMenu={handleEditMenu}
              onViewMenu={handleViewMenu}
            />
             
            <MenuCategories 
              categories={menuCategories}
              menuItems={menuItems}
              onEditMenu={handleEditMenu}
              onViewMenu={handleViewMenu}
            />
          </div>
        )}

        {menuState.view === 'create' && (
          <div className="flex flex-col lg:flex-row gap-4 bg-white rounded-xl p-4 lg:p-6 border-2 border-[#D8D8D8]/30">
            <div className="w-full min-[1620px]:mr-56">  
              <AddMenu 
                onCancel={() => handleViewChange('list')} 
                onSave={(newMenu: MenuItem) => { 
         
                  import('@/services/menuService').then(({ createMenu, menuToFormData }) => {
               
                    const formData = menuToFormData(newMenu);
                    
                    createMenu(formData)
                      .then(response => {
                        toast.success('Menu créé avec succès');
                        handleViewChange('list');
                      })
                      .catch(error => {
                        console.error('Erreur lors de la création du menu:', error);
                        toast.error('Erreur lors de la création du menu');
                      });
                  }).catch(error => {
                    console.error('Erreur lors de l\'import du service menuService:', error);
                    toast.error('Erreur lors de l\'import du service');
                  });
                }} 
              />
            </div>
          </div>
        )}

        {menuState.view === 'edit' && menuState.selectedMenu && (
          <div className="flex flex-col lg:flex-row gap-4 bg-white rounded-xl p-4 lg:p-6 border-2 border-[#D8D8D8]/30">
            <div className="w-full min-[1620px]:mr-56">
              {menuState.loadingMenu ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F17922]"></div>
                </div>
              ) : (
                <EditMenu
                  menu={menuState.selectedMenu}
                  onCancel={() => handleViewChange('list')}
                  onSave={handleSaveEdit}
                />
              )}
            </div>
          </div>
        )}

        {menuState.view === 'view' && menuState.selectedMenu && (
          <div className="flex flex-col xl:flex-row gap-4">
            <div className="flex-1">
              {menuState.loadingMenu ? (
                <div className="flex items-center justify-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F17922]"></div>
                </div>
              ) : (
                <DetailsMenu
                  menu={menuState.selectedMenu}
                  onClose={() => handleViewChange('list')}
                  onEdit={() => handleEditMenu(menuState.selectedMenu!)}
                />
              )}
            </div>
            <div className="xl:w-1/3">
              <MenuRightSide 
                similarMenus={similarMenus} 
                onEditMenu={handleEditMenu}
                onViewMenu={handleViewMenu}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Menus;