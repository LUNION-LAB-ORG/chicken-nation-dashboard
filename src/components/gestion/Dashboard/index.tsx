import React from 'react';
import { DollarSign, Users, ShoppingBag } from 'lucide-react';
import './Dashboard.css';
import RevenueChart from './RevenueChart';
import ProductItem from './ProductItem';
import ProgressSection from './ProgressSection';
import DashboardPageHeader from '@/components/ui/DashboardPageHeader';
import { GenericStatCard } from './GenericStatCard';  
import WeeklyOrdersChart from './WeeklyOrdersChart';  

const Dashboard = () => {
  const revenueData = [
    { name: 'Jan', value: 120000 },
    { name: 'Fév', value: 150000 },
    { name: 'Mar', value: 180000 },
    { name: 'Avr', value: 170000 },
    { name: 'Mai', value: 190000 },
    { name: 'Juin', value: 210000 },
  ];



  const topProducts = [
    {
      name: 'Creamy Parmesan Cheese with Chicken Teriyaki Egg',
      price: '46% des personnes intéressées',
      image: '/images/food1.png',
      progress: 75
    },
    {
      name: 'Creamy Parmesan Cheese with Chicken Teriyaki Egg',
      price: '46% des personnes intéressées',
      image: '/images/food1.png',
      progress: 65
    },
    {
      name: 'Creamy Parmesan Cheese with Chicken Teriyaki Egg',
      price: '46% des personnes intéressées',
      image: '/images/food1.png',
      progress: 45
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <DashboardPageHeader
        mode="list"
        title="Tableau de bord"
      />
      <div className="dashboard-container">
        <div className="stats-grid">
          <GenericStatCard
            title="Objectif : 267.000.000 xof"
            value="145.000.000"
            unit="XOF"
            badgeText="Chiffre d'affaires"
            badgeColor="#EA4335"
            icon={DollarSign}
            iconColor="#EA4335"
          />
          <GenericStatCard
            title="Reste : 89 à vendre"
            value="256 vendus"
            badgeText="Menus vendus"
            badgeColor="#F17922"
            icon={DollarSign}
            iconColor="#F17922"
            trend={{ value: 8, isPositive: true }}
          />
          <GenericStatCard
            title="199 commandes"
            value=" "
            badgeText="Total de commandes"
            badgeColor="#4FCB71"
            icon={ShoppingBag}
            iconColor="#F17922"
          />
          <GenericStatCard
            title="Clients"
            value="45"
            badgeText="Nombre de clients"
            badgeColor="#007AFF"
            icon={Users}
            iconColor="#007AFF"

          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <RevenueChart data={revenueData} />
          <WeeklyOrdersChart />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="products-list">
            <h3 className="chart-title mb-4">Revenu des produits (par jour)</h3>
            {topProducts.map((product, index) => (
              <ProductItem key={index} {...product} />
            ))}
          </div>
          <ProgressSection />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;