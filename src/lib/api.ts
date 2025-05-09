import { LoginCredentials, LoginResponse, RefreshTokenResponse } from '@/types/auth';

const API_URL = process.env.NEXT_PUBLIC_API_PREFIX ;
 
export const authApi = {
 
  login: async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur de connexion');
      }

      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
 
  refreshToken: async (refreshToken: string): Promise<RefreshTokenResponse> => {
    try {
      const response = await fetch(`${API_URL}/auth/refresh-token?type=admin`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Impossible de rafraîchir le token');
      }

      return await response.json();
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  },

  /**
   * Déconnexion utilisateur
   */
  logout: async (): Promise<void> => {
    
    return Promise.resolve();
  },
};
 
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
  token: string
): Promise<Response> => {
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
