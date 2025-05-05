import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

// Wrapper pour ajouter des logs au handler d'authentification
const withLogging = (handler: (req: Request) => Promise<Response>) => {
  return async (req: Request): Promise<Response> => {
    console.log('========== AUTH REQUEST ==========');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', Object.fromEntries([...req.headers.entries()]));
    
    try {
      // Cloner la requête pour pouvoir lire le corps
      const clonedReq = req.clone();
      const body = await clonedReq.text();
      console.log('Body:', body.length > 500 ? body.substring(0, 500) + '...' : body);
    } catch (error) {
      console.log('Impossible de lire le corps de la requête:', error);
    }
    
    // Appeler le handler original
    try {
      const response = await handler(req);
      console.log('Response status:', response.status);
      console.log('========== AUTH RESPONSE END ==========');
      return response;
    } catch (error) {
      console.error('Erreur dans le handler d\'authentification:', error);
      console.log('========== AUTH ERROR END ==========');
      throw error;
    }
  };
};

// Export des méthodes HTTP pour le handler Better Auth avec journalisation
export const { GET, POST } = toNextJsHandler(withLogging(auth.handler));

// Pour déboguer les requêtes entrantes
export async function DEBUG(req: Request) {
  console.log('Requête reçue:', req.url, req.method);
  return new Response('Debug mode', { status: 200 });
}
