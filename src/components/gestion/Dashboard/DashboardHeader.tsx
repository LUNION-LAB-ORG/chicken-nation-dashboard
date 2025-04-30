"use client"

import React from 'react'
import DashboardPageHeader from '@/components/ui/DashboardPageHeader'
import { Plus } from 'lucide-react'

interface OrderHeaderProps {
  currentView: 'list' | 'create' | 'edit' | 'view'
  onBack?: () => void
  onCreateMenu: () => void
}

function OrderHeader({ currentView = 'list', onBack, onCreateMenu }: OrderHeaderProps) {
  if (currentView === 'list') {
    return (
      <DashboardPageHeader
        mode="list"
        title="Tableau de bord"
        searchConfig={{
          placeholder: "Rechercher une commande",
          buttonText: "Chercher",
          onSearch: (value) => console.log('Searching:', value)
        }}
        actions={[
          {
            label: "Créer un menu",
            onClick: onCreateMenu,
            icon: Plus,
          }
        ]}
      />
    )
  }

  return (
    <DashboardPageHeader
   
      onBack={onBack}
      title={
        "Tableau de bord"
      }
      gradient={true}
    />
  )
}

export default OrderHeader
