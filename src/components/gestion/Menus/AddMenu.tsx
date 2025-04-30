import React from 'react'
import { MenuItem } from '@/types'
import MenuForm from '@/components/ui/MenuForm';  

interface AddMenuProps {
  onCancel?: () => void;
  onSave?: (newMenu: MenuItem) => void;
}

const AddMenu = ({ onCancel, onSave }: AddMenuProps) => {
  return (
    <MenuForm
      onCancel={onCancel}
      onSubmit={onSave || (() => {})}
      submitLabel="Ajouter"
    />
  )
}

export default AddMenu