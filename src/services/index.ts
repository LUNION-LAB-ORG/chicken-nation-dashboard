 
// Exporter tous les services
export { betterApiClient } from './betterApiClient';
export * from './authService';
export * from './categoryService';
export * from './dishRestaurantService';
export * from './dishService';
export * from './dishSupplementService';
export * from './menuService';
export * from './productService';
export * from './restaurantService';
export * from './supplementService';
export * from './userService';
export * from './customerService';

// Re-export des interfaces pour faciliter l'importation
export type { Category, CreateCategoryDto, UpdateCategoryDto } from './categoryService';
export type { Product, CreateProductDto, UpdateProductDto } from './productService';
export type { AuthResponse, RefreshTokenResponse } from './authService';
export type { User, CreateUserDto, UpdateUserDto } from './userService';
