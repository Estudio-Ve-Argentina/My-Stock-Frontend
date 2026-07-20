"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Spinner } from "@/components/ui/Spinner";

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, ready, profileReady } = useAuth();
  const router = useRouter();
  const isAdmin = user?.roles.includes("ADMIN") ?? false;

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!profileReady) return;
    if (!isAdmin) {
      router.replace("/panel");
    }
  }, [ready, user, profileReady, isAdmin, router]);

  if (!ready || !user || !profileReady || !isAdmin) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Spinner className="text-brand" />
      </div>
    );
  }

  return <>{children}</>;
}
