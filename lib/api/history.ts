import type { Movement } from "@/config/site.types";
import { isMockEnabled, mockListMovements } from "./mock";

export function listMovements(): Promise<Movement[]> {
  if (isMockEnabled()) {
    return mockListMovements();
  }
  return Promise.resolve([]);
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
