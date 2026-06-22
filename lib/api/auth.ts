import type { AuthResponse } from "@/config/site.types";
import { appConfig } from "@/config/app.config";
import { apiRequest } from "./client";
import { isMockEnabled, mockLogin, mockSignup } from "./mock";

export interface LoginInput {
  username: string;
  password: string;
}

export interface SignupInput {
  username: string;
  password: string;
  name: string;
  lastname: string;
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
    body: { ...input, roleEnum: "USER" },
    auth: false,
  });
}

export function googleLoginUrl(): string {
  return `${appConfig.apiBaseUrl}/oauth2/authorization/google`;
}
