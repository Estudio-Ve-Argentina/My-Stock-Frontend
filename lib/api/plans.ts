import type { PlanRequest, PlanResponse } from "@/config/site.types";
import { apiRequest } from "./client";

export function listPlans(): Promise<PlanResponse[]> {
  return apiRequest<PlanResponse[]>("/api/plans", { auth: false });
}

export function getPlan(id: number): Promise<PlanResponse> {
  return apiRequest<PlanResponse>(`/api/plans/${id}`, { auth: false });
}

export function createPlan(input: PlanRequest): Promise<PlanResponse> {
  return apiRequest<PlanResponse>("/api/plans", { method: "POST", body: input });
}

export function updatePlan(id: number, input: PlanRequest): Promise<PlanResponse> {
  return apiRequest<PlanResponse>(`/api/plans/${id}`, { method: "PUT", body: input });
}

export function deletePlan(id: number): Promise<void> {
  return apiRequest<void>(`/api/plans/${id}`, { method: "DELETE" });
}
