"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { betterAuthService } from '@/services/betterAuthService'; // Module non disponible
import { User } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
  refreshToken: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser l'u00e9tat d'authentification au chargement
  useEffect(() => {
    const initAuth = () => {
      try {
        // const isAuth = betterAuthService.isAuthenticated(); // Module non disponible
        // const currentUser = betterAuthService.getCurrentUser(); // Module non disponible

        setIsAuthenticated(false); // Valeur par défaut
        setUser(null); // Valeur par défaut
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de l\'authentification:', error);
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Du00e9connexion
  const logout = async () => {
    try {
      // await betterAuthService.logout(); // Module non disponible
      setIsAuthenticated(false);
      setUser(null);
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la du00e9connexion:', error);
    }
  };

  // Rafraichissement du token
  const refreshToken = async (): Promise<boolean> => {
    try {
      // const success = await betterAuthService.refreshToken(); // Module non disponible
      const success = false;

      if (success) {
        // Mettre u00e0 jour l'u00e9tat d'authentification
        // const isAuth = betterAuthService.isAuthenticated(); // Module non disponible
        // const currentUser = betterAuthService.getCurrentUser(); // Module non disponible
        const isAuth = false;
        const currentUser = null;

        setIsAuthenticated(isAuth);
        setUser(currentUser);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Erreur lors du rafraichissement du token:', error);
      return false;
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    logout,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
