import { authClient, getCurrentUser as getUser, isUserLoggedIn } from '@/lib/auth-client';
import { betterApiClient } from './betterApiClient';
import { LoginCredentials, LoginResponse, User } from '@/types/auth';

 
export const betterAuthService = {
 
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      // @ts-ignore - L'API de Better Auth a évolué
      const response = await authClient.signInEmail?.({ 
        email: credentials.email, 
        password: credentials.password 
      });
      
      if (!response) {
        throw new Error('Erreur lors de la connexion');
      }
      
      return response;
    } catch (error) {
      console.error('Erreur lors de la connexion:', error);
      throw error;
    }
  },
  
  /**
   * Déconnecte l'utilisateur actuel
   */
  async logout(): Promise<void> {
    try {
       await authClient.signOut?.();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      throw error;
    }
  },
  
  /**
   * Rafraîchit le token d'accès
   */
  async refreshToken(): Promise<boolean> {
    try {
      // @ts-ignore - L'API de Better Auth a évolué
      const result = await authClient.refresh?.();
      return !!result;
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du token:', error);
      return false;
    }
  },
  
  /**
   * Vérifie si l'utilisateur est authentifié
   */
  isAuthenticated(): boolean {
    return isUserLoggedIn();
  },
  
  /**
   * Récupère l'utilisateur actuel
   */
  getCurrentUser(): User | null {
    return getUser() as User | null;
  }
};
