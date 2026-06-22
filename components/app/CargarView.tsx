"use client";

import { useRouter } from "next/navigation";
import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { useAuth } from "@/hooks/useAuth";
import { useProducts } from "@/hooks/useProducts";
import { ProductForm } from "./ProductForm";

export function CargarView() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const router = useRouter();
  const { add } = useProducts(user?.username);

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-foreground">
          {t(ui.products.createTitle)}
        </h1>
        <p className="text-sm text-subtle">{t(ui.products.createSubtitle)}</p>
      </header>

      <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
        <ProductForm
          userId={user?.userId ?? 0}
          onCreate={add}
          onDone={() => router.push("/productos")}
        />
      </div>
    </div>
  );
}
