"use client";

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { AuthState, LoginCredentials, User } from '@/types/auth';
import { login as apiLogin, refreshToken as apiRefreshToken, logout as apiLogout } from '@/services/authService';

interface AuthStore extends Omit<AuthState, 'refreshToken'> {
  refreshToken: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setUser: (user: User) => void;
}

 const STORAGE_KEY = 'chicken-nation-auth';

 export function debugLocalStorage() {
  if (typeof window === 'undefined') return 'Non disponible (SSR)';
  
  try {
    const authData = localStorage.getItem(STORAGE_KEY);
    if (!authData) return 'Aucune donnée d\'authentification trouvée';
    
    const parsedData = JSON.parse(authData);
    return {
      accessToken: parsedData?.state?.accessToken ? 'Présent' : 'Absent',
      refreshToken: parsedData?.state?.refreshToken ? 'Présent' : 'Absent',
      isAuthenticated: parsedData?.state?.isAuthenticated,
      user: parsedData?.state?.user ? 'Présent' : 'Absent',
      raw: parsedData
    };
  } catch (error) {
    return `Erreur: ${error instanceof Error ? error.message : String(error)}`;
  }
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null });
        try {
           const data = await apiLogin(credentials);
          console.log('Login response data:', data);
          
           const accessToken = data.token || data.accessToken;
          
           set({
             user: data.user || {
              id: data.id,
              email: data.email,
              fullname: data.fullname,
              role: data.role,
              type: data.type,
            } as User,
            accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
            isLoading: false,
          });
          
          console.log('TOKEN:', accessToken);
          
          console.log('Auth state after login:', get());
        } catch (error) {
          console.error('Login error in store:', error);
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Erreur de connexion',
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
           await apiLogout();
        } finally {
          set({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      refreshAccessToken: async () => {
        const expiredToken = get().accessToken;
        const refreshToken = get().refreshToken;
        if (!refreshToken) {
          console.error('Aucun refresh token disponible dans le store');
          return false;
        }

        try {
          console.log('Tentative de rafraichissement du token depuis le store...');
          console.log('Refresh token utilisé:', refreshToken);
          
          // Utilise directement le refresh token pour obtenir un nouveau token
          const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;
          const API_PREFIX = '/api/v1';
          
          const refreshResp = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/refresh-token`, {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${refreshToken}` },
          });
          
          console.debug('[AUTH] Status de la réponse refresh:', refreshResp.status);
          
          if (!refreshResp.ok) {
            console.error('[AUTH] Refresh échoué, statut:', refreshResp.status);
            return false;
          }
          
          // Récupère le nouveau token
          const refreshData = await refreshResp.json();
          console.debug('[AUTH] Données reçues du refresh:', refreshData);
          
          let newToken = refreshData.accessToken || refreshData.token;
          if (!newToken) {
            console.error('[AUTH] Pas de nouveau token dans la réponse');
            return false;
          }
          
          // Vérifie si le token a le champ "type"
          try {
            const [header, payload, signature] = newToken.split('.');
            const decodedPayload = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
            console.debug('[AUTH] Payload du nouveau token:', decodedPayload);
            
            // Forcer le type à USER si non présent ou non reconnu
            if (!decodedPayload.type) {
              console.debug('[AUTH] Token sans type détecté, ajout du type USER');
              
              decodedPayload.type = 'USER';
              
              const modifiedPayload = btoa(JSON.stringify(decodedPayload))
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');
              
              newToken = `${header}.${modifiedPayload}.${signature}`;
              console.debug('[AUTH] Token modifié avec type ajouté:', newToken);
            }
          } catch (e) {
            console.error('[AUTH] Erreur lors de la vérification/modification du token:', e);
          }
          
          console.log('Token rafraîchi avec succès, mise à jour du store');
          set({ 
            accessToken: newToken,
          });
          return true;
        } catch (error) {
          console.error('Erreur lors du rafraîchissement du token depuis le store:', error);
          return false;
        }
      },

      setUser: (user: User) => {
        set({ user });
      },
    }),
    {
      name: STORAGE_KEY,
       storage: createJSONStorage(() => localStorage),
       partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
 
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null; 
  
  try {
    const authData = localStorage.getItem(STORAGE_KEY);
    if (!authData) {
      console.error('Aucune donnée d\'authentification dans le localStorage');
      return null;
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken || null;
    
    if (!token) {
      console.error('Token absent dans les données d\'authentification');
      // Déboguer le contenu du localStorage
      console.debug('Contenu du localStorage:', debugLocalStorage());
    }
    
    return token;
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
}

 
export function isUserAuthenticated(): boolean {
  if (typeof window === 'undefined') return false; 
  
  try {
    const authData = localStorage.getItem(STORAGE_KEY);
    if (!authData) return false;
    
    const parsedData = JSON.parse(authData);
    return !!parsedData?.state?.isAuthenticated;
  } catch (error) {
    console.error('Error checking authentication status:', error);
    return false;
  }
}
