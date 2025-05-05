import { API_URL } from '@/config';
import { fetchWithAuth } from '@/utils/authUtils';
import { formatImageUrl } from '@/utils/imageHelpers';

 
export interface Supplement {
  id: string;
  name: string;
  price: number;
  category: 'FOOD' | 'DRINK' | 'ACCESSORY';
  image?: string;
  available?: boolean;
  description?: string;
}

 export const getSupplementsByCategory = async (category: string): Promise<Supplement[]> => {
  try {
    // Utiliser fetchWithAuth pour garantir l'authentification
    return await fetchWithAuth<Supplement[]>(`${API_URL}/api/v1/supplements?category=${category}`);
  } catch (error) {
    console.error(`Erreur lors de la récupération des suppléments de catégorie ${category}:`, error);
    throw error;
  }
};

 export const getAllSupplements = async (): Promise<Record<string, Supplement[]>> => {
  try {
    // Utiliser fetchWithAuth pour garantir l'authentification
    return await fetchWithAuth<Record<string, Supplement[]>>(`${API_URL}/api/v1/supplements`);
  } catch (error) {
    console.error('Erreur lors de la récupération des suppléments:', error);
    throw error;
  }
};

 export const convertSupplementsToOptions = (supplements: Supplement[]) => {
  return supplements.map(supplement => ({
    value: supplement.id,
    label: supplement.name,
    price: `${supplement.price} XOF`,
    image: formatImageUrl(supplement.image),
    category: supplement.category
  }));
};
