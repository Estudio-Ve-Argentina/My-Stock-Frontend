"use client";

import { ui } from "@/config/i18n";
import { useLanguage } from "@/hooks/useLanguage";
import { Button } from "@/components/ui/Button";

interface AdminPagerProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function AdminPager({ page, totalPages, onChange }: AdminPagerProps) {
  const { t } = useLanguage();

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-2">
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 0}
        onClick={() => onChange(page - 1)}
      >
        {t(ui.admin.pagePrev)}
      </Button>
      <span className="text-sm text-subtle">
        {t(ui.admin.pageWord)} {page + 1} {t(ui.admin.pageOf)} {totalPages}
      </span>
      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        {t(ui.admin.pageNext)}
      </Button>
    </div>
  );
}
