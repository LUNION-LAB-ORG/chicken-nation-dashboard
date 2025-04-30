"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { MoreHorizontal, Loader2 } from 'lucide-react'
import { Category as ApiCategory } from '@/services'

// Adapter l'interface Category de l'API pour le composant
interface Category extends ApiCategory {
  productCount?: number;
}

interface CategoriesTableProps {
  categories: Category[]
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  onCreateCategory: () => void
  onRefresh?: () => void
  isLoading?: boolean
}

export default function CategoriesTable({ 
  categories, 
  onEdit, 
  onDelete, 
  onCreateCategory,
  onRefresh,
  isLoading = false 
}: CategoriesTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  // Fonction pour traduire les catégories
  const translateCategory = (category: string): string => {
    const translations: Record<string, string> = {
      'FOOD': 'Accompagnements',
      'DRINK': 'Boissons',
      'ACCESSORY': 'Ingrédients',
      'all': 'Tous les produits'
    };
    return translations[category] || category;
  };

  // Fonction pour obtenir l'URL de l'image avec fallback
 

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-[#F17922] animate-spin" />
          <span className="ml-3 text-[14px] text-gray-600">Chargement des catégories...</span>
        </div>
      ) : (
        <>
          {/* Vue mobile (affichage en cartes) */}
          <div className="md:hidden">
            {categories.length === 0 ? (
              <div className="flex items-center justify-center flex-col gap-4 py-8">
                <span className="text-[14px] text-[#F17922]">
                  Aucune catégorie trouvée
                </span>
                <button 
                  onClick={onCreateCategory}
                  className="px-4 py-2 text-[14px] cursor-pointer bg-[#F17922] text-white font-medium rounded-xl 
                  hover:bg-[#F17922]/90 transition-colors"
                >
                  Ajouter une catégorie
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                    <div className="flex items-center">
                      {/* Image de la catégorie */}
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 mr-3 flex-shrink-0">
                        <Image
                          src={category.image ? 
                            (category.image.startsWith('http') || category.image.startsWith('/') 
                              ? category.image 
                              : `https://chicken.turbodeliveryapp.com/${category.image}`)
                            : '/images/plat.png'}
                          alt={category.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* Informations de la catégorie */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-[14px] font-medium text-gray-900 truncate">{translateCategory(category.name)}</h3>
                        <p className="text-[12px] text-gray-500">
                          {category.productCount || 0} produit{(category.productCount || 0) > 1 ? 's' : ''}
                        </p>
                      </div>
                      
                      {/* Menu d'actions */}
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === category.id ? null : category.id)}
                          className="p-2 hover:bg-gray-50 rounded-full"
                        >
                          <MoreHorizontal className="h-5 w-5 text-gray-500" />
                        </button>
                        
                        {/* Dropdown menu */}
                        {openMenuId === category.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-[10px] shadow-lg py-1 z-10">
                            <button
                              onClick={() => {
                                onEdit(category)
                                setOpenMenuId(null)
                              }}
                              className="w-full px-4 py-2 text-left text-[13px] text-gray-900 hover:bg-gray-50"
                            >
                              Modifier cette catégorie
                            </button>
                            <button
                              onClick={() => {
                                onDelete(category)
                                setOpenMenuId(null)
                              }}
                              className="w-full px-4 py-2 text-left text-[13px] text-red-600 hover:bg-gray-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Description (si disponible) */}
                    {category.description && (
                      <p className="text-[12px] text-gray-600 mt-2 line-clamp-2">
                        {category.description || '--'}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Vue desktop (affichage en tableau) */}
          <div className="hidden md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="w-16"></th>
                  <th className="text-left py-4 text-[13px] text-gray-600 font-medium">Catégories</th>
                  <th className="text-left py-4 text-[13px] text-gray-600 font-medium">Nombre de produits</th>
                  <th className="text-left py-4 text-[13px] text-gray-600 font-medium">Description</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8">
                      <div className='flex items-center justify-center flex-col gap-4'>
                        <span className='text-[14px] text-[#F17922]'>
                          Aucune catégorie trouvée
                        </span>
                        <button 
                          onClick={onCreateCategory}
                          className="px-4 py-2 text-[14px] cursor-pointer bg-[#F17922] text-white font-medium rounded-xl 
                          hover:bg-[#F17922]/90 transition-colors"
                        >
                          Ajouter une catégorie
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="border-b border-gray-100">
                      <td className="py-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 mx-auto">
                          <Image
                            src={category.image ? 
                              (category.image.startsWith('http') || category.image.startsWith('/') 
                                ? category.image 
                                : `https://chicken.turbodeliveryapp.com/${category.image}`)
                              : '/images/plat.png'}
                            alt={category.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="py-4 text-[13px] text-gray-900">{translateCategory(category.name)}</td>
                      <td className="py-4 text-[13px] text-gray-900">{category.productCount || 0}</td>
                      <td className="py-4 text-[13px] text-gray-900">{category.description || '--'}</td>
                      <td className="py-4 relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === category.id ? null : category.id)}
                          className="p-1 hover:bg-gray-50 rounded"
                        >
                          <MoreHorizontal className="h-4 w-4 text-gray-500" />
                        </button>
                        
                        {/* Dropdown menu */}
                        {openMenuId === category.id && (
                          <div className="absolute right-0 mt-1 w-48 bg-white rounded-[10px] shadow-lg py-1 z-10">
                            <button
                              onClick={() => {
                                onEdit(category)
                                setOpenMenuId(null)
                              }}
                              className="w-full px-4 py-2 text-left text-[13px] text-gray-900 hover:bg-gray-50"
                            >
                              Modifier cette catégorie
                            </button>
                            <button
                              onClick={() => {
                                onDelete(category)
                                setOpenMenuId(null)
                              }}
                              className="w-full px-4 py-2 text-left text-[13px] text-red-600 hover:bg-gray-50"
                            >
                              Supprimer
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
