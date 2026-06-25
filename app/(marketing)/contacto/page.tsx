import { MarketingContact } from "@/components/marketing/MarketingContact";

export default function ContactoPublicPage() {
  return (
    <section className="relative flex h-full flex-1 items-center overflow-hidden bg-muted">
      <div className="texture-dots texture-fade pointer-events-none absolute inset-0 opacity-100" />
      <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/15 blur-[110px]" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-accent/10 blur-[100px]" />
      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-8">
        <MarketingContact compact />
      </div>
    </section>
  );
}
