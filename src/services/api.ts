const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL  
const API_PREFIX = '/api/v1';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method: RequestMethod;
  headers?: Record<string, string>;
  body?: any;
}

 
function getTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) return null;
    
    const parsedData = JSON.parse(authData);
    const token =
      parsedData?.state?.accessToken ||
      parsedData?.accessToken ||
      parsedData?.token ||
      null;
    
    return token;
  } catch (error) {
    return null;
  }
}

 
function getRefreshTokenFromLocalStorage(): string | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) return null;
    
    const parsedData = JSON.parse(authData);
    return parsedData?.state?.refreshToken || null;
  } catch (error) {
    return null;
  }
}

 
function updateAccessTokenInLocalStorage(newToken: string): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) return false;
    
    const parsedData = JSON.parse(authData);
    if (!parsedData.state) return false;
    
    parsedData.state.accessToken = newToken;
    
    localStorage.setItem('chicken-nation-auth', JSON.stringify(parsedData));
    return true;
  } catch (error) {
    console.error('Erreur lors de la mise à jour du token:', error);
    return false;
  }
}
 
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshTokenFromLocalStorage();
  if (!refreshToken) return null;
  
  try {
    const url = `${API_BASE_URL}${API_PREFIX}/auth/refresh-token?type=USER`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
    
    if (!response.ok) {
      console.error('Échec du rafraîchissement du token:', response.status);
      return null;
    }
    
    const data = await response.json();
    const newToken = data.token || data.accessToken;
    
    if (newToken) {
       updateAccessTokenInLocalStorage(newToken);
      return newToken;
    }
    
    return null;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    return null;
  }
}

function logTokenInfo(context: string) {
  try {
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      console.log(`[${context}] Pas de données d'authentification`);
      return;
    }
    
    const parsedData = JSON.parse(authData);
    const accessToken = parsedData?.state?.accessToken || parsedData?.accessToken || parsedData?.token;
    const refreshToken = parsedData?.state?.refreshToken;
    
    console.log(`[${context}] Token Info:`, {
      accessToken: accessToken ? `${accessToken.substring(0, 10)}...` : 'non trouvé',
      refreshToken: refreshToken ? `${refreshToken.substring(0, 10)}...` : 'non trouvé',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error(`[${context}] Erreur lors du log du token:`, error);
  }
}

export async function apiRequest<T>(
  endpoint: string,
  method: RequestMethod = 'GET',
  data?: any,
  requiresAuth: boolean = true
): Promise<T> {
  const url = `${API_BASE_URL}${API_PREFIX}${endpoint}`;
  
  logTokenInfo(`API Request - ${method} ${endpoint}`);
  
  const options: RequestOptions = {
    method,
    headers: {
      'Accept': 'application/json',
    }
  };
  
   if (requiresAuth) {
    const token = getTokenFromLocalStorage();
    if (token) {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  
   if (data) {
    if (data instanceof FormData) {
       options.body = data;
    } else {
      options.headers = {
        ...options.headers,
        'Content-Type': 'application/json'
      };
      options.body = JSON.stringify(data);
    }
  }
  
  try {
    // Effectuer la requête
    const response = await fetch(url, options as RequestInit);
    
    // Si la réponse est OK, retourner les données
    if (response.ok) {
      // Vérifier si la réponse est vide
      const text = await response.text();
      if (!text) {
        return {} as T;
      }
      
      // Sinon, parser le JSON
      const data = JSON.parse(text);
      return data as T;
    }
     
    if (response.status === 401 && requiresAuth) {
      try {
        const newToken = await refreshAccessToken();
        if (newToken) {
          return await apiRequest<T>(endpoint, method, data, requiresAuth);
        }
        throw new Error('Session expirée, veuillez vous reconnecter.');
      } catch (refreshError) {
        // Ne pas rediriger automatiquement, laisser le composant gérer l'erreur
        throw new Error('Session expirée, veuillez vous reconnecter.');
      }
    }
    
     let errorMessage = `Erreur ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
       const errorText = await response.text();
      errorMessage = errorText || errorMessage;
    }
    
    throw new Error(errorMessage);
  } catch (error) {
    // Gérer les erreurs de réseau ou autres
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Une erreur inconnue est survenue');
  }
}

 export function logCurrentUserToken() {
  try {
    const authRaw = localStorage.getItem('chicken-nation-auth');
    if (authRaw) {
      const parsed = JSON.parse(authRaw);
      const token = parsed?.state?.accessToken;
      if (token) {
        return token;
      }
    }
  } catch (err) {
    return null;
  }
}

 export const api = {
  get: <T>(endpoint: string, requiresAuth: boolean = true): Promise<T> => 
    apiRequest<T>(endpoint, 'GET', undefined, requiresAuth),
    
  post: <T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<T> => 
    apiRequest<T>(endpoint, 'POST', data, requiresAuth),
    
  put: <T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<T> => 
    apiRequest<T>(endpoint, 'PUT', data, requiresAuth),

  patch: <T>(endpoint: string, data: any, requiresAuth: boolean = true): Promise<T> => 
    apiRequest<T>(endpoint, 'PATCH', data, requiresAuth),
    
  delete: <T>(endpoint: string, requiresAuth: boolean = true): Promise<T> => 
    apiRequest<T>(endpoint, 'DELETE', undefined, requiresAuth),
};
