"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import AuthHeader from '@/components/auth/AuthHeader';
import styles from './page.module.css';
import { LoginCredentials } from '@/types/auth';
import { authClient, isUserLoggedIn } from '@/lib/auth-client';

/**
 * Page de connexion
 */
export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isUserLoggedIn()) {
        router.push('/gestion');
      } else {
        setCheckingAuth(false);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [router]);

  /**
   * Gère la soumission du formulaire de connexion
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    setLoginError(null);
    setIsLoading(true);
    
    try {
      console.log('Tentative de connexion avec:', { email: credentials.email, password: '***' });
      console.log('URL API:', process.env.NEXT_PUBLIC_API_URL);
      
      // Utiliser directement l'API externe au lieu de Better Auth
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: credentials.email, password: credentials.password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Identifiants incorrects');
      }
      
      const data = await response.json();
      console.log('Réponse API:', data);
      
      // Stocker l'access token (durée 1 heure)
      document.cookie = `chicken-nation-session=${data.token || data.accessToken}; path=/; max-age=3600`;
      
      // Stocker le refresh token (durée 30 jours)
      if (data.refreshToken) {
        document.cookie = `chicken-nation-refresh=${data.refreshToken}; path=/; max-age=${30 * 24 * 60 * 60}`;
      }
      
      console.log('Tokens stockés dans les cookies');
      console.log('Redirection vers /gestion...');
      
      // Forcer la redirection avec window.location pour éviter les problèmes avec le router
      window.location.href = '/gestion';
    } catch (error) {
      console.error('Erreur de connexion détaillée:', error);
      setLoginError(error instanceof Error ? error.message : 'Identifiants incorrects');
    } finally {
      setIsLoading(false);
    }
  };

  // Afficher un écran de chargement pendant la vérification
  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-orange-500 mb-4">Chargement...</h2>
          <p className="text-gray-600">Vérification de votre authentification</p>
        </div>
      </div>
    );
  }

  return (
   <div className="flex flex-col overflow-hidden">
     {/* Header fixe */}
     <div className="fixed top-0 left-0 right-0 z-50">
       <AuthHeader />
     </div>

     {/* Contenu principal */}
     <main
       className={`${styles.fullHeightContainer} flex flex-col md:flex-row`}
       style={{
         backgroundColor: 'black',
         backgroundImage: 'url("/images/background.png")',
         backgroundSize: 'cover',
         backgroundPosition: 'center',
         backgroundRepeat: 'no-repeat'
       }}
     >
      {/* Section gauche avec mascotte */}
      <div className="flex-1 flex items-center justify-center mt-6 p-6 md:p-12 z-2">
        <div className="relative w-full max-full aspect-square">
          <Image
            src="/images/mascote.png"
            alt="Chicken Nation Mascotte"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>

      {/* Section droite avec formulaire */}
      <div className="flex-1 flex items-center justify-center -mt-56 p-6 md:p-12">
        <div className="w-full max-w-md">
          {/* Carte de connexion */}
          <div className="bg-white rounded-3xl shadow-lg p-8 z-10">
            <h2 className="text-center text-2xl text-orange-500 font-sofia-bold text-primary mb-8">
              Commençons
            </h2>

            <div className="text-center text-sm font-sofia-regular text-dark mb-6">
              Identifiant de l'admin
            </div>

            {loginError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </main>
   </div>
  );
}