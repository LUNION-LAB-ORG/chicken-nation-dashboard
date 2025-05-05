 import { betterApiClient } from './betterApiClient';
import { Order, PaginatedResponse } from '@/types/order';

const ORDERS_ENDPOINT = '/orders';

// Types pour les paramètres de recherche
export interface OrderSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
  customer_id?: string;
}

// Fonction pour construire les paramètres de requête
function buildQueryParams(params: OrderSearchParams): string {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.sort) queryParams.append('sort', params.sort);
  if (params.customer_id) queryParams.append('customer_id', params.customer_id);
  
  return queryParams.toString();
}

// Obtenir la liste des commandes avec pagination
export async function getOrders(params: OrderSearchParams = {}): Promise<PaginatedResponse<Order>> {
  try {
    return await betterApiClient.get<PaginatedResponse<Order>>(`${ORDERS_ENDPOINT}?${buildQueryParams(params)}`);
  } catch (error) {
    console.error('[API] Erreur lors de la récupération des commandes:', error);
    throw error;
  }
}

// Obtenir une commande par son ID
export async function getOrderById(id: string): Promise<Order> {
  try {
    return await betterApiClient.get<Order>(`${ORDERS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération de la commande ${id}:`, error);
    throw error;
  }
}

// Mettre à jour le statut d'une commande
export async function updateOrderStatus(id: string, status: string): Promise<Order> {
  console.log(`[updateOrderStatus] Mise à jour du statut de la commande ${id} vers ${status}`);
  
  try {
    return await betterApiClient.patch<Order>(`${ORDERS_ENDPOINT}/${id}/status`, { status });
  } catch (error) {
    console.error(`[API] Erreur lors de la mise à jour du statut de la commande ${id}:`, error);
    
    // Gérer spécifiquement l'erreur 409 (Conflict)
    if (error instanceof Error && error.message.includes('409')) {
      // Extraire le message d'erreur du serveur
      const match = error.message.match(/statut suivant recommandé est : (.+)/);
      const nextStatus = match ? match[1] : null;
      
      // Créer une erreur enrichie avec le statut suivant recommandé
      const enhancedError: any = new Error(`Transition de statut invalide. Le statut suivant recommandé est : ${nextStatus}`);
      enhancedError.status = 409;
      enhancedError.nextRecommendedStatus = nextStatus;
      throw enhancedError;
    }
    
    throw error;
  }
}

// Supprimer une commande
export async function deleteOrder(id: string): Promise<void> {
  try {
    await betterApiClient.delete(`${ORDERS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`[API] Erreur lors de la suppression de la commande ${id}:`, error);
    throw error;
  }
}

// Mettre à jour les informations d'une commande
export async function updateOrder(id: string, data: Partial<Order>): Promise<Order> {
  try {
    return await betterApiClient.patch<Order>(`${ORDERS_ENDPOINT}/${id}`, data);
  } catch (error) {
    console.error(`[API] Erreur lors de la mise à jour de la commande ${id}:`, error);
    throw error;
  }
}
