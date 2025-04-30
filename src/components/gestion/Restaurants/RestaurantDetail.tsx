"use client"

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Phone, Mail, User as UserIcon, Calendar, MapPin, ArrowLeft, Clock, Star, ShoppingBag, DollarSign, Users, ChevronRight } from 'lucide-react'
import { toast } from 'react-hot-toast'
import Toggle from '@/components/ui/Toggle'
import { getRestaurantById, Restaurant, Schedule, updateRestaurantStatus, getRestaurantManager } from '@/services/restaurantService'
import { IMAGE_BASE_URL } from '@/config'
import DashboardPageHeader from '@/components/ui/DashboardPageHeader'
import { getAllMenus } from '@/services/menuService'

// Interface pour le manager du restaurant
interface RestaurantManager {
  fullname: string;
  email: string;
  phone: string;
  image: string | null;
  address: string | null;
  restaurant_id: string;
}

interface RestaurantDetailProps {
  open: boolean;
  restaurantId: string;
  onClose: () => void;
  onEdit: (restaurant: Restaurant) => void;
}

export default function RestaurantDetail({ open, restaurantId, onClose, onEdit }: RestaurantDetailProps) {
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [manager, setManager] = useState<RestaurantManager | null>(null)
  const [isLoadingManager, setIsLoadingManager] = useState(false)
  const [restaurantMenus, setRestaurantMenus] = useState<any[]>([])
  const [isLoadingMenus, setIsLoadingMenus] = useState(false)
  const [searchMenuQuery, setSearchMenuQuery] = useState('')
  const [selectedMenu, setSelectedMenu] = useState<any>(null)
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false)

  // Fonction pour charger les détails du restaurant
  const fetchRestaurantDetails = async () => {
    setIsLoading(true)
    try {
      const data = await getRestaurantById(restaurantId);
      setRestaurant(data);
      
      // Charger les informations du manager
      fetchManagerDetails(restaurantId);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || 'Impossible de charger les détails du restaurant'}`);
      console.error('Erreur lors du chargement des détails du restaurant:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fonction pour charger les détails du manager
  const fetchManagerDetails = async (restaurantId: string) => {
    setIsLoadingManager(true);
    try {
      const managerData = await getRestaurantManager(restaurantId);
      setManager(managerData);
    } catch (error: any) {
      console.error('Erreur lors du chargement des détails du manager:', error);
       
    } finally {
      setIsLoadingManager(false);
    }
  };

  // Fonction pour récupérer les menus d'un restaurant spécifique
  const fetchRestaurantMenus = async (restaurantId: string) => {
    if (!restaurantId) return;
    
    setIsLoadingMenus(true);
    try {
      const allMenus = await getAllMenus();
      
     
      let filteredMenus: any[] = [];
      
      // Méthode 1: Vérifier directement restaurantId
      const menusByRestaurantId = allMenus.filter(menu => menu.restaurantId === restaurantId);
      
      // Méthode 2: Vérifier si le restaurantId est un tableau et contient l'ID recherché
      const menusByRestaurantIdArray = allMenus.filter(menu => 
        Array.isArray(menu.restaurantId) && menu.restaurantId.includes(restaurantId)
      );
      
      // Méthode 3: Vérifier si dish_restaurants existe et contient l'ID recherché
      const menusByDishRestaurants = allMenus.filter(menu => 
        menu.dish_restaurants && 
        Array.isArray(menu.dish_restaurants) && 
        menu.dish_restaurants.some((dr: any) => dr.restaurant_id === restaurantId)
      );
      
      // Combiner tous les résultats et éliminer les doublons
      filteredMenus = [
        ...menusByRestaurantId,
        ...menusByRestaurantIdArray,
        ...menusByDishRestaurants
      ];
      
      // Éliminer les doublons en utilisant les IDs
      const uniqueIds = new Set();
      filteredMenus = filteredMenus.filter(menu => {
        if (uniqueIds.has(menu.id)) return false;
        uniqueIds.add(menu.id);
        return true;
      });
      
       if (filteredMenus.length === 0 && process.env.NODE_ENV === 'development') {
        filteredMenus = allMenus;
      }
      
      setRestaurantMenus(filteredMenus);
      
       if (filteredMenus.length > 0) {
        toast.success(`${filteredMenus.length} menus trouvés pour ce restaurant`);
      } else {
        toast.success('Aucun menu trouvé pour ce restaurant');
      }
    } catch (error: any) {
      console.error('Erreur lors du chargement des menus du restaurant:', error);
      toast.error(`Erreur: ${error.message || 'Impossible de charger les menus'}`);
    } finally {
      setIsLoadingMenus(false);
    }
  };

  // Fonction pour ouvrir le modal avec les détails du menu
  const handleOpenMenuModal = (menu: any) => {
    setSelectedMenu(menu);
    setIsMenuModalOpen(true);
  };

  // Fonction pour fermer le modal
  const handleCloseMenuModal = () => {
    setIsMenuModalOpen(false);
    setSelectedMenu(null);
  };

  // Charger les détails du restaurant au chargement du composant
  useEffect(() => {
    if (open && restaurantId) {
      fetchRestaurantDetails();
      fetchRestaurantMenus(restaurantId);
    }
  }, [open, restaurantId]);

   const handleToggleActive = async (active: boolean) => {
    if (!restaurant || !restaurant.id) return;
    
    try {
      await updateRestaurantStatus(restaurant.id, active);
      setRestaurant(prev => prev ? { ...prev, active } : null);
      toast.success(`Restaurant ${active ? 'activé' : 'désactivé'} avec succès`);
    } catch (error: any) {
      toast.error(`Erreur: ${error.message || 'Impossible de mettre à jour le statut du restaurant'}`);
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  // Fonction pour formater l'horaire d'ouverture
  const formatSchedule = (schedule: Schedule[]) => {
    if (!Array.isArray(schedule)) {
      return (
        <div className="text-gray-500 text-sm italic">
          Horaires non disponibles
        </div>
      );
    }
    
    const daysMap: {[key: string]: string} = {
      '1': 'Lundi',
      '2': 'Mardi',
      '3': 'Mercredi',
      '4': 'Jeudi',
      '5': 'Vendredi',
      '6': 'Samedi',
      '7': 'Dimanche'
    };
    
    // Trier les jours dans l'ordre de la semaine
    const sortedSchedule = [...schedule].sort((a, b) => {
      const dayA = Object.keys(a)[0];
      const dayB = Object.keys(b)[0];
      return parseInt(dayA) - parseInt(dayB);
    });
    
    return sortedSchedule.map(item => {
      const day = Object.keys(item)[0];
      const hours = item[day];
      const isClosed = hours === 'Fermé';
      
      return (
        <div key={day} className="flex justify-between py-2 border-b border-gray-100 last:border-0">
          <span className="font-medium text-sm">{daysMap[day]}</span>
          <span className={`text-sm ${isClosed ? 'text-red-500 italic' : 'text-green-600'} font-medium`}>
            {isClosed ? 'Fermé' : hours}
          </span>
        </div>
      );
    });
  };

  // Formater la date de création
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Date inconnue';
    
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  if (!open) return null;

  return (
    <div className="fixed right-0 top-0 bottom-0 h-screen w-full lg:w-[70vw] bg-white z-[130] rounded-l-3xl shadow-2xl flex flex-col overflow-y-auto animate-slideInModal">
      {/* Header */}
      <DashboardPageHeader 
        title={restaurant?.name || "Détails du restaurant"} 
        mode="detail"
        onBack={onClose}
        actions={restaurant ? [
          {
            label: restaurant.active ? 'Actif' : 'Inactif',
            onClick: () => handleToggleActive(!restaurant.active),
            variant: restaurant.active ? 'primary' : 'secondary',
            className: `ml-2 ${restaurant.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`
          },
          {
            label: 'Modifier',
            onClick: () => onEdit(restaurant),
            variant: 'primary',
            className: 'bg-[#F17922] text-white hover:bg-[#e06a15]'
          }
        ] : []}
      />

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F17922]"></div>
        </div>
      ) : !restaurant ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <p>Restaurant introuvable</p>
          <button 
            onClick={onClose}
            className="mt-4 text-[#F17922] hover:underline"
          >
            Retour à la liste
          </button>
        </div>
      ) : (
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
            <div className="space-y-6">
        
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="relative w-full h-48">
                  {restaurant.image ? (
                    <Image 
                      src={restaurant.image.startsWith('http') 
                        ? restaurant.image 
                        : `${process.env.NEXT_PUBLIC_API_URL || ''}${restaurant.image.startsWith('/') ? '' : '/'}${restaurant.image}`} 
                      alt={restaurant.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <p className="text-gray-400">Aucune image</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Informations générales */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-[#F17922] text-base font-semibold mb-4 flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Informations générales
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Description</h4>
                    <p className="text-sm text-gray-600 mt-1">{restaurant.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Adresse</h4>
                    <p className="text-sm text-gray-600 mt-1">{restaurant.address}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Contact</h4>
                    <div className="mt-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{restaurant.phone}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-600">{restaurant.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Coordonnées</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      Lat: {restaurant.latitude}, Long: {restaurant.longitude}
                    </p>
                    
                 
                    <div className="mt-2 bg-gray-100 rounded-lg h-32 flex items-center justify-center">
                      <p className="text-sm text-gray-500">Carte à intégrer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Deuxième colonne - Manager et horaires */}
            <div className="space-y-6">
              {/* Informations du gérant */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-[#F17922] text-base font-semibold mb-4 flex items-center">
                  <UserIcon className="h-4 w-4 mr-2" />
                  Informations du gérant
                </h3>
                
                <div className="flex flex-col items-center mb-4">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-2">
                    {manager?.image ? (
                      <Image 
                        src={manager.image} 
                        alt={manager.fullname}
                        width={64}
                        height={64}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="h-8 w-8 text-gray-400" />
                    )}
                  </div>
                  <h4 className="text-base font-medium">{manager?.fullname || 'Non disponible'}</h4>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-700 flex-1">{manager?.email || 'Non disponible'}</p>
                  </div>
                  
                  <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <p className="text-sm text-gray-700 flex-1">{manager?.phone || 'Non disponible'}</p>
                  </div>
                  
                  {manager?.address && (
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-700 flex-1">{manager.address}</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Horaires d'ouverture */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-[#F17922] text-base font-semibold mb-4 flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Horaires d'ouverture
                </h3>
                
                <div className="space-y-1 divide-y divide-gray-100">
                  {formatSchedule(restaurant.schedule)}
                </div>
              </div>
              
              {/* Date de création */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Date de création</p>
                    <p className="text-sm font-medium">{formatDate(restaurant.createdAt)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Troisième colonne - Statistiques et menus */}
            <div className="space-y-6">
              {/* Statistiques */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-[#F17922] text-base font-semibold mb-4 flex items-center">
                  <Star className="h-4 w-4 mr-2" />
                  Statistiques
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <ShoppingBag className="h-5 w-5 text-[#F17922] mx-auto mb-1" />
                    <p className="text-xl font-bold text-[#F17922]">0</p>
                    <p className="text-xs text-gray-600">Commandes</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <DollarSign className="h-5 w-5 text-[#F17922] mx-auto mb-1" />
                    <p className="text-xl font-bold text-[#F17922]">0 XOF</p>
                    <p className="text-xs text-gray-600">Chiffre d'affaires</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <Users className="h-5 w-5 text-[#F17922] mx-auto mb-1" />
                    <p className="text-xl font-bold text-[#F17922]">0</p>
                    <p className="text-xs text-gray-600">Clients fidèles</p>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <Star className="h-5 w-5 text-[#F17922] mx-auto mb-1" />
                    <p className="text-xl font-bold text-[#F17922]">N/A</p>
                    <p className="text-xs text-gray-600">Note moyenne</p>
                  </div>
                </div>
              </div>
              
              {/* Menus disponibles */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h3 className="text-[#F17922] text-base font-semibold mb-4 flex items-center">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Menus disponibles
                </h3>
                
                {/* Barre de recherche */}
                <div className="mb-3">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Rechercher un menu..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#F17922] focus:border-transparent"
                      value={searchMenuQuery}
                      onChange={(e) => setSearchMenuQuery(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {restaurantMenus.length > 0 ? (
                    restaurantMenus
                      .filter(menu => 
                        searchMenuQuery === '' || 
                        menu.name.toLowerCase().includes(searchMenuQuery.toLowerCase()) ||
                        (menu.description && menu.description.toLowerCase().includes(searchMenuQuery.toLowerCase()))
                      )
                      .map((menu) => (
                        <div key={menu.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition cursor-pointer" onClick={() => handleOpenMenuModal(menu)}>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-md flex items-center justify-center overflow-hidden">
                              {menu.image ? (
                                <Image 
                                  src={menu.image} 
                                  alt={menu.name}
                                  width={40}
                                  height={40}
                                  className="object-cover w-full h-full"
                                />
                              ) : (
                                <ShoppingBag className="h-5 w-5 text-[#F17922]" />
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{menu.name}</p>
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500">
                                  {(menu.isPromotion || menu.is_promotion) && menu.originalPrice && menu.discountedPrice ? (
                                    <span className="flex items-center">
                                      <span className="line-through mr-1">{menu.originalPrice} XOF</span>
                                      <span className="text-green-600 font-medium">{menu.discountedPrice} XOF</span>
                                    </span>
                                  ) : (
                                    <span>{menu.price} XOF</span>
                                  )}
                                </p>
                                {menu.isAvailable === false && (
                                  <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded">Non disponible</span>
                                )}
                                {menu.isNew && (
                                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">Nouveau</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      {isLoadingMenus ? 'Chargement des menus...' : 'Aucun menu trouvé pour ce restaurant'}
                    </div>
                  )}
                  
                  <button 
                    className="w-full mt-3 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg p-2 text-sm font-medium flex items-center justify-center gap-2 transition"
                    onClick={() => restaurant?.id && fetchRestaurantMenus(restaurant.id)}
                  >
                    {isLoadingMenus ? (
                      <div className="flex items-center">
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-[#F17922] rounded-full mr-2"></div>
                        <span>Chargement...</span>
                      </div>
                    ) : (
                      <>
                        <span>Voir tous les menus</span>
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal pour les détails du menu */}
      {isMenuModalOpen && selectedMenu && (
        <div className="fixed inset-0   backdrop-blur-xs z-[150] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* En-tête du modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-[#F17922]">{selectedMenu.name}</h3>
              <button 
                onClick={handleCloseMenuModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Corps du modal */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Image du menu */}
                <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
                  {selectedMenu.image ? (
                    <Image 
                      src={selectedMenu.image} 
                      alt={selectedMenu.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Badges de statut */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2">
                    {selectedMenu.isPromotion || selectedMenu.is_promotion ? (
                      <span className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded">Promotion</span>
                    ) : null}
                    {selectedMenu.isNew && (
                      <span className="bg-blue-500 text-white text-xs font-medium px-2 py-1 rounded">Nouveau</span>
                    )}
                    {selectedMenu.isAvailable === false && (
                      <span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded">Non disponible</span>
                    )}
                  </div>
                </div>
                
                {/* Détails du menu */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Description</h4>
                    <p className="text-sm text-gray-600 mt-1">{selectedMenu.description || 'Aucune description disponible'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Prix</h4>
                    <div className="mt-1">
                      {(selectedMenu.isPromotion || selectedMenu.is_promotion) && selectedMenu.originalPrice && selectedMenu.discountedPrice ? (
                        <div className="flex items-center gap-2">
                          <span className="line-through text-gray-400">{selectedMenu.originalPrice} XOF</span>
                          <span className="text-green-600 font-medium">{selectedMenu.discountedPrice} XOF</span>
                        </div>
                      ) : (
                        <p className="text-gray-600">{selectedMenu.price} XOF</p>
                      )}
                    </div>
                  </div>
                  
                  {selectedMenu.ingredients && selectedMenu.ingredients.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Ingrédients</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {selectedMenu.ingredients.map((ingredient: string, index: number) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {ingredient}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Suppléments */}
                  {selectedMenu.supplements && Object.keys(selectedMenu.supplements).length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700">Suppléments disponibles</h4>
                      <div className="mt-1 space-y-2">
                        {Object.entries(selectedMenu.supplements).map(([key, value]: [string, any]) => {
                          if (!value || (Array.isArray(value) && value.length === 0)) return null;
                          
                          return (
                            <div key={key} className="text-sm">
                              <p className="font-medium text-gray-600 capitalize">{key}</p>
                              {Array.isArray(value.items) && value.items.length > 0 ? (
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {value.items.map((item: any) => (
                                    <span key={item.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded flex items-center">
                                      {item.name}
                                      {item.price && <span className="ml-1 text-gray-500">+{item.price} XOF</span>}
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-gray-500">Aucun supplément disponible</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Pied du modal */}
            <div className="flex justify-end p-4 border-t border-gray-100">
              <button
                onClick={handleCloseMenuModal}
                className="px-4 py-2 bg-gray-100 text-gray-700 cursor-pointer rounded-lg hover:bg-orange-200 transition"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
