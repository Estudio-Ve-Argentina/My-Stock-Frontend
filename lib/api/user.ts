import type { Page, SubscriptionStatus, UserEntityResponse, UserSaveRequest } from "@/config/site.types";
import { apiRequest } from "./client";

export interface SearchUsersParams {
  search?: string;
  planName?: string;
  subscriptionStatus?: SubscriptionStatus;
  page?: number;
  size?: number;
}

export function searchUsers(params: SearchUsersParams = {}): Promise<Page<UserEntityResponse>> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.planName) query.set("planName", params.planName);
  if (params.subscriptionStatus) query.set("subscriptionStatus", params.subscriptionStatus);
  query.set("page", String(params.page ?? 0));
  query.set("size", String(params.size ?? 10));
  return apiRequest<Page<UserEntityResponse>>(`/api/user?${query.toString()}`);
}

export function getUserById(id: number): Promise<UserEntityResponse> {
  return apiRequest<UserEntityResponse>(`/api/user/${id}`);
}

export function createUser(input: UserSaveRequest): Promise<UserEntityResponse> {
  return apiRequest<UserEntityResponse>("/api/user/save", { method: "POST", body: input });
}

export function updateUser(id: number, input: UserSaveRequest): Promise<UserEntityResponse> {
  return apiRequest<UserEntityResponse>(`/api/user/${id}`, { method: "PUT", body: input });
}

export function deleteUser(id: number): Promise<void> {
  return apiRequest<void>(`/api/user/${id}`, { method: "DELETE" });
}

export function cancelUserPlan(id: number): Promise<UserEntityResponse> {
  return apiRequest<UserEntityResponse>(`/api/user/${id}/plan/cancel`, { method: "PATCH" });
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
