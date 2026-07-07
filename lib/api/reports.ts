import { appConfig } from "@/config/app.config";
import { readTokenCookie } from "@/lib/auth/session";
import { ApiError } from "./client";

export interface ExportInventoryInput {
  productIds: number[];
  branchIds: number[];
  splitByBranch: boolean;
}

export async function exportInventoryExcel(
  input: ExportInventoryInput,
): Promise<void> {
  const url = `${appConfig.apiBaseUrl}/api/reports/inventory/excel`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const token = readTokenCookie();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    let message = response.statusText;
    try {
      const data = await response.json();
      message = data.message || message;
      throw new ApiError(response.status, message, data.errors);
    } catch (e) {
      if (e instanceof ApiError) throw e;
      throw new ApiError(response.status, message);
    }
  }

  const blob = await response.blob();
  const disposition = response.headers.get("content-disposition");
  let filename = `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`;
  if (disposition) {
    const match = disposition.match(/filename="?(.+?)"?$/);
    if (match) filename = match[1];
  }

  const blobUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(blobUrl);
}
