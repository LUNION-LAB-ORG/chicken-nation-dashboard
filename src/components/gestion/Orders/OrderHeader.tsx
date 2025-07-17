"use client"

import React from 'react'
import DashboardPageHeader from '@/components/ui/DashboardPageHeader'
import ExportDropdown from '@/components/ui/ExportDropdown'
import { useOrdersQuery } from '@/hooks/useOrdersQuery'

interface OrderHeaderProps {
  currentView: 'list' | 'create' | 'edit' | 'view'
  onBack?: () => void
  onCreateMenu: () => void
  onSearch?: (searchQuery: string) => void
  // ✅ Paramètres nécessaires pour useOrdersQuery
  activeFilter?: string
  selectedRestaurant?: string
  searchQuery?: string
  selectedDate?: Date | null
}

function OrderHeader({ 
  currentView = 'list', 
  onBack, 
  onSearch, 
  activeFilter = 'all',
  selectedRestaurant,
  searchQuery = '',
  selectedDate = null
}: OrderHeaderProps) {

  const { orders: realOrders } = useOrdersQuery({
    activeFilter,
    selectedRestaurant,
    searchQuery,
    selectedDate
  });

  const handleSearch = (query: string) => {
    onSearch?.(query);
  }

  if (currentView === 'list') {
    return (
      <DashboardPageHeader
        mode="list"
        title="Commandes"
        searchConfig={{
          placeholder: "Rechercher par référence...",
          buttonText: "Chercher",
          onSearch: handleSearch,
          realTimeSearch: true
        }}
        actions={[
          {
            label: "Exporter",
            onClick: () => {}, // Sera remplacé par le dropdown
            customComponent: (
              <ExportDropdown
                orders={realOrders}
                buttonText="Exporter"
              />
            )
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
                onClick: () => {}, // Sera remplacé par le dropdown
                customComponent: (
                  <ExportDropdown
                    orders={realOrders}
                    buttonText="Exporter"
                  />
                )
              }
            ]
          : undefined
      }
    />
  )
}

export default OrderHeader
