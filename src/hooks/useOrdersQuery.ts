import { useState, useCallback, useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrders, OrderQuery, PaginatedResponse, ApiOrderRaw } from '@/services/orderService';

interface UseOrdersQueryParams {
  activeFilter: string;
  selectedRestaurant?: string;
  searchQuery?: string;
  selectedDate?: Date | null;
}

interface UseOrdersQueryReturn {
  // Données
  orders: ApiOrderRaw[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: Error | null;
  
  // Actions
  setCurrentPage: (page: number) => void;
  refetch: () => void;
}

export function useOrdersQuery({
  activeFilter,
  selectedRestaurant,
  searchQuery,
  selectedDate
}: UseOrdersQueryParams): UseOrdersQueryReturn {
  const [currentPage, setCurrentPageState] = useState(1);
  const queryClient = useQueryClient();

  // ✅ Construire les filtres API
  const buildApiFilters = useCallback((): OrderQuery => {
    const apiFilters: OrderQuery = {
      page: currentPage,
      limit: 10
    };

    // Mapper les filtres UI vers API
    if (activeFilter === 'delivery') apiFilters.type = 'DELIVERY';
    if (activeFilter === 'pickup') apiFilters.type = 'PICKUP';
    if (activeFilter === 'table') apiFilters.type = 'TABLE';
    if (activeFilter === 'new') apiFilters.status = 'PENDING';

    if (selectedRestaurant) {
      apiFilters.restaurantId = selectedRestaurant;
    }

    // ✅ Recherche côté serveur par référence uniquement - API attend "reference"
    if (searchQuery && searchQuery.trim()) {
      apiFilters.reference = searchQuery.trim();
    }

    // ✅ Filtre par date côté serveur (gère jour et mois)
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      
      // Vérifier si c'est une sélection de mois entier (premier jour du mois)
      const isMonthSelection = selectedDate.getDate() === 1;
      
      if (isMonthSelection) {
        // Filtrer par mois entier
        const startDate = `${year}-${month}-01`;
        const endDate = new Date(year, selectedDate.getMonth() + 1, 0); // Dernier jour du mois
        const endDateStr = `${year}-${month}-${String(endDate.getDate()).padStart(2, '0')}`;
        
        apiFilters.startDate = startDate;
        apiFilters.endDate = endDateStr;
      } else {
        // Filtrer par jour spécifique
        const dateStr = `${year}-${month}-${day}`;
        apiFilters.startDate = dateStr;
        apiFilters.endDate = dateStr;
      }
    }

    return apiFilters;
  }, [currentPage, activeFilter, selectedRestaurant, selectedDate, searchQuery]);

  // ✅ Clé de requête avec search
  const queryKey = [
    'orders',
    currentPage,
    activeFilter,
    selectedRestaurant,
    searchQuery,
    selectedDate?.toISOString()
  ].filter(Boolean);

  // ✅ Query TanStack
  const {
    data,
    isLoading,
    error
  } = useQuery<PaginatedResponse<ApiOrderRaw>>({
    queryKey,
    queryFn: async () => {
      const filters = buildApiFilters();
      const result = await getOrders(filters);
      return result;
    },
    staleTime: 30000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // ✅ Reset page à 1 quand les filtres changent - approche stable
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
  }, [activeFilter, selectedRestaurant, searchQuery, selectedDate, currentPage]);

  // ✅ Invalider le cache pour forcer un refresh
  const forceRefetch = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['orders'] });
  }, [queryClient]);

  return {
    orders: data?.data || [],
    totalItems: data?.meta?.totalItems || 0,
    totalPages: data?.meta?.totalPages || 0,
    currentPage: currentPage,
    isLoading,
    error: error as Error | null,
    setCurrentPage,
    refetch: forceRefetch
  };
}
