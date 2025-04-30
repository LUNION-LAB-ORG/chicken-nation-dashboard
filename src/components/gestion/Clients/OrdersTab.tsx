interface Client {
  orderHistory: Array<{
    id: string;
    date: string;
    total: number;
    paymentMethod: string;
    status: string;
  }>;
}

interface OrdersTabProps {
  client: Client;
  formatDate: (date: string) => string;
}

export function OrdersTab({ client, formatDate }: OrdersTabProps) {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4 px-4 sm:px-0">
        <h3 className="text-sm font-medium text-gray-700">
          Total des commandes : <span className="text-orange-500">{client.orderHistory.length}</span>
        </h3>
      </div>
      
      {/* Vue bureau - Tableau (caché sur mobile) */}
      <div className="hidden sm:block overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-100 rounded-xl">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paiement</th>
                <th className="px-3 py-3 sm:px-6 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(client?.orderHistory) && client.orderHistory.length > 0 ? (
                client.orderHistory.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-xs sm:text-sm text-gray-500">{formatDate(order.date)}</td>
                    <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-xs sm:text-sm text-gray-500">{order.total} XOF</td>
                    <td className="px-3 py-4 sm:px-6 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {order.paymentMethod === 'card' ? 'Carte' : 
                       order.paymentMethod === 'mobile_money' ? 'Mobile Money' : 
                       order.paymentMethod === 'cash' ? 'Espèces' : order.paymentMethod}
                    </td>
                    <td className="px-3 py-4 sm:px-6 whitespace-nowrap">
                      <span className={`px-2 sm:px-3 py-1 sm:py-1.5 inline-flex text-xs leading-5 font-semibold rounded-xl ${
                        order.status === 'delivered' ? 'bg-[#4FCBBA] text-white' :
                        order.status === 'pending' ? 'bg-[#FBD2B5] text-slate-600' :
                        order.status === 'cancelled' ? 'bg-black text-[#FDE9DA]' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status === 'delivered' ? 'En cours' :
                         order.status === 'pending' ? 'Confirmé' :
                         order.status === 'cancelled' ? 'Annulé' :
                         order.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-3 py-4 sm:px-6 whitespace-nowrap text-sm text-gray-500 text-center">
                    Aucune commande trouvée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Vue mobile - Cards (visible uniquement sur mobile) */}
      <div className="sm:hidden">
        {Array.isArray(client?.orderHistory) && client.orderHistory.length > 0 ? (
          <div className="space-y-4">
            {client.orderHistory.map((order) => (
              <div key={order.id} className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
                <div className="flex justify-between items-start mb-3">
                  <p className="text-sm font-semibold text-gray-900">#{order.id}</p>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    order.status === 'delivered' ? 'bg-[#4FCBBA] text-white' :
                    order.status === 'pending' ? 'bg-[#FBD2B5] text-slate-600' :
                    order.status === 'cancelled' ? 'bg-black text-[#FDE9DA]' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {order.status === 'delivered' ? 'En cours' :
                     order.status === 'pending' ? 'Confirmé' :
                     order.status === 'cancelled' ? 'Annulé' :
                     order.status}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-500 mb-1">Date</p>
                    <p className="font-medium">{formatDate(order.date)}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Montant</p>
                    <p className="font-medium">{order.total} XOF</p>
                  </div>
                  <div>
                    <p className="text-gray-500 mb-1">Paiement</p>
                    <p className="font-medium">
                      {order.paymentMethod === 'card' ? 'Carte' : 
                       order.paymentMethod === 'mobile_money' ? 'Mobile Money' : 
                       order.paymentMethod === 'cash' ? 'Espèces' : order.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 text-center bg-gray-50 p-4 rounded-xl">
            Aucune commande trouvée
          </div>
        )}
      </div>
    </div>
  )
}
