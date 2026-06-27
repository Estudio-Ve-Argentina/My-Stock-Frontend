import type { UserDetailResponse } from "@/config/site.types";
import { apiRequest } from "./client";

export function getUserDetail(userId: number): Promise<UserDetailResponse> {
  return apiRequest<UserDetailResponse>(`/api/user/${userId}`);
}

export interface UpdateProfileInput {
  name: string;
  lastName?: string;
}

export function updateProfile(
  userId: number,
  input: UpdateProfileInput,
): Promise<void> {
  return apiRequest<void>(`/api/user/${userId}/profile`, {
    method: "PATCH",
    body: input,
  });
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export function changePassword(
  userId: number,
  input: ChangePasswordInput,
): Promise<void> {
  return apiRequest<void>(`/api/user/${userId}/password`, {
    method: "PATCH",
    body: input,
  });
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
