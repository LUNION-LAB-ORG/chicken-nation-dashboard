 
export interface CreateDishDto {
  name: string;
  description?: string;
  price: number;
  image?: string;
  available?: boolean;
  category_id: string;
  restaurant_ids?: string[];
  supplement_ids?: string[];
}

 
export interface UpdateDishDto extends Partial<CreateDishDto> {}
 
export interface Dish {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  available: boolean;
  category_id: string;
  category?: string;  
  created_at: string;
  updated_at: string; 
  [key: string]: any;
}

 
export interface DishResponse {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  available: boolean;
  category_id: string;
  created_at: string;
  updated_at: string; 
  [key: string]: any;
}
