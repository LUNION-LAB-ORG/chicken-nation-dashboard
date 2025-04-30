"use client"

import { useState } from "react"
import { users, reviews } from "@/data/MockedData"
import Image from "next/image"  
import { TabButton } from "./TabButton"
import { IdentificationTab } from "./IdentificationTab"
import { OrdersTab } from "./OrdersTab"
import { ReviewsTab } from "./ReviewsTab"

interface ClientProfileProps {
  clientId: string
  onClose: () => void
}

export function ClientProfile({ clientId }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState("identification")
  const client = users.find((user) => user.id === clientId)

  if (!client) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Client non trouvé</p>
      </div>
    )
  }

  // Formatage de la date d'inscription
  const formatDate = (dateString: string) => {
    
    if (dateString.includes(",")) return dateString
    
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).replace(':', 'h')
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
      return dateString
    }
  }

  // Construction du nom complet
  const fullName = `${client.firstName} ${client.lastName}`

  // Filtrer les commentaires de l'utilisateur
  const clientReviews = reviews.filter(review => review.userId === clientId)

  return (
    <div className="bg-white p-4 sm:p-6 lg:px-8 xl:px-24 2xl:px-64 rounded-xl shadow-sm">
      <div className="flex flex-col items-center">
        <div>
          <Image 
            src={client.profilePicture || "/images/default-avatar.png"} 
            alt="Client" 
            width={170} 
            height={170} 
            className="rounded-full w-32 h-32 sm:w-40 sm:h-40 lg:w-[170px] lg:h-[170px] object-cover"
          />
        </div>
        <h2 className="text-base sm:text-lg mt-4 font-medium font-sofia-pro text-gray-900">{fullName}</h2>
      </div>

      <div className="mt-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row justify-center items-center sm:space-x-8 space-y-2 sm:space-y-0">
          <TabButton 
            label="Identification" 
            isActive={activeTab === "identification"} 
            onClick={() => setActiveTab("identification")} 
          />
          <TabButton 
            label="Commandes" 
            isActive={activeTab === "commandes"} 
            onClick={() => setActiveTab("commandes")} 
          />
          <TabButton 
            label="Commentaires" 
            isActive={activeTab === "commentaires"} 
            onClick={() => setActiveTab("commentaires")} 
          />
        </div>
      </div>

      <div className="mt-6 w-full max-w-[1400px] mx-auto">
        {activeTab === "identification" && (
          <IdentificationTab 
            client={client} 
            fullName={fullName} 
            formatDate={formatDate} 
          />
        )}

        {activeTab === "commandes" && (
          <OrdersTab 
            client={{
              ...client,
              orderHistory: client.orderHistory.map(order => ({
                ...order,
                total: typeof order.total === 'string' ? parseFloat(order.total) : order.total
              }))
            }} 
            formatDate={formatDate} 
          />
        )}

        {activeTab === "commentaires" && (
          <ReviewsTab 
            clientReviews={clientReviews} 
            client={{ 
              firstName: client.firstName,
              ...client as unknown as { [key: string]: unknown }
            }} 
            fullName={fullName} 
            formatDate={formatDate} 
          />
        )}
        
        <div className="flex items-center justify-center gap-4 mt-8">
          <button className=" cursor-pointer px-6 sm:px-10 font-sofia-medium py-1.5 bg-[#ECECEC] rounded-xl text-[#9796A1] text-xs font-medium hover:bg-gray-50 transition-colors">
            {activeTab === "identification" ? "Supprimer" : "Tout supprimer"}
          </button>
          {activeTab === "identification" && (
            <button className="px-4 cursor-pointer sm:px-6 py-1.5 bg-[#F17922] text-white rounded-xl text-xs font-medium hover:bg-orange-600 transition-colors">
              Modifier les infos
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

