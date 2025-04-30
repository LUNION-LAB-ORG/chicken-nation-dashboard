import Image from "next/image"
import { MenuItem as MenuItemType } from "@/types"
import MenuItemSimple from "@/components/ui/MenuItemSimple"
import { useEffect, useState, useRef } from "react"
import { getAllMenus} from "@/services/menuService"

interface MenuPromoProps {
  promoMenus: MenuItemType[]
  onEditMenu: (menu: MenuItemType) => void
  onViewMenu?: (menu: MenuItemType) => void
}

export default function MenuPromo({ promoMenus: propPromoMenus, onViewMenu }: MenuPromoProps) { 
  const [promoMenus, setPromoMenus] = useState<MenuItemType[]>(propPromoMenus || [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  useEffect(() => {
    // Éviter les appels multiples à l'API
    if (fetchedRef.current) return;
    
    const fetchPromoMenus = async () => {
      try {
        setLoading(true)
       
        const apiMenus = await getAllMenus()  
        
        
        fetchedRef.current = true;
        
        
        if (!Array.isArray(apiMenus)) {
          setError('Format de données inattendu');
          setLoading(false);
          return;
        }
        
        // Filtrer les menus en promotion
        const promotionMenus = apiMenus.filter(menu => {
          return menu.isPromotion === true || 
                 menu.is_promotion === true || 
                 (menu.discountedPrice !== undefined && menu.discountedPrice !== null);
        }).slice(0, 5); // Limiter à 5 menus en promotion
        
        setPromoMenus(promotionMenus)
        setError(null)
      } catch (err) {
        setError('Impossible de charger les menus en promotion')
        
        setPromoMenus(propPromoMenus)
      } finally {
        setLoading(false)
      }
    }

    fetchPromoMenus()
    
 
    return () => {
      fetchedRef.current = false;
    };
  }, [propPromoMenus])

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center mb-6">
        <Image 
          src="/icons/chicken.png" 
          alt="menu" 
          width={12} 
          height={12} 
          className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-3.5 md:h-3.5" 
        />
        <h2 className="text-xs sm:text-sm font-medium text-[#F17922] pl-1.5 sm:pl-2">
          Promo en cours
        </h2>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Chargement des promotions...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-red-500">{error}</p>
        </div>
      ) : promoMenus.length === 0 ? (
        <div className="flex justify-center items-center h-40">
          <p className="text-gray-500">Aucune promotion en cours</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 md:gap-4 lg:gap-6">
          {promoMenus.map((menu) => (
            <MenuItemSimple 
              key={menu.id} 
              menu={menu} 
              onView={() => onViewMenu?.(menu)}
            />
          ))}
        </div>
      )}
      <div className="w-full h-px bg-gray-100 mt-8" />
    </div>
  )
}
