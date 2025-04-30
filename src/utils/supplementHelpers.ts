 
export enum SupplementType {
  ACCESSORY = 'ACCESSORY', 
  FOOD = 'FOOD',           
  DRINK = 'DRINK',         
  OTHER = 'OTHER'          
}

 
export interface NormalizedSupplement {
  id: string;
  name: string;
  type: SupplementType;
  price?: number;
  image?: string;
  quantity?: number;
  category?: string;
}

 
export interface NormalizedDishSupplement {
  id?: string;               
  supplement_id: string;     
  quantity: number;          
  supplement?: any;          
}

 
export interface GroupedSupplements {
  [SupplementType.ACCESSORY]: NormalizedSupplement[];
  [SupplementType.FOOD]: NormalizedSupplement[];
  [SupplementType.DRINK]: NormalizedSupplement[];
  [SupplementType.OTHER]: NormalizedSupplement[];
}
 
export function determineSupplementType(supplement: any): SupplementType {
 
  if (supplement?.type === SupplementType.ACCESSORY) return SupplementType.ACCESSORY;
  if (supplement?.type === SupplementType.FOOD) return SupplementType.FOOD;
  if (supplement?.type === SupplementType.DRINK) return SupplementType.DRINK;
  
 
  if (supplement?.category === SupplementType.ACCESSORY) return SupplementType.ACCESSORY;
  if (supplement?.category === SupplementType.FOOD) return SupplementType.FOOD;
  if (supplement?.category === SupplementType.DRINK) return SupplementType.DRINK;
 
  if (supplement?.name) {
    const name = supplement.name.toLowerCase();
    if (name.includes('fanta') || name.includes('coca') || name.includes('eau') || 
        name.includes('jus') || name.includes('soda') || name.includes('boisson')) {
      return SupplementType.DRINK;
    }
    
    if (name.includes('frite') || name.includes('riz') || name.includes('salade') || 
        name.includes('accompagnement') || name.includes('garniture')) {
      return SupplementType.FOOD;
    }
    
    return SupplementType.ACCESSORY;
  }
 
  return SupplementType.OTHER;
}

 
export function normalizeSupplementData(supplement: any): NormalizedSupplement {
 
  const id = supplement?.id || supplement?.supplement_id || '';
  
  const name = supplement?.name || 
               (supplement?.supplement && supplement.supplement.name) || 
               '';
  
  const type = determineSupplementType(supplement.supplement || supplement);
 
  const price = supplement?.price || 
                (supplement?.supplement && supplement.supplement.price) || 
                0;
 
  const image = supplement?.image || 
                (supplement?.supplement && supplement.supplement.image) || 
                '/images/plat.png';
 
  const quantity = supplement?.quantity || 1;
 
  const category = supplement?.category || 
                   (supplement?.supplement && supplement.supplement.category) || 
                   '';
  
  return {
    id,
    name,
    type,
    price,
    image,
    quantity,
    category
  };
}
 
export function normalizeDishSupplement(dishSupplement: any): NormalizedDishSupplement {
 
  const id = dishSupplement?.id || '';
  const supplement_id = dishSupplement?.supplement_id || 
                        (dishSupplement?.supplement && dishSupplement.supplement.id) || 
                        '';
 
  const quantity = dishSupplement?.quantity || 1;
  
   const supplement = dishSupplement?.supplement 
    ? normalizeSupplementData(dishSupplement.supplement)
    : undefined;
  
  return {
    id,
    supplement_id,
    quantity,
    supplement
  };
}

 
export function normalizeDishSupplements(dishSupplements: any[]): NormalizedDishSupplement[] {
  if (!Array.isArray(dishSupplements)) return [];
  
  return dishSupplements
    .filter(item => item) 
    .map(normalizeDishSupplement);
}

export function groupSupplementsByType(supplements: NormalizedSupplement[]): GroupedSupplements {
  const result: GroupedSupplements = {
    [SupplementType.ACCESSORY]: [],
    [SupplementType.FOOD]: [],
    [SupplementType.DRINK]: [],
    [SupplementType.OTHER]: []
  };
  
  supplements.forEach(supplement => {
    result[supplement.type].push(supplement);
  });
  
  return result;
}

export function convertToSelectOptions(supplements: NormalizedSupplement[]) {
  return supplements.map(supplement => ({
    value: supplement.id,
    label: supplement.name,
    price: supplement.price ? `${supplement.price} XOF` : undefined,
    image: supplement.image,
    type: supplement.type,
    category: supplement.category
  }));
}
