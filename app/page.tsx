import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingFeatures } from "@/components/marketing/MarketingFeatures";
import { MarketingPreview } from "@/components/marketing/MarketingPreview";
import { MarketingPricing } from "@/components/marketing/MarketingPricing";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function HomePage() {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <MarketingHeader />
      <main>
        <MarketingHero />

        <div className="relative bg-brand-tint">
          <svg
            aria-hidden
            viewBox="0 0 1440 70"
            preserveAspectRatio="none"
            className="absolute inset-x-0 top-0 h-[70px] w-full -translate-y-full text-brand-tint"
          >
            <path fill="currentColor" d="M0,70 C420,6 1020,6 1440,70 L1440,70 L0,70 Z" />
          </svg>
          <div className="texture-grid texture-fade pointer-events-none absolute inset-0 opacity-50" />
          <div className="relative">
            <MarketingFeatures />
            <MarketingPreview />
          </div>
        </div>

        <MarketingPricing />
      </main>
      <MarketingFooter />
    </div>
  );
}
