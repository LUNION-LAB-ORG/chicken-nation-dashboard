import Image from "next/image"
import { MenuItem as MenuItemType } from "@/types"
import { Mail } from "lucide-react" 
import { formatImageUrl } from "@/utils/imageHelpers"

interface DetailsMenuProps {
  menu: MenuItemType
  onClose: () => void
  onEdit: () => void
}

export default function DetailsMenu({ menu, onClose, onEdit }: DetailsMenuProps) {
  // Filtrer les suppléments par catégorie
  const getSupplementsByCategory = (category: string) => {
    if (!menu.dish_supplements || !Array.isArray(menu.dish_supplements)) {
      return [];
    }

    
    return menu.dish_supplements.filter(item => 
      item.supplement && item.supplement.category === category
    );
  };

  const getSafeImageUrl = (imageUrl: string | null): string => {
    if (!imageUrl) return '/images/burger.png';
    if (imageUrl.startsWith('data:')) return imageUrl;
    return formatImageUrl(imageUrl);
  };

  //  les ingrédients (catégorie ACCESSORY)
  const ingredients = getSupplementsByCategory('ACCESSORY');
  //  les accompagnements (catégorie FOOD)
  const sides = getSupplementsByCategory('FOOD');
  //  les boissons (catégorie DRINK)
  const drinks = getSupplementsByCategory('DRINK');

  return (
    <div className="bg-white w-full h-full overflow-y-auto">
      {/* Image du menu */}
      <div className="relative w-full h-[200px] xs:h-[300px] sm:h-[400px] lg:h-[530px] p-2 xs:p-3 sm:p-4 lg:p-6">
        <div className="relative w-full h-full">
          <Image
            src={getSafeImageUrl(menu.image)}
            alt={menu.name}
            className="w-full h-full object-contain sm:object-cover rounded-xl sm:rounded-2xl border border-orange-300"
            width={600}
            height={530}
            priority
          />
        </div>
      </div>

      <div className="p-3 sm:p-4 lg:p-6">
        {/* En-tête avec titre et prix */}
        <div className="flex flex-col xs:flex-row justify-between items-start gap-2 xs:gap-4 sm:gap-0 mb-4">
          <div className="w-full xs:w-auto">
            <h1 className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-semibold text-[#595959] mb-2">{menu.name}</h1>
            <div className="inline-block px-2 py-1 bg-orange-50 rounded-md">
              <span className="text-xs font-medium text-gray-500">PLATS</span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full xs:w-auto justify-between xs:justify-end">
            <span className="text-lg xs:text-xl sm:text-2xl lg:text-3xl font-semibold text-[#F17922]">{menu.price} FCFA</span>
            <button 
              onClick={onEdit}
              className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border border-slate-200 rounded-xl p-1.5 sm:p-2"
            >
              <Image src="/icons/share.png" alt="share" width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row min-h-[300px] sm:min-h-[350px] lg:min-h-[400px] gap-6 lg:gap-0">
          <div className="w-full lg:w-2/3 flex flex-col lg:pr-6">
            {/* Tabs */}
            <div className="flex items-center gap-4 sm:gap-6 mb-4 sm:mb-6">
              <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                <Mail className="w-5 h-5 sm:w-6 sm:h-6 rounded-2xl text-gray-500" />
                <span className="text-xs sm:text-sm text-gray-500">Commentaires</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2 cursor-pointer">
                <Image src="/icons/cart.png" alt="orders" width={20} height={20} className="w-5 h-5 sm:w-6 sm:h-6" />
                <span className="text-xs sm:text-sm text-gray-500">Commandes</span>
              </div>
            </div>

            {/* Description */}
            <div className="flex-grow mb-4 sm:mb-6">
              <div className="flex items-center mb-3 sm:mb-4 gap-2">
                <Image src="/icons/chicken.png" alt="menu" width={12} height={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 mt-0.5" />
                <h3 className="text-base sm:text-lg font-bold text-[#F17922]">Description</h3>
              </div>
              <div className="space-y-1 text-sm sm:text-base lg:text-lg text-gray-600">
                <p>{menu.description}</p>
             
              </div>
            </div>

            {/* Bouton Supprimer */}
            <div className="flex justify-end">
              <button
                onClick={onClose}
                className="w-full sm:w-[180px] lg:w-[200px] py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Supprimer
              </button>
            </div>
          </div>

          <div className="w-full lg:w-1/3 flex flex-col">
            {/* Ingrédients */}
            <div className="flex-grow border border-slate-200 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Image src="/icons/chicken.png" alt="menu" width={12} height={12} className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 mt-0.5" />
                <h3 className="text-base sm:text-lg font-bold text-[#F17922]">Ingrédients</h3>
              </div>
              <div className="space-y-2">
                {ingredients && ingredients.length > 0 ? (
                  ingredients.map((ingredient, index) => (
                    ingredient.supplement && (
                      <div key={ingredient.supplement.id || index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-orange-500" />
                        <span className="text-sm text-gray-600">{ingredient.supplement.name}</span>
                      </div>
                    )
                  ))
                ) : (
                  <span className="text-sm text-gray-500">Aucun ingrédient disponible</span>
                )}
              </div>
            </div>

            {/* Bouton Modifier */}
            <button
              onClick={onEdit}
              className="w-full mt-4 sm:mt-6 py-2 bg-[#F17922] text-white rounded-lg text-sm font-medium hover:bg-[#e06816] transition-colors"
            >
              Modifier le menu
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
