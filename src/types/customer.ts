// Types pour les clients

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'NEW';

export interface Customer {
  id: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  phone?: string;
  addresses?: any[];
  image?: string | null;
  created_at: string;
  updated_at: string;
  entity_status: CustomerStatus;
  birth_day?: string | null;
  [key: string]: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalItems: number;
    itemCount: number;
    itemsPerPage: number;
    totalPages: number;
    currentPage: number;
  };
}
