import type { Metadata } from "next";
import { TermsContent } from "@/components/marketing/TermsContent";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Términos y condiciones de uso de Stockeo, la herramienta de gestión de inventario para negocios.",
};

export default function TermsPage() {
  return <TermsContent />;
}
