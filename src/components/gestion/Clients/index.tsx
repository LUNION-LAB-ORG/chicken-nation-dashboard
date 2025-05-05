'use client'

import React, { useState, useEffect } from 'react'; 
import ClientHeader from './ClientHeader';
import { ClientsTable } from './ClientsTable';
import { ClientProfile } from './ClientProfile';
import AddMenu from '../Menus/AddMenu'; 
import { UserCounter } from './UserCounter';
import { GlobalReviews } from './GlobalReviews'; 
import { useCustomerStore } from '@/store/customerStore';

interface ClientState {
  view: 'list' | 'create' | 'edit' | 'view' | 'reviews';
  selectedClientId?: string | null;
  showConnectedOnly: boolean;
}

interface ClientsProps {
  setActiveTab?: (tab: string) => void;
}

export default function Clients({ setActiveTab }: ClientsProps) {
  const [clientState, setClientState] = useState<ClientState>({
    view: 'list',
    selectedClientId: null,
    showConnectedOnly: false
  });

  // Utiliser le store client
  const { 
    customers, 
    fetchCustomers, 
    setShowConnectedOnly, 
    pagination, 
    isLoading,
    error 
  } = useCustomerStore();

  // Charger les clients au montage du composant
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleViewChange = (view: 'list' | 'create' | 'edit' | 'view' | 'reviews', clientId?: string | null) => {
    
    setClientState(prev => ({ ...prev, view, selectedClientId: clientId }));
    
  };

  const handleClientSelect = (clientId: string) => {
   
    
    // Si on clique sur le même client, on désélectionne
    if (clientState.selectedClientId === clientId) {
       setClientState(prev => ({ ...prev, selectedClientId: null }));
    } else {
      // Sinon on sélectionne le client sans changer de vue
       setClientState(prev => ({ ...prev, selectedClientId: clientId }));
    }
    
  };

  const handleClientDoubleClick = (clientId: string) => {
   
    handleViewChange('view', clientId);
   
  };

  const handleBack = () => {
    handleViewChange('list');
  };

  const handleViewReviews = () => {
    // Si un client est sélectionné dans la vue liste, on affiche ses avis
    if (clientState.view === 'list' && clientState.selectedClientId) {
      handleViewChange('view', clientState.selectedClientId);
    } else {
      // Sinon on affiche tous les avis
      handleViewChange('reviews');
    }
  };

  const toggleConnectedFilter = () => {
     setClientState(prev => ({ 
      ...prev, 
      showConnectedOnly: !prev.showConnectedOnly,
      selectedClientId: null  
    }));
 
    setShowConnectedOnly(!clientState.showConnectedOnly);
  };

  // Fonction pour rediriger vers les commandes
  const handleViewOrders = () => {
    if (setActiveTab) {
      setActiveTab('orders');
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 px-8 space-y-6">
        <div className="-mt-10">
          <ClientHeader 
            currentView={clientState.view}
            selectedClientId={clientState.selectedClientId}
            onCreateMenu={() => handleViewChange('create')}
            onBack={clientState.view !== 'list' ? handleBack : undefined}
            onViewReviews={handleViewReviews}
            onToggleConnected={toggleConnectedFilter}
            showingConnectedOnly={clientState.showConnectedOnly}
            onViewOrders={handleViewOrders}  
          />
          
          {/* UserCounter uniquement sur la vue liste */}
          {clientState.view === 'list' && (
            <UserCounter count={pagination.totalItems} />
          )}
        </div>

        {clientState.view === 'list' && (
          <div className='bg-white border border-slate-100 rounded-xl sm:rounded-2xl overflow-hidden'>
            <ClientsTable 
              selectedClientId={clientState.selectedClientId}
              onClientClick={handleClientSelect}
              onClientDoubleClick={handleClientDoubleClick}
              connectedOnly={clientState.showConnectedOnly}
              isLoading={isLoading}
            />
          </div>
        )}

        {clientState.view === 'view' && clientState.selectedClientId && (
          <ClientProfile 
            clientId={clientState.selectedClientId} 
            onClose={handleBack}
          />
        )}

        {clientState.view === 'create' && (
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 lg:w-2/3">
              <AddMenu onCancel={handleBack} />
            </div>
            <div className="w-full lg:w-1/3 invisible">
              {/* Espace vide comme dans Orders */} 
            </div>
          </div>
        )}

        {clientState.view === 'reviews' && (
          <GlobalReviews />
        )}
      </div>
    </div>
  );
}