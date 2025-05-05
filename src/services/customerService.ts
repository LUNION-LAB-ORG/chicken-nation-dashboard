 import { betterApiClient } from './betterApiClient';
import { Customer, PaginatedResponse } from '@/types/customer';
import { Order } from '@/types/order';
import { Review } from '@/types/review';

const CUSTOMERS_ENDPOINT = '/customer';
const ORDERS_ENDPOINT = '/orders';
const REVIEWS_ENDPOINT = '/reviews';

// Types pour les paramètres de recherche
export interface CustomerSearchParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sort?: string;
}

// Fonction pour construire les paramètres de requête
function buildQueryParams(params: CustomerSearchParams): string {
  const queryParams = new URLSearchParams();
  
  if (params.page) queryParams.append('page', params.page.toString());
  if (params.limit) queryParams.append('limit', params.limit.toString());
  if (params.search) queryParams.append('search', params.search);
  if (params.status) queryParams.append('status', params.status);
  if (params.sort) queryParams.append('sort', params.sort);
  
  return queryParams.toString();
}

// Obtenir la liste des clients avec pagination
export async function getCustomers(params: CustomerSearchParams = {}): Promise<PaginatedResponse<Customer>> {
  try {
    const queryParams = { ...params };
    if (!queryParams.status) {
      queryParams.status = 'NEW';
    }
    
    return await betterApiClient.get<PaginatedResponse<Customer>>(`${CUSTOMERS_ENDPOINT}?${buildQueryParams(queryParams)}`);
  } catch (error) {
    console.error('[API] Erreur lors de la récupération des clients:', error);
    throw error;
  }
}

// Obtenir un client par son ID
export async function getCustomerById(id: string): Promise<Customer> {
  try {
    return await betterApiClient.get<Customer>(`${CUSTOMERS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération du client ${id}:`, error);
    throw error;
  }
}

// Mettre à jour le statut d'un client
export async function updateCustomerStatus(id: string, status: string): Promise<Customer> {
  try {
    return await betterApiClient.patch<Customer>(`${CUSTOMERS_ENDPOINT}/${id}/status`, { status });
  } catch (error) {
    console.error(`[API] Erreur lors de la mise à jour du statut du client ${id}:`, error);
    throw error;
  }
}

// Supprimer un client
export async function deleteCustomer(id: string): Promise<void> {
  try {
    await betterApiClient.delete(`${CUSTOMERS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`[API] Erreur lors de la suppression du client ${id}:`, error);
    throw error;
  }
}

// Mettre à jour les informations d'un client
export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  try {
    return await betterApiClient.patch<Customer>(`${CUSTOMERS_ENDPOINT}/${id}`, data);
  } catch (error) {
    console.error(`[API] Erreur lors de la mise à jour du client ${id}:`, error);
    throw error;
  }
}

// Obtenir les commandes d'un client
export async function getCustomerOrders(id: string, params: CustomerSearchParams = {}): Promise<PaginatedResponse<Order>> {
  try {
    return await betterApiClient.get<PaginatedResponse<Order>>(`${CUSTOMERS_ENDPOINT}/${id}/orders?${buildQueryParams(params)}`);
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération des commandes du client ${id}:`, error);
    throw error;
  }
}

// Obtenir les avis d'un client
export async function getCustomerReviews(id: string, params: CustomerSearchParams = {}): Promise<PaginatedResponse<Review>> {
  try {
    return await betterApiClient.get<PaginatedResponse<Review>>(`${CUSTOMERS_ENDPOINT}/${id}/reviews?${buildQueryParams(params)}`);
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération des avis du client ${id}:`, error);
    throw error;
  }
}