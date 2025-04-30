"use client"

import React, { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import { ChevronDown } from 'lucide-react'
import Checkbox from '@/components/ui/Checkbox'
import Toggle from '@/components/ui/Toggle' 
import SupplementActionsMenu from './SupplementActionsMenu'
import { createPortal } from 'react-dom'

type ProductCategory = 'all' | 'FOOD' | 'DRINK' | 'ACCESSORY'
const API_URL = process.env.NEXT_PUBLIC_API_URL;
interface ProductsViewProps {
  selectedTab: ProductCategory
  onEdit: (product: any) => void
  onCreateProduct: () => void
  products: any[]
  onUpdateAvailability?: (productId: string, available: boolean) => void
  onDeleteProduct?: (productId: string) => void
  onDelete?: (product: any) => void 
}

export default function SupplementView({ 
  selectedTab, 
  onEdit, 
  onCreateProduct, 
  products = [],
  onUpdateAvailability,
  onDeleteProduct,
  onDelete
}: ProductsViewProps) {
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null)
 
  const [menuOpenId, setMenuOpenId] = useState<string|null>(null)
  const [menuPosition, setMenuPosition] = useState<{top: number, left: number}|null>(null)
  const menuRef = useRef<HTMLDivElement|null>(null)
  const safeProducts = Array.isArray(products) ? products : []
  const filteredProducts = safeProducts
  const translateCategory = (category: string): string => {
    switch (category) {
      case 'FOOD':
        return 'Accompagnements';
      case 'DRINK':
        return 'Boissons';
      case 'ACCESSORY':
        return 'Ingrédient';
      default:
        return category;
    }
  };

  const handleMenuOpen = (productId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (menuOpenId === productId) {
      
      setMenuOpenId(null);
      setMenuPosition(null);
    } else {
      
      setMenuPosition({ 
        top: event.clientY, 
        left: event.clientX 
      });
      setMenuOpenId(productId);
    }
  }

 
  useEffect(() => {
    if (!menuOpenId) return 
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && menuRef.current.contains(e.target as Node)) return;
      setMenuOpenId(null); setMenuPosition(null)
    } 
    const handleClose = () => { setMenuOpenId(null); setMenuPosition(null) }
    window.addEventListener('scroll', handleClose, true)
    window.addEventListener('resize', handleClose)
    window.addEventListener('click', handleClick)
    return () => {
      window.removeEventListener('scroll', handleClose, true)
      window.removeEventListener('resize', handleClose)
      window.removeEventListener('click', handleClick)
    }
  }, [menuOpenId])

  return (
    <div className="flex flex-col lg:flex-row gap-6 rounded-2xl">
      <div className="flex-1 hidden md:block">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="w-10 pl-6"></th>
              <th className="w-16"></th>
              <th className="text-left py-4 text-[14px] text-[#71717A] font-bold w-[250px]">
                <div className="flex items-center">
                  Produits
                  <ChevronDown className="ml-2 w-4 h-4" />
                </div>
              </th>
              <th className="text-left py-4 text-[14px] text-[#71717A] font-bold w-[200px]">
                <div className="flex items-center">
                  Catégorie
                  <ChevronDown className="ml-2 w-4 h-4" />
                </div>
              </th>
              <th className="text-right py-4 text-[14px] text-[#71717A] font-bold w-[250px]">
                <div className="flex items-center justify-end">
                  Prix XOF
                  <ChevronDown className="ml-2 w-4 h-4" />
                </div>
              </th>
              <th className="text-center py-4 text-[14px] text-[#71717A] font-bold w-[300px]">
                <div className="flex items-center justify-center">
                  Disponible
                  <ChevronDown className="ml-2 w-4 h-4" />
                </div>
              </th>
              <th className="w-6"></th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map((product) => (
              <tr 
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className={`border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                  selectedProduct?.id === product.id ? 'bg-gray-50' : ''
                }`}
              >
                <td className="py-4 pl-6">
                  <Checkbox 
                    checked={false}
                    onChange={() => {}}
                  />
                </td>
                <td className="py-4 pl-10">
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 mr-20">
                    <Image
                      src={product.image ? 
                        (product.image.startsWith('http') || product.image.startsWith('/') 
                          ? product.image 
                          : `${API_URL}/${product.image}`)
                        : '/images/plat.png'}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="w-full h-full object-cover "
                    />
                  </div>
                </td>
                <td className="py-4 text-[13px] text-gray-900  ">{product.name}</td>
                <td className="py-4 text-[13px] text-gray-900">{translateCategory(product.category) || 'Non catégorisé'}</td>
                <td className="py-4 text-[13px] text-gray-900 text-right pr-8">{product.price} XOF</td>
                <td className="py-4 px-4">
                  <div className="flex items-center justify-center">
                    <Toggle 
                      checked={product.available || false}
                      onChange={(checked) => {
                        if (onUpdateAvailability) {
                          onUpdateAvailability(product.id, checked);
                        }
                      }}
                    />
                  </div>
                </td>
                <td>
                  <button 
                    onClick={(e) => handleMenuOpen(product.id, e)}
                    className="px-2 py-2 text-[14px] cursor-pointer hover:bg-gray-100 rounded-full transition-colors"
                  >
                    •••
                  </button>
                  {menuOpenId === product.id && menuPosition && createPortal(
                    <SupplementActionsMenu 
                      menuPosition={menuPosition}
                      menuRef={menuRef}
                      productId={product.id}
                      onEdit={() => {
                        setMenuOpenId(null);
                        onEdit(product);
                      }}
                      onDelete={() => {
                        setMenuOpenId(null);
                        if (onDeleteProduct) {
                          onDeleteProduct(product.id);
                        } else if (onDelete) {
                          onDelete(product);
                        }
                      }}
                    />,
                    document.body
                  )}
                </td>
              </tr>
            ))}
            {safeProducts.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center">
                  <div className='flex items-center justify-center flex-col gap-4'>
                    <span className='text-[14px] text-[#F17922]'>
                      Aucun supplément trouvé
                    </span>
                    <button 
                      onClick={onCreateProduct}
                      className="px-4 py-2 text-[14px] cursor-pointer bg-[#F17922] text-white font-medium rounded-xl 
                      hover:bg-[#F17922]/90 transition-colors"
                    >
                      Ajouter un supplément
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="flex flex-col gap-4 md:hidden">
        {filteredProducts.map((product) => (
          <div 
            key={product.id} 
            className="bg-white rounded-xl shadow-sm border border-[#ECECEC] p-4 flex items-center gap-4 cursor-pointer hover:bg-[#FFF6E9]/60 transition"
            onClick={() => onEdit(product)}
          >
            <div className="w-14 h-14 rounded-lg bg-[#FFF6E9] flex items-center justify-center overflow-hidden">
              <Image 
                src={product.image ? 
                  (product.image.startsWith('http') || product.image.startsWith('/') 
                    ? product.image 
                    : `${API_URL}/${product.image}`)
                  : '/images/plat.png'}
                alt={product.name}
                width={56}
                height={56}
                className="object-cover w-full h-full"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-row justify-between gap-2">
                <span className="text-[13px] text-[#232323] font-semibold truncate">{product.name}</span>
                <span className="bg-[#FBDBA7] text-[#7A3502] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {translateCategory(product.category)}
                </span>
              </div>
              <div className="text-[12px] text-[#71717A] truncate">{product.price} XOF</div>
              <div className="flex items-center justify-between mt-2">
                <div className="text-[11px] text-[#F17922] font-medium">
                  {product.available ? 'Disponible' : 'Non disponible'}
                </div>
                <Toggle 
                  checked={product.available || false}
                  onChange={(checked) => {
                    if (onUpdateAvailability) {
                      onUpdateAvailability(product.id, checked);
                    }
                  }}
                  size="small"
                />
              </div>
            </div>
            <span
              className="text-[#71717A] text-lg cursor-pointer select-none px-2"
              onClick={(e) => {
                e.stopPropagation();
                handleMenuOpen(product.id, e);
              }}
            >
              •••
            </span>
          </div>
        ))}
        
        {safeProducts.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-[#ECECEC] p-6 flex flex-col items-center justify-center">
            <span className="text-[14px] text-[#F17922] mb-4">
              Aucun supplément trouvé
            </span>
            <button 
              onClick={onCreateProduct}
              className="px-4 py-2 text-[14px] cursor-pointer bg-[#F17922] text-white font-medium rounded-xl 
              hover:bg-[#F17922]/90 transition-colors"
            >
              Ajouter un supplément
            </button>
          </div>
        )}
      </div>

      {/* Supplement Preview */}
      {safeProducts.length > 0 && (
        <div className="w-[300px] border-[1.5px] border-[#D4D4D8]/60 rounded-2xl">
        {/* Aperçu Section */}
        <div className="bg-white rounded-t-2xl p-4 px-2  mb-10">
          <h3 className="text-[20px] text-[#71717A] font-medium mb-6 bg-[#F4F4F5] rounded-lg p-2">Aperçu</h3>

          <div className="space-y-6 px-2">
            <div className="flex items-center flex-row justify-between gap-2">
              <span className="text-[16px] text-[#71717A]">Total des produits</span>
              <span className="text-[16px] text-[#F17922] font-medium">798</span>
            </div>
            <div className="flex items-center flex-row justify-between gap-2">
              <span className="text-[16px] text-[#71717A]">Vendus</span>
              <span className="text-[16px] text-[#F17922] font-medium">176</span>
            </div>
            <div className="flex items-center flex-row justify-between gap-2">
              <span className="text-[16px] text-[#71717A]">En réserve</span>
              <span className="text-[16px] text-[#F17922] font-medium">622</span>
            </div>
          </div>
        </div>

        {/* Supplements Section */}
        <div className="bg-white rounded-b-2xl p-4 px-2">
          <h3 className="text-[20px] text-[#71717A] font-medium mb-6 bg-[#F4F4F5] rounded-lg p-2">Produits</h3>

          <div className="grid grid-cols-5 gap-2 px-2">
            {Array.from({ length: 20 }).map((_, index) => (
              <div 
                key={index}
                className="relative aspect-square rounded-2xl overflow-hidden bg-[#E4E4E7]"
              >
                <Image
                  src="/images/plat.png"
                  alt={`Product ${index + 1}`}
                  width={50}
                  height={50}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    </div>
  )
}
