"use client"

import React from 'react'
import DashboardPageHeader from '@/components/ui/DashboardPageHeader'
import { Plus } from 'lucide-react'

interface MenuHeaderProps {
  currentView: 'list' | 'create' | 'edit' | 'view'
  onBack?: () => void
  onCreateMenu?: () => void
}

function MenuHeader({ currentView = 'list', onBack, onCreateMenu }: MenuHeaderProps) {
  if (currentView === 'list') {
    return (
      <DashboardPageHeader
        mode="list"
        title="Plat"
        searchConfig={{
          placeholder: "Rechercher un plat",
          buttonText: "Chercher",
          onSearch: (value) => console.log('Searching:', value)
        }}
        actions={onCreateMenu ? [
          {
            label: "Créer un plat",
            onClick: onCreateMenu,
            icon: Plus,
          }
        ] : []}
      />
    )
  }

  return (
    <DashboardPageHeader
      mode={currentView === 'view' ? 'detail' : currentView}
      onBack={onBack}
      title={
        currentView === 'create' 
          ? 'Créer un plat' 
          : currentView === 'edit' 
            ? 'Modifier le plat' 
            : 'Détails du plat'
      }
      gradient={true}
    />
  )
}

export default MenuHeader
