 import { betterApiClient } from './betterApiClient';
import { LoginCredentials, LoginResponse } from '@/types/auth';

const AUTH_ENDPOINT = '/auth';

export type AuthResponse = LoginResponse;

export interface RefreshTokenResponse {
  accessToken?: string;
  token?: string; 
}

const translateErrorMessage = (error: any): string => {
  if (!(error instanceof Error)) {
    return 'Une erreur inconnue est survenue';
  }

  const message = error.message.toLowerCase();
  
  if (message.includes('user not found') || message.includes('utilisateur non trouvé')) {
    return 'Identifiants incorrects. Veuillez vérifier votre email.';
  }
  
  if (message.includes('invalid password') || message.includes('mot de passe invalide')) {
    return 'Mot de passe incorrect. Veuillez réessayer.';
  }
  
  if (message.includes('authentication required') || message.includes('unauthorized')) {
    return 'Échec de la connexion. Veuillez vérifier vos identifiants ';
  }
  
  if (message.includes('network') || message.includes('réseau')) {
    return 'Problème de connexion au serveur. Veuillez vérifier votre connexion internet.';
  }
 
  return 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
};

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  
  try {
    const response = await betterApiClient.post<AuthResponse>(`${AUTH_ENDPOINT}/login`, credentials);
    
    const normalizedResponse: AuthResponse = {
      ...response,
      accessToken: response.token || response.accessToken,
    };
     
    if (!normalizedResponse.user && normalizedResponse.id) {
      normalizedResponse.user = {
        id: normalizedResponse.id || '',
        email: normalizedResponse.email || '',
        fullname: normalizedResponse.fullname || '',
        role: normalizedResponse.role || '',
        type: normalizedResponse.type,
      };
    }
    
    return normalizedResponse;
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    const frenchErrorMessage = translateErrorMessage(error);
    throw new Error(frenchErrorMessage);
  }
};

export const refreshToken = async (refreshToken: string): Promise<RefreshTokenResponse> => {
  console.log('Tentative de rafraichissement du token avec:', { tokenLength: refreshToken?.length });
  console.log('Refresh token utilisé (début):', refreshToken?.substring(0, 10) + '...');
 
  try {
    // Utiliser directement betterApiClient avec un header d'autorisation personnalisé
    const response = await betterApiClient.get<RefreshTokenResponse>('/auth/refresh-token', {
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
    
    console.log('Réponse du rafraichissement:', response);
    
    // Normaliser la réponse
    const normalizedData = {
      accessToken: response.token || response.accessToken,
      token: response.token || response.accessToken, // Assurer la compatibilité
      ...response
    };
    
    console.log('Données normalisées:', { hasToken: !!normalizedData.token, hasAccessToken: !!normalizedData.accessToken });
 
    return normalizedData;
  } catch (error) {
    console.error('Erreur lors du rafraichissement du token:', error);
    // Traduire le message d'erreur en français
    const frenchErrorMessage = translateErrorMessage(error);
    throw new Error(frenchErrorMessage);
  }
};

export const logout = async (): Promise<void> => {
  console.log('Déconnexion de l\'utilisateur');
  return Promise.resolve();
};
