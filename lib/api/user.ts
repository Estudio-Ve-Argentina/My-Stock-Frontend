import { apiRequest } from "./client";

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
