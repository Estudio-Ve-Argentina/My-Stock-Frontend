import type { Localized } from "@/config/site.types";
import { ui } from "@/config/i18n";
import { ApiError } from "./api/client";

type TranslateFn = (localized: Localized) => string;

export function resolveErrorMessage(error: unknown, t: TranslateFn): string {
  if (!(error instanceof ApiError)) {
    if (error instanceof Error) {
      return error.message || t(ui.common.genericError);
    }
    return t(ui.common.genericError);
  }
  switch (error.status) {
    case 409:
      return t(ui.errors.conflict);
    case 500:
      return t(ui.errors.serverError);
    case 503:
      return t(ui.errors.serviceUnavailable);
    default:
      return error.message || t(ui.common.genericError);
  }
}
