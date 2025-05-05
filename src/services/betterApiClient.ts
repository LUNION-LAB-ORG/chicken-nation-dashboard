import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_PREFIX = '/api/v1';

// File d'attente pour les requêtes en attente pendant le refresh du token
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

// Traitement de la file d'attente après refresh
const processQueue = (error: any | null) => {
  failedQueue.forEach(promise => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
};

// Fonction pour obtenir l'access token depuis les cookies
const getAccessToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  // Utilisation d'une expression régulière pour extraire le cookie de manière plus fiable
  const match = document.cookie.match(/(^|;)\s*chicken-nation-session\s*=\s*([^;]+)/);
  return match ? match[2] : null;
};

// Fonction pour obtenir le refresh token depuis les cookies
const getRefreshToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  // Utilisation d'une expression régulière pour extraire le cookie de manière plus fiable
  const match = document.cookie.match(/(^|;)\s*chicken-nation-refresh\s*=\s*([^;]+)/);
  return match ? match[2] : null;
};

// Fonction pour mettre à jour les tokens dans les cookies
const updateTokens = (accessToken: string, refreshToken: string) => {
  if (typeof document === 'undefined') return;
  
  console.log('=============================================');
  console.log('TOKEN UPDATE CALLED');
  console.log(`Access Token: ${accessToken.substring(0, 10)}...`);
  console.log(`Refresh Token: ${refreshToken.substring(0, 10)}...`);
  console.log('=============================================');
  
  // Access token avec durée de 10 secondes (pour les tests)
  const accessTokenExpiry = 10; // 10 secondes pour les tests
  
  console.log(`[TOKEN] Mise à jour des tokens - Access token valide pour ${accessTokenExpiry} secondes`);
  document.cookie = `chicken-nation-session=${accessToken}; path=/; max-age=${accessTokenExpiry}; SameSite=Lax`;
  
  // Refresh token avec durée de 30 jours
  document.cookie = `chicken-nation-refresh=${refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  
  // Déclencher un refresh immédiat pour les tests
  console.log('[TOKEN] Déclenchement immédiat du refresh pour test');
  triggerRefresh();
};

// Fonction pour déclencher le refresh
const triggerRefresh = () => {
  if (typeof window === 'undefined') return;
  
  // Supprimer tout timer existant
  if (window.refreshTokenTimeout) {
    clearTimeout(window.refreshTokenTimeout);
    console.log('[TOKEN] Timer précédent annulé');
  }
  
  // Programmer un nouveau refresh dans 5 secondes (pour les tests)
  const refreshDelay = 5 * 1000; // 5 secondes
  console.log(`[TOKEN] Programmation du prochain refresh dans ${refreshDelay/1000} secondes`);
  
  window.refreshTokenTimeout = setTimeout(async () => {
    try {
      console.log('[TOKEN] Début du refresh automatique');
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        console.log('[TOKEN] Aucun refresh token disponible, refresh annulé');
        return;
      }
      
      console.log('[TOKEN] Envoi de la requête de refresh');
      console.log(`[TOKEN] URL: ${API_BASE_URL}${API_PREFIX}/auth/refresh-token`);
      
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken: currentRefreshToken }),
      });
      
      if (!response.ok) {
        console.error(`[TOKEN] Refresh échoué avec statut: ${response.status}`);
        throw new Error(`Refresh automatique échoué: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[TOKEN] Réponse du serveur:', data);
      
      const newAccessToken = data.token || data.accessToken;
      const newRefreshToken = data.refreshToken || currentRefreshToken;
      
      if (!newAccessToken) {
        console.error('[TOKEN] Aucun nouveau token d\'accès reçu');
        throw new Error('Aucun nouveau token d\'accès reçu');
      }
      
      console.log('[TOKEN] Nouveaux tokens reçus avec succès');
      console.log(`[TOKEN] Access token: ${newAccessToken.substring(0, 10)}...`);
      
      // Mettre à jour les tokens
      updateTokens(newAccessToken, newRefreshToken);
      console.log('[TOKEN] Refresh automatique réussi');
    } catch (error) {
      console.error('[TOKEN] Erreur lors du refresh automatique:', error);
    }
  }, refreshDelay);
};

// Étendre l'interface Window pour inclure notre propriété
declare global {
  interface Window {
    refreshTokenTimeout?: NodeJS.Timeout;
  }
}

export class BetterApiClient {
  private axiosInstance: AxiosInstance;
  
  constructor() {
    this.axiosInstance = axios.create({
      baseURL: `${API_BASE_URL}${API_PREFIX}`,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true, // Envoie les cookies avec les requêtes
    });
    
    this.setupInterceptors();
  }
  
