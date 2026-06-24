import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { MarketingHero } from "@/components/marketing/MarketingHero";
import { MarketingFeatures } from "@/components/marketing/MarketingFeatures";
import { MarketingPreview } from "@/components/marketing/MarketingPreview";
import { MarketingPricing } from "@/components/marketing/MarketingPricing";
import { MarketingFooter } from "@/components/marketing/MarketingFooter";

export default function HomePage() {
  const gridMask = "linear-gradient(to bottom, transparent, black 12%, black 88%, transparent)";
  const lightGridMask = "linear-gradient(to bottom, transparent, black 8%, black 92%, transparent)";

  return (
    <div className="relative min-h-dvh bg-background text-foreground">
      <div
        className="texture-grid-light pointer-events-none fixed inset-0 z-0"
        style={{ maskImage: lightGridMask, WebkitMaskImage: lightGridMask }}
      />

      <div className="relative z-10">
        <MarketingHeader />
        <main>
          <div className="relative">
            <MarketingHero />
            <div className="pointer-events-none absolute -bottom-32 left-1/4 h-64 w-64 rounded-full bg-brand/10 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-20 right-1/6 h-48 w-48 rounded-full bg-accent/8 blur-[100px]" />
          </div>

          <svg
            aria-hidden
            viewBox="-10 0 1460 200"
            preserveAspectRatio="none"
            className="-mb-1 block h-[30px] w-full md:h-[50px]"
          >
            <path
              fill="var(--dark-2)"
              d="M-10,60 C180,60 280,180 480,170 C650,162 740,50 920,55 C1060,59 1180,8 1360,12 C1420,14 1450,20 1450,20 L1450,200 L-10,200 Z"
            />
          </svg>

          <div className="relative bg-dark-2">
            <div
              className="texture-grid pointer-events-none absolute inset-0 opacity-80"
              style={{ maskImage: gridMask, WebkitMaskImage: gridMask }}
            />
            <div className="pointer-events-none absolute left-1/2 top-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-neon/8 blur-[140px]" />
            <div className="pointer-events-none absolute -left-20 top-2/3 h-56 w-56 rounded-full bg-brand/10 blur-[100px]" />
            <div className="relative">
              <MarketingFeatures />
              <MarketingPreview />
            </div>
          </div>

          <div className="relative">
            <div className="pointer-events-none absolute left-1/3 top-0 h-72 w-72 -translate-y-1/2 rounded-full bg-brand/8 blur-[120px]" />
            <div className="pointer-events-none absolute right-1/4 top-1/2 h-56 w-56 rounded-full bg-accent/6 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-brand/5 blur-[130px]" />
            <MarketingPricing />
          </div>
        </main>
        <MarketingFooter />
      </div>
    </div>
  );
}
