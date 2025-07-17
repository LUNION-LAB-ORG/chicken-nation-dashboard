// --- Dashboard Service pour les statistiques ---

import { api } from './api';

// Types pour les statistiques du dashboard
export interface DashboardStats {
  revenue: {
    value: string;
    objective: string;
    percentage: number;
  };
  menusSold: {
    value: string;
    objective: string;
    percentage: number;
  };
  orders: {
    value: string;
  };
  clients: {
    value: string;
  };
}

export interface RevenueData {
  name: string;
  value: number;
}

export interface WeeklyOrdersData {
  name: string;
  value: number;
}

// Types pour la réponse API des statistiques (structure réelle)
export interface ApiDashboardResponse {
  stats: {
    revenue: {
      title: string;
      value: string;
      unit: string;
      badgeText: string;
      badgeColor: string;
      iconImage: string;
    };
    menusSold: {
      title: string;
      value: string;
      badgeText: string;
      badgeColor: string;
      iconImage: string;
    };
    totalOrders: {
      title: string;
      value: string;
      badgeText: string;
      badgeColor: string;
      iconImage: string;
    };
    totalCustomers: {
      title: string;
      value: string;
      badgeText: string;
      badgeColor: string;
      iconImage: string;
    };
  };
  revenue: {
    dailyData: {
      total: string;
      trend: {
        percentage: string;
        comparedTo: string;
        isPositive: boolean;
      };
    };
  };
  weeklyOrders: {
    dateRanges: string[];
    currentRange: string;
    dailyOrders: Array<{
      day: string;
      count: number;
    }>;
  };
  bestSellingMenus: Array<{
    id?: string;
    name?: string;
    count?: number;
    image?: string;
    percentage?: number;
  }>;
  dailySales: {
    title: string;
    subtitle: string;
    categories: Array<{
      label: string;
      value: string;
      color: string;
      percentage: number;
    }>;
  };
}

// Interface pour les paramètres de requête
export interface DashboardStatsParams {
  restaurantId?: string;
  startDate?: string;
  endDate?: string;
  period?: 'today' | 'week' | 'month' | 'lastMonth' | 'year';
  dateRange?: string; // ✅ Ajouter le paramètre dateRange
}

export interface BestSalesItem {
  id: string;
  name: string;
  count: number;
  image: string;
  percentage: number;
  interestedPercentage: string;
}

export interface DailySalesData {
  label: string;
  value: string;
  color: string;
  percentage: number;
}

