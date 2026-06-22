import { useContext } from "react";
import {
  LanguageContext,
  type LanguageContextValue,
} from "@/components/providers/LanguageProvider";

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
