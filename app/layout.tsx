import type { Metadata } from "next";
import { Geist, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { appConfig } from "@/config/app.config";
import { LanguageProvider } from "@/components/providers/LanguageProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";

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
  title: {
    default: `${appConfig.name} — Controlá tu stock en 3 clicks`,
    template: `%s · ${appConfig.name}`,
  },
  description:
    "My-Stock es la forma más simple de controlar el inventario de tu negocio. Sumá, restá y mirá tu stock al instante.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={appConfig.defaultLocale} className={`${sans.variable} ${heading.variable} h-full antialiased`}>
      <body className="min-h-full font-body">
        <LanguageProvider>
          <AuthProvider>{children}</AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
