"use client"

import { useState, useEffect } from "react"
import { TabContainer } from "./TabContainer"
import { TabButton } from "./TabButton"
import { IdentificationTab } from "./IdentificationTab"
import { OrdersTab } from "./OrdersTab"
import { ReviewsTab } from "./ReviewsTab"
import { useCustomerStore } from "@/store/customerStore"
import { getCustomerReviews, getCustomerOrders, PaginatedResponse } from "@/services/customerService"
import Image from "next/image"

const API_URL = process.env.NEXT_PUBLIC_API_URL
interface Client {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string;
  addresses?: any[];
  image?: string | null;
  created_at: string;
  updated_at: string;
  entity_status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'NEW';
  birth_day?: string | null;
  orderHistory?: Array<{
    id: string;
    date: string;
    total: number;
    paymentMethod: string;
    status: string;
  }>;
  [key: string]: any;
}

interface ClientProfileProps {
  clientId: string;
  onClose: () => void;
}

// Interfaces pour les données de reviews et orders
interface Review {
  id: string;
  userId: string;
  productId: string;
  rating: number;
  comment: string;
  date: string;
  [key: string]: any;
}

interface Order {
  id: string;
  total: string | number;
  date: string;
  status: string;
  paymentMethod: string;
  [key: string]: any;
}

export function ClientProfile({ clientId, onClose }: ClientProfileProps) {
  const [activeTab, setActiveTab] = useState("identification")
  const [isLoading, setIsLoading] = useState(true)
  const [clientReviews, setClientReviews] = useState<Review[]>([])
  const [clientOrders, setClientOrders] = useState<Order[]>([])
  
  const { getCustomerById } = useCustomerStore()

  // Charger les données du client au montage du composant
  useEffect(() => {
    const loadClientData = async () => {
      setIsLoading(true)
      try {
        // Récupérer le client depuis le store
        const customer = getCustomerById(clientId)
        if (!customer) {
          console.error("Client non trouvé dans le store")
          return
        }
        
        // Charger les avis du client
        try {
          const reviewsData = await getCustomerReviews(clientId) as PaginatedResponse<Review>;
          setClientReviews(reviewsData.data || [])
        } catch (error) {
          console.error("Erreur lors du chargement des avis:", error)
          setClientReviews([])
        }
        
        // Charger les commandes du client
        try {
          const ordersData = await getCustomerOrders(clientId) as PaginatedResponse<Order>;
          const processedOrders = (ordersData.data || []).map(order => ({
            ...order,
            paymentMethod: order.paymentMethod || 'cash'
          }));
          setClientOrders(processedOrders)
        } catch (error) {
          console.error("Erreur lors du chargement des commandes:", error)
          setClientOrders([])
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données client:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    loadClientData()
  }, [clientId, getCustomerById])

  if (isLoading) {
    return (
      <div className="bg-white p-4 sm:p-6 lg:px-8 xl:px-24 2xl:px-64 rounded-xl shadow-sm flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  const customer = getCustomerById(clientId)
  if (!customer) {
    return (
      <div className="bg-white p-4 sm:p-6 lg:px-8 xl:px-24 2xl:px-64 rounded-xl shadow-sm text-center py-8">
        <p className="text-gray-500">Ce client n'existe plus ou a été supprimé</p>
        <button 
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-[#F17922] text-white rounded-xl text-sm font-medium hover:bg-orange-600 transition-colors"
        >
          Retour à la liste
        </button>
      </div>
    )
  }

  // Formatage de la date d'inscription
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date inconnue"
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
  const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.email || ''

  // Préparer l'historique des commandes
  const orderHistory = clientOrders.map(order => ({
    id: order.id,
    date: order.created_at,
    total: typeof order.total === 'string' ? parseFloat(order.total) : order.total || 0,
    paymentMethod: order.paymentMethod,
    status: order.status
  }))

  // Adapter le client pour les composants enfants
  const adaptedClient = {
    ...customer,
    id: customer.id,
    first_name: customer.first_name,
    last_name: customer.last_name,
    email: customer.email,
    phone: customer.phone || '',
    image: customer.image,
    created_at: customer.created_at,
    updated_at: customer.updated_at,
    entity_status: customer.entity_status,
    birth_day: customer.birth_day,
    addresses: customer.addresses || [],
    orderHistory
  } satisfies Client;

  

  return (
    <div className="bg-white p-4 sm:p-6 lg:px-8 xl:px-24 2xl:px-64 rounded-xl shadow-sm">
      <div className="flex flex-col items-center">
        <div>
          <Image 
            src={customer.image ? `${API_URL}/${customer.image}` : '/default-avatar.png'} 
            alt="Client" 
            width={170} 
            height={170} 
            className="rounded-full object-cover"
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
            client={adaptedClient} 
            fullName={fullName} 
            formatDate={formatDate} 
          />
        )}

        {activeTab === "commandes" && (
          <OrdersTab 
            client={adaptedClient}
            formatDate={formatDate} 
          />
        )}

        {activeTab === "commentaires" && (
          <ReviewsTab 
            clientReviews={clientReviews} 
            client={{ 
              firstName: adaptedClient.first_name || '',
              ...adaptedClient as unknown as { [key: string]: unknown }
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
