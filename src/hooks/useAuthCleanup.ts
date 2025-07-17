import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook pour nettoyer les caches lors des changements d'authentification
 */
export const useAuthCleanup = () => {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  useEffect(() => {
    // Nettoyer toutes les queries liées aux données spécifiques d'un utilisateur/restaurant
    // quand l'utilisateur change ou se déconnecte
    const cleanup = () => {
      console.log('🧹 [useAuthCleanup] Nettoyage des queries TanStack');
      
      // Invalider toutes les queries liées aux données dashboard
      queryClient.invalidateQueries({ queryKey: ['weekly-orders'] });
      queryClient.invalidateQueries({ queryKey: ['revenue-data'] });
      queryClient.invalidateQueries({ queryKey: ['daily-sales'] });
      queryClient.invalidateQueries({ queryKey: ['date-ranges'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notification-stats'] });
      
      // Optionnel : Supprimer complètement les queries pour éviter les fuites
      queryClient.removeQueries({ queryKey: ['weekly-orders'] });
      queryClient.removeQueries({ queryKey: ['revenue-data'] });
      queryClient.removeQueries({ queryKey: ['daily-sales'] });
      queryClient.removeQueries({ queryKey: ['date-ranges'] });
    };

    // Nettoyer lors de la déconnexion
    if (!isAuthenticated) {
      cleanup();
    }
    
    // Nettoyer lors du changement d'utilisateur (différent ID)
    if (user?.id) {
      // Si l'utilisateur change, invalider les queries
      queryClient.invalidateQueries();
    }
  }, [user?.id, isAuthenticated, queryClient]);

  return {
    clearAllQueries: () => {
      queryClient.clear();
      console.log('🧹 [useAuthCleanup] Toutes les queries supprimées');
    }
  };
};
