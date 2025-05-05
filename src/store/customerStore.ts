'use client';

import { create } from 'zustand';
import { Customer, CustomerQuery, getCustomers, getCustomerById } from '@/services/customerService';

interface CustomerState {
  customers: Customer[];
  selectedCustomer: Customer | null;
  isLoading: boolean;
  error: string | null;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  filters: {
    showConnectedOnly: boolean;
    search: string;
    status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | undefined;
  };
  
  // Actions
  fetchCustomers: (params?: CustomerQuery) => Promise<void>;
  fetchCustomerById: (id: string) => Promise<Customer | null>;
  setSelectedCustomer: (customer: Customer | null) => void;
  setShowConnectedOnly: (value: boolean) => void;
  setSearch: (value: string) => void;
  setStatus: (value: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | undefined) => void;
  setCurrentPage: (page: number) => void;
  getCustomerById: (id: string) => Customer | null;
}

const defaultPagination = {
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 8,
};

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  pagination: defaultPagination,
  isLoading: false,
  error: null,
  filters: {
    showConnectedOnly: false,
    search: '',
    status: undefined,
  },

  fetchCustomers: async (params?: CustomerQuery) => {
    set({ isLoading: true, error: null });
    try {
      // Préparer les paramètres de requête
      const queryParams: CustomerQuery = {
        page: get().pagination.currentPage,
        limit: get().pagination.itemsPerPage,
        ...params,
      };

      // Ajouter le filtre isConnected si nécessaire
      if (get().filters.showConnectedOnly) {
        queryParams.status = 'ACTIVE';
      } else if (get().filters.status) {
        queryParams.status = get().filters.status;
      }

      // Ajouter la recherche si définie
      if (get().filters.search) {
        queryParams.search = get().filters.search;
      }

     
      const response = await getCustomers(queryParams);
      
      
      // Si la réponse est null (erreur d'authentification générée)
      if (response === null) {
        set({
          isLoading: false,
          error: "Erreur d'authentification. Redirection vers la page de connexion..."
        });
        return;
      }
      
      // Correction : gérer à la fois tableau simple et pagination
      if (Array.isArray(response)) {
        set({
          customers: response,
          pagination: {
            currentPage: 1,
            totalPages: 1,
            totalItems: response.length,
            itemsPerPage: response.length,
          },
          isLoading: false,
        });
        return;
      }
      if (response.data && response.meta) {
        set({
          customers: response.data,
          pagination: {
            currentPage: response.meta.currentPage,
            totalPages: response.meta.totalPages,
            totalItems: response.meta.totalItems,
            itemsPerPage: response.meta.itemsPerPage,
          },
          isLoading: false,
        });
        return;
      }
      // Cas inattendu : fallback
      set({
        customers: [],
        pagination: {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 8,
        },
        isLoading: false,
      });
      return;
    } catch (error) {
      console.error('Erreur lors du chargement des clients:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement des clients',
      });
    }
  },

  fetchCustomerById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
     
      const customer = await getCustomerById(id);
    
      
       if (customer === null) {
        set({
          isLoading: false,
          selectedCustomer: null,
          error: "Erreur d'authentification. Redirection vers la page de connexion..."
        });
        return null;
      }
      
      set({
        selectedCustomer: customer,
        isLoading: false,
      });
      return customer;
    } catch (error) {
      console.error('Erreur lors du chargement du client:', error);
      // Si c'est une 404, on recharge la liste des clients
      if (error instanceof Error && error.message.includes('404')) {
        get().fetchCustomers(); // Recharger la liste
      }
      set({
        isLoading: false,
        selectedCustomer: null,
        error: error instanceof Error ? error.message : 'Une erreur est survenue lors du chargement du client'
      });
      return null;
    }
  },

  setSelectedCustomer: (customer: Customer | null) => {
    set({ selectedCustomer: customer });
  },

  setShowConnectedOnly: (value: boolean) => {
    set((state) => ({
      filters: {
        ...state.filters,
        showConnectedOnly: value,
      },
      pagination: {
        ...state.pagination,
        currentPage: 1,  
      }
    }));
    get().fetchCustomers();
  },

  setSearch: (value: string) => {
    set((state) => ({
      filters: {
        ...state.filters,
        search: value,
      },
      pagination: {
        ...state.pagination,
        currentPage: 1,
      }
    }));
    // Debounce pour éviter trop d'appels API pendant la frappe
    const debounceTimer = setTimeout(() => {
      get().fetchCustomers();
    }, 500);
    return () => clearTimeout(debounceTimer);
  },

  setStatus: (value: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | undefined) => {
    set((state) => ({
      filters: {
        ...state.filters,
        status: value,
      },
      pagination: {
        ...state.pagination,
        currentPage: 1,
      }
    }));
    get().fetchCustomers();
  },

  setCurrentPage: (page: number) => {
    set((state) => ({
      pagination: {
        ...state.pagination,
        currentPage: page,
      }
    }));
    get().fetchCustomers();
  },

  getCustomerById: (id: string) => {
    const customer = get().customers.find(c => c.id === id);
    if (!customer) return null;
    return customer;
  },
}));
