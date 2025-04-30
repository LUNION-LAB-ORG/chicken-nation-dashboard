export interface User {
  id: string;
  fullname: string;
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | string;
  type?: 'BACKOFFICE' | 'CUSTOMER' | string;
  phone?: string;
  address?: string;
  image?: string | null;
  entity_status?: string;
  created_at?: string;
  updated_at?: string;
  restaurant_id?: string | null;
  password_is_updated?: boolean;
 
  [key: string]: any;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  user?: User;
  accessToken?: string;
  token?: string; 
  refreshToken: string;
 
  id?: string;
  email?: string;
  fullname?: string;
  role?: string;
  type?: string;
 
  [key: string]: any;
}

export interface RefreshTokenResponse {
  accessToken?: string;
  token?: string; 
}
