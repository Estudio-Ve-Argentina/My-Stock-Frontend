import type { SupplierRequest, SupplierResponse } from "@/config/site.types";
import { apiRequest } from "./client";

export function listSuppliers(): Promise<SupplierResponse[]> {
  return apiRequest<SupplierResponse[]>("/api/suppliers");
}

export function createSupplier(
  input: SupplierRequest,
): Promise<SupplierResponse> {
  return apiRequest<SupplierResponse>("/api/suppliers", {
    method: "POST",
    body: input,
  });
}

export function updateSupplier(
  id: number,
  input: SupplierRequest,
): Promise<SupplierResponse> {
  return apiRequest<SupplierResponse>(`/api/suppliers/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteSupplier(id: number): Promise<void> {
  return apiRequest<void>(`/api/suppliers/${id}`, { method: "DELETE" });
}
