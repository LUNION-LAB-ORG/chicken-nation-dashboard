"use client"

import React, { useState, useEffect } from 'react';
import { Product as InventoryProduct } from '@/types/inventory';
import AddSupplement from './AddSupplement';
import EditSupplement from './EditSupplement';
import AddCategory from './AddCategory';
import Modal from '@/components/ui/Modal';
import { ChevronDown } from 'lucide-react';
import DashboardPageHeader from '@/components/ui/DashboardPageHeader'; 
import CategoriesTable from './CategoriesTable';
import SupplementView from './SupplementView';
import { Category as ApiCategory, getAllCategories, deleteCategory as deleteCategoryApi } from '@/services';
import { toast } from 'react-hot-toast';
import { Dish } from '@/types/dish';
import DeleteSupplementModal from './DeleteSupplementModal';
import DeleteCategoryModal from './DeleteCategoryModal';
import EditCategory from './EditCategory';
import { deleteSupplement } from '@/services/dishService';
import SupplementTabs, { TabItem } from './SupplementTabs';

type ViewType = 'products' | 'categories';
type ProductCategory = 'all' | 'FOOD' | 'DRINK' | 'ACCESSORY';

interface Category extends ApiCategory {
  productCount?: number;
}
interface ProductViewProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  image: string;
}

// Interface Product pour Supplement
interface AddProductProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  totalValue: number;
  description?: string;
}

// Interface Product combinant les deux interfaces pour une utilisation interne
interface Product extends ProductViewProduct, Omit<AddProductProduct, 'id' | 'name' | 'category' | 'price'> {}

