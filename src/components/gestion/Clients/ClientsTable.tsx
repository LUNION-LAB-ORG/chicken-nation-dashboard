import { useState, useMemo } from 'react'
import { ClientRow } from './ClientRow'
import { Pagination } from '@/components/ui/pagination'
import { TableHeader } from './TableHeader'
import { users } from '@/data/MockedData'
import { type User } from '@/types'
import React from 'react'

export interface Client extends User {
  totalOrders: number
  lastOrderDate: string
}

const generateClients = (): Client[] => {
  return users.slice(0, 24).map((user) => ({
    ...user,
    totalOrders: Math.floor(Math.random() * 50),
    lastOrderDate: new Date(Date.now() - Math.random() * 10 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }))
}

interface ClientsTableProps {
  selectedClientId?: string | null;
  onClientClick: (clientId: string) => void;
  onClientDoubleClick: (clientId: string) => void; 
  connectedOnly?: boolean;
}

export function ClientsTable({ 
  selectedClientId, 
  onClientClick,
  onClientDoubleClick,
  connectedOnly = false 
}: ClientsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  
  const clients = useMemo(() => generateClients(), [])

  // Filtrer les clients si nécessaire
  const filteredClients = useMemo(() => {
    if (connectedOnly) {
      return clients.filter(client => client.isConnected);
    }
    return clients;
  }, [clients, connectedOnly]);

  const itemsPerPage = 8
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentClients = filteredClients.slice(startIndex, endIndex)

  
  React.useEffect(() => {
    setCurrentPage(1);
  }, [connectedOnly]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(currentClients.map(client => client.id))
    } else {
      setSelectedClients([])
    }
  }

  const handleSelectClient = (clientId: string, checked: boolean) => {
    if (checked) {
      setSelectedClients(prev => [...prev, clientId])
    } else {
      setSelectedClients(prev => prev.filter(id => id !== clientId))
    }
  }

  const handleClientClick = (clientId: string) => {
    console.log("Clicked on client with ID:", clientId);
    
    if (clientId) {
      onClientClick(clientId);
    } else {
      console.error("Client ID is undefined or null");
    }
  };

  const handleClientDoubleClick = (clientId: string) => {
    console.log("Double-clicked on client with ID:", clientId);
    
    if (clientId) {
      onClientDoubleClick(clientId);
    } else {
      console.error("Client ID is undefined or null");
    }
  };

  return (
    <div className="min-w-full bg-white">
      <div className="overflow-hidden">
        <table className="min-w-full divide-y border-1 border-slate-200 rounded-xl divide-gray-200">
          <TableHeader 
            onSelectAll={handleSelectAll}
            isAllSelected={selectedClients.length === currentClients.length}
          />
          <tbody className="divide-y divide-gray-200">
            {currentClients.map((client) => (
              <ClientRow 
                key={client.id}
                client={client}
                isSelected={selectedClients.includes(client.id)}
                onSelect={(clientId, checked) => handleSelectClient(clientId, checked)}
                onClick={() => handleClientClick(client.id)}
                onDoubleClick={() => handleClientDoubleClick(client.id)}
                isHighlighted={selectedClientId === client.id}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center py-4 px-2 border-t border-gray-200">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}