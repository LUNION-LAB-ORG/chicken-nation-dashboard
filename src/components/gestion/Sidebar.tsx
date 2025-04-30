"use client"

import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LogOut } from 'lucide-react';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick: () => void;
}

interface SidebarIconProps {
  defaultIcon: string;
  whiteIcon: string;
  alt: string;
  active: boolean;
}

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ defaultIcon, whiteIcon, alt, active }) => {
  return (
    <div className="relative w-5 h-5">
      <Image
        src={active ? whiteIcon : defaultIcon}
        alt={alt}
        width={20}
        height={20}
        className="absolute inset-0"
      />
    </div>
  );
};

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active = false, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`
        w-full flex items-center cursor-pointer space-x-3 px-4 py-[10px] rounded-[14px]
        ${active ? 'bg-gradient-to-r from-[#F17922] to-[#FA6345]' : 'text-gray-600 hover:bg-gray-100'}
        transition-all duration-200
      `}
    >
      {icon}
      <span className={`text-sm font-sofia-regular font-normal cursor-pointer ${active ? 'text-white' : 'text-gray-600'}`}>{label}</span>
    </button>
  );
};

export default function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <aside className="w-64 bg-white shadow-lg h-screen flex flex-col transition-transform duration-300 ease-in-out">
        {/* Logo */}
        <div className="p-4">
          <div className="flex space-x-2 items-start justify-start">
            <Image src="/icons/sidebar/logo-orange.png" alt="Chicken Nation" width={200} height={100} />
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-2 px-2 flex-1 overflow-y-auto">
          <div className="space-y-1">
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/home.png"
                whiteIcon="/icons/sidebar/home-white.png"
                alt="Tableau de bord"
                active={activeTab === 'dashboard'}
              />} 
              label="Tableau de bord" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/menu.png"
                whiteIcon="/icons/sidebar/menu-white.png"
                alt="Menu"
                active={activeTab === 'menus'}
              />} 
              label="Menus" 
              active={activeTab === 'menus'} 
              onClick={() => setActiveTab('menus')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/commande.png"
                whiteIcon="/icons/sidebar/commande-white.png"
                alt="Orders"
                active={activeTab === 'orders'}
              />} 
              label="Commandes" 
              active={activeTab === 'orders'} 
              onClick={() => setActiveTab('orders')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/client.png"
                whiteIcon="/icons/sidebar/client-white.png"
                alt="Clients"
                active={activeTab === 'clients'}
              />} 
              label="Clients" 
              active={activeTab === 'clients'} 
              onClick={() => setActiveTab('clients')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/inventaire.png"
                whiteIcon="/icons/sidebar/inventaire-white.png"
                alt="Inventory"
                active={activeTab === 'inventory'}
              />} 
              label="Inventaires" 
              active={activeTab === 'inventory'} 
              onClick={() => setActiveTab('inventory')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/programme.png"
                whiteIcon="/icons/sidebar/programme-white.png"
                alt="Program"
                active={activeTab === 'program'}
              />} 
              label="Programme" 
              active={activeTab === 'program'} 
              onClick={() => setActiveTab('program')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/restaurants.png"
                whiteIcon="/icons/sidebar/restaurants-white.png"
                alt="Restaurants"
                active={activeTab === 'restaurants'}
              />} 
              label="Restaurants" 
              active={activeTab === 'restaurants'} 
              onClick={() => setActiveTab('restaurants')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/client.png"
                whiteIcon="/icons/sidebar/client-white.png"
                alt="Personnel"
                active={activeTab === 'personnel'}
              />} 
              label="Personnel" 
              active={activeTab === 'personnel'} 
              onClick={() => setActiveTab('personnel')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/publicites.png"
                whiteIcon="/icons/sidebar/publicites-white.png"
                alt="Ads"
                active={activeTab === 'ads'}
              />} 
              label="Publicités" 
              active={activeTab === 'ads'} 
              onClick={() => setActiveTab('ads')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/promotions.png"
                whiteIcon="/icons/sidebar/promotions-white.png"
                alt="Promos"
                active={activeTab === 'promos'}
              />} 
              label="Promotions" 
              active={activeTab === 'promos'} 
              onClick={() => setActiveTab('promos')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/fidelisation.png"
                whiteIcon="/icons/sidebar/fidelisation-white.png"
                alt="Loyalty"
                active={activeTab === 'loyalty'}
              />} 
              label="Fidélisation" 
              active={activeTab === 'loyalty'} 
              onClick={() => setActiveTab('loyalty')}
            />
            <SidebarItem 
              icon={<SidebarIcon 
                defaultIcon="/icons/sidebar/widget.png"
                whiteIcon="/icons/sidebar/widget-white.png"
                alt="Apps"
                active={activeTab === 'apps'}
              />} 
              label="Apps et Widgets" 
              active={activeTab === 'apps'} 
              onClick={() => setActiveTab('apps')}
            />
          </div>
        </nav>

        {/* Bouton de déconnexion */}
        <div className="p-4 border-t border-gray-200">
          <button 
            onClick={handleLogout}
            className={`
              w-full flex items-center cursor-pointer space-x-3 px-4 py-[10px] rounded-[14px]
              text-gray-600 hover:bg-gray-100
              transition-all duration-200
            `}
          >
            <div className="relative w-5 h-5 flex items-center justify-center">
              <LogOut size={20} className="text-[#F17922]" />
            </div>
            <span className="text-sm font-sofia-regular font-normal cursor-pointer text-gray-600">Déconnexion</span>
          </button>
        </div>
      </aside>
    </div>
  );
}