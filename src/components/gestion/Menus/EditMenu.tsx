import React from 'react'
import { MenuItem } from '@/types'
import MenuForm from '@/components/ui/MenuForm';  

interface EditMenuProps {
  menu: MenuItem;
  onCancel?: () => void;
  onSave?: (updatedMenu: MenuItem) => void;
}

const EditMenu = ({ menu, onCancel, onSave }: EditMenuProps) => {
  return (
    <MenuForm
      initialData={menu}
      onCancel={onCancel}
      onSubmit={onSave || (() => {})}
      submitLabel="Modifier"
    />
  )
}

export default EditMenu