import { appConfig } from "@/config/app.config";
import { readTokenCookie } from "@/lib/auth/session";
import { ApiError } from "./client";

export interface ExportInventoryInput {
  productIds?: number[];
  branchIds?: number[];
  categoryIds?: number[];
  supplierIds?: number[];
  lowStockOnly?: boolean;
}

export interface ExportMovementsInput {
  dateFrom: string;
  dateTo: string;
  branchIds?: number[];
  categoryId?: number;
  supplierId?: number;
  movementTypes?: string[];
}

export interface LowStockPdfInput {
  branchIds?: number[];
  categoryIds?: number[];
  supplierIds?: number[];
  lowStockOnly?: boolean;
}

export interface SummaryPdfInput {
  branchIds?: number[];
  sections?: string[];
  periodDays?: number;
}

async function downloadReport(
  url: string,
  fallbackFilename: string,
  body?: unknown,
): Promise<void> {
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const token = readTokenCookie();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    method: "POST",
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
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
  let filename = fallbackFilename;
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

export function exportInventoryExcel(
  input: ExportInventoryInput,
): Promise<void> {
  return downloadReport(
    `${appConfig.apiBaseUrl}/api/reports/inventory/excel`,
    `inventario_${new Date().toISOString().slice(0, 10)}.xlsx`,
    input,
  );
}

export function exportMovementsExcel(
  input: ExportMovementsInput,
): Promise<void> {
  return downloadReport(
    `${appConfig.apiBaseUrl}/api/reports/movements/excel`,
    `movimientos_${new Date().toISOString().slice(0, 10)}.xlsx`,
    input,
  );
}

export function exportSummaryPdf(input?: SummaryPdfInput): Promise<void> {
  return downloadReport(
    `${appConfig.apiBaseUrl}/api/reports/summary/pdf`,
    `resumen_ejecutivo_${new Date().toISOString().slice(0, 10)}.pdf`,
    input ?? {},
  );
}

export function exportLowStockPdf(input: LowStockPdfInput): Promise<void> {
  return downloadReport(
    `${appConfig.apiBaseUrl}/api/reports/low-stock/pdf`,
    `alerta_stock_bajo_${new Date().toISOString().slice(0, 10)}.pdf`,
    input,
  );
}

export function exportMovementsPdf(
  input: ExportMovementsInput,
): Promise<void> {
  return downloadReport(
    `${appConfig.apiBaseUrl}/api/reports/movements/pdf`,
    `movimientos_${new Date().toISOString().slice(0, 10)}.pdf`,
    input,
  );
}
