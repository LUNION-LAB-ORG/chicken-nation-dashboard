"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/gestion/Sidebar";
import Header from "@/components/gestion/Header";
import Dashboard from "@/components/gestion/Dashboard";
import Menus from "@/components/gestion/Menus";
import Orders from "@/components/gestion/Orders";
import Clients from "@/components/gestion/Clients";
import Inventory from "@/components/gestion/Inventory";
import Program from "@/components/gestion/Program";
import Ads from "@/components/gestion/Ads";
import Promos from "@/components/gestion/Promos";
import Loyalty from "@/components/gestion/Loyalty";
import Apps from "@/components/gestion/Apps";
import { useAuthStore } from "@/store/authStore";
import Personnel from "@/components/gestion/Personnel";
import Restaurants from "@/components/gestion/Restaurants";

export default function GestionPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Vérification d'authentification simplifiée
  useEffect(() => {
    // Si l'utilisateur n'est pas authentifié, rediriger vers la page de connexion
    if (!isAuthenticated) {
      router.replace("/");
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1080;
      setIsMobile(mobile);
      if (!mobile) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "menus":
        return <Menus />;
      case "orders":
        return <Orders />;
      case "clients":
        return <Clients setActiveTab={setActiveTab} />;
      case "inventory":
        return <Inventory />;
      case "program":
        return <Program />;
      case "restaurants":
        return <Restaurants />;
      case "personnel":
        return <Personnel />;
      case "ads":
        return <Ads />;
      case "promos":
        return <Promos />;
      case "loyalty":
        return <Loyalty />;
      case "apps":
        return <Apps />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`
        fixed top-0 left-0 h-screen bg-white shadow-lg z-40
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? "w-64" : "w-0"}
        ${isMobile ? "w-0" : ""}
      `}
      >
        <div
          className={`${isSidebarOpen ? "w-64" : "w-0"} overflow-hidden h-full`}
        >
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
      </aside>

      {/* Main content wrapper */}
      <div
        className={`
        flex-1 flex flex-col min-w-0
        transition-all duration-300 ease-in-out
        ${isSidebarOpen && !isMobile ? "ml-64" : ""}
        ${isSidebarOpen && isMobile ? "opacity-50" : "opacity-100"}
      `}
      >
        {/* Fixed Header */}
        <Header
          toggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
          className={`fixed z-30 bg-white ${
            isSidebarOpen && !isMobile ? "left-64" : "left-0"
          } right-0 top-0`}
        />

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto pt-14">
          <div className="container mx-auto px-4 ">{renderContent()}</div>
        </main>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30"
          onClick={toggleSidebar}
        />
      )}
    </div>
  );
}
