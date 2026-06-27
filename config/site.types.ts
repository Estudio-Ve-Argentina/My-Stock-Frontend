export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export type Localized<T = string> = Record<Locale, T>;

export type PlanId = "free" | "pro-monthly" | "pro-annual";

export interface Plan {
  id: PlanId;
  name: Localized;
  priceUsd: number;
  productLimit: number;
  durationDays: number;
  features: Localized<string[]>;
}

export interface AuthResponse {
  username: string;
  message: string;
  jwtToken: string;
  refreshToken: string;
  status: boolean;
}

export interface UserMeResponse {
  id: number;
  name: string;
  lastName: string;
  username: string;
  planName: string;
  maxProducts: number;
  roles: string[];
  emailVerified: boolean;
  hasPassword: boolean;
}

export interface UserDetailResponse {
  name: string;
  lastName: string;
  username: string;
  planName: string;
  planExpiresAt: string | null;
  autoRenew: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  stock: number;
  active: boolean;
  minStock: number;
  lowStock: boolean;
  categoryId: number | null;
  categoryName: string | null;
  userId: number;
  user: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  stock: number;
  userId: number;
  categoryId?: number | null;
  minStock?: number;
}

export interface CategoryResponse {
  id: number;
  name: string;
}

export interface CategoryRequest {
  name: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type BackendMovementType =
  | "STOCK_UPDATE"
  | "PRODUCT_CREATED"
  | "PRODUCT_MODIFIED"
  | "PRODUCT_DELETED";

export type MovementType = "created" | "increased" | "decreased" | "modified" | "deleted";

export interface Movement {
  id: number;
  productName: string;
  type: MovementType;
  quantity: number;
  at: string;
}

export interface StockMovementResponse {
  id: number;
  productName: string;
  productId: number | null;
  quantity: number;
  movementType: BackendMovementType;
  createdAt: string;
}

export interface PlanResponse {
  id: number;
  name: string;
  maxProducts: number;
  price: number;
  durationDays: number;
}
