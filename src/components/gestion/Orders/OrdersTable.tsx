"use client"

import { useState, useMemo, useCallback } from 'react'
import { OrderRow } from './OrderRow'
import { Pagination } from '@/components/ui/pagination'
import { TableHeader } from './TableHeader'
import { users } from '@/data/MockedData'
import { OrderFilters } from './OrderFilters'
import { toast } from 'react-hot-toast'

export interface Order {
  id: string
  clientName: string
  date: string
  status: 'NOUVELLE' | 'EN COURS' | 'LIVRÉ' | 'COLLECTÉ' | 'ANNULÉE' | 'LIVRAISON' | 'PRÊT'
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

const generateOrders = (): Order[] => {
  const orderTypes = ['À livrer', 'À table', 'À récupérer'] as const;
  const statuses = ['NOUVELLE', 'EN COURS', 'LIVRÉ', 'COLLECTÉ', 'ANNULÉE', 'LIVRAISON', 'PRÊT'] as const;
  
  return users.slice(0, 24).map((user, index) => {
  
    const orderTypeIndex = Math.floor(Math.random() * 3);
    const orderType = orderTypes[orderTypeIndex];
    
    
    let status: typeof statuses[number];
    if (index < 8) {
      status = index % 2 === 0 ? 'NOUVELLE' : statuses[Math.floor(Math.random() * (statuses.length - 1)) + 1];
    } else {
      
      status = statuses[Math.floor(Math.random() * statuses.length)];
    }
    
    
    const tableNumber = orderType === 'À table' ? `${Math.floor(Math.random() * 20) + 1}` : undefined;
    
    return {
      id: `${index + 1}`.padStart(5, '0'),
      clientName: `${user.firstName} ${user.lastName}`,
      userId: user.id,
      date: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: status,
      totalPrice: 27000, 
      deliveryPrice: 0,
      orderType: orderType,
      address: 'Adresse Rue 2',
      tableNumber,
      hidden: false
    };
  });
};

export function OrdersTable({ onViewDetails }: OrdersTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedOrders, setSelectedOrders] = useState<string[]>([])
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [orders, setOrders] = useState<Order[]>(() => generateOrders())
  
  // gérer les actions sur les commandes
  const handleAcceptOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'EN COURS' } : order
    ));
    toast.success(`Commande ${orderId} acceptée`);
  }, []);

  const handleRejectOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, status: 'ANNULÉE' } : order
    ));
    toast.success(`Commande ${orderId} refusée`);
  }, []);

  const handleHideOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, hidden: true } : order
    ));
    toast.success(`Commande ${orderId} masquée de la liste`);
  }, []);

  const handleRemoveOrder = useCallback((orderId: string) => {
    setOrders(prev => prev.filter(order => order.id !== orderId));
    toast.success(`Commande ${orderId} retirée de la liste`);
  }, []);

   
  const handleViewOrderDetails = useCallback((orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order) {
      onViewDetails(order);
    }
  }, [orders, onViewDetails]);

  // Filtrer les commandes en fonction du filtre actif et de la date
  const filteredOrders = useMemo(() => {
    // D'abord, filtrer par visibilité
    let filtered = orders.filter(order => !order.hidden);
    
    // Ensuite, appliquer le filtre actif
    if (activeFilter === 'delivery') filtered = filtered.filter(order => order.orderType === 'À livrer');
    if (activeFilter === 'pickup') filtered = filtered.filter(order => order.orderType === 'À récupérer');
    if (activeFilter === 'table') filtered = filtered.filter(order => order.orderType === 'À table');
    if (activeFilter === 'new') filtered = filtered.filter(order => order.status === 'NOUVELLE');
    
   
    
    return filtered;
  }, [orders, activeFilter]);

  const itemsPerPage = 12  
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(currentOrders.map(order => order.id))
    } else {
      setSelectedOrders([])
    }
  }

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId])
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId))
    }
  }

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    setCurrentPage(1); 
  };

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setCurrentPage(1); 
  };

  return (
    <div className="min-w-full bg-white h-screen border-1 border-slate-300 p-3 rounded-xl overflow-hidden">
      {/* Composant de filtres */}
      <OrderFilters 
        activeFilter={activeFilter} 
        onFilterChange={handleFilterChange} 
        selectedDate={selectedDate}
        onDateChange={handleDateChange}
      />
      
      <div className="overflow-hidden">
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