import { useState, useMemo, useEffect } from 'react'
import { ClientRow } from './ClientRow'
import { Pagination } from '@/components/ui/pagination'
import { TableHeader } from './TableHeader'
import React from 'react'
import { useCustomerStore } from '@/store/customerStore'
import { Customer } from '@/services/customerService'

// Adapter l'interface Client pour qu'elle soit compatible avec les données de l'API
export type Client = Customer;

interface ClientsTableProps {
  selectedClientId?: string | null;
  onClientClick: (clientId: string) => void;
  onClientDoubleClick: (clientId: string) => void; 
  connectedOnly?: boolean;
  isLoading?: boolean;
}

export function ClientsTable({ 
  selectedClientId, 
  onClientClick,
  onClientDoubleClick,
  connectedOnly = false,
  isLoading = false
}: ClientsTableProps) {
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  
  // Utiliser le store client
  const { 
    customers, 
    fetchCustomers, 
    pagination, 
    setCurrentPage 
  } = useCustomerStore();

  // Charger les clients lorsque le filtre change
  useEffect(() => {
    fetchCustomers();
  }, [connectedOnly, fetchCustomers]);
  
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedClients(customers.map(client => client.id))
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
  
    
    if (clientId) {
      onClientClick(clientId);
    } else {
      console.error("Client ID is undefined or null");
    }
   
  };

  const handleClientDoubleClick = (clientId: string) => {
  
    
    if (clientId) {
      onClientDoubleClick(clientId);
    } else {
      console.error("Client ID is undefined or null");
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="min-w-full bg-white">
      <div className="overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <table className="min-w-full divide-y border-1 border-slate-200 rounded-xl divide-gray-200">
            <TableHeader 
              onSelectAll={handleSelectAll}
              isAllSelected={selectedClients.length === customers.length && customers.length > 0}
            />
            <tbody className="divide-y divide-gray-200">
              {customers.map((client) => (
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
              {customers.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun client trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex justify-center py-4 px-2 border-t border-gray-200">
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  )
}