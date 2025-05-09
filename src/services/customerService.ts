// --- Customer Service simplifié ---

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://chicken.turbodeliveryapp.com';
const API_PREFIX = '/api/v1';
const CUSTOMERS_ENDPOINT = '/customer';
const REVIEWS_ENDPOINT = '/reviews';
const ORDERS_ENDPOINT = '/orders';
const CUSTOMER_ORDERS_ENDPOINT = '/orders/customer';

// Vérifier si le token est valide
function isTokenValid() {
  try {
    if (typeof window === 'undefined') return false;
    
    const auth = localStorage.getItem('chicken-nation-auth');
    if (!auth) return false;
    
    const parsedAuth = JSON.parse(auth);
    const token = parsedAuth?.state?.accessToken;
    if (!token) return false;
    
    // Vérifier si le token est expiré (si JWT avec exp)
    // Cette partie est optionnelle et dépend du format de votre token
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('Token expiré');
          return false;
        }
      }
    } catch (e) {
      // Si on ne peut pas décoder le token, on suppose qu'il est valide
      console.warn('Impossible de vérifier l\'expiration du token');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return false;
  }
}

function getAuthToken() {
  try {
    // Vérifier si nous sommes côté client (browser)
    if (typeof window === 'undefined') {
      console.error('getAuthToken appelé côté serveur');
      return '';
    }

    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      console.error('Token non trouvé dans le localStorage');
      return '';
    }

    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken || parsedData?.accessToken || parsedData?.token;

    if (!token) {
      console.error('Token invalide dans le localStorage:', parsedData);
      return '';
    }

    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return '';
  }
}

// Ajout des types TypeScript pour robustesse et auto-complétion

type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'NEW';

export interface Customer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string;
  addresses?: any[];
  image?: string | null;
  created_at: string;
  updated_at: string;
  entity_status: CustomerStatus;
  birth_day?: string | null;
  totalOrders?: number;
  lastOrderDate?: string;
  isConnected?: boolean;
  [key: string]: any;
}

export interface CustomerQuery {
  page?: number;
  limit?: number;
  status?: CustomerStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

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

// Fonction pour gérer les erreurs d'authentification
async function handleAuthError(response: Response, retryFn: () => Promise<any>) {
  if (response.status === 401) {
    console.error('Erreur d\'authentification 401 - Token expiré ou invalide');
    
    try {
      // Tenter de rafraîchir le token
      const authData = localStorage.getItem('chicken-nation-auth');
      if (authData) {
        const parsedData = JSON.parse(authData);
        const refreshToken = parsedData?.state?.refreshToken;
        
        if (refreshToken) {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ refreshToken }),
            });

            if (response.ok) {
              const data = await response.json();
              // Mettre à jour le token dans le localStorage
              const newAuthData = {
                ...parsedData,
                state: {
                  ...parsedData.state,
                  accessToken: data.accessToken,
                },
              };
              localStorage.setItem('chicken-nation-auth', JSON.stringify(newAuthData));
              
              // Réessayer la requête originale
              return retryFn();
            }
          } catch (refreshError) {
            console.error('Échec du rafraîchissement du token:', refreshError);
          }
        }
      }
      
      // Si le rafraîchissement échoue ou n'est pas possible, déconnecter proprement
      if (typeof window !== 'undefined') {
        localStorage.removeItem('chicken-nation-auth');
        window.location.href = '/';
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la gestion de l\'authentification:', error);
      throw new Error(`Erreur d'authentification: ${response.status} ${response.statusText}`);
    }
  }
  
  // Pour les autres erreurs, on laisse passer
  throw new Error(`API Error: ${response.status} ${response.statusText}`);
}

export async function getCustomers(params: CustomerQuery = {}): Promise<any> {
  const { page = 1, limit = 10, status = 'ACTIVE', search, sortBy, sortOrder } = params;
  
  // Construire les paramètres de requête
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('limit', limit.toString());
  if (status) queryParams.append('status', status);
  if (search) queryParams.append('search', search);
  if (sortBy) queryParams.append('sortBy', sortBy);
  if (sortOrder) queryParams.append('sortOrder', sortOrder);
  
  const url = `${API_URL}${API_PREFIX}${CUSTOMERS_ENDPOINT}?${queryParams}`;
  
  try {
    const token = getAuthToken();
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });
    
    if (!response.ok) {
      return await handleAuthError(response, () => getCustomers(params));
    }
    
    const data = await response.json();
    
    // Enrichir les données avec les informations sur les commandes
    const enrichedData = await enrichCustomersWithOrderInfo(data);
    
    return enrichedData;
  } catch (error) {
    console.error('Erreur lors de la récupération des clients:', error);
    throw error;
  }
}

// Fonction pour enrichir les données des clients avec les informations sur les commandes
async function enrichCustomersWithOrderInfo(customersData: any): Promise<any> {
  // Si c'est un tableau simple, on l'enrichit directement
  if (Array.isArray(customersData)) {
    const enrichedCustomers = await Promise.all(
      customersData.map(async (customer) => {
        return await enrichCustomerWithOrderInfo(customer);
      })
    );
    return enrichedCustomers;
  }
  
  // Si c'est une réponse paginée, on enrichit les données
  if (customersData.data && Array.isArray(customersData.data)) {
    const enrichedCustomers = await Promise.all(
      customersData.data.map(async (customer: Customer) => {
        return await enrichCustomerWithOrderInfo(customer);
      })
    );
    
    return {
      ...customersData,
      data: enrichedCustomers
    };
  }
  
  // Si le format est inattendu, on retourne les données telles quelles
  return customersData;
}

