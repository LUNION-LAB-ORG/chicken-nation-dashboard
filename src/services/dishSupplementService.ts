 

import { API_URL } from '@/config';
import { API_ENDPOINTS } from '@/constants/menuConstants';
 
export const getSupplementsByDishId = async (dishId: string): Promise<any[]> => {
  try {
     const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
     const endpoint = `${API_URL}${API_ENDPOINTS.DISH_SUPPLEMENTS}?dish_id=${dishId}`;
    
    const response = await fetch(endpoint, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[getSupplementsByDishId] Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur: ${response.status} - ${errorText.substring(0, 100)}`);
    }
    
    const data = await response.json();
    const result = data.data || [];
    console.log(`[getSupplementsByDishId] ${result.length} suppléments trouvés:`, result);
    return result;
  } catch (error) {
    console.error(`[getSupplementsByDishId] Erreur lors de la récupération des suppléments pour le plat ${dishId}:`, error);
    throw error;
  }
};

 
export const addSupplementToDish = async (
  dishId: string, 
  supplementId: string, 
  quantity: number = 1
): Promise<any> => {
  try {
     const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}${API_ENDPOINTS.DISH_SUPPLEMENTS}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        dish_id: dishId,
        supplement_id: supplementId,
        quantity: quantity
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Erreur lors de l'ajout du supplément ${supplementId} au plat ${dishId}:`, error);
    throw error;
  }
};
 
