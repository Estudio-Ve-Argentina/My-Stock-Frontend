import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function MarketingLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div className="relative z-10 flex min-h-dvh flex-col">
        <MarketingHeader />
        <main className="flex flex-1 flex-col">{children}</main>
        <MarketingFooter />
      </div>
    </div>
  );
}
