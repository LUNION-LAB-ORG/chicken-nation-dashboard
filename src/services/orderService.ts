// --- Order Service ---

const API_URL = process.env.NEXT_PUBLIC_API_URL
const API_PREFIX = '/api/v1';
const ORDERS_ENDPOINT = '/orders';

// Récupérer le token d'authentification
function getAuthToken() {
  try {
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      console.error('Pas de données d\'authentification trouvées');
      return null;
    }

    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken || parsedData?.accessToken || parsedData?.token;
    
    if (!token) {
      console.error('Token non trouvé dans les données d\'authentification');
      return null;
    }

    return token;
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return null;
  }
}

// Types pour les commandes
export type OrderStatus = 'PENDING' | 'CANCELLED' | 'ACCEPTED' | 'IN_PROGRESS' | 'READY' | 'PICKED_UP' | 'DELIVERED' | 'COLLECTED' | 'COMPLETED';
export type OrderType = 'DELIVERY' | 'PICKUP' | 'TABLE';

export interface OrderQuery {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  type?: OrderType;
  customerId?: string;
  restaurantId?: string;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  type: OrderType;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  restaurant: {
    id: string;
    name: string;
  };
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  deliveryFee?: number;
  address?: string;
  tableNumber?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
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

// Fonction pour récupérer les commandes avec filtres
export async function getOrders(params: OrderQuery = {}): Promise<PaginatedResponse<Order>> {
  console.log('[OrderService] getOrders - Début de la requête');
  const {
    page = 1,
    limit = 10,
    status,
    type,
    customerId,
    restaurantId,
    startDate,
    endDate,
    minAmount,
    maxAmount,
    sortBy = 'created_at',
    sortOrder = 'desc'
  } = params;

  // Construire les paramètres de requête
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    sortBy,
    sortOrder
  });

  // Ajouter les filtres optionnels
  if (status) queryParams.append('status', status);
  if (type) queryParams.append('type', type);
  if (customerId) queryParams.append('customerId', customerId);
  if (restaurantId) queryParams.append('restaurantId', restaurantId);
  if (startDate) queryParams.append('startDate', startDate);
  if (endDate) queryParams.append('endDate', endDate);
  if (minAmount !== undefined) queryParams.append('minAmount', String(minAmount));
  if (maxAmount !== undefined) queryParams.append('maxAmount', String(maxAmount));

  const url = `${API_URL}${API_PREFIX}${ORDERS_ENDPOINT}?${queryParams}`;
  console.log('[OrderService] getOrders - URL:', url);

  try {
    const token = getAuthToken();
    console.log('[OrderService] getOrders - Token utilisé:', token ? `${token.substring(0, 10)}...` : 'non trouvé');
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('[OrderService] getOrders - Status de la réponse:', response.status);

    // Gérer spécifiquement l'erreur 404
    if (response.status === 404) {
      return { data: [], meta: { totalItems: 0, itemCount: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 } };
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OrderService] getOrders - Erreur:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[OrderService] getOrders - Réponse reçue');
    return data;
  } catch (error) {
    console.error('[OrderService] getOrders - Erreur:', error);
    throw error;
  }
}

// Fonction pour récupérer une commande par son ID
export async function getOrderById(id: string): Promise<Order> {
  console.log('[OrderService] getOrderById - Début de la requête pour ID:', id);
  if (!id) throw new Error('ID commande manquant');
  const url = `${API_URL}${API_PREFIX}${ORDERS_ENDPOINT}/${id}`;
  
  try {
    const token = getAuthToken();
    console.log('[OrderService] getOrderById - Token utilisé:', token ? `${token.substring(0, 10)}...` : 'non trouvé');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(url, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });

    console.log('[OrderService] getOrderById - Status de la réponse:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[OrderService] getOrderById - Erreur:', errorText);
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('[OrderService] getOrderById - Réponse reçue');
    return data;
  } catch (error) {
    console.error('[OrderService] getOrderById - Erreur:', error);
    throw error;
  }
}

// Fonction pour mettre à jour le statut d'une commande
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  if (!id || !status) throw new Error('ID ou statut manquant');
  const url = `${API_URL}${API_PREFIX}${ORDERS_ENDPOINT}/${id}/status`;
  
 

  try {
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('[API] Erreur lors de la mise à jour du statut de la commande:', error);
    throw error;
  }
}

// Fonction pour supprimer une commande
export async function deleteOrder(id: string): Promise<void> {
  if (!id) throw new Error('ID commande manquant');
  const url = `${API_URL}${API_PREFIX}${ORDERS_ENDPOINT}/${id}`;
   

  try {
    const token = getAuthToken();
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
 
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('[API] Erreur lors de la suppression de la commande:', error);
    throw error;
  }
}

// Fonction pour mettre à jour une commande
export async function updateOrder(id: string, data: Partial<Order>): Promise<Order> {
  if (!id || !data) throw new Error('ID ou données manquantes');
  const url = `${API_URL}${API_PREFIX}${ORDERS_ENDPOINT}/${id}`;
  
 

  try {
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
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data2 = await response.json();
    return data2;
  } catch (error) {
    console.error('[API] Erreur lors de la mise à jour de la commande:', error);
    throw error;
  }
}

console.log('Auth Data:', localStorage.getItem('chicken-nation-auth'));
