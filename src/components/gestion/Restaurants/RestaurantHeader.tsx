"use client"

import React from 'react'
import DashboardPageHeader from '@/components/ui/DashboardPageHeader'
import { Plus } from 'lucide-react'

interface RestaurantHeaderProps {
  onAddRestaurant: () => void
}

export default function RestaurantHeader({ onAddRestaurant }: RestaurantHeaderProps) {
  return (
    <DashboardPageHeader  
      mode="list"
      title="Restaurants"
      searchConfig={{
        placeholder: "Rechercher",
        buttonText: "Chercher",
        onSearch: (value) => console.log('Searching:', value)
      }}
      actions={[
        {
          label: "Ajouter un restaurant",
          onClick: onAddRestaurant,
          icon: Plus,
          variant: 'primary'
        }
      ]}
    />
  )
}
