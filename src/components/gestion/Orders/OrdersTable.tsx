"use client"

import { useState, useMemo, useCallback, useEffect } from 'react'
import { OrderRow } from './OrderRow'
import { Pagination } from '@/components/ui/pagination'
import { TableHeader } from './TableHeader'
import { OrderFilters } from './OrderFilters'
import { toast } from 'react-hot-toast'
import { useOrderStore } from '@/store/orderStore'
import { OrderStatus, OrderType, updateOrderStatus } from '@/services/orderService'

// Interface existante pour les commandes (ne pas modifier pour garder l'UI intacte)
export interface Order {
  id: string
  reference: string
  clientName: string
  date: string
  status: 'NOUVELLE' | 'EN COURS' | 'EN PRÉPARATION' | 'LIVRÉ' | 'COLLECTÉ' | 'ANNULÉE' | 'LIVRAISON' | 'PRÊT'
  totalPrice: number
  deliveryPrice: number
  userId: string
  orderType: 'À livrer' | 'À table' | 'À récupérer'
  address: string
  tableNumber?: string
  hidden?: boolean
}

interface OrdersTableProps {
  onViewDetails: (order: Order) => void;
}

// Fonction pour convertir les données de l'API en format attendu par l'UI
const mapApiOrderToUiOrder = (apiOrder: any): Order => {
  // Vérifier que apiOrder est un objet valide
  if (!apiOrder || typeof apiOrder !== 'object') {
     return {
      id: 'error',
      reference: 'REF-ERROR',
      clientName: 'Erreur de données',
      date: new Date().toLocaleDateString('fr-FR'),
      status: 'ANNULÉE',
      totalPrice: 0,
      deliveryPrice: 0,
      userId: '',
      orderType: 'À livrer',
      address: '',
      hidden: false
    };
  }

  // Mapper le statut de l'API vers le statut de l'UI
  let uiStatus: Order['status'];
  switch (apiOrder.status) {
    case 'PENDING': uiStatus = 'NOUVELLE'; break;
    case 'ACCEPTED': uiStatus = 'EN COURS'; break;
    case 'IN_PROGRESS': uiStatus = 'EN COURS'; break;
    case 'READY': uiStatus = 'PRÊT'; break;
    case 'DELIVERED': uiStatus = 'LIVRÉ'; break;
    case 'COLLECTED': uiStatus = 'COLLECTÉ'; break;
    case 'CANCELLED': uiStatus = 'ANNULÉE'; break;
    case 'PICKED_UP': uiStatus = 'LIVRAISON'; break;
    case 'COMPLETED': uiStatus = 'LIVRÉ'; break;
    case 'PREPARATION': uiStatus = 'EN PRÉPARATION'; break;
    default: uiStatus = 'NOUVELLE';
  }

  // Mapper le type de commande de l'API vers le type de l'UI
  let uiOrderType: Order['orderType'];
  switch (apiOrder.type) {
    case 'DELIVERY': uiOrderType = 'À livrer'; break;
    case 'PICKUP': uiOrderType = 'À récupérer'; break;
    case 'TABLE': uiOrderType = 'À table'; break;
    default: uiOrderType = 'À livrer';
  }

  // Construire le nom du client de manière sécurisée
  let clientName = 'Client inconnu';
  if (apiOrder.customer) {
    const firstName = apiOrder.customer.first_name || '';
    const lastName = apiOrder.customer.last_name || '';
    const email = apiOrder.customer.email || '';
    
    const fullName = `${firstName} ${lastName}`.trim();
    clientName = fullName || email || apiOrder.fullname || 'Client inconnu';
  } else if (apiOrder.fullname) {
    clientName = apiOrder.fullname;
  }

  // Formater la date de manière sécurisée
  let date = 'Date inconnue';
  try {
    if (apiOrder.created_at) {
      date = new Date(apiOrder.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  } catch (error) {
    console.error('Erreur lors du formatage de la date:', error);
  }

  // Calculer le prix total à partir des order_items si disponible
  let totalPrice = 0;
  if (Array.isArray(apiOrder.order_items) && apiOrder.order_items.length > 0) {
    totalPrice = apiOrder.order_items.reduce((sum: number, item: any) => {
      const itemPrice = typeof item.amount === 'number' ? item.amount : 0;
      const quantity = typeof item.quantity === 'number' ? item.quantity : 1;
      return sum + (itemPrice * quantity);
    }, 0);
  } else if (typeof apiOrder.amount === 'number') {
    totalPrice = apiOrder.amount;
  } else if (typeof apiOrder.total === 'number') {
    totalPrice = apiOrder.total;
  } else if (typeof apiOrder.price === 'number') {
    totalPrice = apiOrder.price;
  }
  
  // Extraire les valeurs numériques de manière sécurisée
  const deliveryPrice = typeof apiOrder.delivery_fee === 'number' ? apiOrder.delivery_fee : 0;
  
  // Extraire l'ID utilisateur de manière sécurisée
  const userId = apiOrder.customer?.id || '';
  
  // Extraire l'adresse de manière sécurisée
  let address = '';
  if (apiOrder.address) {
    if (typeof apiOrder.address === 'string') {
      address = apiOrder.address;
    } else if (typeof apiOrder.address === 'object') {
      // Si l'adresse est un objet, construire une adresse formatée
      const addressObj = apiOrder.address;
      const addressParts = [];
      
      if (addressObj.title) addressParts.push(addressObj.title);
      if (addressObj.address) addressParts.push(addressObj.address);
      if (addressObj.street) addressParts.push(addressObj.street);
      if (addressObj.city) addressParts.push(addressObj.city);
      
      address = addressParts.join(', ');
    }
  }
  
  // Construire et retourner l'objet Order pour l'UI
  return {
    id: apiOrder.id || 'ID inconnu',
    reference: apiOrder.reference || `ORD-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(Math.random() * 100000).toString().padStart(5, '0')}`,
    clientName,
    date,
    status: uiStatus,
    totalPrice,
    deliveryPrice,
    userId,
    orderType: uiOrderType,
    address,
    tableNumber: apiOrder.table_number || apiOrder.table_type,
    hidden: false
  };
};

// Fonction pour convertir les filtres de l'UI vers les filtres de l'API
const mapUiFilterToApiFilter = (filter: string): { status?: OrderStatus, type?: OrderType } => {
  switch (filter) {
    // Filtres par type
    case 'delivery': return { type: 'DELIVERY' };
    case 'pickup': return { type: 'PICKUP' };
    case 'table': return { type: 'TABLE' };
    
    // Filtre par statut (uniquement 'new' est disponible dans l'UI)
    case 'new': return { status: 'PENDING' };
    
    // Filtre par défaut (tous)
    default: return {};
  }
};

// Fonction de génération de données mockées retirée - l'API est maintenant utilisée

export function OrdersTable({ onViewDetails }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [localOrders, setLocalOrders] = useState<Order[]>([])
  
  // Utiliser le store pour les commandes
  const { 
    orders: apiOrders, 
    pagination, 
    isLoading, 
    error, 
    fetchOrders,
    updateOrderStatus: updateOrderStatusInStore,
    deleteOrder: deleteOrderInStore,
    setFilter,
    setCurrentPage: setStoreCurrentPage
  } = useOrderStore();

  // Charger les commandes au montage du composant
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Convertir les commandes de l'API en format UI
  useEffect(() => {
    if (apiOrders.length > 0) {
      console.log('Données brutes de la commande:', JSON.stringify(apiOrders[0], null, 2));
      const mappedOrders = apiOrders.map(mapApiOrderToUiOrder);
      setLocalOrders(mappedOrders);
    }
  }, [apiOrders, isLoading, error]);

  // Synchroniser la pagination avec le store
  useEffect(() => {
    setStoreCurrentPage(currentPage);
  }, [currentPage, setStoreCurrentPage]);

  // Synchroniser les filtres avec le store
  useEffect(() => {
    const apiFilter = mapUiFilterToApiFilter(activeFilter);
    if (apiFilter.status) {
      setFilter('status', apiFilter.status);
    } else if (apiFilter.type) {
      setFilter('type', apiFilter.type);
    } else {
      // Réinitialiser les filtres
      setFilter('status', undefined);
      setFilter('type', undefined);
    }
  }, [activeFilter, setFilter]);
  
  // Gérer les actions sur les commandes
  const handleAcceptOrder = useCallback((orderId: string) => {
    console.log(`[handleAcceptOrder] Début de l'acceptation de la commande ${orderId}`);
    updateOrderStatusInStore(orderId, 'ACCEPTED')
      .then((result) => {
        console.log(`[handleAcceptOrder] Résultat de l'API:`, result);
        setLocalOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: 'EN COURS' } : order
        ));
        toast.success(`Commande ${orderId} acceptée`);
      })
      .catch(error => {
        console.error('[handleAcceptOrder] Erreur lors de l\'acceptation de la commande:', error);
        toast.error(`Erreur: ${error.message || 'Impossible d\'accepter la commande'}`);
      });
  }, [updateOrderStatusInStore]);

  const handleRejectOrder = useCallback((orderId: string) => {
    console.log(`[handleRejectOrder] Début du refus de la commande ${orderId}`);
    updateOrderStatusInStore(orderId, 'CANCELLED')
      .then((result) => {
        console.log(`[handleRejectOrder] Résultat de l'API:`, result);
        setLocalOrders(prev => prev.map(order => 
          order.id === orderId ? { ...order, status: 'ANNULÉE' } : order
        ));
        toast.success(`Commande ${orderId} refusée`);
      })
      .catch(error => {
        console.error('[handleRejectOrder] Erreur lors du refus de la commande:', error);
        toast.error(`Erreur: ${error.message || 'Impossible de refuser la commande'}`);
      });
  }, [updateOrderStatusInStore]);

  const handleHideOrder = useCallback((orderId: string) => {
    setLocalOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, hidden: true } : order
    ));
    toast.success(`Commande ${orderId} masquée de la liste`);
  }, []);

  const handleRemoveOrder = useCallback((orderId: string) => {
    deleteOrderInStore(orderId)
      .then(success => {
        if (success) {
          setLocalOrders(prev => prev.filter(order => order.id !== orderId));
          toast.success(`Commande ${orderId} retirée de la liste`);
        } else {
          toast.error(`Erreur: Impossible de supprimer la commande ${orderId}`);
        }
      })
      .catch(error => {
        console.error('Erreur lors de la suppression de la commande:', error);
        toast.error(`Erreur: ${error.message || 'Impossible de supprimer la commande'}`);
      });
  }, [deleteOrderInStore]);

  const handleViewOrderDetails = useCallback((orderId: string) => {
    const order = localOrders.find(o => o.id === orderId);
    if (order) {
      onViewDetails(order);
    }
  }, [localOrders, onViewDetails]);

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      console.log(`[handleStatusChange] Début de la mise à jour du statut pour la commande ${orderId} vers ${newStatus}`);
      const result = await updateOrderStatusInStore(orderId, newStatus);
      console.log(`[handleStatusChange] Résultat de l'API:`, result);
      
      const uiStatus = convertApiStatusToUiStatus(newStatus);
      console.log(`[handleStatusChange] Statut converti pour l'UI: ${uiStatus}`);
      
      setLocalOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: uiStatus } : order
        )
      );
      toast.success(`Statut de la commande mis à jour avec succès`);
    } catch (error) {
      console.error('[handleStatusChange] Erreur lors de la mise à jour du statut:', error);
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  // Fonction pour convertir le statut API en statut UI
  const convertApiStatusToUiStatus = (apiStatus: string): Order['status'] => {
    // Mapping entre les statuts API et les statuts UI
    const statusMapping: Record<string, Order['status']> = {
      // Statuts en anglais (conversion vers format UI)
      'ACCEPTED': 'EN COURS',
      'IN_PROGRESS': 'EN COURS',
      'READY': 'PRÊT',
      'PICKED_UP': 'LIVRAISON',
      'DELIVERED': 'LIVRÉ',
      'CANCELLED': 'ANNULÉE',
      'COLLECTED': 'COLLECTÉ',
      'COMPLETED': 'LIVRÉ',
      'PENDING': 'NOUVELLE',
      'PREPARATION': 'EN PRÉPARATION'
    };
    
    return statusMapping[apiStatus] || 'NOUVELLE';
  };

  // Fonction pour convertir le statut UI en statut API
  const convertUiStatusToApiStatus = (uiStatus: Order['status']): OrderStatus => {
    // Mapping entre les statuts UI et les statuts API
    const statusMapping: Record<Order['status'], OrderStatus> = {
      'NOUVELLE': 'PENDING',
      'EN COURS': 'IN_PROGRESS',
      'PRÊT': 'READY',
      'LIVRAISON': 'PICKED_UP',
      'LIVRÉ': 'DELIVERED',
      'ANNULÉE': 'CANCELLED',
      'COLLECTÉ': 'COLLECTED',
      'EN PRÉPARATION': 'PREPARATION'
    };
    
    return statusMapping[uiStatus] || 'PENDING';
  };

  // Filtrer les commandes en fonction du filtre actif et de la date
  const filteredOrders = useMemo(() => {
    // D'abord, filtrer par visibilité
    let filtered = localOrders.filter(order => !order.hidden);
    
    // Ensuite, appliquer le filtre actif
    if (activeFilter === 'delivery') filtered = filtered.filter(order => order.orderType === 'À livrer');
    if (activeFilter === 'pickup') filtered = filtered.filter(order => order.orderType === 'À récupérer');
    if (activeFilter === 'table') filtered = filtered.filter(order => order.orderType === 'À table');
    if (activeFilter === 'new') filtered = filtered.filter(order => order.status === 'NOUVELLE');
    
    return filtered;
  }, [localOrders, activeFilter]);

  const itemsPerPage = pagination.itemsPerPage || 12;
  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(currentOrders.map(order => order.id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1); 
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentPage(1);
    
    // Convertir la date en format ISO pour l'API
    const isoDate = date.toISOString().split('T')[0];
    setFilter('startDate', isoDate);
  };

  // Afficher un indicateur de chargement
  if (isLoading && localOrders.length === 0) {
    return (
      <div className="min-w-full bg-white h-screen border-1 border-slate-300 p-3 rounded-xl overflow-hidden flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Afficher un message d'erreur
  if (error && localOrders.length === 0) {
    return (
      <div className="min-w-full bg-white h-screen border-1 border-slate-300 p-3 rounded-xl overflow-hidden flex justify-center items-center">
        <div className="text-red-500 text-center">
          <p className="text-lg font-medium">Erreur lors du chargement des commandes</p>
          <p className="text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-full bg-white h-screen border-1 border-slate-300 p-3 rounded-xl overflow-hidden">
      {/* Composant de filtres */}
      <OrderFilters 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange} 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      
      <div className="min-w-full">
        {/* Version mobile */}
        <div className="md:hidden px-4">
          {currentOrders.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              isSelected={selectedOrders.includes(order.id)}
              onSelect={(orderId, checked) => handleSelectOrder(orderId, checked)}
              onAccept={handleAcceptOrder}
              onReject={handleRejectOrder}
              onViewDetails={handleViewOrderDetails}
              onHideFromList={handleHideOrder}
              onRemoveFromList={handleRemoveOrder}
              isMobile={true}
            />
          ))}
        </div>

        {/* Version desktop */}
        <div className="hidden md:block overflow-hidden">
          <table className="min-w-full">
            <TableHeader 
              onSelectAll={handleSelectAll}
              isAllSelected={selectedOrders.length === currentOrders.length}
            />
            <tbody className="">
              {currentOrders.map((order) => (
                <OrderRow
                  key={order.id}
                  order={order}
                  isSelected={selectedOrders.includes(order.id)}
                  onSelect={(orderId, checked) => handleSelectOrder(orderId, checked)}
                  onAccept={handleAcceptOrder}
                  onReject={handleRejectOrder}
                  onViewDetails={handleViewOrderDetails}
                  onHideFromList={handleHideOrder}
                  onRemoveFromList={handleRemoveOrder}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-center py-4 px-2">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}