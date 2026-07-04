import type { Metadata } from "next";
import { PrivacyContent } from "@/components/marketing/PrivacyContent";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Cómo My-Stock recopila, usa y protege tu información personal.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
