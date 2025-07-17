import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getCustomers, CustomerQuery, Customer } from '@/services/customerService';

interface UseCustomersQueryParams {
  searchQuery?: string;
  showConnectedOnly?: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | undefined;
  restaurantId?: string;
}

interface UseCustomersQueryReturn {
  // Données
  customers: Customer[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setCurrentPage: (page: number) => void;
  refetch: () => void;
}

export function useCustomersQuery({
  searchQuery,
  showConnectedOnly = false,
  status,
  restaurantId
}: UseCustomersQueryParams): UseCustomersQueryReturn {
  const [currentPage, setCurrentPageState] = useState(1);
  const queryClient = useQueryClient();

  // ✅ Construire les filtres API - recherche côté serveur
  const buildApiFilters = useCallback((): CustomerQuery => {
    const apiFilters: CustomerQuery = {
      page: currentPage,
      limit: 10
    };

    // ✅ Envoyer la recherche côté serveur
    if (searchQuery && searchQuery.trim()) {
      apiFilters.search = searchQuery.trim();
    }

    if (showConnectedOnly) {
      apiFilters.status = 'ACTIVE';
    }

    if (status) {
      apiFilters.status = status;
    }

    if (restaurantId) {
      apiFilters.restaurantId = restaurantId;
    }

    return apiFilters;
  }, [currentPage, searchQuery, showConnectedOnly, status, restaurantId]);

  // ✅ Clé de requête unique basée sur tous les filtres - exactement comme OrdersQuery
  const queryKey = [
    'customers',
    currentPage,
    searchQuery,
    showConnectedOnly,
    status,
    restaurantId
  ].filter(Boolean);

  // ✅ Query TanStack - exactement comme OrdersQuery
  const {
    data,
    isLoading,
    error
  } = useQuery({
    queryKey,
    queryFn: async () => {
      const filters = buildApiFilters();
      const result = await getCustomers(filters);
      return result;
    },
    staleTime: 30000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // ✅ Reset page à 1 quand les filtres changent - exactement comme OrdersQuery
  const isPageChangeRef = useRef(false);
  
  // ✅ Retourner à la page 1 quand les filtres changent
  const setCurrentPage = useCallback((page: number) => {
    isPageChangeRef.current = true; // Marquer comme changement de page intentionnel
    setCurrentPageState(page);
  }, []);

  // ✅ Reset page quand les filtres changent (pas lors du changement de page)
  useEffect(() => {
    // Si c'est un changement de page intentionnel, ne pas reset
    if (isPageChangeRef.current) {
      isPageChangeRef.current = false;
      return;
    }
    
    // Sinon, reset à la page 1 car les filtres ont changé
    if (currentPage !== 1) {
      setCurrentPageState(1);
    }
  }, [searchQuery, showConnectedOnly, status, restaurantId, currentPage]);

  // ✅ Invalider le cache pour forcer un refresh
  const forceRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['customers'] });
  }, [queryClient]);

  // ✅ Recherche côté serveur - pas de filtrage côté client
  const customers = data?.data || [];

  return {
    customers: customers,
    totalItems: data?.meta?.totalItems || 0,
    totalPages: data?.meta?.totalPages || 0,
    currentPage: currentPage,
    isLoading,
    error: error as Error | null,
    setCurrentPage,
    refetch: forceRefetch
  };
}

// ✅ Hook spécialisé pour compter le nombre total de clients
export function useCustomersCount(params: Omit<UseCustomersQueryParams, 'searchQuery'> = {}) {
  const { data } = useQuery({
    queryKey: ['customers-count', params.restaurantId, params.status],
    queryFn: async () => {
      const filters: CustomerQuery = {
        page: 1,
        limit: 1000, // ✅ Limite élevée pour récupérer un maximum de clients
        status: params.status,
        restaurantId: params.restaurantId
      };
      
      const result = await getCustomers(filters);
      console.log('🔍 [useCustomersCount] Réponse API pour comptage:', {
        totalItems: result?.meta?.totalItems,
        dataLength: result?.data?.length,
        meta: result?.meta
      });
      
      return result;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - plus long car le comptage change moins souvent
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  // ✅ Retourner le total avec fallback intelligent
  const totalCount = data?.meta?.totalItems || data?.data?.length || 0;
  
  return {
    totalCount,
    isLoading: !data,
    hasAccurateCount: !!(data?.meta?.totalItems)
  };
}
