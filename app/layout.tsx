import type { Metadata } from "next";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { appConfig } from "@/config/app.config";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";

const sans = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const heading = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://stockeo.app"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  title: {
    default: `${appConfig.name} — Controlá tu stock en 3 clicks`,
    template: `%s · ${appConfig.name}`,
  },
  description:
    "Stockeo es la forma más simple de controlar el inventario de tu negocio. Sumá, restá y mirá tu stock al instante.",
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: appConfig.name,
    title: `${appConfig.name} — Controlá tu stock en 3 clicks`,
    description:
      "La forma más simple de controlar el inventario de tu negocio. Sin planillas, sin complicaciones.",
    url: "https://stockeo.app",
    images: [{ url: "/og.png", width: 1897, height: 817, alt: `${appConfig.name} — gestión de stock simple` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appConfig.name} — Controlá tu stock en 3 clicks`,
    description:
      "La forma más simple de controlar el inventario de tu negocio. Sin planillas, sin complicaciones.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={appConfig.defaultLocale} className={`${sans.variable} ${heading.variable} h-full antialiased`}>
      <body className="min-h-full font-body">
        <LanguageProvider>
          <AuthProvider>
            <ToastProvider>{children}</ToastProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
