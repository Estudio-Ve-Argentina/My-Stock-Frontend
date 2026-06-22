import type { ReactNode } from "react";
import { AppGuard } from "@/components/app/AppGuard";
import { AppShell } from "@/components/app/AppShell";

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <AppGuard>
      <AppShell>{children}</AppShell>
    </AppGuard>
  );
}
