 
import { api } from './api';

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
  return api.get<User[]>(USERS_ENDPOINT, true);
};

/**
 * Récupère un utilisateur par son ID
 */
export const getUserById = async (id: string): Promise<User> => {
  return api.get<User>(`${USERS_ENDPOINT}/${id}`, true);
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
  const formData = new FormData();
  formData.append('fullname', String(data.fullname));
  formData.append('email', String(data.email));
  if (data.phone) formData.append('phone', data.phone);
  if (data.address) formData.append('address', String(data.address));
  formData.append('role', String(data.role));
  if (data.image) formData.append('image', data.image);
  return api.post<User>(USERS_ENDPOINT, formData, true);
};

 
export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const formData = new FormData();
  
   
  formData.append('id', id);
  
 
  if (data.fullname !== undefined) formData.append('fullname', data.fullname);
  if (data.email !== undefined) formData.append('email', data.email);
  if (data.phone !== undefined) formData.append('phone', data.phone);
  if (data.address !== undefined) formData.append('address', data.address);
  if (data.role !== undefined) formData.append('role', data.role);
  if (data.type !== undefined) formData.append('type', data.type);
  if (data.restaurant !== undefined) formData.append('restaurant', data.restaurant);
  
  return api.patch<User>(USERS_ENDPOINT, formData, true);
};
 
export const updateUserJSON = async (id: string, data: Partial<User>): Promise<User> => {
 
  const cleanData: Partial<User> = {};
  
   cleanData.id = id;
  
   if (data.fullname !== undefined) cleanData.fullname = data.fullname;
  if (data.email !== undefined) cleanData.email = data.email;
  if (data.phone !== undefined) cleanData.phone = data.phone;
  if (data.address !== undefined) cleanData.address = data.address;
  if (data.role !== undefined) cleanData.role = data.role;
  if (data.type !== undefined) cleanData.type = data.type;
  if (data.restaurant !== undefined) cleanData.restaurant = data.restaurant;
  
   return api.patch<User>(USERS_ENDPOINT, cleanData, true);
};

 
export const updateUserWithImage = async (id: string, formData: FormData): Promise<User> => {
   if (!formData.has('id')) {
    formData.append('id', id);
  }
  
   return api.patch<User>(USERS_ENDPOINT, formData, true);
};

export const deleteUser = async (id: string): Promise<void> => {
  return api.delete<void>(`${USERS_ENDPOINT}/${id}`, true);
};