// Fonction pour enrichir un client individuel avec ses informations de commande
async function enrichCustomerWithOrderInfo(customer: Customer): Promise<Customer> {
  try {
    // Récupérer les commandes du client (limité à 1 pour obtenir juste la dernière)
    const ordersResponse = await getCustomerOrders(customer.id, { limit: 1 });
    
    // Vérifier si la réponse contient des commandes
    if (ordersResponse && ordersResponse.data && ordersResponse.data.length > 0) {
      // Enrichir le client avec les informations de commande
      return {
        ...customer,
        // Définir si le client est connecté (basé sur son statut)
        isConnected: customer.entity_status === 'ACTIVE',
        // Nombre total de commandes - vérifier si totalItems existe
        totalOrders: ordersResponse.meta?.totalItems || ordersResponse.data.length,
        // Date de la dernière commande
        lastOrderDate: ordersResponse.data[0].created_at
      };
    } else {
      // Si le client n'a pas de commandes
      return {
        ...customer,
        isConnected: customer.entity_status === 'ACTIVE',
        totalOrders: 0,
        lastOrderDate: undefined
      };
    }
  } catch (error) {
    console.error(`Erreur lors de l'enrichissement des données pour le client ${customer.id}:`, error);
    // En cas d'erreur, on retourne le client sans enrichissement
    return {
      ...customer,
      isConnected: customer.entity_status === 'ACTIVE',
      totalOrders: 0,
      lastOrderDate: undefined
    };
  }
}

export async function getCustomerById(id: string): Promise<Customer> {
  if (!id) throw new Error('ID client manquant');
  const url = `${API_URL}${API_PREFIX}${CUSTOMERS_ENDPOINT}/${id}`;
 
  const token = getAuthToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
 
  if (!response.ok) {
    await handleAuthError(response, () => getCustomerById(id));
  }
  const data = await response.json();
 
  return data;
}

export async function updateCustomerStatus(id: string, status: CustomerStatus): Promise<Customer> {
  if (!id || !status) throw new Error('ID ou statut manquant');
  const url = `${API_URL}${API_PREFIX}${CUSTOMERS_ENDPOINT}/${id}/status`;
 
  const token = getAuthToken();
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });
 
  if (!response.ok) {
    await handleAuthError(response, () => updateCustomerStatus(id, status));
  }
  return await response.json();
}

export async function deleteCustomer(id: string): Promise<void> {
  if (!id) throw new Error('ID client manquant');
  const url = `${API_URL}${API_PREFIX}${CUSTOMERS_ENDPOINT}/${id}`;
 
  const token = getAuthToken();
  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
 
  if (!response.ok) {
    await handleAuthError(response, () => deleteCustomer(id));
  }
}

export async function updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
  if (!id || !data) throw new Error('ID ou données manquantes');
  const url = `${API_URL}${API_PREFIX}${CUSTOMERS_ENDPOINT}/${id}`;
 
  const token = getAuthToken();
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
 
  if (!response.ok) {
    await handleAuthError(response, () => updateCustomer(id, data));
  }
  return await response.json();
}

// --- Ajout getCustomerOrders et getCustomerReviews ---

export async function getCustomerOrders(id: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<any>> {
  if (!id) throw new Error('ID client manquant');
  
  // Construire les paramètres de requête
  const queryParams = new URLSearchParams();
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  
  // Utiliser le nouvel endpoint dédié aux commandes par client
  const url = `${API_URL}${API_PREFIX}${CUSTOMER_ORDERS_ENDPOINT}/${id}${queryParams.toString() ? `?${queryParams}` : ''}`;
  
  const token = getAuthToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Gérer spécifiquement l'erreur 404 pour les commandes
  if (response.status === 404) {
    console.warn('[API] Endpoint orders/customer non disponible, tentative avec l\'ancien endpoint');
    // Fallback vers l'ancien endpoint si le nouveau n'existe pas encore
    return getCustomerOrdersLegacy(id, params);
  }
  
  if (!response.ok) {
    await handleAuthError(response, () => getCustomerOrders(id, params));
  }
  
  return await response.json();
}

// Fonction de fallback utilisant l'ancien endpoint
async function getCustomerOrdersLegacy(id: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<any>> {
  const queryParams = new URLSearchParams({ customerId: id });
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  const url = `${API_URL}${API_PREFIX}${ORDERS_ENDPOINT}?${queryParams}`;

  const token = getAuthToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  // Gérer spécifiquement l'erreur 404 pour les commandes
  if (response.status === 404) {
    console.warn('[API] Endpoint orders non disponible, retour d\'une liste vide');
    return { data: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } };
  }
  
  if (!response.ok) {
    await handleAuthError(response, () => getCustomerOrdersLegacy(id, params));
  }
  
  return await response.json();
}

export async function getCustomerReviews(id: string, params: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<any>> {
  if (!id) throw new Error('ID client manquant');
  const queryParams = new URLSearchParams({ customerId: id });
  if (params.page !== undefined) queryParams.append('page', params.page.toString());
  if (params.limit !== undefined) queryParams.append('limit', params.limit.toString());
  const url = `${API_URL}${API_PREFIX}${REVIEWS_ENDPOINT}?${queryParams}`;
 
  const token = getAuthToken();
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
 
  
  // Gérer spécifiquement l'erreur 404 pour les avis
  if (response.status === 404) {
    console.warn('[API] Endpoint reviews non disponible, retour d\'une liste vide');
    return { data: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } };
  }
  
  if (!response.ok) {
    await handleAuthError(response, () => getCustomerReviews(id, params));
  }
  return await response.json();
}

// --- Fin ajout ---