import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { NotificationAPI, Notification } from '@/services/notificationService';

interface UseNotificationsQueryProps {
  userId: string;
  userRole?: string;
  enabled?: boolean;
}

interface NotificationPage {
  data: Notification[];
  meta: {
    limit: number;
    page: number;
    total: number;
    totalPages: number;
  };
}

interface UseNotificationsQueryReturn {
  // Données
  notifications: Notification[];
  totalNotifications: number;
  
  // États de chargement
  isLoading: boolean;
  isFetchingNextPage: boolean;
  hasNextPage: boolean | undefined;
  error: Error | null;
  
  // Actions
  fetchNextPage: () => void;
  refetch: () => void;
  markAsRead: (notificationId: string) => void;
  markAsUnread: (notificationId: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (notificationId: string) => void;
  
  // États des mutations
  isMarkingAsRead: boolean;
  isMarkingAsUnread: boolean;
  isMarkingAllAsRead: boolean;
  isDeletingNotification: boolean;
}

export const useNotificationsQuery = ({ userId, userRole, enabled = true }: UseNotificationsQueryProps): UseNotificationsQueryReturn => {
  const queryClient = useQueryClient();

  // ✅ Query pour récupérer les notifications avec pagination infinie
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteQuery<NotificationPage>({
    queryKey: ['notifications', userId, userRole],
    queryFn: async ({ pageParam = 1 }) => {
      console.log(`[useNotificationsQuery] Fetching page ${pageParam} for user ${userId}, role: ${userRole}`);
      
      if (userRole === 'ADMIN') {
        // ADMIN : Utiliser l'endpoint global avec pagination
        // ✅ IMPORTANT : Filtrer pour ne récupérer que les notifications destinées aux utilisateurs du dashboard
        const response = await NotificationAPI.getAllNotifications({ 
          limit: 20, 
          page: pageParam as number,
          target: 'USER' // ✅ Exclure les notifications CUSTOMER (app mobile)
        });
        return response;
      } else {
        // Utilisateurs normaux : Utiliser l'endpoint spécifique (pas de pagination)
        if (pageParam === 1) {
          const notifications = await NotificationAPI.getUserNotifications(userId);
          return {
            data: notifications,
            meta: {
              limit: notifications.length,
              page: 1,
              total: notifications.length,
              totalPages: 1
            }
          } as NotificationPage;
        } else {
          // Pas de pages supplémentaires pour les utilisateurs normaux
          return {
            data: [],
            meta: { limit: 0, page: pageParam as number, total: 0, totalPages: 1 }
          } as NotificationPage;
        }
      }
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage: NotificationPage) => {
      if (lastPage.meta.page < lastPage.meta.totalPages) {
        return lastPage.meta.page + 1;
      }
      return undefined;
    },
    enabled,
    staleTime: 30000, // 30 secondes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  // ✅ Aplatir toutes les notifications de toutes les pages
  const allNotifications = data?.pages.flatMap(page => page.data) || [];
  
  // ✅ FILTRAGE CÔTÉ CLIENT : Exclure définitivement les notifications CUSTOMER 
  const notifications = allNotifications.filter(notification => 
    notification.target !== 'CUSTOMER'
  );
  
  // ✅ Métadonnées de la dernière page
  const lastPage = data?.pages[data.pages.length - 1];
  const totalNotifications = lastPage?.meta.total || 0;

  // ✅ Mutation pour marquer comme lu
  const markAsReadMutation = useMutation({
    mutationFn: (notificationId: string) => NotificationAPI.markAsRead(notificationId),
    onSuccess: (_, notificationId) => {
      // Mise à jour optimiste
      queryClient.setQueryData(['notifications', userId, userRole], (oldData: { pages: NotificationPage[] } | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: NotificationPage) => ({
            ...page,
            data: page.data.map((notification: Notification) =>
              notification.id === notificationId
                ? { ...notification, is_read: true }
                : notification
            )
          }))
        };
      });
      
      // Invalider les stats
      queryClient.invalidateQueries({ queryKey: ['notification-stats', userId] });
    }
  });

  // ✅ Mutation pour marquer comme non lu
  const markAsUnreadMutation = useMutation({
    mutationFn: (notificationId: string) => NotificationAPI.markAsUnread(notificationId),
    onSuccess: (_, notificationId) => {
      // Mise à jour optimiste
      queryClient.setQueryData(['notifications', userId, userRole], (oldData: { pages: NotificationPage[] } | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: NotificationPage) => ({
            ...page,
            data: page.data.map((notification: Notification) =>
              notification.id === notificationId
                ? { ...notification, is_read: false }
                : notification
            )
          }))
        };
      });
      
      // Invalider les stats
      queryClient.invalidateQueries({ queryKey: ['notification-stats', userId] });
    }
  });

  // ✅ Mutation pour marquer toutes comme lues
  const markAllAsReadMutation = useMutation({
    mutationFn: () => NotificationAPI.markAllAsRead(userId),
    onSuccess: () => {
      // Mise à jour optimiste
      queryClient.setQueryData(['notifications', userId, userRole], (oldData: { pages: NotificationPage[] } | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: NotificationPage) => ({
            ...page,
            data: page.data.map((notification: Notification) => ({
              ...notification,
              is_read: true
            }))
          }))
        };
      });
      
      // Invalider les stats
      queryClient.invalidateQueries({ queryKey: ['notification-stats', userId] });
    }
  });

  // ✅ Mutation pour supprimer une notification
  const deleteNotificationMutation = useMutation({
    mutationFn: (notificationId: string) => NotificationAPI.deleteNotification(notificationId),
    onSuccess: (_, notificationId) => {
      // Mise à jour optimiste
      queryClient.setQueryData(['notifications', userId, userRole], (oldData: { pages: NotificationPage[] } | undefined) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: NotificationPage) => ({
            ...page,
            data: page.data.filter((notification: Notification) => notification.id !== notificationId)
          }))
        };
      });
      
      // Invalider les stats
      queryClient.invalidateQueries({ queryKey: ['notification-stats', userId] });
    }
  });

  return {
    // Données
    notifications,
    totalNotifications,
    
    // États de chargement
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    error,
    
    // Actions
    fetchNextPage,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAsUnread: markAsUnreadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    
    // États des mutations
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAsUnread: markAsUnreadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending,
  };
};
