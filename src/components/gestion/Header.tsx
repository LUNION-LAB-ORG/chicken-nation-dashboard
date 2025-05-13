"use client"

import { Search, Menu } from 'lucide-react';
import Image from 'next/image';
import { useAuthStore } from '@/store/authStore';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
  className?: string;
}

export default function Header({ toggleSidebar, isSidebarOpen, className }: HeaderProps) {
  const { user } = useAuthStore();

  return (
    <header className={`bg-white border-b border-gray-200 shadow-3xl ${className}`}>
      <div className="flex items-center h-14">
        {/* Menu Hamburger */}
        <button 
          onClick={toggleSidebar}
          className="p-4 hover:bg-gray-100 rounded-lg transition-colors duration-200"
          aria-label={isSidebarOpen ? "Fermer le menu" : "Ouvrir le menu"}>
          <Menu size={20} className="text-gray-800" />
        </button>

        {/* Barre de recherche */}
        <div className="flex-1 flex items-center px-4">
          <div className="relative w-full max-w-[310px]">
            <input 
              type="text" 
              placeholder="Rechercher" 
              className="w-full pl-4 text-slate-500 font-sofia-regular font-light pr-10 py-2 text-sm border border-orange-200 rounded-2xl focus:outline-none focus:border-orange-300"
            />
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#9E9E9E]" size={20} />
          </div>
        </div>

        {/* Icones  à droite */}
        <div className="flex items-center px-4 space-x-8">
          {/* <button className="relative">
            <Image src="/icons/header/notification.png" alt="notification" width={24} height={24} className="text-gray-600" /> 
          </button>
          
          <button className="relative">
            <Image src="/icons/header/mail.png" alt="Mail" width={24} height={24} className="text-gray-600" />
          </button>

          <button className="relative">
            <Image src="/icons/header/setting.png" alt="Settings" width={24} height={24} className="text-gray-600" /> 
          </button> */}

          {/* Menu Utilisateur */}
          <div className="flex items-center pl-2">
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="text-sm text-gray-700">{user?.fullname || 'Utilisateur'}</span> 
              </div>
              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden">
                <Image 
                  src={user?.image || "/icons/header/default-avatar.png"} 
                  alt={user?.fullname || "Utilisateur"} 
                  width={24} 
                  height={24} 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 