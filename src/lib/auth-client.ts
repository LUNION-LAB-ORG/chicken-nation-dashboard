import { createAuthClient } from "better-auth/react";

// Création du client Better Auth simplifié
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  basePath: "/api/auth", // Ajouter le chemin de base correct pour les requêtes d'authentification
  
  // Redirection après connexion/déconnexion
  redirects: {
    afterSignIn: "/gestion",
    afterSignOut: "/",
  },
  
  // Gestion des erreurs
  onError: (error: unknown) => {
    console.error("Erreur d'authentification:", error);
  },
});

// Fonction utilitaire pour obtenir le token d'accès actuel
export const getAccessToken = (): string | null => {
  try {
    // @ts-ignore - L'API de Better Auth a évolué
    return authClient.getState?.()?.session?.accessToken || null;
  } catch (error) {
    console.error("Erreur lors de la récupération du token:", error);
    return null;
  }
};

// Fonction utilitaire pour vérifier si l'utilisateur est connecté
export const isUserLoggedIn = (): boolean => {
  try {
    // @ts-ignore - L'API de Better Auth a évolué
    return !!authClient.getState?.()?.session;
  } catch (error) {
    console.error("Erreur lors de la vérification de l'authentification:", error);
    return false;
  }
};

// Fonction utilitaire pour obtenir l'utilisateur actuel
export const getCurrentUser = () => {
  try {
    // @ts-ignore - L'API de Better Auth a évolué
    return authClient.getState?.()?.session?.user || null;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return null;
  }
};