  private setupInterceptors(): void {
    // Intercepteur pour les requêtes
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Ne pas ajouter de Content-Type pour FormData
        if (config.data instanceof FormData) {
          delete config.headers['Content-Type'];
        }
        
        // Ajouter le token d'authentification à chaque requête
        const token = getAccessToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Intercepteur pour les réponses
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        
        // Si erreur 401 et pas déjà en retry
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (isRefreshing) {
            // Mettre la requête en file d'attente si refresh en cours
            return new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject, config: originalRequest });
            })
              .then(() => this.axiosInstance(originalRequest))
              .catch(err => Promise.reject(err));
          }
          
          originalRequest._retry = true;
          isRefreshing = true;
          
          try {
            // Récupérer le refresh token depuis les cookies
            const refreshToken = getRefreshToken();
            if (!refreshToken) {
              throw new Error('Refresh token non disponible');
            }
            
            // Appel à l'API pour rafraîchir le token
            const response = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/refresh-token`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include', // très important si le cookie est httpOnly
              body: JSON.stringify({ refreshToken }),
            });
            
            if (!response.ok) {
              throw new Error(`Refresh échoué avec statut: ${response.status}`);
            }
            
            const data = await response.json();
            const newAccessToken = data.token || data.accessToken;
            const newRefreshToken = data.refreshToken || refreshToken;
            
            // Mettre à jour les tokens dans les cookies
            updateTokens(newAccessToken, newRefreshToken);
            
            // Ajouter le nouveau token à la requête originale
            if (originalRequest.headers) {
              originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
            }
            
            // Traiter la file d'attente
            processQueue(null);
            
            // Réessayer la requête originale
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // En cas d'échec
            console.error('Erreur lors du refresh token:', refreshError);
            processQueue(refreshError);
            
            // Déconnexion et redirection
            if (typeof document !== 'undefined') {
              // Supprimer les cookies d'authentification
              document.cookie = 'chicken-nation-session=; path=/; max-age=0';
              document.cookie = 'chicken-nation-refresh=; path=/; max-age=0';
              
              // Rediriger vers la page d'accueil
              window.location.href = '/';
            }
            
            return Promise.reject(refreshError);
          } finally {
            isRefreshing = false;
          }
        }
        
        return Promise.reject(error);
      }
    );
  }
  
  // Méthode unifiée pour toutes les requêtes API
  async request<T = any>({
    endpoint,
    method = 'GET',
    data,
    params,
    config = {}
  }: {
    endpoint: string;
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    data?: any;
    params?: Record<string, string>;
    config?: AxiosRequestConfig;
  }): Promise<T> {
    try {
      // Construction de l'URL avec les paramètres de requête
      const queryString = params ? new URLSearchParams(params).toString() : '';
      const url = `${endpoint}${queryString ? `?${queryString}` : ''}`;
      
      // Exécution de la requête selon la méthode
      switch (method.toUpperCase()) {
        case 'POST':
          return (await this.axiosInstance.post<T>(url, data, config)).data;
        case 'PUT':
          return (await this.axiosInstance.put<T>(url, data, config)).data;
        case 'PATCH':
          return (await this.axiosInstance.patch<T>(url, data, config)).data;
        case 'DELETE':
          return (await this.axiosInstance.delete<T>(url, config)).data;
        default: // GET
          return (await this.axiosInstance.get<T>(url, config)).data;
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('API Request failed:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response?.data,
        });
      } else {
        console.error('Unknown API error:', error);
      }
      throw error;
    }
  }
  
  // Méthodes d'API simplifiées (pour compatibilité avec le code existant)
  async get<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ endpoint, method: 'GET', config });
  }
  
  async post<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ endpoint, method: 'POST', data, config });
  }
  
  async put<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ endpoint, method: 'PUT', data, config });
  }
  
  async patch<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ endpoint, method: 'PATCH', data, config });
  }
  
  async delete<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T> {
    return this.request<T>({ endpoint, method: 'DELETE', config });
  }
  
  // Méthode spéciale pour FormData
  async postFormData<T>(endpoint: string, formData: FormData, config?: AxiosRequestConfig): Promise<T> {
    const formConfig = {
      ...config,
      headers: {
        ...config?.headers,
      }
    };
    return this.request<T>({ endpoint, method: 'POST', data: formData, config: formConfig });
  }
}

// Instance singleton du client API
export const betterApiClient = new BetterApiClient();

// Exporter les fonctions utilitaires pour les utiliser ailleurs
export { getAccessToken, getRefreshToken, updateTokens };