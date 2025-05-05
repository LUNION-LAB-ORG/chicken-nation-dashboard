 import { betterApiClient } from './betterApiClient';

const USERS_ENDPOINT = '/users';

export interface User {
  password?: string;
  id: string;
  email: string;
  fullname: string;
  name?: string;
  phone?: string;
  address?: string;
  role: string;
  type?: string;
  restaurant?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateUserDto {
  email: string;
  fullname: string;
  phone?: string;
  address?: string;
  password: string;
  role: string;
  type?: string;
  restaurant?: string;
}

export interface UpdateUserDto {
  email?: string;
  fullname?: string;
  password?: string;
  role?: string;
  type?: string;
  restaurant?: string;
}

/**
 * Récupère tous les utilisateurs
 */
export const getAllUsers = async (): Promise<User[]> => {
  try {
    return await betterApiClient.get<User[]>(USERS_ENDPOINT);
  } catch (error) {
    console.error('[API] Erreur lors de la récupération des utilisateurs:', error);
    throw error;
  }
};

/**
 * Récupère un utilisateur par son ID
 */
export const getUserById = async (id: string): Promise<User> => {
  try {
    return await betterApiClient.get<User>(`${USERS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`[API] Erreur lors de la récupération de l'utilisateur ${id}:`, error);
    throw error;
  }
};

/**
 * Crée un nouvel utilisateur
 */
export async function createUser(data: {
  fullname: string;
  email: string;
  phone?: string;
  address?: string;
  image?: File;
  role: string;
}) {
  try {
    const formData = new FormData();
    formData.append('fullname', String(data.fullname));
    formData.append('email', String(data.email));
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', String(data.address));
    formData.append('role', String(data.role));
    if (data.image) formData.append('image', data.image);
    
    return await betterApiClient.postFormData<User>(USERS_ENDPOINT, formData);
  } catch (error) {
    console.error("[API] Erreur lors de la création de l'utilisateur:", error);
    throw error;
  }
}

/**
 * Met à jour un utilisateur avec FormData
 */
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    const formData = new FormData();
    
    if (data.fullname !== undefined) formData.append('fullname', data.fullname);
    if (data.email !== undefined) formData.append('email', data.email);
    if (data.phone !== undefined) formData.append('phone', data.phone);
    if (data.address !== undefined) formData.append('address', data.address);
    if (data.role !== undefined) formData.append('role', data.role);
    if (data.type !== undefined) formData.append('type', data.type);
    if (data.restaurant !== undefined) formData.append('restaurant', data.restaurant);
    
    return await betterApiClient.postFormData<User>(`${USERS_ENDPOINT}/${id}`, formData);
  } catch (error) {
    console.error(`[API] Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
    throw error;
  }
};

/**
 * Met à jour un utilisateur avec JSON
 */
export const updateUserJSON = async (id: string, data: Partial<User>): Promise<User> => {
  try {
    const cleanData: Partial<User> = {};
    
    if (data.fullname !== undefined) cleanData.fullname = data.fullname;
    if (data.email !== undefined) cleanData.email = data.email;
    if (data.phone !== undefined) cleanData.phone = data.phone;
    if (data.address !== undefined) cleanData.address = data.address;
    if (data.role !== undefined) cleanData.role = data.role;
    if (data.type !== undefined) cleanData.type = data.type;
    if (data.restaurant !== undefined) cleanData.restaurant = data.restaurant;
    
    return await betterApiClient.patch<User>(`${USERS_ENDPOINT}/${id}`, cleanData);
  } catch (error) {
    console.error(`[API] Erreur lors de la mise à jour de l'utilisateur ${id}:`, error);
    throw error;
  }
};

/**
 * Met à jour un utilisateur avec une image
 */
export const updateUserWithImage = async (id: string, formData: FormData): Promise<User> => {
  try {
    // Ne pas ajouter l'ID dans le formData, il doit être dans l'URL
    if (formData.has('id')) {
      formData.delete('id');
    }
    
    return await betterApiClient.postFormData<User>(`${USERS_ENDPOINT}/${id}`, formData);
  } catch (error) {
    console.error(`[API] Erreur lors de la mise à jour de l'utilisateur ${id} avec image:`, error);
    throw error;
  }
};

/**
 * Supprime un utilisateur
 */
export const deleteUser = async (id: string): Promise<void> => {
  try {
    return await betterApiClient.delete<void>(`${USERS_ENDPOINT}/${id}`);
  } catch (error) {
    console.error(`[API] Erreur lors de la suppression de l'utilisateur ${id}:`, error);
    throw error;
  }
};
