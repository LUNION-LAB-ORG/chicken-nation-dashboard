import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  
  // Récupérer le cookie de session (access token)
  const sessionCookie = request.cookies.get('chicken-nation-session');
 
  
  // Récupérer le chemin de la requête
  const path = request.nextUrl.pathname;

  // Routes protégées qui nécessitent une authentification
  const protectedRoutes = [
    '/gestion',
  ];

  // Vérifie si la route actuelle est protégée
  const isProtectedRoute = protectedRoutes.some(route => 
    path === route || path.startsWith(`${route}/`)
  );
  
 

  // Si c'est une route protégée et qu'il n'y a pas de cookie de session, rediriger vers la page d'accueil
  if (isProtectedRoute && !sessionCookie) {
 
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Si l'utilisateur est déjà connecté et essaie d'accéder à la page de connexion, rediriger vers le tableau de bord
  if (sessionCookie && path === '/') {
 
    return NextResponse.redirect(new URL('/gestion', request.url));
  }
  
 
  return NextResponse.next();
}

// Spécifier les routes sur lesquelles le middleware doit s'appliquer
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (API routes for authentication)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
