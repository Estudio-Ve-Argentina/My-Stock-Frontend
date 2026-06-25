import type { CategoryRequest, CategoryResponse } from "@/config/site.types";
import { apiRequest } from "./client";
import {
  isMockEnabled,
  mockCreateCategory,
  mockDeleteCategory,
  mockListCategories,
  mockRenameCategory,
} from "./mock";

export function listCategories(): Promise<CategoryResponse[]> {
  if (isMockEnabled()) {
    return mockListCategories();
  }
  return apiRequest<CategoryResponse[]>("/api/categories");
}

export function createCategory(
  input: CategoryRequest,
): Promise<CategoryResponse> {
  if (isMockEnabled()) {
    return mockCreateCategory(input);
  }
  return apiRequest<CategoryResponse>("/api/categories", {
    method: "POST",
    body: input,
  });
}

export function renameCategory(
  id: number,
  input: CategoryRequest,
): Promise<CategoryResponse> {
  if (isMockEnabled()) {
    return mockRenameCategory(id, input);
  }
  return apiRequest<CategoryResponse>(`/api/categories/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteCategory(id: number): Promise<void> {
  if (isMockEnabled()) {
    return mockDeleteCategory(id);
  }
  return apiRequest<void>(`/api/categories/${id}`, { method: "DELETE" });
}