export default function Inventory() {
  const [currentView, setCurrentView] = useState<ViewType>('products');
  const [selectedTab, setSelectedTab] = useState<ProductCategory>('all');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showEditSupplementModal, setShowEditSupplementModal] = useState(false);
  const [showDeleteSupplementModal, setShowDeleteSupplementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Dish | null>(null);
  const [productToDelete, setProductToDelete] = useState<any | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<ApiCategory | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<ApiCategory | null>(null);
  const [isEditCategoryModalOpen, setIsEditCategoryModalOpen] = useState(false);
  const [isDeleteCategoryModalOpen, setIsDeleteCategoryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Exemple de données pour les produits (pour éviter un tableau vide au démarrage)
  const [products, setProducts] = useState<any[]>([
    {
      
    }
  ]);

  // Fonction pour traduire les catégories en français
  const translateCategory = (category: string): string => {
    switch (category) {
      case 'FOOD':
        return 'Accompagnements';
      case 'DRINK':
        return 'Boissons';
      case 'ACCESSORY':
        return 'Ingrédient';
      case 'all':
        return 'Tous les produits';
      default:
        return category;
    }
  };

  const tabs: TabItem[] = [
    { id: 'all', label: translateCategory('all') },
    { id: 'FOOD', label: translateCategory('FOOD') },
    { id: 'DRINK', label: translateCategory('DRINK') },
    { id: 'ACCESSORY', label: translateCategory('ACCESSORY') },
  ];

  // Charger les catégories au chargement du composant
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    // Importer les suppléments depuis l'API
    const fetchSupplements = async () => {
      try {
        const { getAllDishes } = await import('@/services/dishService');
        const data = await getAllDishes(); 
        
        // Les données sont organisées par catégorie
        const allProducts = [];
        
        // Ajouter les produits de chaque catégorie
        if (data && data.DRINK && Array.isArray(data.DRINK)) {
        
          data.DRINK.forEach(item => {
            allProducts.push({
              id: item.id,
              name: item.name,
              category: 'DRINK',
              price: item.price,
              stock: item.available ? 1 : 0,
              image: item.image || '/images/plat.png'
            });
          });
        }
        
        if (data && data.FOOD && Array.isArray(data.FOOD)) {
          
          data.FOOD.forEach(item => {
            allProducts.push({
              id: item.id,
              name: item.name,
              category: 'FOOD',
              price: item.price,
              stock: item.available ? 1 : 0,
              image: item.image || '/images/plat.png'
            });
          });
        }
        
        if (data && data.ACCESSORY && Array.isArray(data.ACCESSORY)) {
         
          data.ACCESSORY.forEach(item => {
            allProducts.push({
              id: item.id,
              name: item.name,
              category: 'ACCESSORY',
              price: item.price,
              stock: item.available ? 1 : 0,
              image: item.image || '/images/plat.png'
            });
          });
        }
         
        setProducts(allProducts);
      } catch (error) {
        console.error('Erreur:', error);
      }
    };
    
    fetchSupplements();
  }, []);

  // Récupérer les catégories depuis l'API
  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const data = await getAllCategories();
      const adaptedCategories: Category[] = data.map(cat => ({
        ...cat,
        productCount: 0 
      }));
      setCategories(adaptedCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des catégories:', error);
      toast.error('Impossible de charger les catégories');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProduct = () => {
    setShowAddProductModal(true);
  };

  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setShowAddCategoryModal(true);
  };

  const handleEditCategory = (category: ApiCategory) => {
    setCategoryToEdit(category);
    setIsEditCategoryModalOpen(true);
  };

  const handleDeleteCategory = (category: ApiCategory) => {
    setCategoryToDelete(category);
    setIsDeleteCategoryModalOpen(true);
  };

  const confirmDeleteCategory = async (category: ApiCategory) => {
    setIsLoading(true);
    try {
      await deleteCategoryApi(category.id);
      // Mettre à jour la liste des catégories
      const updatedCategories = categories.filter(cat => cat.id !== category.id);
      setCategories(updatedCategories);
      toast.success('Catégorie supprimée avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      if (error instanceof Error) {
        if (error.message.includes('Authentication required')) {
          toast.error('Authentification requise. Veuillez vous reconnecter.');
        } else {
          toast.error(`Erreur: ${error.message}`);
        }
      } else {
        toast.error('Une erreur est survenue lors de la suppression de la catégorie');
      }
    } finally {
      setIsLoading(false);
      setIsDeleteCategoryModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const handleSaveEditedCategory = (updatedCategory: ApiCategory) => {
    // Mettre à jour la liste des catégories
    const updatedCategories = categories.map(cat => 
      cat.id === updatedCategory.id ? updatedCategory : cat
    );
    setCategories(updatedCategories);
    setIsEditCategoryModalOpen(false);
    setCategoryToEdit(null);
  };

  const handleEditProduct = (product: any) => { 
    setSelectedProduct(product);
    setShowEditSupplementModal(true);
  };

   
  const handleSaveProduct = (product: InventoryProduct) => {
 
    const updatedProduct: Product = {
      ...product,
      stock: product.quantity,  
      image: '/images/plat.png', 
      totalValue: product.price * product.quantity  
    };
    
  
    setShowAddProductModal(false);
    setSelectedProduct(null);
  };

 
  const handleSaveCategory = (savedCategory: ApiCategory) => {
    
    const adaptedCategory: Category = {
      ...savedCategory,
      productCount: selectedCategory?.productCount || 0
    };
    
    setShowAddCategoryModal(false);
    fetchCategories(); // Recharger les catégories après la sauvegarde
  };

  // Fonction pour mettre à jour la disponibilité d'un supplément
  const handleUpdateAvailability = async (productId: string, available: boolean) => {
    try {
      setIsLoading(true);
      const { updateSupplementAvailability } = await import('@/services/dishService');
      await updateSupplementAvailability(productId, available);
      
      // Mettre à jour l'état local
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === productId 
            ? { ...product, available } 
            : product
        )
      );
      
      toast.success(`Disponibilité mise à jour avec succès !`);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la disponibilité:', error);
      toast.error('Erreur lors de la mise à jour de la disponibilité');
    } finally {
      setIsLoading(false);
    }
  };

  // Supprimer un supplément
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteSupplement(productId);
      toast.success('Supplément supprimé avec succès');
      
      // Mettre à jour l'état local
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productId)
      );
      
      setShowDeleteSupplementModal(false);
      setProductToDelete(null);
    } catch (error) {
      console.error('Erreur lors de la suppression du supplément:', error);
      toast.error('Impossible de supprimer le supplément');
    }
  };

  // Afficher le modal de confirmation de suppression
  const confirmDeleteProduct = (product: any) => {
    setProductToDelete(product);
    setShowDeleteSupplementModal(true);
  };

  // Fonction pour gérer la mise à jour d'un supplément
  const handleUpdateSupplement = async (updatedSupplement: Dish) => {
    try {
      setIsLoading(true);
      
      // Mettre à jour l'état local
      setProducts(prevProducts => 
        prevProducts.map(product => 
          product.id === updatedSupplement.id 
            ? {
                ...product,
                name: updatedSupplement.name,
                price: updatedSupplement.price,
                category: updatedSupplement.category,
                available: updatedSupplement.available,
                image: updatedSupplement.image
              } 
            : product
        )
      );
      
      toast.success(`Supplément mis à jour avec succès !`);
      setShowEditSupplementModal(false);
      setSelectedProduct(null);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du supplément:', error);
      toast.error('Erreur lors de la mise à jour du supplément');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="px-2 lg:pt-2 pb-2 sm:px-4 sm:pb-4 md:px-6 md:pb-6 lg:px-8 lg:pb-8">
        <DashboardPageHeader
          mode="list"
          title="Inventaires"
          searchConfig={{
            placeholder: "Rechercher un menu",
            buttonText: "Chercher",
            onSearch: (value) => console.log('Searching:', value)
          }}
          actions={[
           
            {
              label: "Créer une catégorie",
              onClick: handleCreateCategory,
              variant: "secondary",
              className: "bg-white border border-[#F17922] text-[#F17922] hover:bg-white hover:opacity-80"
            },
            {
              label: "Ajouter un supplément",
              onClick: handleCreateProduct,
              variant: "primary"
            }
          ]}
        />

        <div className="bg-white rounded-[20px] p-4 mt-4 shadow-sm">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
           
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-[#F4F4F5] rounded-[10px] px-4 py-2 cursor-pointer"
              >
                <span className="text-[10px] lg:text-[14px] text-[#9796A1]">
                  {currentView === 'products' ? 'Suppléments' : 'Catégories'}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500 " />
              </button>
              
          
              {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-[10px] shadow-lg py-1 z-10">
                  <button
                    onClick={() => {
                      setCurrentView('products');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 hover:text-orange-500 cursor-pointer text-left text-[10px] lg:text-[14px] text-gray-900 hover:bg-gray-50"
                  >
                    Supplément
                  </button>
                  <button
                    onClick={() => {
                      setCurrentView('categories');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full px-4 py-2 hover:text-orange-500 cursor-pointer text-left text-[10px] lg:text-[14px] text-gray-900 hover:bg-gray-50"
                  >
                    Catégories
                  </button>
                </div>
              )}
            </div>

          
            {currentView === 'categories' ? (
              <div className="bg-[#F17922] rounded-[10px] lg:px-8 p-2 lg:py-2">
                <span className="text-[10px] lg:text-[14px] text-white font-bold">
                  Toutes les catégories
                </span>
              </div>
            ) : (
              <SupplementTabs 
                tabs={tabs} 
                selectedTab={selectedTab} 
                onTabChange={(tabId) => setSelectedTab(tabId as ProductCategory)} 
              />
            )}

       
            <div className="w-[120px]"></div>
          </div>

          
          {currentView === 'categories' ? (
            <CategoriesTable
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onCreateCategory={handleCreateCategory}
              isLoading={isLoading}
              onRefresh={fetchCategories}
            />
          ) : (
            <SupplementView
              products={products.filter(product => product.category === selectedTab || selectedTab === 'all')}
              selectedTab={selectedTab}
              onEdit={handleEditProduct}
              onCreateProduct={handleCreateProduct}
              onDelete={confirmDeleteProduct}
              onUpdateAvailability={handleUpdateAvailability}
            />
          )}
        </div>

        <Modal
          isOpen={showAddProductModal}
          onClose={() => setShowAddProductModal(false)}
          title="Ajouter un supplément"
        >
          <AddSupplement
            onCancel={() => setShowAddProductModal(false)}
            On={handleSaveProduct}
            product={selectedProduct ? {
              id: selectedProduct.id,
              name: selectedProduct.name,
              category: selectedProduct.category,
              price: selectedProduct.price,
              quantity: selectedProduct.quantity,
              totalValue: selectedProduct.totalValue,
              description: selectedProduct.description
            } : null}
          />
        </Modal>

        <Modal
          isOpen={showAddCategoryModal}
          onClose={() => setShowAddCategoryModal(false)}
          title={selectedCategory ? "Modifier la catégorie" : "Créer une catégorie"}
        >
          <AddCategory
            onClose={() => setShowAddCategoryModal(false)}
            onSave={handleSaveCategory}
            category={selectedCategory}
          />
        </Modal>

        <Modal
          isOpen={showEditSupplementModal}
          onClose={() => setShowEditSupplementModal(false)}
          title="Modifier un supplément"
        >
          <EditSupplement
            onCancel={() => setShowEditSupplementModal(false)}
            onSuccess={handleUpdateSupplement}
            product={selectedProduct}
          />
        </Modal>

        <Modal
          isOpen={showDeleteSupplementModal}
          onClose={() => setShowDeleteSupplementModal(false)}
          title="Supprimer un supplément"
        >
          <DeleteSupplementModal
            onCancel={() => setShowDeleteSupplementModal(false)}
            onDelete={handleDeleteProduct}
            product={productToDelete}
          />
        </Modal>

        <Modal
          isOpen={isDeleteCategoryModalOpen}
          onClose={() => setIsDeleteCategoryModalOpen(false)}
          title="Supprimer une catégorie"
        >
          {categoryToDelete && (
            <DeleteCategoryModal
              category={categoryToDelete as ApiCategory}
              onClose={() => setIsDeleteCategoryModalOpen(false)}
              onConfirm={confirmDeleteCategory}
              isLoading={isLoading}
            />
          )}
        </Modal>

        <Modal
          isOpen={isEditCategoryModalOpen}
          onClose={() => setIsEditCategoryModalOpen(false)}
          title="Modifier une catégorie"
        >
          {categoryToEdit && (
            <EditCategory
              onClose={() => setIsEditCategoryModalOpen(false)}
              onSave={handleSaveEditedCategory}
              category={categoryToEdit as ApiCategory}
            />
          )}
        </Modal>
      </div>
    </div>
  );
}