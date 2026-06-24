import type { Movement, Page, StockMovementResponse } from "@/config/site.types";
import { apiRequest } from "./client";
import { isMockEnabled, mockListMovements } from "./mock";

function toMovement(raw: StockMovementResponse): Movement {
  return {
    id: raw.id,
    productName: raw.productName,
    type: raw.quantity >= 0 ? "increased" : "decreased",
    quantity: Math.abs(raw.quantity),
    at: raw.createdAt,
  };
}

export async function listMovements(userId: number): Promise<Movement[]> {
  if (isMockEnabled()) {
    return mockListMovements();
  }
  const page = await apiRequest<Page<StockMovementResponse>>(
    `/api/stock-movements/user/${userId}?size=50`,
  );
  return page.content.map(toMovement);
}

export function isToday(iso: string): boolean {
  const date = new Date(iso);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}
