"use client"

import React from 'react'
import DashboardPageHeader from '@/components/ui/DashboardPageHeader' 
 

interface OrderHeaderProps {
  currentView: 'list' | 'create' | 'edit' | 'view'
  onBack: () => void
  onCreateMenu: () => void
}

function OrderHeader({ currentView = 'list', onBack, onCreateMenu }: OrderHeaderProps) {
  if (currentView === 'list') {
    return (
      <DashboardPageHeader
        mode="list"
        title="Commandes"
        searchConfig={{
          placeholder: "Rechercher une commande",
          buttonText: "Chercher",
          onSearch: (value) => console.log('Searching:', value)
        }}
        actions={[
          
          {
            label: "Exporter",
            onClick: onCreateMenu,
          
          }
        ]}
      />
    )
  }

  return (
    <DashboardPageHeader
      mode={currentView === 'view' ? 'detail' : currentView}
      onBack={onBack}
      title={
        currentView === 'create' 
          ? 'Créer un menu' 
          : currentView === 'edit' 
            ? 'Modifier le menu' 
            : 'Détails '
      }
      gradient={true}
      actions={
        currentView === 'view' 
          ? [
              {
                label: "Exporter",
                onClick: () => console.log('Exporting order'),
               
              }
            ] 
          : undefined
      }
    />
  )
}

export default OrderHeader
