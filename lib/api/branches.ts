import type { BranchRequest, BranchResponse } from "@/config/site.types";
import { apiRequest } from "./client";

export function listBranches(): Promise<BranchResponse[]> {
  return apiRequest<BranchResponse[]>("/api/branches");
}

export function createBranch(input: BranchRequest): Promise<BranchResponse> {
  return apiRequest<BranchResponse>("/api/branches", {
    method: "POST",
    body: input,
  });
}

export function updateBranch(
  id: number,
  input: BranchRequest,
): Promise<BranchResponse> {
  return apiRequest<BranchResponse>(`/api/branches/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteBranch(id: number): Promise<void> {
  return apiRequest<void>(`/api/branches/${id}`, { method: "DELETE" });
}
