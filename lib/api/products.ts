import type { ProductRequest, ProductResponse } from "@/config/site.types";
import { apiRequest } from "./client";
import {
  isMockEnabled,
  mockCreateProduct,
  mockDeleteProduct,
  mockListProducts,
  mockUpdateProduct,
  mockUpdateStock,
} from "./mock";

export function listProductsByUsername(
  username: string,
): Promise<ProductResponse[]> {
  if (isMockEnabled()) {
    return mockListProducts(username);
  }
  return apiRequest<ProductResponse[]>(
    `/api/products/by-username/${encodeURIComponent(username)}`,
  );
}

export function createProduct(
  input: ProductRequest,
): Promise<ProductResponse> {
  if (isMockEnabled()) {
    return mockCreateProduct(input);
  }
  return apiRequest<ProductResponse>("/api/products", {
    method: "POST",
    body: input,
  });
}

export interface UpdateProductInput {
  name: string;
  description: string;
  categoryId?: number | null;
  supplierId?: number | null;
  minStock?: number;
}

export interface StockUpdateInput {
  quantity: number;
  reason?: string | null;
  branchId?: number | null;
}

export function updateProduct(
  id: number,
  input: UpdateProductInput,
): Promise<ProductResponse> {
  if (isMockEnabled()) {
    return mockUpdateProduct(id, input);
  }
  return apiRequest<ProductResponse>(`/api/products/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function updateStock(
  id: number,
  input: StockUpdateInput,
): Promise<ProductResponse> {
  if (isMockEnabled()) {
    return mockUpdateStock(id, input.quantity);
  }
  const body: Record<string, unknown> = { quantity: input.quantity };
  if (input.reason) body.reason = input.reason;
  if (input.branchId) body.branchId = input.branchId;
  return apiRequest<ProductResponse>(`/api/products/${id}/stock`, {
    method: "PATCH",
    body,
  });
}

export function pinProduct(id: number): Promise<ProductResponse> {
  return apiRequest<ProductResponse>(`/api/products/${id}/pin`, {
    method: "PATCH",
  });
}

export function deleteProduct(id: number): Promise<void> {
  if (isMockEnabled()) {
    return mockDeleteProduct(id);
  }
  return apiRequest<void>(`/api/products/${id}`, { method: "DELETE" });
}
