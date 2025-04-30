"use client"

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/LoginForm';
import AuthHeader from '@/components/auth/AuthHeader';
import styles from './page.module.css';
import { useAuthStore } from '@/store/authStore';
import { LoginCredentials } from '@/types/auth';

/**
 * Page de connexion
 * Reproduit fidèlement l'écran de connexion de Chicken Nation
 */
export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, isAuthenticated } = useAuthStore();
  const [loginError, setLoginError] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    // Ajouter un délai pour éviter les problèmes de rendu
    const timer = setTimeout(() => {
      // Si l'utilisateur est déjà authentifié, rediriger vers /gestion
      if (isAuthenticated && !redirecting) {
        setRedirecting(true);
        router.push('/gestion');
      } else {
        // Sinon, marquer que la vérification est terminée
        setCheckingAuth(false);
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated, router, redirecting]);

  /**
   * Gère la soumission du formulaire de connexion
   */
  const handleLogin = async (credentials: LoginCredentials) => {
    setLoginError(null);
    
    try {
      // Effectuer la connexion via le store qui utilise maintenant notre service d'authentification
      await login(credentials);
      
      // Marquer qu'on est en train de rediriger
      setRedirecting(true);
      
      // Rediriger vers le tableau de bord
      router.push('/gestion');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Erreur de connexion');
    }
  };

  // Afficher un écran de chargement pendant la vérification ou la redirection
  if (checkingAuth || redirecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-xl font-bold text-orange-500 mb-4">
            {redirecting ? "Redirection en cours..." : "Chargement..."}
          </h2>
          <p className="text-gray-600">
            {redirecting ? "Vous allez être redirigé vers le dashboard" : "Vérification de votre authentification"}
          </p>
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

     {/* Contenu principal - exactement la hauteur restante */}
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
              Identifiant de l&apos;admin
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