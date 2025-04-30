"use client"

import React from 'react'
import DashboardPageHeader from '@/components/ui/DashboardPageHeader'
import { Plus } from 'lucide-react'

interface MenuHeaderProps {
  onAddPersonnel?: () => void
}

function PersonnelHeader({ onAddPersonnel }: MenuHeaderProps) {
  return (
    <DashboardPageHeader  
      mode="list"
      title="Personnel"
      searchConfig={{
        placeholder: "Rechercher",
        buttonText: "Chercher",
        onSearch: (value) => console.log('Searching:', value)
      }}
      actions={[
        {
          label: "Créer un membre",
          onClick: onAddPersonnel || (() => {}),
         
        }
      ]}
    />
  )
}

export default PersonnelHeader
