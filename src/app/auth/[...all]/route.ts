import { NextResponse } from 'next/server';

// Redirection des requêtes de /auth vers /api/auth
export async function GET(req: Request) {
  const url = new URL(req.url);
  // Construire la nouvelle URL avec /api/auth
  const newUrl = new URL(`${url.origin}/api/auth${url.pathname.replace('/auth', '')}${url.search}`);
  console.log(`Redirection de ${url.pathname} vers ${newUrl.pathname}`);
  return NextResponse.redirect(newUrl);
}

export async function POST(req: Request) {
  const url = new URL(req.url);
  // Construire la nouvelle URL avec /api/auth
  const newUrl = new URL(`${url.origin}/api/auth${url.pathname.replace('/auth', '')}${url.search}`);
  console.log(`Redirection de ${url.pathname} vers ${newUrl.pathname}`);
  
  // Cloner la requête pour préserver le corps
  const clonedReq = req.clone();
  const body = await clonedReq.text();
  
  // Créer une nouvelle requête avec le même corps
  const newReq = new Request(newUrl, {
    method: 'POST',
    headers: req.headers,
    body: body
  });
  
  // Faire suivre la requête à la nouvelle URL
  return fetch(newReq);
}
