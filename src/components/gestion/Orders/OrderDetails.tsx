import React from 'react';
import { Order } from './OrdersTable'; 
import Image from 'next/image';

interface OrderDetailsProps {
  order: Order;
  onBack: () => void;
  onAccept?: (orderId: string) => void;
  onReject?: (orderId: string) => void;
}

const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack, onAccept, onReject }) => {
  //  articles fictifs pour la commande
  const orderItems = [
    {
      id: '1',
      name: 'LE PATRON', 
      price: 8000,
      quantity: 1,
      image: '/images/food2.png'
    },
    {
      id: '2',
      name: 'Aile de crispy',   
      price: 10000,
      quantity: 3,
      image: '/images/food2.png'
    },
    {
      id: '3',
      name: 'Aile de crispy', 
      price: 3000,
      quantity: 1,
      image: '/images/food2.png'
    }
  ];

  return (
    <div className="bg-white rounded-xl h-screen overflow-hidden shadow-sm">
      <div className="">
        <div className="flex flex-col md:flex-row gap-12">
       
          <div className="md:w-3/5 p-4 sm:p-6 h-screen">
            {/* En-tête avec informations générales */}
            <div className="mb-6">
              <div className="flex justify-between items-center">
                <h2 className="xl:text-lg text-sm font-medium text-[#F17922]">Information sur la commande #{order.id}</h2>
                <span className="px-3 lg:-mr-10 py-1.5 border-1 border-[#FBD2B5] font-bold text-[#FF3B30] text-[8px] lg:text-xs rounded-lg">
                  {order.status}
                </span>
              </div>

              {/* Informations commande */}
              <div className="mt-4 space-y-4">
                <div className="flex  gap-40 items-center">
                  <p className="lg:text-sm text-xs text-gray-500">Restaurant</p>
                  <p className="font-bold text-[#F17922] lg:text-sm text-xs">Chicken Nation Angré</p>
                </div>
                
                <div className="flex gap-26  items-center">
                  <p className="lg:text-sm text-xs font-medium text-[#71717A]">Type de commande</p>
                  <div className="inline-flex items-center  rounded-[10px] px-3 py-[4px] text-xs font-medium  bg-[#FBDBA7] text-[#71717A]">
                    À livrer
                    <Image className='ml-2' src="/icons/deliver.png" alt="truck" width={15} height={15} />
                  </div>
                </div>
                
                <div className="flex gap-22  items-center">
                  <p className="lg:text-sm text-xs font-medium text-[#71717A]">Date de la commande</p>
                  <p className="font-bold text-xs lg:text-sm text-[#71717A]">12 Fev 2025</p>
                </div>
                
                <div className="flex gap-32  items-center">
                  <p className="lg:text-sm text-xs font-medium text-[#71717A]">Mode paiement</p>
                  <div className="flex items-center">
                    <p className="font-bold text-xs lg:text-sm text-[#71717A]">Carte de crédit</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Détails de la commande */}
            <div>
              <h3 className="text-lg font-medium mb-4 text-[#F17922]">Commande</h3>
              <div className='flex flex-row items-center justify-between mb-6'>
                <span className='text-xs font-medium text-[#71717A]'>
                  Coût de la commande
                </span>
                <span className='text-sm font-bold text-[#F17922]'>
                  27.000F
                </span>
              </div>
              {/* Articles de la commande avec prix */}
              {orderItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-16 h-12 my-2 rounded-lg mr-3 relative overflow-hidden">
                      <Image 
                        src={item.image} 
                        alt={item.name}
                        width={80}
                        height={64}
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{item.name}</p>
                      <p className="text-xs text-gray-500">Quantité: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="text-sm font-bold text-[#71717A]">{item.price.toLocaleString()}F</p>
                </div>
              ))}
            </div>
          </div>
          
          {/* Partie droite (1/3) */}
          <div className="md:w-3/6 p-4 sm:p-6 bg-[#FBFBFB] h-screen">
            {/* Informations client */}
            <div className="mb-8">
              <p className="text-[18px] font-medium text-[#F17922] mb-4">Client</p>
              <div className='flex flex-row items-center justify-between mb-4'>
                <p className="text-sm text-[#71717A]">Client</p>
                <p className="text-sm text-[#71717A] font-bold">Client 1</p>
              </div>
            
              {/* Adresse */}
              <div className="flex flex-row justify-between items-start">
                <p className="text-sm text-[#71717A]">Adresse</p>
                <p className="text-sm text-[#71717A] font-bold text-right">Rue du 7 décembre - Zone 4,<br />Abidjan, Côte d'Ivoire</p>
              </div>
            </div>
            
            {/* Section livraison */}
            <div className="mb-8">
              <p className="text-[18px] font-medium text-[#F17922] mb-4">Livraison</p>
              <div className="bg-white p-5 px-2 border-[#F17922] border-1 rounded-xl">
                <div className="flex justify-between items-center ">
                  <div className="w-10 h-10 rounded-[12px] border-1 border-[#F17922] flex items-center justify-center text-white">
                    <Image src="/icons/poulet.png" alt="restaurant" width={24} height={24} />
                  </div>
                  <div className="flex-1   h-1 bg-[#F17922]"></div>
                  <div className="w-10 h-10 rounded-[12px] bg-[#F17922] flex items-center justify-center text-white">
                    <Image src="/icons/package.png" alt="box" width={24} height={24} />
                  </div>
                  <div className="flex-1 h-1 bg-[#FFE8D7]"></div>
                  <div className="w-10 h-10 rounded-[12px] bg-white border-[1.5px] border-[#F17922] flex items-center justify-center text-[#FFE8D7]">
                    <Image src="/icons/location-outline.png" alt="pin" width={24} height={24} />
                  </div>
                </div>
              
              </div>
              <p className="text-xs text-center mt-4 text-[#71717A]">Processus de livraison proposé par <span className="text-[#71717A] font-bold">Turbo Delivery</span></p>
              <button className="w-full mt-4 py-3 px-4 bg-[#F17922] hover:bg-[#F17972] cursor-pointer rounded-xl flex items-center justify-center text-sm font-medium text-white">
                <Image src="/icons/external-link.png" alt="eye" width={20} height={20} className="mr-2" />
                <span>Voir le suivi de livraison</span>
              </button>
            </div>
            
            {/* Informations de prix */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#71717A]">Prix net</span>
                <span className="text-sm font-bold text-[#71717A]">27.000F</span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-[#71717A]">Taxe</span>
                <span className="text-sm font-bold text-[#71717A]">--</span>
              </div>
              
              <div className="flex justify-between items-center mb-6">
                <span className="text-sm text-[#71717A]">Réduction</span>
                <span className="text-sm font-bold text-[#71717A]">--</span>
              </div>
              
              {/* Total de la commande */}
              <div className="flex justify-between items-center">
                <span className="text-[18px] font-medium text-[#F17922]">Prix Total</span>
                <div className="bg-[#F17922] text-white px-6 py-2 rounded-xl font-bold">
                  27.000F
                </div>
              </div>

              {/* Boutons d'action pour les nouvelles commandes */}
              {order.status === 'NOUVELLE' && (
                <div className="mt-6 flex justify-between gap-4">
                  <button 
                    onClick={() => onReject && onReject(order.id)}
                    className="w-full py-3 px-4 bg-white border border-[#FF3B30] hover:bg-gray-50 text-[#FF3B30] rounded-xl font-medium"
                  >
                    Refuser
                  </button>
                  <button 
                    onClick={() => onAccept && onAccept(order.id)}
                    className="w-full py-3 px-4 bg-[#F17922] hover:bg-[#F17972] text-white rounded-xl font-medium"
                  >
                    Accepter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
