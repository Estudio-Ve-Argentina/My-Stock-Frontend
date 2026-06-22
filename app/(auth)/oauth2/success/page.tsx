import { Suspense } from "react";
import { OAuthCallback } from "@/components/auth/OAuthCallback";

export default function OAuthSuccessPage() {
  return (
    <Suspense>
      <OAuthCallback />
    </Suspense>
  );
}
