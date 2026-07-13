import type { SubscribeResponse, SubscriptionResponse } from "@/config/site.types";
import { apiRequest } from "./client";

export function subscribe(planName: string): Promise<SubscribeResponse> {
  return apiRequest<SubscribeResponse>("/api/subscriptions/subscribe", {
    method: "POST",
    body: { planName },
  });
}

export async function getSubscription(): Promise<SubscriptionResponse | null> {
  const result = await apiRequest<SubscriptionResponse | undefined>(
    "/api/subscriptions/me",
  );
  return result ?? null;
}

export function cancelSubscription(): Promise<void> {
  return apiRequest<void>("/api/subscriptions/cancel", { method: "POST" });
}
