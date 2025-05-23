import React, { useEffect, useState } from 'react';
import { Order } from './OrdersTable'; 
import Image from 'next/image';
import { useOrderStore } from '@/store/orderStore';
import { getRestaurantById, Restaurant } from '@/services/restaurantService';
import { OrderStatus } from '@/types/order';
import toast from 'react-hot-toast';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack, onAccept, onReject, onStatusChange }) => {
  const { getOrderById, fetchOrderById, updateOrderStatus } = useOrderStore();
  const [fullOrderDetails, setFullOrderDetails] = useState<any>(null);
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant inconnu');
  const [currentStatus, setCurrentStatus] = useState<string>(order.status);
  
  // Récupérer les détails complets de la commande au chargement
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        console.log('[OrderDetails] Début de la récupération des détails de la commande');
        console.log('[OrderDetails] Token actuel:', localStorage.getItem('chicken-nation-auth'));
        
        const freshOrderDetails = await fetchOrderById(order.id);
        
        if (freshOrderDetails) {
          console.log('[OrderDetails] Données fraîches de la commande:', freshOrderDetails);
          setFullOrderDetails(freshOrderDetails);
          setCurrentStatus(convertApiStatusToUiStatus(freshOrderDetails.status));
          
          // Récupérer immédiatement le nom du restaurant
          if (freshOrderDetails.restaurant_id) {
            console.log('[OrderDetails] Récupération du restaurant:', freshOrderDetails.restaurant_id);
            getRestaurantById(freshOrderDetails.restaurant_id)
              .then(resto => {
                console.log('[OrderDetails] Restaurant récupéré:', resto);
                if (resto && resto.name) {
                  setRestaurantName(resto.name);
                } else {
                  setRestaurantName(freshOrderDetails.restaurant_id);
                }
              })
              .catch(error => {
                console.error('[OrderDetails] Erreur lors de la récupération du restaurant:', error);
                setRestaurantName(freshOrderDetails.restaurant_id);
              });
          }
        } else {
          console.log('[OrderDetails] Pas de données fraîches, utilisation du store');
          // Fallback sur getOrderById si fetchOrderById échoue
          const orderDetails = getOrderById(order.id);
          if (orderDetails) {
            console.log('[OrderDetails] Données de la commande depuis le store:', orderDetails);
            setFullOrderDetails(orderDetails);
            setCurrentStatus(convertApiStatusToUiStatus(orderDetails.status));
            
            // Récupérer immédiatement le nom du restaurant
            if (orderDetails.restaurant_id) {
              console.log('[OrderDetails] Récupération du restaurant depuis le store:', orderDetails.restaurant_id);
              getRestaurantById(orderDetails.restaurant_id)
                .then(resto => {
                  console.log('[OrderDetails] Restaurant récupéré depuis le store:', resto);
                  if (resto && resto.name) {
                    setRestaurantName(resto.name);
                  } else {
                    setRestaurantName(orderDetails.restaurant_id);
                  }
                })
                .catch(error => {
                  console.error('[OrderDetails] Erreur lors de la récupération du restaurant depuis le store:', error);
                  setRestaurantName(orderDetails.restaurant_id);
                });
            }
          }
        }
      } catch (error) {
        console.error('[OrderDetails] Erreur lors de la récupération des détails de la commande:', error);
        console.log('[OrderDetails] Token après erreur:', localStorage.getItem('chicken-nation-auth'));
      }
    };
    
    fetchOrderDetails();
  }, [order.id, getOrderById, fetchOrderById]);

  // Définition de tous les statuts possibles dans l'ordre du workflow
  const allStatuses: Order['status'][] = [
    'EN COURS',
    'EN PRÉPARATION',
    'PRÊT',
    'LIVRAISON',
    'LIVRÉ', 
    'ANNULÉE'
  ];

  // Définition des statuts visibles pour les commandes TABLE
  const visibleTableStatuses: Order['status'][] = [
    'EN COURS',
    'PRÊT',
    'ANNULÉE'
  ];

  // Définition des statuts visibles pour les commandes PICKUP
  const visiblePickupStatuses: Order['status'][] = [
    'EN COURS',
    'EN PRÉPARATION',
    'PRÊT',
    'RÉCUPÉRÉ',
    'ANNULÉE'
  ];

  // Fonction pour obtenir les statuts à afficher dans le menu déroulant
  const getVisibleStatuses = (): Order['status'][] => {
    if (fullOrderDetails?.type === 'TABLE') {
      return visibleTableStatuses;
    }
    if (fullOrderDetails?.type === 'PICKUP') {
      return visiblePickupStatuses;
    }
    return allStatuses;
  };

  // Fonction pour traduire le statut API en statut UI
  const convertApiStatusToUiStatus = (apiStatus: string): Order['status'] => {
    if (fullOrderDetails?.type === 'PICKUP') {
      const pickupStatusMapping: Record<string, Order['status']> = {
        'PENDING': 'NOUVELLE',
        'ACCEPTED': 'EN COURS',
        'IN_PROGRESS': 'EN PRÉPARATION',
        'PREPARATION': 'EN PRÉPARATION',
        'READY': 'PRÊT',
        'COLLECTED': 'RÉCUPÉRÉ',
        'CANCELLED': 'ANNULÉE'
      };
      return pickupStatusMapping[apiStatus] || 'NOUVELLE';
    }

    const statusMapping: Record<string, Order['status']> = {
      'PENDING': 'NOUVELLE',
      'ACCEPTED': 'EN COURS',
      'IN_PROGRESS': 'EN PRÉPARATION',
      'PREPARATION': 'EN PRÉPARATION',
      'READY': 'PRÊT',
      'PICKED_UP': 'LIVRAISON',
      'DELIVERED': 'LIVRÉ',
      'COLLECTED': 'RÉCUPÉRÉ',
      'CANCELLED': 'ANNULÉE',
      'COMPLETED': 'LIVRÉ'
    };
    
    return statusMapping[apiStatus] || 'NOUVELLE';
  };

  // Fonction pour traduire le statut UI en statut API
  const convertUiStatusToApiStatus = (uiStatus: string): OrderStatus => {
    if (fullOrderDetails?.type === 'PICKUP') {
      const pickupStatusMapping: Record<string, OrderStatus> = {
        'NOUVELLE': 'PENDING',
        'EN COURS': 'ACCEPTED',
        'EN PRÉPARATION': 'IN_PROGRESS',
        'PRÊT': 'READY',
        'RÉCUPÉRÉ': 'COLLECTED',
        'ANNULÉE': 'CANCELLED'
      };
      return pickupStatusMapping[uiStatus] || 'PENDING';
    }
 
    const statusMapping: Record<string, OrderStatus> = {
      'NOUVELLE': 'PENDING',
      'EN COURS': 'ACCEPTED',
      'EN PRÉPARATION': 'IN_PROGRESS',
      'PRÊT': 'READY',
      'LIVRAISON': 'PICKED_UP',
      'LIVRÉ': 'DELIVERED',
      'RÉCUPÉRÉ': 'COLLECTED',
      'ANNULÉE': 'CANCELLED'
    };
    
    return statusMapping[uiStatus] || 'PENDING';
  };

  // Fonction pour obtenir l'index d'un statut dans le workflow
  const getStatusIndex = (status: Order['status']): number => {
    return allStatuses.indexOf(status);
  };

  // Fonction pour vérifier si un statut est disponible
  const isStatusAvailable = (status: Order['status'], currentStatusParam: Order['status']): boolean => {
    // Le statut actuel est toujours disponible
    if (status === currentStatusParam) return true;
    
    // ANNULÉE est toujours disponible sauf si la commande est déjà annulée
    if (status === 'ANNULÉE' && currentStatusParam !== 'ANNULÉE') {
      return true;
    }
    
    // Pour les autres statuts, vérifier si on peut y accéder
    const currentIndex = getStatusIndex(currentStatusParam);
    const targetIndex = getStatusIndex(status);
    
    // On ne peut pas revenir en arrière dans le workflow
    return targetIndex > currentIndex;
  };

  // Fonction pour mettre à jour le statut de la commande
  const handleStatusChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = event.target.value as Order['status'];
    console.log(`[OrderDetails] Changement de statut demandé: ${currentStatus} -> ${newStatus}`);
    
    if (newStatus === currentStatus) {
      console.log(`[OrderDetails] Aucun changement de statut nécessaire`);
      return;
    }

    // Mettre à jour l'état local immédiatement pour une meilleure UX
    setCurrentStatus(newStatus);
    
    if (onStatusChange) {
      console.log(`[OrderDetails] Utilisation de onStatusChange pour mettre à jour le statut`);
      onStatusChange(order.id, newStatus);
    } else {
      console.log(`[OrderDetails] onStatusChange n'existe pas, mise à jour directe via le store`);
      
      try {
        if (fullOrderDetails?.type === 'TABLE') {
          // Pour les commandes TABLE, gérer la conversion spéciale
          if (newStatus === 'PRÊT') {
            // Passer par tous les statuts intermédiaires jusqu'à LIVRÉ
            const intermediateStatuses = ['IN_PROGRESS', 'READY', 'PICKED_UP', 'DELIVERED'];
            for (const status of intermediateStatuses) {
              await updateOrderStatus(order.id, status as OrderStatus);
            }
          } else {
            const apiStatus = convertUiStatusToApiStatus(newStatus);
            await updateOrderStatus(order.id, apiStatus);
          }
        } else if (fullOrderDetails?.type === 'PICKUP') {
          // Pour les commandes PICKUP
          if (newStatus === 'PRÊT') {
            // Passer par tous les statuts intermédiaires jusqu'à COLLECTED
            const intermediateStatuses = ['IN_PROGRESS', 'READY', 'COLLECTED'];
            for (const status of intermediateStatuses) {
              await updateOrderStatus(order.id, status as OrderStatus);
            }
          } else if (newStatus === 'RÉCUPÉRÉ') {
            // Pour RÉCUPÉRÉ, utiliser COLLECTED
            await updateOrderStatus(order.id, 'COLLECTED');
          } else {
            const apiStatus = convertUiStatusToApiStatus(newStatus);
            await updateOrderStatus(order.id, apiStatus);
          }
        } else {
          // Pour les autres types de commandes, utiliser la logique normale
          const currentIndex = getStatusIndex(currentStatus);
          const targetIndex = getStatusIndex(newStatus);
          
          if (targetIndex > currentIndex) {
            for (let i = currentIndex + 1; i <= targetIndex; i++) {
              const intermediateStatus = allStatuses[i];
              const apiStatus = convertUiStatusToApiStatus(intermediateStatus);
              await updateOrderStatus(order.id, apiStatus);
            }
          } else if (newStatus === 'ANNULÉE') {
            const apiStatus = convertUiStatusToApiStatus('ANNULÉE');
            await updateOrderStatus(order.id, apiStatus);
          }
        }
        
        console.log(`[OrderDetails] Statut mis à jour avec succès`);
        
        toast.success(`Statut de la commande mis à jour avec succès`, {
          duration: 3000,
          position: 'top-center',
        });
        
        await fetchOrderById(order.id);
        console.log(`[OrderDetails] Données de commande rafraîchies`);
      } catch (error: any) {
        console.log(`[OrderDetails] Erreur lors de la mise à jour du statut:`, error);
        
        // Récupérer le statut actuel depuis le serveur
        await fetchOrderById(order.id);
        const updatedOrder = getOrderById(order.id);
        if (updatedOrder) {
          const currentApiStatus = updatedOrder.status;
          const currentUiStatus = convertApiStatusToUiStatus(currentApiStatus);
          setCurrentStatus(currentUiStatus);
          console.log(`[OrderDetails] Statut rétabli à: ${currentUiStatus}`);
        }
        
        toast.error(`Erreur lors de la mise à jour du statut: ${error.message || 'Erreur inconnue'}`, {
          duration: 3000,
          position: 'top-center',
        });
      }
    }
  };

  // Fonction pour obtenir le titre de la section en fonction du statut
  const getDeliverySectionTitle = () => {
    if (fullOrderDetails?.type === 'PICKUP') {
      switch (currentStatus) {
        case 'PRÊT':
          return 'Prêt à récupérer';
        case 'RÉCUPÉRÉ':
          return 'Récupéré';
        case 'EN COURS':
          return 'En cours de préparation';
        case 'EN PRÉPARATION':
          return 'En préparation';
        case 'ANNULÉE':
          return 'Annulée';
        default:
          return 'Suivi de la commande';
      }
    }
    
    switch (currentStatus) {
      case 'LIVRAISON':
        return 'En livraison';
      case 'LIVRÉ':
        return 'Livré';
      case 'RÉCUPÉRÉ':
        return 'Récupéré';
      case 'PRÊT':
        return 'Prêt à emporter';
      case 'EN COURS':
        return 'En cours de préparation';
      case 'EN PRÉPARATION':
        return 'En préparation';
      case 'ANNULÉE':
        return 'Annulée';
      default:
        return 'Suivi de la commande';
    }
  };
   
  const orderType = fullOrderDetails?.type === 'DELIVERY' ? 'À livrer' : (fullOrderDetails?.type === 'TABLE' ? 'Sur place' : (fullOrderDetails?.type ?? 'À livrer'));
  console.log('[OrderDetails] Type de commande:', orderType, 'Type original:', fullOrderDetails?.type);
  
  // Fonction pour traduire le type de commande
  const translateOrderType = (type: string): string => {
    switch (type) {
      case 'DELIVERY': return 'À livrer';
      case 'PICKUP': return 'À récupérer';
      case 'TABLE': return 'À table';
      default: return type;
    }
  };

  const paymentMethod = (fullOrderDetails?.paiements && fullOrderDetails.paiements.length > 0 && fullOrderDetails.paiements[0]?.method)
    ? fullOrderDetails.paiements[0].method
    : (fullOrderDetails?.note ?? 'Non renseigné');
  const customerName = fullOrderDetails?.fullname
    || (fullOrderDetails?.customer?.first_name && fullOrderDetails?.customer?.last_name
        ? `${fullOrderDetails.customer.first_name} ${fullOrderDetails.customer.last_name}`
        : 'Client inconnu');
  const customerEmail = fullOrderDetails?.email || fullOrderDetails?.customer?.email || '';
  const customerPhone = fullOrderDetails?.phone || fullOrderDetails?.customer?.phone || '';
  const customerAddress = fullOrderDetails?.address || "Adresse non spécifiée";

  
  const tableNumber = fullOrderDetails?.table_number || '';
  const tableType = fullOrderDetails?.table_type || '';
  const numberOfGuests = fullOrderDetails?.places || 0;

  
  const translateTableType = (tableType: string | undefined): string => {
    if (!tableType) return 'Table';
    
    switch (tableType) {
      case 'TABLE_SQUARE':
        return 'Table carrée';
      case 'TABLE_RECTANGLE':
        return 'Table ronde';  
      case 'TABLE_ROUND':
        return 'Table longue';
      default:
        return tableType;
    }
  };

  // Formater l'heure de réservation
  let reservationTime = '';
  if (fullOrderDetails?.time) {
    try {
      const d = new Date(fullOrderDetails.time);
      reservationTime = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
    } catch (error) {
      console.error('Erreur lors du formatage de l\'heure de réservation:', error);
      reservationTime = '';
    }
  }

  // Formater la date de réservation
  let reservationDate = fullOrderDetails?.date || '';
  let formattedReservationDate = '';
  if (reservationDate) {
    try {
      const d = new Date(reservationDate);
      formattedReservationDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    } catch (error) {
      console.error('Erreur lors du formatage de la date de réservation:', error);
      formattedReservationDate = reservationDate;
    }
  }

  console.log('[OrderDetails] Informations de réservation:', { 
    tableNumber, 
    tableType,
    reservationDate, 
    formattedReservationDate,
    reservationTime, 
    numberOfGuests
  });

  // Date de la commande 
  let orderDate = '';
  if (fullOrderDetails?.date) {
    const d = new Date(fullOrderDetails.date);
    orderDate = `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth()+1).toString().padStart(2, '0')}/${d.getFullYear()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  } else {
    orderDate = 'Date inconnue';
  }

  // Remplacer la génération du shortOrderId par la référence
  const orderReference = fullOrderDetails?.reference || 'Référence non disponible';

  // Contenu de la commande : mapping précis des items
  const orderItems = Array.isArray(fullOrderDetails?.order_items) && fullOrderDetails.order_items.length > 0
    ? fullOrderDetails.order_items.map((item: any) => ({
        id: item.id,
        name: item.dish?.name || 'Article inconnu',
        price: item.amount || 0,
        quantity: item.quantity || 1,
        image: item.dish?.image
          ? `${process.env.NEXT_PUBLIC_API_URL ? process.env.NEXT_PUBLIC_API_URL + '/' : '/'}${item.dish.image}`
          : '/images/food2.png',
      }))
    : [
       
      ];

  const totalPrice = orderItems.reduce((sum: number, item: any) => sum + (item.price * (item.quantity ?? 1)), 0);

  
  const tax = typeof fullOrderDetails?.tax === 'number' ? fullOrderDetails.tax : undefined;

   
  const getProgressStyles = () => {
    const styles = {
      // Étape 1 - Restaurant
      step1Border: 'border-[#F17922]',
      step1Bg: 'bg-white',
      step1Icon: '/icons/poulet.png',
      
      // Ligne entre étape 1 et 2
      line1: 'bg-[#FFE8D7]',
      
      // Étape 2 - Préparation
      step2Border: 'border-[#F17922]',
      step2Bg: 'bg-white',
      step2Icon: '/icons/package_orange.png',
      
      // Ligne entre étape 2 et 3
      line2: 'bg-[#FFE8D7]',
      
      // Étape 3 - Livraison
      step3Border: 'border-[#F17922]',
      step3Bg: 'bg-white',
      step3Icon: '/icons/location-outline.png',
    };
    
    // Pour les commandes TABLE, si le statut est PRÊT, tout est complété
    if (fullOrderDetails?.type === 'TABLE' && currentStatus === 'PRÊT') {
      styles.step1Bg = 'bg-[#F17922]';
      styles.step1Icon = '/icons/poulet-blanc.png';
      styles.line1 = 'bg-[#F17922]';
      styles.step2Bg = 'bg-[#F17922]';
      styles.step2Icon = '/icons/package.png';
      styles.line2 = 'bg-[#F17922]';
      styles.step3Bg = 'bg-[#F17922]';
      styles.step3Icon = '/icons/location_white.png';
      return styles;
    }
    
    // Statut ACCEPTÉE ou EN PRÉPARATION - Restaurant actif
    if (currentStatus === 'EN COURS' || currentStatus === 'EN PRÉPARATION') {
      styles.step1Bg = 'bg-[#F17922]';
      styles.step1Icon = '/icons/poulet-blanc.png';
    }
    
    // Statut PRÊT - Restaurant et préparation actifs
    else if (currentStatus === 'PRÊT') {
      styles.step1Bg = 'bg-[#F17922]';
      styles.step1Icon = '/icons/poulet-blanc.png';
      styles.line1 = 'bg-[#F17922]';
      styles.step2Bg = 'bg-[#F17922]';
      styles.step2Icon = '/icons/package.png';
    }
    
    // Statut EN LIVRAISON - Restaurant, préparation actifs et livraison en cours
    else if (currentStatus === 'LIVRAISON') {
      styles.step1Bg = 'bg-[#F17922]';
      styles.step1Icon = '/icons/poulet-blanc.png';
      styles.line1 = 'bg-[#F17922]';
      styles.step2Bg = 'bg-[#F17922]';
      styles.step2Icon = '/icons/package.png';
    }
    
    // Statut LIVRÉ ou COLLECTÉ - Tout est terminé
    else if (currentStatus === 'LIVRÉ' || currentStatus === 'COLLECTÉ') {
      styles.step1Bg = 'bg-[#F17922]';
      styles.step1Icon = '/icons/poulet-blanc.png';
      styles.line1 = 'bg-[#F17922]';
      styles.step2Bg = 'bg-[#F17922]';
      styles.step2Icon = '/icons/package.png';
      styles.line2 = 'bg-[#F17922]';
      styles.step3Bg = 'bg-[#F17922]';
      styles.step3Icon = '/icons/location_white.png';
    }
    
    // Statut ANNULÉE - Style spécial pour les commandes annulées
    else if (currentStatus === 'ANNULÉE') {
      styles.step1Border = 'border-[#FF3B30]';
      styles.step1Bg = 'bg-[#FF3B30]';
      styles.step1Icon = '/icons/poulet-blanc.png';
      styles.line1 = 'bg-[#FFE8D7]';
      styles.step2Border = 'border-[#FF3B30]';
      styles.step2Bg = 'bg-white';
      styles.line2 = 'bg-[#FFE8D7]';
      styles.step3Border = 'border-[#FF3B30]';
      styles.step3Bg = 'bg-white';
    }
    
    return styles;
  };

  // Fonction pour formater l'adresse
  const formatAddress = (addressString: string) => {
    try {
      const addressObj = JSON.parse(addressString);
      const parts = [];
      
      if (addressObj.title) parts.push(addressObj.title);
      if (addressObj.address || addressObj.road) parts.push(addressObj.address || addressObj.road);
      if (addressObj.city) parts.push(addressObj.city);
      if (addressObj.postalCode) parts.push(addressObj.postalCode);
      
      return parts.join(', ') || 'Adresse non disponible';
    } catch {
      return addressString || 'Adresse non disponible';
    }
  };

  return (
    <div className="bg-white rounded-xl h-screen overflow-hidden shadow-sm">
      <div className="">
        <div className="flex flex-col md:flex-row gap-12">
       
          <div className="md:w-3/5 p-4 sm:p-6 h-screen">
            {/* En-tête avec informations générales */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="xl:text-lg text-sm font-medium text-[#F17922]">Information sur la commande <span className="text-xs font-bold ">#{orderReference}</span></h2>
                <div className="flex items-center space-x-2">
                  {/* <span className="px-3 py-1.5 border-1 border-[#FBD2B5] font-bold text-[#FF3B30] text-[8px] lg:text-xs rounded-lg">
                    {currentStatus}
                  </span>
                   */}
                  {/* Liste déroulante pour mettre à jour le statut */}
                  <select 
                    value={currentStatus}
                    onChange={handleStatusChange}
                    className="border border-[#F17922] text-[#F17922] text-xs w-50 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#F17922] cursor-pointer"
                  >
                    {/* Afficher les statuts visibles avec des styles différents selon leur disponibilité */}
                    {getVisibleStatuses().map((status) => {
                      const isAvailable = isStatusAvailable(status, currentStatus as Order['status']);
                      
                      // Déterminer la classe CSS en fonction de l'état du statut
                      let optionClass = '';
                      
                      if (status === currentStatus) {
                        optionClass = 'font-bold text-[#F17922]';
                      } else if (isAvailable) {
                        optionClass = 'text-[#F17922]';
                      } else {
                        optionClass = 'text-gray-300';
                      }
                      
                      return (
                        <option 
                          key={status} 
                          value={status}
                          disabled={!isAvailable}
                          className={optionClass}
                        >
                          {status} 
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Informations commande */}
              <div className="mt-4 space-y-4">
                <div className="flex  gap-40 items-center">
                  <p className="lg:text-sm text-xs text-gray-500">Restaurant</p>
                  <p className="font-bold text-[#F17922] lg:text-sm text-xs">{restaurantName}</p>
                </div>
                
                <div className="flex gap-26  items-center">
                  <p className="lg:text-sm text-xs font-medium text-[#71717A]">Type de commande</p>
                  <div className="inline-flex items-center  rounded-[10px] px-3 py-[4px] text-xs font-medium  bg-[#FBDBA7] text-[#71717A]">
                    {translateOrderType(fullOrderDetails?.type)}
                    <Image className='ml-2' src="/icons/deliver.png" alt="truck" width={15} height={15} />
                  </div>
                </div>
                
                <div className="flex gap-22  items-center">
                  <p className="lg:text-sm text-xs font-medium text-[#71717A]">Date de la commande</p>
                  <p className="font-bold text-xs lg:text-sm text-[#71717A]">{orderDate}</p>
                </div>
                
                <div className="flex gap-41  items-center">
                  <p className="lg:text-sm text-xs font-medium text-[#71717A]">Référence</p>
                  <p className="font-bold text-xs lg:text-sm text-[#71717A]">{orderReference}</p>
                </div>
                
                <div className="flex gap-32  items-center">
                  <p className="lg:text-sm text-xs font-medium text-[#71717A]">Mode paiement</p>
                  <div className="flex items-center">
                    <p className="font-bold text-xs lg:text-sm text-[#71717A]">{paymentMethod}</p>
                  </div>
                </div>
                
                {/* Section de réservation - Afficher uniquement pour les commandes de type TABLE */}
                {fullOrderDetails?.type === 'TABLE' && (
                  <div className="mt-6 border-t pt-4 border-gray-200">
                    <h3 className="text-lg font-medium mb-4 text-[#F17922]">Informations de réservation</h3>
                    <div className="bg-[#FFF9F2] p-4 rounded-lg border border-[#FFE8D7]">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center">
                          <Image src="/icons/table.png" alt="Table" width={20} height={20} className="mr-2" />
                          <div>
                            <span className="text-sm font-medium text-[#71717A]">Table</span>
                            <p className="text-sm font-bold text-[#71717A]">{translateTableType(tableType) || 'Non spécifié'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Image src="/icons/people.png" alt="Convives" width={20} height={20} className="mr-2" />
                          <div>
                            <span className="text-sm font-medium text-[#71717A]">Nombre de places</span>
                            <p className="text-sm font-bold text-[#71717A]">{numberOfGuests || '0'} {numberOfGuests > 1 ? 'personnes' : 'personne'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Image src="/icons/calendar.png" alt="Date" width={20} height={20} className="mr-2" />
                          <div>
                            <span className="text-sm font-medium text-[#71717A]">Date</span>
                            <p className="text-sm font-bold text-[#71717A]">{formattedReservationDate || 'Non spécifiée'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <Image src="/icons/clock.png" alt="Heure" width={20} height={20} className="mr-2" />
                          <div>
                            <span className="text-sm font-medium text-[#71717A]">Heure</span>
                            <p className="text-sm font-bold text-[#71717A]">{reservationTime || 'Non spécifiée'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Détails de la commande */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-[#F17922]">Commande</h3>
              <div className='flex flex-row items-center justify-between mb-6'>
                <span className='text-xs font-medium text-[#71717A]'>
                  Coût de la commande
                </span>
                <span className='text-sm font-bold text-[#F17922]'>
                  {totalPrice.toLocaleString()}F
                </span>
              </div>
              {/* Articles de la commande avec prix */}
              {orderItems.map((item: { id: string; name: string; price: number; quantity: number; image: string }) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-16 h-12 my-2 rounded-lg mr-3 relative overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        width={80}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#71717A]">{item.price.toLocaleString()}F</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Partie droite (1/3) */}
          <div className="md:w-3/6 p-4 sm:p-6 bg-[#FBFBFB] h-screen">
            {/* Informations client */}
            <div className="mb-8">
              <p className="text-[18px] font-medium text-[#F17922] mb-4">Client</p>
              <div className='flex flex-row items-center justify-between mb-4'>
                <p className="text-sm text-[#71717A]">Client</p>
                <p className="text-sm text-[#71717A] font-bold">{customerName}</p>
              </div>
            
              {/* Adresse */}
              <div className="flex flex-row justify-between items-start mb-4">
                <p className="text-sm text-[#71717A]">Adresse</p>
                <p className="text-sm text-[#71717A] font-bold text-right max-w-[250px]">
                  {formatAddress(customerAddress)}
                </p>
              </div>
              {customerEmail && (
                <div className='flex flex-row items-center justify-between mb-2'>
                  <p className="text-sm text-[#71717A]">Email</p>
                  <p className="text-sm text-[#71717A] font-bold">{customerEmail}</p>
                </div>
              )}
              {customerPhone && (
                <div className='flex flex-row items-center justify-between mb-2'>
                  <p className="text-sm text-[#71717A]">Téléphone</p>
                  <p className="text-sm text-[#71717A] font-bold">{customerPhone}</p>
                </div>
              )}
            </div>
            
            {/* Section livraison */}
            <div className="mb-8">
              <p className="text-[18px] font-medium text-[#F17922] mb-4">{getDeliverySectionTitle()}</p>
              <div className="bg-white p-5 px-2 border-[#F17922] border-1 rounded-xl">
                <div className="flex justify-between items-center ">
                  {/* Étape 1 - Restaurant */}
                  <div className={`w-10 h-10 rounded-[12px] border-1 ${getProgressStyles().step1Border} ${getProgressStyles().step1Bg} flex items-center justify-center transition-all duration-500 ease-in-out transform hover:scale-110`}>
                    <Image src={getProgressStyles().step1Icon} alt="restaurant" width={24} height={24} />
                  </div>
                  
                  {/* Ligne entre étape 1 et 2 */}
                  <div className={`flex-1 h-1 ${getProgressStyles().line1} transition-all duration-500 ease-in-out`}></div>
                  
                  {/* Étape 2 - Préparation */}
                  <div className={`w-10 h-10 rounded-[12px] border-1 ${getProgressStyles().step2Border} ${getProgressStyles().step2Bg} flex items-center justify-center transition-all duration-500 ease-in-out transform hover:scale-110`}>
                    <Image src={getProgressStyles().step2Icon} alt="box" width={24} height={24} />
                  </div>
                  
                  {/* Ligne entre étape 2 et 3 */}
                  <div className={`flex-1 h-1 ${getProgressStyles().line2} transition-all duration-500 ease-in-out`}></div>
                  
                  {/* Étape 3 - Livraison */}
                  <div className={`w-10 h-10 rounded-[12px] border-1 ${getProgressStyles().step3Border} ${getProgressStyles().step3Bg} flex items-center justify-center transition-all duration-500 ease-in-out transform hover:scale-110`}>
                    <Image src={getProgressStyles().step3Icon} alt="pin" width={24} height={24} />
                  </div>
                </div>
              
              </div>
              <p className="text-xs text-center mt-4 text-[#71717A]">Processus de livraison proposé par <span className="text-[#71717A] font-bold">Turbo Delivery</span></p>
              <button className="w-full mt-4 py-3 px-4 bg-[#F17922] hover:bg-[#F17972] cursor-pointer rounded-xl flex items-center justify-center text-sm font-medium text-white">
                <Image src="/icons/external-link.png" alt="eye" width={20} height={20} className="mr-2" />
                <span>Voir le suivi de livraison</span>
              </button>
            </div>
            
            {/* Informations de prix */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#71717A]">Prix net</span>
                <span className="text-sm font-bold text-[#71717A]">{totalPrice.toLocaleString()}F</span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#71717A]">Taxe</span>
                <span className="text-sm font-bold text-[#71717A]">{tax !== undefined ? tax : '--'}</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-[#71717A]">Réduction</span>
                <span className="text-sm font-bold text-[#71717A]">--</span>
              </div>
              
              {/* Total de la commande */}
              <div className="flex justify-between items-center">
                <span className="text-[18px] font-medium text-[#F17922]">Prix Total</span>
                <div className="bg-[#F17922] text-white px-6 py-2 rounded-xl font-bold">
                  {totalPrice.toLocaleString()}F
                </div>
              </div>

              {/* Boutons d'action pour les nouvelles commandes */}
              {order.status === 'NOUVELLE' && (
                <div className="mt-6 flex justify-between gap-4">
                  <button 
                    onClick={() => onReject && onReject(order.id)}
                    className="w-full py-3 px-4 bg-white border border-[#FF3B30] hover:bg-gray-50 text-[#FF3B30] rounded-xl font-medium"
                  >
                    Refuser
                  </button>
                  <button 
                    onClick={() => onAccept && onAccept(order.id)}
                    className="w-full py-3 px-4 bg-[#F17922] hover:bg-[#F17972] text-white rounded-xl font-medium"
                  >
                    Accepter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Bouton retour */}
      <button 
        onClick={onBack}
        className="absolute top-4 left-4 p-2 rounded-full bg-white shadow-md hover:bg-gray-100"
      >
        <Image src="/icons/arrow-left.png" alt="Retour" width={24} height={24} />
      </button>
    </div>
  );
};

export default OrderDetails;
