export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export type Localized<T = string> = Record<Locale, T>;

export type PlanId = "free" | "pro-monthly" | "pro-annual" | "pro-test";

export interface Plan {
  id: PlanId;
  name: Localized;
  price: number;
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

export type SubscriptionStatus = "PENDING" | "AUTHORIZED" | "PAUSED";

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
  subscriptionStatus: SubscriptionStatus | null;
}

export interface UserDetailResponse {
  name: string;
  lastName: string;
  username: string;
  planName: string;
  subscriptionStatus: SubscriptionStatus | null;
}

export interface SubscriptionResponse {
  subscriptionId: number;
  status: SubscriptionStatus;
  planName: string;
  nextPaymentDate: string;
}

export interface SubscribeResponse {
  subscriptionId: number;
  initPoint: string;
  status: string;
}

export interface BranchStock {
  branchId: number;
  branchName: string;
  stock: number;
  minStock: number;
  lowStock: boolean;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  createdAt: string;
  stock: number;
  active: boolean;
  pinned: boolean;
  minStock: number;
  lowStock: boolean;
  categoryId: number | null;
  categoryName: string | null;
  supplierId: number | null;
  supplierName: string | null;
  branchStocks: BranchStock[];
  userId: number;
  user: string;
}

export interface StockDistribution {
  branchId: number;
  stock: number;
  minStock?: number;
}

export interface ProductRequest {
  name: string;
  description: string;
  stock: number;
  userId: number;
  categoryId?: number | null;
  supplierId?: number | null;
  minStock?: number;
  distributions?: StockDistribution[];
}

export interface CategoryResponse {
  id: number;
  name: string;
}

export interface CategoryRequest {
  name: string;
}

export interface SupplierResponse {
  id: number;
  name: string;
  contact: string;
  email: string | null;
  address: string | null;
}

export interface SupplierRequest {
  name: string;
  contact: string;
  email?: string;
  address?: string;
}

export interface BranchResponse {
  id: number;
  name: string;
  address: string | null;
}

export interface BranchRequest {
  name: string;
  address?: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type SummarySection =
  | "KPI"
  | "CATEGORY_BREAKDOWN"
  | "CRITICAL_STOCK"
  | "TOP_MOVERS"
  | "NO_MOVEMENT"
  | "NEW_PRODUCTS"
  | "MOVEMENT_SUMMARY";

export type BackendMovementType =
  | "STOCK_UPDATE"
  | "PRODUCT_CREATED"
  | "PRODUCT_MODIFIED"
  | "PRODUCT_DELETED";

export type MovementType = "created" | "increased" | "decreased" | "modified" | "deleted";

export type StockReason = "VENTA" | "MERMA" | "DEVOLUCION" | "AJUSTE_CONTEO";

export interface Movement {
  id: number;
  productName: string;
  type: MovementType;
  quantity: number;
  at: string;
  reason: StockReason | null;
  branchName: string | null;
}

export interface StockMovementResponse {
  id: number;
  productName: string;
  productId: number | null;
  quantity: number;
  movementType: BackendMovementType;
  reason: StockReason | null;
  branchName: string | null;
  createdAt: string;
}

export interface PlanResponse {
  id: number;
  name: string;
  maxProducts: number;
  price: number;
  durationDays: number;
}
