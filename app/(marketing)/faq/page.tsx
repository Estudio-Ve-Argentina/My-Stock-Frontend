import type { Metadata } from "next";
import { FaqContent } from "@/components/marketing/FaqContent";

export const metadata: Metadata = {
  title: "Preguntas frecuentes",
  description:
    "Respuestas a las preguntas más comunes sobre Stockeo: planes, funciones, seguridad y más.",
};

export default function FaqPage() {
  return <FaqContent />;
}
