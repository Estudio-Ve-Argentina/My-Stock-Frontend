import type { UserDetailResponse } from "@/config/site.types";
import { apiRequest } from "./client";

export function getUserDetail(userId: number): Promise<UserDetailResponse> {
  return apiRequest<UserDetailResponse>(`/api/user/${userId}`);
}

export function changePlan(
  userId: number,
  planId: number,
): Promise<UserDetailResponse> {
  return apiRequest<UserDetailResponse>(`/api/user/${userId}/plan`, {
    method: "PATCH",
    body: { planId },
  });
}

export function cancelPlanRenewal(
  userId: number,
): Promise<UserDetailResponse> {
  return apiRequest<UserDetailResponse>(`/api/user/${userId}/plan/cancel`, {
    method: "PATCH",
  });
}
