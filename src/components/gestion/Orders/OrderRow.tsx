import Checkbox from '@/components/ui/Checkbox'
import { type Order } from './OrdersTable'
import { Menu } from 'lucide-react'
import { useState } from 'react'
import OrderContextMenu from './OrderContextMenu'
import Image from 'next/image';

interface OrderRowProps {
  order: Order
  isSelected: boolean
  onSelect: (orderId: string, checked: boolean) => void
  onAccept: (orderId: string) => void
  onReject: (orderId: string) => void
  onViewDetails: (orderId: string) => void
  onHideFromList: (orderId: string) => void
  onRemoveFromList: (orderId: string) => void
  isMobile?: boolean
}

const OrderTypeBadge = ({ type }: { type: Order['orderType'] }) => {
  const styles = {
    'À livrer': 'bg-[#FBDBA7] text-[#71717A]',
    'À table': 'bg-[#CCE3FD] text-[#71717A]',
    'À récupérer': 'bg-[#C9A9E9] text-white'
  };

  const getIcon = () => {
    if (type === 'À livrer') return '/icons/deliver.png';
    if (type === 'À table') return '/icons/store.png';
    return '/icons/resto.png';
  };

  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${styles[type]}`}>
      {type} <Image src={getIcon()} alt={type} width={15} height={15} className="ml-1" />
    </span>
  );
};

const StatusBadge = ({ status }: { status: Order['status'] }) => {
  const styles = {
    'NOUVELLE': 'text-[#007AFF]',
    'EN COURS': 'text-[#F5A524]',
    'EN PRÉPARATION': 'text-[#F5A524]',
    'LIVRÉ': 'text-[#17C964]',
    'COLLECTÉ': 'text-[#17C964]',
    'ANNULÉE': 'text-[#090909]',
    'LIVRAISON': 'text-red-600',
    'PRÊT':  'text-[#17C964]'
  };

  return (
    <span className={`font-medium text-sm ${styles[status] || 'text-gray-500'}`}>
      {status}
    </span>
  );
};

export function OrderRow({ order, isSelected, onSelect, onAccept, onReject, onViewDetails, onHideFromList, onRemoveFromList, isMobile = false }: OrderRowProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (isMobile) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-4 mb-3 border border-gray-100">
        <div className="flex items-start gap-3">
          <div className="pt-1">
            <Checkbox
              checked={isSelected}
              onChange={(checked) => onSelect(order.id, checked)}
            />
          </div>
          <div className="flex-1">
            <div className="flex justify-between items-start mb-3">
              <div>
                <div className="font-medium text-[#71717A]">{order.id}</div>
                <div className="text-xs text-gray-500">{order.date}</div>
              </div>
              <OrderTypeBadge type={order.orderType} />
            </div>
            <div className="mb-3">
              <div className="font-medium text-[#71717A]">{order.clientName}</div>
              <div className="text-xs text-gray-500 truncate max-w-[200px]">{order.address}</div>
            </div>
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm font-bold text-[#F17922]">{(order.totalPrice || 0).toLocaleString()} F</div>
              <StatusBadge status={order.status} />
            </div>
            <div className="flex justify-end mt-2">
              <div className="relative">
                <button 
                  className="p-1.5 text-gray-500 hover:text-[#F17922] rounded-lg hover:bg-orange-100"
                  onClick={() => setMenuOpen(!menuOpen)}
                >
                  <Menu size={20} />
                </button>
                {menuOpen && (
                  <OrderContextMenu
                    order={order}
                    isOpen={menuOpen}
                    onClose={() => setMenuOpen(false)}
                    onAccept={onAccept}
                    onReject={onReject}
                    onViewDetails={onViewDetails}
                    onHideFromList={onHideFromList}
                    onRemoveFromList={onRemoveFromList}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <tr className="hover:bg-[#FDEDD3]">
      <td className="w-8 whitespace-nowrap py-3 px-3 sm:px-4">
        <Checkbox
          checked={isSelected}
          onChange={(checked) => onSelect(order.id, checked)}
        />
      </td>
      <td className="whitespace-nowrap py-3 px-3 sm:px-4">
        <span className="text-sm font-medium text-[#71717A]">{order.id}</span>
      </td>
      <td className="whitespace-nowrap py-3 px-3 sm:px-4">
        <span className="text-sm text-gray-500">{order.date}</span>
      </td>
      <td className="whitespace-nowrap py-3 px-3 sm:px-4">
        <span className="text-sm font-medium text-[#71717A]">{order.clientName}</span>
      </td>
      <td className="whitespace-nowrap py-3 px-3 sm:px-4">
        <OrderTypeBadge type={order.orderType} />
      </td>
      <td className="whitespace-nowrap py-3 px-3 sm:px-4">
        <span className="text-sm text-gray-500 max-w-[150px] truncate inline-block">{order.address}</span>
      </td>
      <td className="whitespace-nowrap py-3 px-3 sm:px-4">
        <span className="text-sm font-medium">{(order.totalPrice || 0).toLocaleString()} F</span>
      </td>
      <td className="whitespace-nowrap py-3 px-3 sm:px-4">
        <StatusBadge status={order.status} />
      </td>
      <td className="whitespace-nowrap py-3 px-3 sm:px-4 text-center relative">
        <button 
          className="p-1 text-[#71717A] cursor-pointer hover:text-gray-700 rounded-lg hover:bg-orange-200"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <Menu size={20} />
        </button>
        {menuOpen && (
          <OrderContextMenu
            order={order}
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onAccept={onAccept}
            onReject={onReject}
            onViewDetails={onViewDetails}
            onHideFromList={onHideFromList}
            onRemoveFromList={onRemoveFromList}
          />
        )}
      </td>
    </tr>
  );
}