import { NextRequest, NextResponse } from 'next/server';
import { getAuthToken } from './src/store/authStore';

export function middleware(request: NextRequest) {
  // Vu00e9rifier si l'utilisateur tente d'accu00e9der u00e0 une route protégée
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/gestion');
  
  // Si ce n'est pas une route protégée, continuer normalement
  if (!isProtectedRoute) {
    return NextResponse.next();
  }
  
  // Récupérer le token d'authentification depuis le localStorage
  // Note: Cette approche ne fonctionne pas dans le middleware car il s'exécute sur le serveur
  // Nous devons utiliser les cookies pour l'authentification dans le middleware
  
  // Récupérer le token depuis les cookies
  const authCookie = request.cookies.get('chicken-nation-auth');
  
  // Si le cookie n'existe pas ou ne contient pas de token valide, rediriger vers la page de connexion
  if (!authCookie || !authCookie.value) {
    return NextResponse.redirect(new URL('/', request.url));
  }
  
  try {
    // Essayer de parser le cookie pour vérifier s'il contient un token valide
    const authData = JSON.parse(authCookie.value);
    const accessToken = authData?.state?.accessToken;
    
    if (!accessToken) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Si tout est bon, continuer normalement
    return NextResponse.next();
  } catch (error) {
    // En cas d'erreur, rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/', request.url));
  }
}

// Configurer les chemins sur lesquels le middleware sera exécuté
export const config = {
  matcher: [
    // Appliquer ce middleware uniquement aux routes commençant par /gestion
    '/gestion/:path*',
  ],
};
