 // Vérifier si le token est valide
export function isTokenValid() {
  try {
    if (typeof window === 'undefined') return false;
    
    const auth = localStorage.getItem('chicken-nation-auth');
    if (!auth) return false;
    
    const parsedAuth = JSON.parse(auth);
    const token = parsedAuth?.state?.accessToken;
    if (!token) return false;
    
    // Vérifier si le token est expiré (si JWT avec exp)
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length === 3) {
        const payload = JSON.parse(atob(tokenParts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('Token expiré');
          return false;
        }
      }
    } catch (e) {
      // Si on ne peut pas décoder le token, on suppose qu'il est valide
      console.warn('Impossible de vérifier l\'expiration du token');
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification du token:', error);
    return false;
  }
}

 
export function getAuthToken(): string {
  try {
    // Vérifier si nous sommes côté client (browser)
    if (typeof window === 'undefined') {
      console.error('getAuthToken appelé côté serveur');
      return '';
    }

    const auth = localStorage.getItem('chicken-nation-auth');
    if (!auth) {
      console.warn('Token non trouvé dans le localStorage');
      return '';
    }

    try {
      const parsedAuth = JSON.parse(auth);
      const token = parsedAuth?.state?.accessToken;

      if (!token) {
        console.warn('Token invalide dans le localStorage');
        return '';
      }

      // Vérifier si le token est expiré (si JWT avec exp)
      try {
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          if (payload.exp && payload.exp * 1000 < Date.now()) {
            console.warn('Token expiré lors de la récupération');
            // On retourne quand même le token expiré pour qu'il puisse être utilisé pour le refresh
          }
        }
      } catch (e) {
        // Si on ne peut pas décoder le token, on suppose qu'il est valide
        console.warn('Impossible de vérifier l\'expiration du token');
      }

      return token;
    } catch (parseError) {
      console.error('Erreur lors du parsing du token:', parseError);
      return '';
    }
  } catch (error) {
    console.error('Erreur lors de la récupération du token:', error);
    return '';
  }
}

 
export async function handleAuthError(response: Response, retryFn: () => Promise<any>) {
  if (response.status === 401) {
    console.error('Erreur d\'authentification 401 - Token expiré ou invalide');
    
    // Tenter de rafraichir le token
    try {
      // Récupérer le token expiré
      const expiredToken = getAuthToken();
      if (!expiredToken) {
        console.error('Aucun token expiré disponible');
        throw new Error('Session expirée');
      }
      
      // Appel direct à l'API de refresh
      const refreshUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh-token`;
      console.log('Tentative de rafraîchissement direct avec URL:', refreshUrl);
      console.log('Token expiré utilisé (début):', expiredToken?.substring(0, 10) + '...');
      
      const refreshResponse = await fetch(refreshUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${expiredToken}`,
        },
      });
      
      if (!refreshResponse.ok) {
        console.error('Échec du rafraîchissement direct:', refreshResponse.status);
        const errorText = await refreshResponse.text();
        console.error('Détails de l\'erreur:', errorText);
        throw new Error('Échec du rafraîchissement');
      }
      
      const refreshData = await refreshResponse.json();
      console.log('Réponse du rafraîchissement:', refreshData);
      
      const newToken = refreshData.token || refreshData.accessToken;
      
      if (!newToken) {
        console.error('Aucun nouveau token reçu');
        throw new Error('Réponse de rafraîchissement invalide');
      }
      
      // Mettre à jour le token dans le localStorage
      try {
        const authData = localStorage.getItem('chicken-nation-auth');
        if (authData) {
          const parsedData = JSON.parse(authData);
          if (parsedData.state) {
            parsedData.state.accessToken = newToken;
            localStorage.setItem('chicken-nation-auth', JSON.stringify(parsedData));
            console.log('Token rafraîchi avec succès, nouvelle tentative...');
            return await retryFn();
          }
        }
      } catch (storageError) {
        console.error('Erreur lors de la mise à jour du token dans le localStorage:', storageError);
      }
      
      throw new Error('Impossible de mettre à jour le token');
    } catch (refreshError) {
      console.error('Échec du rafraîchissement du token:', refreshError);
      // Ne pas rediriger immédiatement, laisser le composant gérer l'erreur
      throw new Error(`Erreur d'authentification: ${response.status} ${response.statusText}`);
    }
  }
  
  throw new Error(`API Error: ${response.status} ${response.statusText}`);
}

 
export function withAuth(options: RequestInit = {}): RequestInit {
  const token = getAuthToken();
 
  const isFormData = options.body instanceof FormData;
  
  // Créer un nouvel objet headers pour éviter de modifier l'original
  const headers: Record<string, string> = {};
  
  // Ajouter les headers existants
  if (options.headers) {
    const existingHeaders = options.headers as Record<string, string>;
    Object.keys(existingHeaders).forEach(key => {
      headers[key] = existingHeaders[key];
    });
  }
  
  // Ajouter le header d'autorisation
  headers['Authorization'] = `Bearer ${token}`;
  
  // Ajouter les headers de contenu seulement si ce n'est pas un FormData
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
    headers['Accept'] = 'application/json';
  } else {
    // Pour FormData, ajouter seulement Accept
    headers['Accept'] = 'application/json';
    // Ne PAS ajouter Content-Type pour FormData, le navigateur le fera automatiquement
  }
  
  return {
    ...options,
    headers
  };
}

 
export async function fetchWithAuth<T>(url: string, options: RequestInit = {}): Promise<T> {
  try {
    console.log(`Appel API avec auth: ${url}`);
    const authOptions = withAuth(options);
    const response = await fetch(url, authOptions);
    
    if (!response.ok) {
      console.log(`Erreur API: ${response.status} ${response.statusText} pour ${url}`);
      
      if (response.status === 401) {
        console.log('Token expiré, tentative de rafraîchissement...');
        return await handleAuthError(response, () => fetchWithAuth<T>(url, options));
      }
      
      // Pour les autres erreurs, essayer de récupérer le message d'erreur
      let errorMessage = `${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Détails de l\'erreur:', errorData);
      } catch (e) {
        // Si ce n'est pas du JSON valide, essayer de récupérer le texte
        try {
          const errorText = await response.text();
          if (errorText) {
            errorMessage = errorText;
            console.error('Détails de l\'erreur (texte):', errorText);
          }
        } catch (textError) {
          console.error('Impossible de lire les détails de l\'erreur');
        }
      }
      
      throw new Error(`API Error: ${errorMessage}`);
    }
    
    // Gérer les réponses vides
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } else {
      // Pour les réponses non-JSON
      return ({} as T);
    }
  } catch (error) {
    console.error(`Erreur lors de l'appel API à ${url}:`, error);
    throw error;
  }
}
