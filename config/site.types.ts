export const LOCALES = ["es", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export type Localized<T = string> = Record<Locale, T>;

export type PlanId = "free" | "pro";

export interface Plan {
  id: PlanId;
  name: Localized;
  priceUsd: number;
  productLimit: number | null;
  features: Localized<string[]>;
}

export interface AuthResponse {
  username: string;
  message: string;
  jwtToken: string;
  status: boolean;
}

export interface ProductResponse {
  id?: number;
  name: string;
  description: string;
  createdAt: string;
  stock: number;
  userId: number;
  user: string;
}

export interface ProductRequest {
  name: string;
  description: string;
  createdAt: string;
  stock: number;
  userId: number;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export type MovementType = "created" | "increased" | "decreased" | "deleted";

export interface Movement {
  id: number;
  productName: string;
  type: MovementType;
  quantity: number;
  at: string;
}
