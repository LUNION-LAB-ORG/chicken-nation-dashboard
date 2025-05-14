import Checkbox from '@/components/ui/Checkbox'

interface TableHeaderProps {
  onSelectAll: (checked: boolean) => void
  isAllSelected: boolean
}

export function TableHeader({ onSelectAll, isAllSelected }: TableHeaderProps) {
  return (
    <>
      {/* En-tête mobile */}
      <thead className="md:hidden bg-gray-100">
        <tr>
          <th className="py-3 px-4" colSpan={7}>
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={isAllSelected}
                onChange={onSelectAll}
              />
              <span className="whitespace-nowrap text-sm font-normal text-gray-600">Tout sélectionner</span>
            </div>
          </th>
        </tr>
      </thead>

      {/* En-tête desktop */}
      <thead className="hidden md:table-header-group bg-gray-100">
        <tr>
          <th className="w-8 whitespace-nowrap py-2 px-3 text-left text-sm font-normal text-gray-600 sm:px-4">
            <Checkbox
              checked={isAllSelected}
              onChange={onSelectAll}
            />
          </th>
          <th className="whitespace-nowrap py-3 px-3 text-left text-sm font-normal text-gray-600 sm:px-4">Référence</th>
          <th className="whitespace-nowrap py-3 px-3 text-left text-sm font-normal text-gray-600 sm:px-4">Date</th>
          <th className="whitespace-nowrap py-3 px-3 text-left text-sm font-normal text-gray-600 sm:px-4">Clients</th>
          <th className="whitespace-nowrap py-3 px-3 text-left text-sm font-normal text-gray-600 sm:px-4">Type de commande</th>
          <th className="whitespace-nowrap py-3 px-3 text-left text-sm font-normal text-gray-600 sm:px-4">Adresse</th>
          <th className="whitespace-nowrap py-3 px-3 text-left text-sm font-normal text-gray-600 sm:px-4">Coût</th>
          <th className="whitespace-nowrap py-3 px-3 text-left text-sm font-normal text-gray-600 sm:px-4">Statut</th>
          <th className="whitespace-nowrap py-3 px-3 text-center text-sm font-normal text-gray-600 sm:px-4">Options</th>
        </tr>
      </thead>
    </>
  )
}
