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
  minStock?: number;
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
  quantity: number,
): Promise<ProductResponse> {
  if (isMockEnabled()) {
    return mockUpdateStock(id, quantity);
  }
  return apiRequest<ProductResponse>(`/api/products/${id}/stock`, {
    method: "PATCH",
    body: { quantity },
  });
}

export function deleteProduct(id: number): Promise<void> {
  if (isMockEnabled()) {
    return mockDeleteProduct(id);
  }
  return apiRequest<void>(`/api/products/${id}`, { method: "DELETE" });
}
