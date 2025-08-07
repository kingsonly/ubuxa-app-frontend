export interface Store {
  id: string;
  name: string;
  type: string;
  image: string;
  capacity: string;
  value: number;
}

export type StoreType = 'MAIN' | 'REGIONAL' | 'SUB REGIONAL';



// Enums
export enum StoreClass {
  MAIN = 'MAIN',
  BRANCH = 'BRANCH',
  OUTLET = 'OUTLET',
}

export enum UserStatus {
  active = 'active',
  inactive = 'inactive',
  suspended = 'suspended',
  // Add more if your backend defines more statuses
}

// Payloads
export interface CreateStorePayload {
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  classification?: StoreClass;
  isActive?: boolean;
}

export interface UpdateStorePayload {
  name?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  classification?: StoreClass;
  isActive?: boolean;
}

// Full Store object from backend
export interface StoreResponse {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  classification: StoreClass;
  isActive: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

// Assign user to store
export interface AssignUserStorePayload {
  userId: string;
  storeId: string;
}

// Store-related user response
export interface StoreUserResponse {
  id: string;
  firstname: string;
  lastname: string;
  username?: string;
  email: string;
  phone?: string;
  status: UserStatus;
  createdAt: string;
  assignedStore?: {
    id: string;
    name: string;
  };
  role?: {
    id: string;
    role: string;
  };
  userTenantId: string;
}
