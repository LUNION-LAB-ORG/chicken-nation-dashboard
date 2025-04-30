"use client"

import React from 'react'
import DashboardPageHeader from '@/components/ui/DashboardPageHeader'

interface ClientHeaderProps {
  currentView: 'list' | 'create' | 'edit' | 'view' | 'reviews';
  selectedClientId?: string | null;
  onBack?: () => void;
  onCreateMenu?: () => void;
  onViewReviews?: () => void;
  onToggleConnected?: () => void;
  onViewOrders?: () => void;
  showingConnectedOnly?: boolean;
}

function ClientHeader({
  currentView = 'list',

  onBack,
  onCreateMenu,
  onViewReviews,
  onToggleConnected,
  onViewOrders,
  showingConnectedOnly = false
}: ClientHeaderProps) {

  // Vue liste principale  
  if (currentView === 'list') {
    return (
      <DashboardPageHeader
        mode="list"
        title={showingConnectedOnly ? "Clients connectés" : "Clients"}
        searchConfig={{
          placeholder: "Rechercher un client",
          buttonText: "Chercher",
          onSearch: (value) => console.log('Searching:', value)
        }}
        actions={[
          {
            label: "Notes & avis",
            onClick: onViewReviews ?? (() => console.log('View reviews clicked')),
          },
          {
            label: showingConnectedOnly ? "Tous les clients" : "Connectés sur l'app",
            onClick: onToggleConnected ?? (() => console.log('Toggle connected clicked')),
          },
          {
            label: "Voir les commandes",
            onClick: onViewOrders ?? (() => console.log('View orders clicked')),
          }
        ]}
      />
    )
  }

  // Autres vues (détail, création, etc.)
  return (
    <DashboardPageHeader
      mode={currentView === 'view' ? 'detail' : currentView === 'reviews' ? 'detail' : currentView}
      onBack={onBack}
      title={
        currentView === 'create'
          ? 'Créer un menu'
          : currentView === 'edit'
            ? 'Modifier le client'
            : currentView === 'reviews'
              ? 'Commentaires'
              : 'Détails du client'
      }
      gradient={true}
      actions={[
        {
          label: "Notes & avis",
          onClick: onViewReviews ?? (() => console.log('View reviews clicked')),
        },
        {
          label: showingConnectedOnly ? "Tous les clients" : "Connectés sur l'app",
          onClick: onToggleConnected ?? (() => console.log('Toggle connected clicked')),
        },
        {
          label: "Voir les commandes",
          onClick: onViewOrders ?? (() => console.log('View orders clicked')),
        },
        // Dans les vues autres que liste, on garde le bouton "Créer un menu"
        ...(onCreateMenu ? [{
          label: "Créer un menu",
          onClick: onCreateMenu,
        }] : [])
      ]}
    />
  )
}

export default ClientHeader