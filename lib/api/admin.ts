import type {
  AdminStatsResponse,
  AdminSubscriptionResponse,
  AssignPlanRequest,
  Page,
  SubscriptionStatus,
  UserEntityResponse,
} from "@/config/site.types";
import { apiRequest } from "./client";

export function getAdminStats(): Promise<AdminStatsResponse> {
  return apiRequest<AdminStatsResponse>("/api/admin/stats");
}

export interface ListAdminSubscriptionsParams {
  status?: SubscriptionStatus;
  page?: number;
  size?: number;
}

export function listAdminSubscriptions(
  params: ListAdminSubscriptionsParams = {},
): Promise<Page<AdminSubscriptionResponse>> {
  const query = new URLSearchParams();
  if (params.status) query.set("status", params.status);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));
  return apiRequest<Page<AdminSubscriptionResponse>>(
    `/api/admin/subscriptions?${query.toString()}`,
  );
}

export function getUserSubscriptionHistory(
  userId: number,
): Promise<AdminSubscriptionResponse[]> {
  return apiRequest<AdminSubscriptionResponse[]>(
    `/api/admin/subscriptions/user/${userId}`,
  );
}

export function assignUserPlan(
  userId: number,
  input: AssignPlanRequest,
): Promise<UserEntityResponse> {
  return apiRequest<UserEntityResponse>(`/api/admin/users/${userId}/plan`, {
    method: "POST",
    body: input,
  });
}
