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
 
    onClick();
  }

  // Formater la date de création pour l'affichage
  const formatDate = (dateString: string) => {
   
    if (!dateString) {
    
      return 'Aucune date';
    }
    
    try {
      const date = new Date(dateString);
    
      // Vérifier si la date est valide
      if (date instanceof Date && !isNaN(date.getTime())) {
        const formatted = date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
 
        return formatted;
      }
      
      return 'Date invalide';
    } catch (error) {
     
      return 'Date invalide';
    }
  };

  // Formater la date de dernière commande pour l'affichage
  const formatLastOrderDate = (dateString?: string) => {
     
    if (!dateString) {
      
      return 'Aucune commande';
    }
    
    try {
      const date = new Date(dateString);
     
      // Vérifier si la date est valide
      if (date instanceof Date && !isNaN(date.getTime())) {
        const formatted = date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
         
        return formatted;
      }
      
      return 'Date invalide';
    } catch (error) {
      console.error('Erreur de formatage de date de dernière commande:', error);
      return 'Date invalide';
    }
  };

  const highlightClass = isHighlighted ? 'bg-[#FDE9DA]' : '';
  const formattedCreationDate = formatDate(client.created_at || '');
  const formattedLastOrderDate = formatLastOrderDate(client.lastOrderDate);
  const fullName = `${client.first_name || ''} ${client.last_name || ''}`.trim();

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
                  <div className="font-medium text-gray-900">{fullName || client.email}</div>
                  <div className="text-sm text-gray-500">{formattedCreationDate}</div>
                </div>
                <StatusBadge status={client.isConnected ? 'online' : 'offline'} />
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-500">Total des commandes:</span>
                  <span className="ml-1 font-medium">{client.totalOrders || 0}</span>
                </div>
                <div>
                  <span className="text-gray-500">Dernières commandes:</span>
                  <span className="ml-1">{formattedLastOrderDate}</span>
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
          <span className="text-sm text-gray-900">{fullName || client.email}</span>
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <span className="text-sm text-gray-500">{formattedCreationDate}</span>
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <StatusBadge status={client.isConnected ? 'online' : 'offline'} />
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <span className="text-sm text-gray-500">{client.totalOrders || 0}</span>
        </td>
        <td className="whitespace-nowrap py-3 px-3 sm:px-4">
          <span className="text-sm text-gray-500">{formattedLastOrderDate}</span>
        </td>
      </tr>
    </>
  )
}