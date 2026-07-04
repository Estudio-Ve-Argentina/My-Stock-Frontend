import type { Metadata } from "next";
import { PlanesContent } from "@/components/marketing/PlanesContent";

export const metadata: Metadata = {
  title: "Planes y precios",
  description:
    "Empezá gratis con My-Stock. Cuando tu negocio crece, elegí el plan Pro mensual o anual.",
};

export default function PlanesPublicPage() {
  return <PlanesContent />;
}