// Fonction pour récupérer les vraies statistiques depuis l'API
export async function getApiDashboardStats(params: DashboardStatsParams = {}): Promise<ApiDashboardResponse> {
  try {
    // Construire les paramètres de requête
    const queryParams = new URLSearchParams();

    if (params.restaurantId) {
      queryParams.append('restaurantId', params.restaurantId);
    }

    // ✅ Gérer la conversion des périodes
    let finalPeriod = params.period;
    let startDate = params.startDate;
    let endDate = params.endDate;

    if (params.period) {
      const convertedParams = convertPeriodToApiParams(params.period);
      finalPeriod = convertedParams.period;
      
      // Utiliser les dates converties si elles existent
      if (convertedParams.startDate && !params.startDate) {
        startDate = convertedParams.startDate;
      }
      if (convertedParams.endDate && !params.endDate) {
        endDate = convertedParams.endDate;
      }
    }

    if (startDate) {
      queryParams.append('startDate', startDate);
    }

    if (endDate) {
      queryParams.append('endDate', endDate);
    }

    if (finalPeriod) {
      queryParams.append('period', finalPeriod);
    }

    // Construire l'endpoint avec les paramètres
    const endpoint = `/statistics/dashboard${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

   
    // Effectuer la requête
    const response = await api.get<ApiDashboardResponse>(endpoint);

 

    return response;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des statistiques API:', error);
    throw error;
  }
}

// Fonction pour transformer les données API en format DashboardStats
export function transformApiDataToDashboardStats(apiData: ApiDashboardResponse): DashboardStats {
  try {
   
    // Les valeurs de l'API sont déjà formatées, on les utilise directement
    const revenueValue = apiData.stats.revenue.value || "0";
    const menusSoldValue = apiData.stats.menusSold.value || "0";
    let ordersValue = apiData.stats.totalOrders.value || "0";
    const clientsValue = apiData.stats.totalCustomers.value || "0";

    // Si les commandes sont à 0, essayer d'extraire depuis weeklyOrders
    if (ordersValue === "0" && apiData.weeklyOrders && apiData.weeklyOrders.dailyOrders) {
      const totalOrders = apiData.weeklyOrders.dailyOrders.reduce((sum, day) => sum + day.count, 0);
      if (totalOrders > 0) {
        ordersValue = totalOrders.toString();
        console.log('💡 Commandes extraites de weeklyOrders:', totalOrders);
      }
    }

    
    // Extraire les pourcentages depuis les badges (ex: "0.0%" -> 0)
    const revenuePercentage = parseFloat(apiData.stats.revenue.badgeText.replace('%', '')) || 0;
    const menuPercentage = parseFloat(apiData.stats.menusSold.badgeText.replace('%', '')) || 0;

    // Pour les objectifs, on utilise les valeurs numériques pour calculer
    let revenueNumeric = parseInt(revenueValue.replace(/[^\d]/g, '')) || 0;
    const menuNumeric = parseInt(menusSoldValue.replace(/[^\d]/g, '')) || 0;

    // Si les stats principales sont à 0, essayer d'extraire des données de dailySales
    if (revenueNumeric === 0 && apiData.dailySales && apiData.dailySales.subtitle) {
      const dailySalesMatch = apiData.dailySales.subtitle.match(/(\d[\d\s]*)/);
      if (dailySalesMatch) {
        revenueNumeric = parseInt(dailySalesMatch[1].replace(/\s/g, '')) || 0;
         
      }
    }

    // Aussi essayer d'extraire depuis les catégories de dailySales
    if (revenueNumeric === 0 && apiData.dailySales && apiData.dailySales.categories && apiData.dailySales.categories.length > 0) {
      let totalFromCategories = 0;
      apiData.dailySales.categories.forEach(category => {
        const categoryMatch = category.value.match(/(\d[\d\s]*)/);
        if (categoryMatch) {
          totalFromCategories += parseInt(categoryMatch[1].replace(/\s/g, '')) || 0;
        }
      });
      if (totalFromCategories > 0) {
        revenueNumeric = totalFromCategories;
         
      }
    }

    const revenueObjective = revenuePercentage > 0 ? Math.round(revenueNumeric / (revenuePercentage / 100)) : 25000000;
    const menuObjective = menuPercentage > 0 ? Math.round(menuNumeric / (menuPercentage / 100)) : 200;

    const finalResult = {
      revenue: {
        value: revenueNumeric > 0 ? `${formatCurrency(revenueNumeric)}` : "0",
        objective: `Objectif : ${formatCurrency(revenueObjective)} xof`,
        percentage: Math.round(revenuePercentage)
      },
      menusSold: {
        value: menuNumeric > 0 ? `${menuNumeric} vendus` : "0 vendus",
        objective: `Reste : ${Math.max(0, menuObjective - menuNumeric)} à vendre`,
        percentage: Math.round(menuPercentage)
      },
      orders: {
        value: ordersValue !== "0" ? `${ordersValue} commandes` : "0 commandes"
      },
      clients: {
        value: clientsValue !== "0" ? `${clientsValue} clients` : "0 clients"
      }
    };

    
    return finalResult;
  } catch (error) {
    console.error('❌ Erreur lors de la transformation des données API:', error);
    throw error;
  }
}



// Calculer les statistiques globales (super admin)
export async function getGlobalDashboardStats(period: 'today' | 'week' | 'month' | 'lastMonth' | 'year' = 'month'): Promise<DashboardStats> {
  try {
    

    // Essayer d'abord de récupérer les vraies données API
    try {
      const apiData = await getApiDashboardStats({
        period // ✅ Utiliser la période passée en paramètre
      });

    
      return transformApiDataToDashboardStats(apiData);
    } catch (apiError) {
      console.error('❌ Échec de récupération API:', apiError);
      throw apiError; // Propager l'erreur au lieu d'utiliser des données simulées
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des stats globales:', error);
    // Retourner des données par défaut en cas d'erreur
    return {
      revenue: { value: "145.000.000", objective: "Objectif : 267.000.000 xof", percentage: 54 },
      menusSold: { value: "1256 vendus", objective: "Reste : 244 à vendre", percentage: 84 },
      orders: { value: "899 commandes" },
      clients: { value: "234 clients" }
    };
  }
}



// Calculer les statistiques pour un restaurant spécifique
export async function getRestaurantDashboardStats(restaurantId: string, period: 'today' | 'week' | 'month' | 'lastMonth' | 'year' = 'month'): Promise<DashboardStats> {
  try {
   
    // Essayer d'abord de récupérer les vraies données API
    try {
      const apiData = await getApiDashboardStats({
        restaurantId,
        period // ✅ Utiliser la période passée en paramètre
      });

   
      return transformApiDataToDashboardStats(apiData);
    } catch (err) {
      console.error('❌ Échec de récupération API:', err);
      throw err; // Propager l'erreur au lieu d'utiliser des données simulées
    }
  } catch (err) {
    console.error('❌ Erreur lors de la récupération des stats du restaurant:', err);
    // Retourner des données par défaut en cas d'erreur
    return {
      revenue: { value: "18.500.000", objective: "Objectif : 25.000.000 xof", percentage: 74 },
      menusSold: { value: "156 vendus", objective: "Reste : 44 à vendre", percentage: 78 },
      orders: { value: "89 commandes" },
      clients: { value: "42 clients" }
    };
  }
}

// Récupérer les données de revenus pour les graphiques depuis l'API
export async function getRevenueData(restaurantId?: string, period: 'today' | 'week' | 'month' | 'lastMonth' | 'year' = 'month'): Promise<RevenueData[]> {
  try {
 

    // Essayer d'abord de récupérer les vraies données API
    try {
      await getApiDashboardStats({
        restaurantId,
        period // ✅ Utiliser la période passée en paramètre
      });

      // Pour l'instant, l'API ne retourne pas de données historiques mensuelles
      // Retourner un tableau vide en attendant l'implémentation côté backend
      console.log('⚠️ Données de revenus historiques non disponibles dans l\'API');
      return [];

    } catch (err) {
      console.error('Erreur lors de la récupération des données de revenu:', err);
      throw err;
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des données de revenus:', error);
    // Retourner des données par défaut
    return restaurantId ? [
      { name: 'Jan', value: 2800000 },
      { name: 'Fév', value: 3200000 },
      { name: 'Mar', value: 2900000 },
      { name: 'Avr', value: 3500000 },
      { name: 'Mai', value: 3800000 },
      { name: 'Juin', value: 3600000 },
    ] : [
      { name: 'Jan', value: 18500000 },
      { name: 'Fév', value: 22000000 },
      { name: 'Mar', value: 19800000 },
      { name: 'Avr', value: 24500000 },
      { name: 'Mai', value: 26800000 },
      { name: 'Juin', value: 25200000 },
    ];
  }
}

// Récupérer les données des commandes hebdomadaires depuis l'API
export async function getWeeklyOrdersData(restaurantId?: string, dateRange?: string): Promise<WeeklyOrdersData[]> {
  try {
    

    // Essayer d'abord de récupérer les vraies données API
    try {
      // ✅ Convertir dateRange en startDate/endDate
      let startDate, endDate;
      if (dateRange) {
        const [start, end] = dateRange.split('_');
        startDate = start;
        endDate = end;
      }



      const apiData = await getApiDashboardStats({
        restaurantId,
        period: 'week',
        startDate, // ✅ Utiliser startDate au lieu de dateRange
        endDate    // ✅ Utiliser endDate au lieu de dateRange
      });



      // Transformer les données API en format WeeklyOrdersData
      if (apiData.weeklyOrders && apiData.weeklyOrders.dailyOrders) {
        const transformedData = apiData.weeklyOrders.dailyOrders.map(dayData => ({
          name: dayData.day.charAt(0).toUpperCase() + dayData.day.slice(1), // Capitaliser
          value: dayData.count
        }));


        return transformedData;
      }

      return [];

    } catch {
      return [];
    }
  } catch {
    return [];
  }
}

// Récupérer les données des meilleures ventes depuis l'API
export async function getBestSalesData(restaurantId?: string, period: 'today' | 'week' | 'month' | 'lastMonth' | 'year' = 'month'): Promise<BestSalesItem[]> {
  try {
    

    // Essayer d'abord de récupérer les vraies données API
    try {
      const apiData = await getApiDashboardStats({
        restaurantId,
        period
      });

      // Transformer les données API en format BestSalesItem
      if (apiData.bestSellingMenus && apiData.bestSellingMenus.length > 0) {
        return apiData.bestSellingMenus.map((menu, index) => ({
          id: menu.id || `menu-${index}`,
          name: menu.name || `Menu ${index + 1}`,
          count: menu.count || 0,
          image: menu.image || '/images/food1.png',
          percentage: menu.percentage || 0,
          interestedPercentage: `${menu.percentage || 0}% des personnes intéressées`
        }));
      }

      console.log('⚠️ Données des meilleures ventes non disponibles');
      return [];

    } catch {
      console.error('❌ Échec de récupération API pour les meilleures ventes');
      return []; // Retourner un tableau vide au lieu de données simulées
    }
  } catch {
    console.error('❌ Erreur lors de la récupération des meilleures ventes');
    return [];
  }
}

// Récupérer les données des ventes journalières depuis l'API
export async function getDailySalesData(restaurantId?: string, period: 'today' | 'week' | 'month' | 'lastMonth' | 'year' = 'today'): Promise<DailySalesData[]> {
  try {
     

    // Essayer d'abord de récupérer les vraies données API
    try {
      const apiData = await getApiDashboardStats({
        restaurantId,
        period
      });

      // Transformer les données API en format DailySalesData
      if (apiData.dailySales && apiData.dailySales.categories) {
        return apiData.dailySales.categories.map(category => ({
          label: category.label,
          value: category.value,
          color: category.color,
          percentage: category.percentage
        }));
      }

      console.log('⚠️ Données des ventes journalières non disponibles');
      return [];

    } catch {
      console.error('❌ Échec de récupération API pour les ventes journalières');
      return []; // Retourner un tableau vide au lieu de données simulées
    }
  } catch {
    console.error('❌ Erreur lors de la récupération des ventes journalières');
    return [];
  }
}

// Fonction utilitaire pour formater les montants
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR').format(amount);
}

// Fonction utilitaire pour convertir les périodes en paramètres API
function convertPeriodToApiParams(period: 'today' | 'week' | 'month' | 'lastMonth' | 'year') {
  const now = new Date();
  
  switch (period) {
    case 'lastMonth': {
      // Calculer les dates du mois précédent
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      
      return {
        period: 'month' as const, // Utiliser 'month' pour l'API
        startDate: lastMonth.toISOString().split('T')[0],
        endDate: endOfLastMonth.toISOString().split('T')[0]
      };
    }
    default:
      return { period };
  }
}
