export interface Admin {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  userId: string;
  type: "USER" | "VENDOR";
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  status: "ACTIVE" | "BLOCKED";
  isMobileVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  totalUsers: number;
  totalVendors: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginResponse {
  access_token: string;
  admin: Admin;
}
