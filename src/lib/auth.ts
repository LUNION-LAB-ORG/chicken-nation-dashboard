import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

// Configuration de l'API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';
const API_PREFIX = '/api/v1';

// Types pour l'adaptateur personnalisé
type UserCredentials = {
  email: string;
  password: string;
};

type User = {
  id: string;
  email: string;
  name: string;
  role?: string;
  emailVerified: boolean;
  customFields?: {
    type?: string;
  };
};

type Session = {
  id: string;
  userId: string;
  expiresAt: Date;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: any;
};

// Adaptateur personnalisé qui se connecte à l'API existante
const customAdapter = {
  // Méthode pour vérifier les identifiants
  async verifyCredentials({ email, password }: UserCredentials) {
    try {
      // Appel à l'API existante pour la connexion
      const response = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants incorrects');
      }

      const data = await response.json();
      
      // Création d'un utilisateur au format Better Auth
      return {
        id: data.user?.id || data.id,
        email: data.user?.email || data.email,
        name: data.user?.fullname || data.fullname || '',
        role: data.user?.role || data.role || 'user',
        emailVerified: true,
        customFields: {
          type: data.user?.type || data.type || 'USER',
        },
      };
    } catch (error) {
      console.error('Erreur lors de la vérification des identifiants:', error);
      throw new Error('Identifiants incorrects');
    }
  },
  // Méthode pour récupérer un utilisateur par son ID
  async getUserById(id: string) {
    try {
      return {
        id,
        email: '',
        name: '',
        role: 'user',
        emailVerified: true,
        customFields: {
          type: 'USER',
        },
      };
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      return null;
    }
  },
  // Autres méthodes nécessaires (implémentation minimale)
  async getUserByEmail() { return null; },
  async createUser() { throw new Error('Création d\'utilisateur non prise en charge'); },
  async updateUser() { return null; },
  async deleteUser() { return null; },
  async createSession(data: Session) { return data; },
  async getSessionById(id: string) { return null; },
  async updateSession(data: Session) { return data; },
  async deleteSession() { return null; },
  async deleteUserSessions() { return null; },
};

// Fonction pour rafraîchir le token
async function refreshTokenFn(token: string) {
  try {
    // Appel à l'API existante pour rafraîchir le token
    const response = await fetch(`${API_BASE_URL}${API_PREFIX}/auth/refresh-token`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` },
    });

    if (!response.ok) {
      throw new Error(`Refresh échoué avec statut: ${response.status}`);
    }

    const data = await response.json();
    return {
      accessToken: data.accessToken || data.token,
      refreshToken: data.refreshToken,
    };
  } catch (error) {
    console.error('Erreur lors du refresh token:', error);
    return null;
  }
}

// Création de l'instance d'authentification
export const auth = betterAuth({
  // Utilisation de notre adaptateur personnalisé
  adapter: customAdapter,
  
  // Configuration des méthodes d'authentification
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // Désactiver l'inscription
  },
  
  // Configuration des cookies et JWT
  secret: process.env.JWT_SECRET || "chicken-nation-secret-key",
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  basePath: "/api/auth", // Chemin de base pour les routes d'authentification
  
  // Configuration des sessions JWT
  jwt: {
    expiresIn: "1h", // Expiration d'une heure comme demandé
  },
  
  cookies: {
    sessionCookie: {
      name: "chicken-nation-session",
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 30 * 24 * 60 * 60, // 30 jours
      },
    },
  },
  
  // Configuration du refresh token
  refreshToken: {
    enabled: true,
    expiresIn: "30d", // 30 jours
    rotate: true, // Générer un nouveau refresh token à chaque utilisation
  },
  
  // Hooks pour personnaliser les réponses
  callbacks: {
    // Hook pour personnaliser la réponse de login
    async signIn({ user, session }: { user: User; session: Session }) {
      return {
        user: {
          id: user.id,
          email: user.email,
          fullname: user.name || "",
          role: user.role || "user",
          type: user.customFields?.type || "USER",
        },
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        token: session.accessToken, // Pour compatibilité avec l'ancien code
      };
    },
    // Hook pour personnaliser la réponse de refresh token
    async refreshToken({ token }: { token: string }) {
      const result = await refreshTokenFn(token);
      if (!result) return null;
      
      return {
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        token: result.accessToken, // Pour compatibilité avec l'ancien code
      };
    },
  },
  
  // Ajouter le plugin nextCookies pour gérer automatiquement les cookies dans les server actions
  plugins: [nextCookies()], // Assurez-vous que c'est le dernier plugin dans le tableau
});

// Fonction utilitaire pour vérifier si l'utilisateur est authentifié
export const isAuthenticated = async (req: Request) => {
  const session = await auth.api.getSession({ headers: req.headers });
  return !!session;
};

// Fonction utilitaire pour obtenir la session utilisateur
export const getSession = async (req: Request) => {
  return await auth.api.getSession({ headers: req.headers });
};

// Fonction utilitaire pour obtenir l'utilisateur courant
export const getCurrentUser = async (req: Request) => {
  const session = await auth.api.getSession({ headers: req.headers });
  if (!session) return null;
  return session.user;
};
