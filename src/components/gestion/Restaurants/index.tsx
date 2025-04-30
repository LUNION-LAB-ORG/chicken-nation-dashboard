"use client"

import React, { useState, useEffect } from 'react'
import RestaurantHeader from './RestaurantHeader'
import AddRestaurant from './AddRestaurant'
import EditRestaurant from './EditRestaurant'
import RestaurantView from '../Restaurants/RestaurantView'
import RestaurantDetail from '../Restaurants/RestaurantDetail'
import RestaurantDeleteModal from '../Restaurants/RestaurantDeleteModal'
import ManagerCredentialsDisplay from '../Restaurants/ManagerCredentialsDisplay'
import { toast } from 'react-hot-toast'  
import Modal from '@/components/ui/Modal'
import { Restaurant, getAllRestaurants, updateRestaurantStatus, deleteRestaurant } from '@/services/restaurantService'

 
interface Schedule {
  [day: string]: string;
}

export default function Restaurants() {
  const [openAdd, setOpenAdd] = useState(false)
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list')
  const [selectedRestaurantId, setSelectedRestaurantId] = useState<string>('')
  const [openDetail, setOpenDetail] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [restaurantToDelete, setRestaurantToDelete] = useState<Restaurant | null>(null)
  const [managerCredentials, setManagerCredentials] = useState<{ email: string; password: string } | null>(null)

  // Fonction pour charger les restaurants
  const fetchRestaurants = async () => {
    setIsLoading(true)
    try {
      const data = await getAllRestaurants();
      setRestaurants(data);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || 'Impossible de charger les restaurants'}`);
   
      setRestaurants([]); 
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les restaurants au chargement du composant
  useEffect(() => {
    fetchRestaurants();
  }, []);

   const handleToggleActive = async (restaurantId: string, active: boolean) => {
    try {
      await updateRestaurantStatus(restaurantId, active);
      
      
      setRestaurants(prevRestaurants => 
        prevRestaurants.map(restaurant => 
          restaurant.id === restaurantId ? { ...restaurant, active } : restaurant
        )
      );
      
      toast.success(`Restaurant ${active ? 'activé' : 'désactivé'} avec succès`);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le statut du restaurant'}`);
    }
  };

   const formatSchedule = (schedule: Schedule[]) => {
    if (!Array.isArray(schedule)) {
      return 'Horaires non disponibles';
    }
    
    const daysMap: {[key: string]: string} = {
      '1': 'Lun',
      '2': 'Mar',
      '3': 'Mer',
      '4': 'Jeu',
      '5': 'Ven',
      '6': 'Sam',
      '7': 'Dim'
    };
    
    return schedule.map(item => {
      const day = Object.keys(item)[0];
      return `${daysMap[day]}: ${item[day]}`;
    }).join(' | ');
  };

   const handleAddRestaurant = () => {
    setOpenAdd(true);
  };

   const handleRestaurantAdded = (restaurant: Restaurant) => {
     if (restaurant.manager && typeof restaurant.manager === 'object' && 
        restaurant.manager.email && restaurant.manager.password) {
      setManagerCredentials({
        email: restaurant.manager.email,
        password: restaurant.manager.password
      });
    }
    
    setRestaurants(prev => [...prev, restaurant]);
    setOpenAdd(false);
    fetchRestaurants();  
  };

   const handleDeleteRestaurant = async (restaurantId: string) => {
     const restaurant = restaurants.find(r => r.id === restaurantId);
    if (restaurant) {
      setRestaurantToDelete(restaurant);
      setDeleteModalOpen(true);
    }
  };

   const confirmDeleteRestaurant = async () => {
    if (!restaurantToDelete || !restaurantToDelete.id) return;
    
    try {
      await deleteRestaurant(restaurantToDelete.id);
      
       setRestaurants(prevRestaurants => 
        prevRestaurants.filter(restaurant => restaurant.id !== restaurantToDelete.id)
      );
      
      toast.success('Restaurant supprimé avec succès');
      setDeleteModalOpen(false);
      setRestaurantToDelete(null);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || 'Impossible de supprimer le restaurant'}`);
    }
  };

   const handleViewRestaurant = (restaurantId: string) => {
    setSelectedRestaurantId(restaurantId);
    setOpenDetail(true);
  };

   const handleEditRestaurant = (restaurant: Restaurant) => {
    setSelectedRestaurant(restaurant);
    setOpenAdd(true);
    setOpenDetail(false);
  };

  return (
    <div className="flex flex-col h-full w-full">
      <RestaurantHeader onAddRestaurant={handleAddRestaurant} />
      
      <RestaurantView 
        onAdd={handleAddRestaurant}
        onEdit={handleEditRestaurant}
        onView={handleViewRestaurant}
        onDelete={handleDeleteRestaurant}
        restaurants={restaurants}
        isLoading={isLoading}
      />
      
      <Modal
        isOpen={openAdd}
        onClose={() => {
          setOpenAdd(false);
          setSelectedRestaurant(null);
        }}
        title={`${selectedRestaurant ? 'Modifier' : 'Ajouter'} un restaurant`}
        size="large"
      >
        {selectedRestaurant ? (
          <EditRestaurant 
            restaurantId={selectedRestaurant.id || ''}
            onCancel={() => {
              setOpenAdd(false);
              setSelectedRestaurant(null);
            }} 
            onSuccess={(updatedRestaurant) => {
            
              setRestaurants(prevRestaurants => 
                prevRestaurants.map(restaurant => 
                  restaurant.id === updatedRestaurant.id ? updatedRestaurant : restaurant
                )
              );
              
              toast.success('Restaurant mis à jour avec succès');
              setOpenAdd(false);
              setSelectedRestaurant(null);
            }}
          />
        ) : (
          <AddRestaurant 
            onCancel={() => {
              setOpenAdd(false);
              setSelectedRestaurant(null);
            }} 
            onSuccess={handleRestaurantAdded}
            restaurant={null}
          />
        )}
      </Modal>

      <RestaurantDetail 
        open={openDetail}
        restaurantId={selectedRestaurantId}
        onClose={() => setOpenDetail(false)}
        onEdit={handleEditRestaurant}
      />

      <RestaurantDeleteModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteRestaurant}
        restaurant={restaurantToDelete}
      />

     
      {managerCredentials && (
        <ManagerCredentialsDisplay
          email={managerCredentials.email}
          password={managerCredentials.password}
        />
      )}
    </div>
  )
}