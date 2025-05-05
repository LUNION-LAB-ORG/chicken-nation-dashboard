import React from 'react';
import { betterApiClient } from '@/services/betterApiClient';

const TokenRefreshTest: React.FC = () => {
  const [testStatus, setTestStatus] = React.useState<{
    status: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
    data?: any;
  }>({ status: 'idle' });

  const handleExpireToken = () => {
    try {
      // Simuler l'expiration du token en supprimant le cookie
      document.cookie = 'chicken-nation-session=; path=/; max-age=0';
      setTestStatus({
        status: 'success',
        message: 'Token expiré avec succès. Faites maintenant une requête pour tester le refresh.'
      });
    } catch (error) {
      setTestStatus({
        status: 'error',
        message: `Erreur lors de l'expiration du token: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  const handleTestRequest = async () => {
    setTestStatus({ status: 'loading', message: 'Envoi d\'une requête API avec le token expiré...' });
    try {
      // Faire une requête qui nécessite une authentification
      const result = await betterApiClient.get('/customer?page=1&limit=5');
      setTestStatus({
        status: 'success',
        message: 'Requête réussie après refresh automatique du token!',
        data: result
      });
    } catch (error) {
      setTestStatus({
        status: 'error',
        message: `Erreur lors de la requête: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  const handleSimulateRefresh = async () => {
    setTestStatus({ status: 'loading', message: 'Simulation du processus de refresh token...' });
    try {
      // Expirer le token d'abord
      document.cookie = 'chicken-nation-session=; path=/; max-age=0';
      
      // Puis faire une requête qui devrait déclencher le refresh
      const result = await betterApiClient.get('/customer?page=1&limit=5');
      
      setTestStatus({
        status: 'success',
        message: 'Simulation réussie! Le token a été rafraîchi automatiquement.',
        data: result
      });
    } catch (error) {
      setTestStatus({
        status: 'error',
        message: `Erreur lors de la simulation: ${error instanceof Error ? error.message : String(error)}`
      });
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Test du Refresh Token</h2>
      
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={handleExpireToken}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
        >
          1. Expirer Token
        </button>
        
        <button
          onClick={handleTestRequest}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          2. Tester Requête API
        </button>
        
        <button
          onClick={handleSimulateRefresh}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Simuler Refresh (tout-en-un)
        </button>
      </div>
      
      {testStatus.status !== 'idle' && (
        <div className={`p-4 rounded-lg ${{
          'loading': 'bg-gray-100',
          'success': 'bg-green-100 text-green-800',
          'error': 'bg-red-100 text-red-800'
        }[testStatus.status]}`}>
          <p className="font-medium">{testStatus.message}</p>
          
          {testStatus.data && (
            <div className="mt-3">
              <p className="font-semibold">Données:</p>
              <pre className="mt-2 p-2 bg-gray-800 text-white rounded overflow-auto max-h-60 text-sm">
                {JSON.stringify(testStatus.data, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 text-sm text-gray-600">
        <p className="font-semibold">Comment utiliser ce test:</p>
        <ol className="list-decimal pl-5 mt-2 space-y-1">
          <li>Cliquez sur "Expirer Token" pour forcer l'expiration du token actuel</li>
          <li>Puis cliquez sur "Tester Requête API" pour déclencher le refresh automatique</li>
          <li>Ou utilisez "Simuler Refresh" pour exécuter les deux étapes en une seule fois</li>
          <li>Vérifiez les logs dans la console du navigateur pour plus de détails</li>
        </ol>
      </div>
    </div>
  );
};

export default TokenRefreshTest;
