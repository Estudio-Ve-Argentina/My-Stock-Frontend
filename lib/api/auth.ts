import type { AuthResponse, UserMeResponse } from "@/config/site.types";
import { appConfig } from "@/config/app.config";
import { apiRequest } from "./client";
import { isMockEnabled, mockLogin, mockSignup } from "./mock";

export interface LoginInput {
  email: string;
  password: string;
}

export interface SignupInput {
  email: string;
  password: string;
  name: string;
  lastname?: string;
}

export function login(input: LoginInput): Promise<AuthResponse> {
  if (isMockEnabled()) {
    return mockLogin(input);
  }
  return apiRequest<AuthResponse>("/auth/login", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function signup(input: SignupInput): Promise<AuthResponse> {
  if (isMockEnabled()) {
    return mockSignup(input);
  }
  return apiRequest<AuthResponse>("/auth/signup", {
    method: "POST",
    body: input,
    auth: false,
  });
}

export function exchangeOAuthCode(code: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(`/auth/oauth2/exchange?code=${code}`, {
    method: "POST",
    auth: false,
  });
}

export function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  return apiRequest<AuthResponse>(`/auth/refresh?refreshToken=${encodeURIComponent(refreshToken)}`, {
    method: "POST",
    auth: false,
  });
}

export function logout(refreshToken: string): Promise<void> {
  return apiRequest<void>(`/auth/logout?refreshToken=${encodeURIComponent(refreshToken)}`, {
    method: "POST",
  });
}

export function fetchMe(): Promise<UserMeResponse> {
  return apiRequest<UserMeResponse>("/auth/me");
}

export function forgotPassword(email: string): Promise<void> {
  return apiRequest<void>(`/auth/forgot-password?email=${encodeURIComponent(email)}`, {
    method: "POST",
    auth: false,
  });
}

export function resetPassword(token: string, newPassword: string): Promise<void> {
  return apiRequest<void>("/auth/reset-password", {
    method: "POST",
    body: { token, newPassword },
    auth: false,
  });
}

export function resendVerification(email: string): Promise<void> {
  return apiRequest<void>(`/auth/resend-verification?email=${encodeURIComponent(email)}`, {
    method: "POST",
    auth: false,
  });
}

export function googleLoginUrl(): string {
  return `${appConfig.apiBaseUrl}/oauth2/authorization/google`;
}
