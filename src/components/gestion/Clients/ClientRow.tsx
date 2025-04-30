import Checkbox from '@/components/ui/Checkbox'
import { type Client } from './ClientsTable'
import { StatusBadge } from '@/components/gestion/Orders/StatusBadge'

interface ClientRowProps {
  client: Client
  isSelected: boolean
  onSelect: (clientId: string, checked: boolean) => void
  onClick: () => void
  onDoubleClick: () => void
  isHighlighted?: boolean 
}

export function ClientRow({
  client,
  isSelected,
  onSelect,
  onClick,
  onDoubleClick,
  isHighlighted = false
}: ClientRowProps) {
  const handleClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.checkbox-wrapper')) return
    console.log("Row clicked for client:", client.id);
    onClick();
  }

  const highlightClass = isHighlighted ? 'bg-[#FDE9DA]' : '';

  return (
    <>
      {/* Version mobile (card) */}
      <tr
        className={`md:hidden hover:bg-[#FDE9DA] cursor-pointer ${highlightClass}`}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
      >
        <td className="p-4" colSpan={6}>
          <div className="flex items-start space-x-3">
            <div className="pt-1 checkbox-wrapper">
              <Checkbox
                checked={isSelected}
                onChange={(checked) => onSelect(client.id, checked)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-medium text-gray-900">{client.firstName} {client.lastName}</div>
                  <div className="text-sm text-gray-500">{client.createdAt}</div>
                </div>
                <StatusBadge status={client.isConnected ? 'online' : 'offline'} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-500">Total des commandes:</span>
                  <span className="ml-1 font-medium">{client.totalOrders}</span>
                </div>
                <div>
                  <span className="text-gray-500">Dernières commandes:</span>
                  <span className="ml-1">{client.lastOrderDate}</span>
                </div>
              </div>
            </div>
          </div>
        </td>
      </tr>

      {/* Version desktop (tableau) */}
      <tr
        className={`hidden md:table-row hover:bg-[#FDE9DA] cursor-pointer ${highlightClass}`}
        onClick={handleClick}
        onDoubleClick={onDoubleClick}
      >
        <td className="w-8 whitespace-nowrap py-3 px-3 sm:px-4 checkbox-wrapper">
          <Checkbox
            checked={isSelected}
            onChange={(checked) => onSelect(client.id, checked)}
          />
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <span className="text-sm text-gray-900">{client.firstName} {client.lastName}</span>
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <span className="text-sm text-gray-500">{client.createdAt}</span>
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <StatusBadge status={client.isConnected ? 'online' : 'offline'} />
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <span className="text-sm text-gray-500">{client.totalOrders}</span>
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <span className="text-sm text-gray-500">{client.lastOrderDate}</span>
        </td>
      </tr>
    </>
  )
}