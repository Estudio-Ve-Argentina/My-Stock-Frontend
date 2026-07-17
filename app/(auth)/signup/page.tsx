import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description:
    "Creá tu cuenta gratis en Stockeo y empezá a controlar tu inventario en minutos.",
};

export default function SignupPage() {
  return <SignupForm />;
}