export const removeSupplementFromDish = async (relationId: string): Promise<void> => {
  try {
    // Récupérer le token d'authentification
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
     const response = await fetch(`${API_URL}${API_ENDPOINTS.DISH_SUPPLEMENTS}/${relationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
     if (response.status === 404) {
      console.log(`Relation ${relationId} déjà supprimée ou inexistante, considéré comme un succès.`);
      return;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur ${response.status} lors de la suppression du supplément:`, errorText);
      throw new Error(`Erreur: ${response.status}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la relation plat-supplément ${relationId}:`, error);
    throw error;
  }
};
 
 
export const deleteDishSupplementRelation = async (relationId: string): Promise<void> => {
  try {
    // Récupérer le token d'authentification
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}${API_ENDPOINTS.DISH_SUPPLEMENTS}/${relationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur ${response.status}:`, errorText);
      throw new Error(`Erreur: ${response.status}`);
    }
  } catch (error) {
    console.error(`Erreur lors de la suppression de la relation plat-supplément ${relationId}:`, error);
    throw error;
  }
};

 
export const updateDishSupplements = async (
  dishId: string,
  currentSupplements: Array<{ id: string; quantity: number; relationId?: string }>,
  newSupplements: Array<{ id: string; quantity: number }>
): Promise<{ added: any[], removed: any[], updated: any[] }> => {
  try {
 

     const uniqueCurrentSupplements = Array.from(
      new Map(currentSupplements.map(s => [s.id, s])).values()
    );
    
    if (uniqueCurrentSupplements.length !== currentSupplements.length) {
  
    }
    
     const uniqueNewSupplements = Array.from(
      new Map(newSupplements.map(s => [s.id, s])).values()
    );
    
    if (uniqueNewSupplements.length !== newSupplements.length) {
      
    }

     const currentMap = new Map(
      uniqueCurrentSupplements.map(s => [s.id, s.quantity])
    );
    
    const newMap = new Map(
      uniqueNewSupplements.map(s => [s.id, s.quantity])
    );
    
  

     const supplementsToAdd = uniqueNewSupplements.filter(
      newSup => !currentMap.has(newSup.id)
    );
  
    const supplementsToRemove = uniqueCurrentSupplements.filter(
      currentSup => !newMap.has(currentSup.id)
    );
    
    const supplementsToUpdate = uniqueNewSupplements.filter(newSup => {
      const currentQuantity = currentMap.get(newSup.id);
      return currentQuantity !== undefined && currentQuantity !== newSup.quantity;
    }); 
    
    const existingRelations = await getSupplementsByDishId(dishId); 
     
    const relationsToUse = existingRelations.length > 0 
      ? existingRelations 
      : currentSupplements.map(s => ({
          id: s.relationId,
          supplement_id: s.id,
          dish_id: dishId,
          quantity: s.quantity
        }));
    
 
    const uniqueExistingRelations = Array.from(
      new Map(relationsToUse
        .filter(r => r.supplement_id || (r.supplement && r.supplement.id))
        .map(r => {
          const supplementId = r.supplement_id || (r.supplement && r.supplement.id);
          return [supplementId, r];
        })
      ).values()
    );
    
    if (uniqueExistingRelations.length !== relationsToUse.length) {
    
      
       const duplicateRelations = relationsToUse.filter(r => {
        const supplementId = r.supplement_id || (r.supplement && r.supplement.id);
        if (!supplementId) return false;
        
         const count = relationsToUse.filter(rel => {
          const relSupplementId = rel.supplement_id || (rel.supplement && rel.supplement.id);
          return relSupplementId === supplementId;
        }).length; 

        if (count > 1) {
          const isKept = uniqueExistingRelations.some(uniqueRel => {
            return uniqueRel.id === r.id;
          });
          return !isKept;
        }
        
        return false;
      });
      
     
      const removeDuplicatesPromises = duplicateRelations.map(relation => {
        if (relation.id) {
           return removeSupplementFromDish(relation.id);
        }
        return Promise.resolve();
      });
      
     
      await Promise.all(removeDuplicatesPromises);
      
    }

    
    const addPromises = supplementsToAdd.map(supplement => 
      addSupplementToDish(dishId, supplement.id, supplement.quantity)
    );
    
  
    const removePromises = supplementsToRemove.map(supplement => {
     
      const relation = uniqueExistingRelations.find(
        r => (r.supplement_id === supplement.id) || 
             (r.supplement && r.supplement.id === supplement.id)
      );
      
      if (relation && relation.id) {
         return removeSupplementFromDish(relation.id);
      } else {
         return Promise.resolve({ error: `Relation non trouvée pour le supplément ${supplement.id}` });
      }
    });
    
    // Mettre à jour les quantités des suppléments existants
    const updatePromises = supplementsToUpdate.map(supplement => {
      // Trouver l'ID de la relation à mettre à jour
      const relation = uniqueExistingRelations.find(
        r => (r.supplement_id === supplement.id) || 
             (r.supplement && r.supplement.id === supplement.id)
      );
      
      if (relation && relation.id) {
        
        return updateSupplementQuantity(relation.id, supplement.quantity);
      } else {
        
        return Promise.resolve({ error: `Relation non trouvée pour la mise à jour du supplément ${supplement.id}` });
      }
    });

    // Exécuter toutes les opérations en parallèle
    const [addResults, removeResults, updateResults] = await Promise.all([
      Promise.all(addPromises),
      Promise.all(removePromises),
      Promise.all(updatePromises)
    ]);

  
    return {
      added: addResults,
      removed: removeResults,
      updated: updateResults
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour des relations plat-suppléments:', error);
    throw error;
  }
};
 
export const updateSupplementQuantity = async (
  relationId: string,
  quantity: number
): Promise<any> => {
  try {
    
    
    // Récupérer le token d'authentification
    const authData = localStorage.getItem('chicken-nation-auth');
    if (!authData) {
      throw new Error('Authentication required');
    }
    
    const parsedData = JSON.parse(authData);
    const token = parsedData?.state?.accessToken;
    
    if (!token) {
      throw new Error('Authentication token not found');
    }
    
    const response = await fetch(`${API_URL}${API_ENDPOINTS.DISH_SUPPLEMENTS}/${relationId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        quantity
      })
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Erreur ${response.status} lors de la mise à jour de la quantité:`, errorText);
      throw new Error(`Erreur: ${response.status}`);
    }
    
    const data = await response.json();
  
    return data;
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la quantité du supplément:', error);
    throw error;
  }
};
