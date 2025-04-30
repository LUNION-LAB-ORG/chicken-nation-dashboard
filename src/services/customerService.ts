 
import { api } from './api';

 const CUSTOMERS_ENDPOINT = '/customer';

// Interfaces pour les données clients
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  isConnected: boolean;
  totalOrders: number;
  lastOrderDate?: string;
}

// Interface pour les paramètres de requête
export interface CustomerQueryParams {
  page?: number;
  limit?: number;
  status?: 'ACTIVE' | 'INACTIVE' | 'BLOCKED';
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Interface pour la réponse paginée
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}

/**
 * Récupère tous les clients avec pagination et filtres
 * @param params Paramètres de requête (pagination, filtres, recherche)
 */
export const getCustomers = async (params: CustomerQueryParams = {}): Promise<PaginatedResponse<Customer>> => {
  // Construire la chaîne de requête à partir des paramètres
  const queryParams = new URLSearchParams();
  
  // Ajouter les paramètres s'ils sont définis
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  if (params.status) queryParams.append('status', params.status);
  if (params.search) queryParams.append('search', params.search);
  if (params.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
  
  // Construire l'URL avec les paramètres
  const endpoint = `${CUSTOMERS_ENDPOINT}?${queryParams.toString()}`;
  
  return api.get<PaginatedResponse<Customer>>(endpoint, true);
};

/**
 * Récupère un client par son ID
 * @param id ID du client
 */
export const getCustomerById = async (id: string): Promise<Customer> => {
  return api.get<Customer>(`${CUSTOMERS_ENDPOINT}/${id}`, true);
};

/**
 * Récupère les commandes d'un client
 * @param id ID du client
 * @param params Paramètres de pagination
 */
export const getCustomerOrders = async (
  id: string, 
  params: { page?: number; limit?: number } = {}
) => {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  
  const endpoint = `${CUSTOMERS_ENDPOINT}/${id}/orders?${queryParams.toString()}`;
  
  return api.get(endpoint, true);
};

/**
 * Récupère les avis d'un client
 * @param id ID du client
 * @param params Paramètres de pagination
 */
export const getCustomerReviews = async (
  id: string, 
  params: { page?: number; limit?: number } = {}
) => {
  const queryParams = new URLSearchParams();
  
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  
  const endpoint = `${CUSTOMERS_ENDPOINT}/${id}/reviews?${queryParams.toString()}`;
  
  return api.get(endpoint, true);
};

/**
 * Met à jour le statut d'un client
 * @param id ID du client
 * @param status Nouveau statut
 */
export const updateCustomerStatus = async (id: string, status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'): Promise<Customer> => {
  return api.patch<Customer>(`${CUSTOMERS_ENDPOINT}/${id}/status`, { status }, true);
};

/**
 * Met à jour les informations d'un client
 * @param id ID du client
 * @param data Données à mettre à jour
 */
export const updateCustomer = async (id: string, data: Partial<Customer>): Promise<Customer> => {
  return api.patch<Customer>(`${CUSTOMERS_ENDPOINT}/${id}`, data, true);
};

/**
 * Supprime un client
 * @param id ID du client
 */
export const deleteCustomer = async (id: string): Promise<void> => {
  return api.delete<void>(`${CUSTOMERS_ENDPOINT}/${id}`, true);
};
