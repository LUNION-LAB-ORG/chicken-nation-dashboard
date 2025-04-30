"use client"
 
import { useEffect, useState, useRef } from "react"
import Image from "next/image"
import { MenuItem as MenuItemType } from "@/types"
import MenuItemCard from "@/components/ui/MenuItem"
import { getAllMenus } from "@/services/menuService"
import { Loader2 } from "lucide-react"
import { formatImageUrl } from "@/utils/imageHelpers"

interface BestSellersProps {
  menus: MenuItemType[]
  onEditMenu: (menu: MenuItemType) => void
  onViewMenu?: (menu: MenuItemType) => void
}

export default function BestSellers({ menus: propMenus, onEditMenu, onViewMenu }: BestSellersProps) {
  const [menus, setMenus] = useState<MenuItemType[]>(propMenus || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Éviter les appels multiples à l'API
    if (fetchedRef.current) return;
    
    const fetchMenus = async () => {
      try {
        setLoading(true) 
        const apiMenus = await getAllMenus() 
        
       
        fetchedRef.current = true;
        
        if (!Array.isArray(apiMenus)) { 
          setError('Format de données inattendu');
          setLoading(false);
          return;
        }
        
     
        const formattedMenus: MenuItemType[] = apiMenus.map((apiMenu: any) => {
          
          let imageUrl = apiMenu.image || '';
          
        
          if (imageUrl && typeof imageUrl === 'string') {
            imageUrl = formatImageUrl(imageUrl);
          }
          
          return {
            id: apiMenu.id || '',
            name: apiMenu.name || '',
            description: apiMenu.description || '',
            price: apiMenu.price || 0,
            image: imageUrl,
            rating: apiMenu.rating || 0,
            isAvailable: apiMenu.isAvailable !== false,
            restaurant: apiMenu.restaurant || '',
            restaurantId: apiMenu.restaurantId || '',
            category: apiMenu.category || '',
            categoryId: apiMenu.categoryId || apiMenu.category_id || '',
            supplements: apiMenu.supplements || {},
            reviews: apiMenu.reviews || [],
            totalReviews: apiMenu.totalReviews || 0
          };
        });
        
        setMenus(formattedMenus)
        setError(null)
      } catch (err) {
        setError('Impossible de charger les menus. Veuillez réessayer.')
      } finally {
        setLoading(false)
      }
    }

    fetchMenus()
    
    
    return () => {
      fetchedRef.current = false;
    };
  }, []) 

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <Image src="/icons/chicken.png" alt="menu" width={12} height={12} className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" />
        <h2 className="text-xs sm:text-sm font-medium text-[#F17922] pl-1.5 sm:pl-2">Les plus vendus</h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 text-[#F17922] animate-spin" />
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-red-500">{error}</p>
        </div>
      ) : menus.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Aucun plat disponible</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {menus.map((menu) => (
            <MenuItemCard 
              key={menu.id} 
              menu={menu} 
              onEdit={onEditMenu}
              onView={onViewMenu}
            />
          ))}
        </div>
      )}
      <div className="w-full h-px bg-gray-100 mt-8" />
    </div>
  )
}
