import type { BackendMovementType, Movement, MovementType, Page, StockMovementResponse } from "@/config/site.types";
import { apiRequest } from "./client";
import { isMockEnabled, mockListMovements } from "./mock";

function mapMovementType(movementType: BackendMovementType, quantity: number): MovementType {
  switch (movementType) {
    case "PRODUCT_CREATED":
      return "created";
    case "PRODUCT_DELETED":
      return "deleted";
    case "PRODUCT_MODIFIED":
      return "modified";
    case "STOCK_UPDATE":
      return quantity >= 0 ? "increased" : "decreased";
  }
}

function toMovement(raw: StockMovementResponse): Movement {
  return {
    id: raw.id,
    productName: raw.productName,
    type: mapMovementType(raw.movementType, raw.quantity),
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
