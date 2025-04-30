 
import { api } from './api';
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
  
   if (message.includes('user not found') || message.includes('utilisateur non trouvu00e9')) {
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
  console.log('Tentative de connexion avec:', { email: credentials.email });
  
  try {
    const response = await api.post<AuthResponse>(`${AUTH_ENDPOINT}/login`, credentials, false);
    
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
 
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/v1${AUTH_ENDPOINT}/refresh-token?type=USER`;
 
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${refreshToken}`,
      },
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Erreur de rafraîchissement du token:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
       const frenchErrorMessage = translateErrorMessage(new Error(errorData.message || `API request failed with status ${response.status}`));
      throw new Error(frenchErrorMessage);
    }
    
    const data = await response.json();
    // Normaliser la réponse
    const normalizedData = {
      accessToken: data.token || data.accessToken,
      ...data
    };
 
    return normalizedData;
  } catch (error) {
    console.error('Erreur lors du rafraîchissement du token:', error);
    // Traduire le message d'erreur en français
    const frenchErrorMessage = translateErrorMessage(error);
    throw new Error(frenchErrorMessage);
  }
};

export const logout = async (): Promise<void> => {
  console.log('Déconnexion de l\'utilisateur');
  return Promise.resolve();
};
