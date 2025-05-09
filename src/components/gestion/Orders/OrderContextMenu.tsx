import React from 'react';
import { X } from 'lucide-react';
import { Order } from './OrdersTable';
import Image from 'next/image';

interface OrderContextMenuProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onAccept: (orderId: string) => void;
  onReject: (orderId: string) => void;
  onViewDetails: (orderId: string) => void;
  onHideFromList: (orderId: string) => void;
  onRemoveFromList: (orderId: string) => void;
}

const OrderContextMenu: React.FC<OrderContextMenuProps> = ({
  order,
  isOpen,
  onClose,
  onAccept,
  onReject,
  onViewDetails,
  onHideFromList,
  onRemoveFromList
}) => {
  if (!isOpen) return null;

 
  const isAccepted = order.status !== 'NOUVELLE';
  const handleAccept = () => {
    onAccept(order.id);
    onClose();
  };

  const handleReject = () => {
    onReject(order.id);
    onClose();
  };

  const handleViewDetails = () => {
    onViewDetails(order.id);
    onClose();
  };

  const handleHideFromList = () => {
    onHideFromList(order.id);
    onClose();
  };

  const handleRemoveFromList = () => {
    onRemoveFromList(order.id);
    onClose();
  };

 
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Vérifier si le clic est en dehors du menu et du bouton qui l'ouvre
      if (isOpen && !(event.target as Element).closest('.order-context-menu') && 
          !(event.target as Element).closest('.menu-button')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <div 
      className="order-context-menu w-56 bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
    >
      {!isAccepted ? (
        <div className="py-1">
          <button
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-[#F17922] hover:bg-gray-50 cursor-pointer"
            onClick={handleAccept}
          >
             <Image src="/icons/check.png" alt="Accepter" width={20} height={20} />
            <span>Accepter la commande</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm flex items-center gap-2 text-red-600 hover:bg-gray-50 cursor-pointer"
            onClick={handleReject}
          >
            <X size={16} />
            <span>Refuser</span>
          </button>
        </div>
      ) : (
        <div className="py-1">
          <button
            className="w-full px-4 py-2 text-left text-sm flex items-center font-bold gap-2 text-[#888891] hover:bg-orange-50 cursor-pointer"
            onClick={handleViewDetails}
          >
            <span>Voir les détails</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm flex items-center font-bold gap-2 text-[#888891] hover:bg-orange-50 cursor-pointer"
            onClick={handleHideFromList}
          >
            <span>Masquer de la liste</span>
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm flex items-center font-bold gap-2 text-[#888891] hover:bg-orange-50 cursor-pointer"
            onClick={handleRemoveFromList}
          >
            <span>Retirer de la liste</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderContextMenu;
