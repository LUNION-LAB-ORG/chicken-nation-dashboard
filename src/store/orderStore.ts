'use client';

import { create } from 'zustand';
import {
  Order,
  OrderStatus, 
} from '@/types/order';
import {
  getOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  OrderSearchParams
} from '@/services/orderService';

interface OrderState {
  orders: Order[];
  selectedOrder: Order | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: OrderSearchParams;
  
  // Actions
  fetchOrders: (params?: OrderSearchParams) => Promise<void>;
  fetchOrderById: (id: string) => Promise<Order | null>;
  setSelectedOrder: (order: Order | null) => void;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<Order | null>;
  deleteOrder: (id: string) => Promise<boolean>;
  setFilter: (key: string, value: any) => void;
  resetFilters: () => void;
  setCurrentPage: (page: number) => void;
  getOrderById: (id: string) => Order | null;
}

const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 10,
};

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  pagination: defaultPagination,
  isLoading: false,
  error: null,
  filters: {},

  fetchOrders: async (params?: OrderSearchParams) => {
    set({ isLoading: true, error: null });
    try {
    
      const queryParams: OrderSearchParams = {
        page: get().pagination.currentPage,
        limit: get().pagination.itemsPerPage,
        ...params,
        ...get().filters,
      };

      
      const response = await getOrders(queryParams);
  
      
     
      if (response.data && response.data.length > 0) {
       
      } 
      
     
      if (response === null) {
        set({
          isLoading: false,
          error: "Erreur d'authentification. Redirection vers la page de connexion..."
        });
        return;
      }
      
      set({
        orders: response.data,
        pagination: {
          currentPage: response.meta.currentPage,
          totalPages: response.meta.totalPages,
          totalItems: response.meta.totalItems,
          itemsPerPage: response.meta.itemsPerPage,
        },
        isLoading: false,
      });
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des commandes',
      });
    }
  },

  fetchOrderById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = await getOrderById(id);
      
      
      if (order === null) {
        set({
          isLoading: false,
          selectedOrder: null,
          error: "Erreur d'authentification. Redirection vers la page de connexion..."
        });
        return null;
      }
      
      set({
        selectedOrder: order,
        isLoading: false,
      });
      return order;
    } catch (error) {
      console.error('Erreur lors du chargement de la commande:', error);
      set({
        isLoading: false,
        selectedOrder: null,
        error: error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement de la commande'
      });
      return null;
    }
  },

  setSelectedOrder: (order: Order | null) => {
    set({ selectedOrder: order });
  },

  updateOrderStatus: async (id: string, status: OrderStatus) => {
    set({ isLoading: true, error: null });
    try {
       const updatedOrder = await updateOrderStatus(id, status);
     
      
      // Mettre à jour la commande dans la liste
      set(state => {
         return {
          orders: state.orders.map(order => {
            if (order.id === id) {
               return { ...order, status };
            }
            return order;
          }),
          selectedOrder: state.selectedOrder?.id === id ? { ...state.selectedOrder, status } : state.selectedOrder,
          isLoading: false
        };
      });
      
      console.log(`[orderStore] Mise à jour du statut terminée avec succès`);
      return updatedOrder;
    } catch (error) {
      console.error('[orderStore] Erreur lors de la mise à jour du statut de la commande:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour du statut de la commande'
      });
      // Propager l'erreur au lieu de retourner null
      throw error;
    }
  },

  deleteOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
    
      await deleteOrder(id);
      
      
      set(state => ({
        orders: state.orders.filter(order => order.id !== id),
        selectedOrder: state.selectedOrder?.id === id ? null : state.selectedOrder,
        isLoading: false
      }));
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la commande:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue lors de la suppression de la commande'
      });
      return false;
    }
  },

  setFilter: (key: string, value: any) => {
    set(state => ({
      filters: {
        ...state.filters,
        [key]: value,
      },
      pagination: {
        ...state.pagination,
        currentPage: 1,
      }
    }));
    get().fetchOrders();
  },

  resetFilters: () => {
    set({
      filters: {},
      pagination: {
        ...get().pagination,
        currentPage: 1,
      }
    });
    get().fetchOrders();
  },

  setCurrentPage: (page: number) => {
    set(state => ({
      pagination: {
        ...state.pagination,
        currentPage: page,
      }
    }));
    get().fetchOrders();
  },

  getOrderById: (id: string) => {
    const order = get().orders.find(o => o.id === id);
    if (!order) return null;
    return order;
  },
}));
