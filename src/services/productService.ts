import { betterApiClient } from './betterApiClient';

 
const DISHES_ENDPOINT = '/dishes';

 
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  available?: boolean;
 
  quantity?: number;
  stock?: number;
  totalValue?: number;
}

 
export interface CreateProductDto {
  name: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  available?: boolean;
}

 
export interface UpdateProductDto {
  name?: string;
  description?: string;
  price?: number;
  image?: string;
  category?: string;
  available?: boolean;
}

 
export const getAllProducts = async (): Promise<Product[]> => {
  return betterApiClient.get<Product[]>(DISHES_ENDPOINT);
};

 
export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => { 
  const products = await getAllProducts();
  return products.filter(product => product.category === categoryId);
};

 
export const getProductById = async (id: string): Promise<Product> => {
  return betterApiClient.get<Product>(`${DISHES_ENDPOINT}/${id}`); 
};
 
export const createProduct = async (product: CreateProductDto): Promise<Product> => {
  return betterApiClient.post<Product>(DISHES_ENDPOINT, product);
};

 
export const updateProduct = async (id: string, product: UpdateProductDto): Promise<Product> => {
  return betterApiClient.patch<Product>(`${DISHES_ENDPOINT}/${id}`, product); 
};

 
export const deleteProduct = async (id: string): Promise<void> => {
  return betterApiClient.delete<void>(`${DISHES_ENDPOINT}/${id}`);
};
 
export const updateProductStock = async (id: string, quantity: number): Promise<Product> => {
  
  return betterApiClient.patch<Product>(`${DISHES_ENDPOINT}/${id}`, { stock: quantity }); 
};
