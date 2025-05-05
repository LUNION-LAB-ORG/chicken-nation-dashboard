import React, { useEffect } from 'react';
import './Dashboard.css';
import RevenueChart from './RevenueChart'; 
import DashboardPageHeader from '@/components/ui/DashboardPageHeader';
import { GenericStatCard } from './GenericStatCard';  
import WeeklyOrdersChart from './WeeklyOrdersChart';  
import BestSalesChart from './BestSalesChart';
import DailySales from './DailySales';

const Dashboard = () => {
  useEffect(() => {
    try {
      const authRaw = localStorage.getItem('chicken-nation-auth');
      if (authRaw) {
        const parsed = JSON.parse(authRaw);
        const token = parsed?.state?.accessToken;
        console.log('TOKEN ACTUEL (localStorage):', token);
      } else {
        console.log('Aucun token trouvé dans le localStorage.');
      }
    } catch (err) {
      console.error('Erreur lors de la lecture du token:', err);
    }
  }, []);

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

  const bestSalesData = [
    {
      id: '1',
      name: 'Creamy Parmesan Cheese with Chicken Teriyaki Egg',
      count: 32,
      image: '/images/food1.png',
      percentage: 75,
      interestedPercentage: '46% des personnes intéressées'
    },
    {
      id: '2',
      name: 'Creamy Parmesan Cheese with Chicken Teriyaki Egg',
      count: 32,
      image: '/images/food1.png',
      percentage: 65,
      interestedPercentage: '46% des personnes intéressées'
    },
    {
      id: '3',
      name: 'Creamy Parmesan Cheese with Chicken Teriyaki Egg',
      count: 32,
      image: '/images/food1.png',
      percentage: 45,
      interestedPercentage: '46% des personnes intéressées'
    },
  ];

  return (
    <div className="flex-1 overflow-auto p-6">
      <div className='-mt-10'>
        <DashboardPageHeader
          mode="list"
          title="Tableau de bord"
        />
      </div>
      <div className="dashboard-container">
        <div className="grid lg:grid-cols-4 lg:gap-10 md:grid-cols-2 grid-cols-1 gap-6">
          <GenericStatCard
            title=""
            value="145.000.000"
            unit="xof"
            badgeText="Revenu mensuel total"
            badgeColor="#EA4335"
            iconImage="/icons/circle.png"
            objective={{
              value: "Objectif : 267.000.000 xof",
              percentage: 77
            }}
          />
          <GenericStatCard
            title=""
            value="256 vendus" 
            badgeText="Menus vendus"
            badgeColor="#F17922"
            iconImage="/icons/circle.png"
            objective={{
              value: "Reste : 89 à vendre",
              percentage: 85
            }}
          />
          <GenericStatCard
            title=""
            value="199 commandes"
            badgeText="Total de commandes"
            badgeColor="#4FCB71"
            iconImage="/icons/market.png"
          />
          <GenericStatCard
            title=""
            value="88 clients"
            badgeText="Nombre de clients"
            badgeColor="#007AFF"
            iconImage="/icons/client.png"
          />
        </div>

        <div className="grid lg:grid-cols-2 gap-10 mt-3 grid-cols-1">
          <RevenueChart data={revenueData} />
          <WeeklyOrdersChart />
        </div>
        <div className="grid grid-cols-1 mt-3">
          <BestSalesChart title="Résumé des menus les plus vendus" items={bestSalesData} />
        </div>
        <div className="lg:grid grid-cols-2 mt-2">
          <DailySales />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;