import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "Inversión Inmobiliaria", template: "%s | Inversión Inmobiliaria" },
  description: "Plataforma de crowdfunding inmobiliario. Invierte en proyectos de compra-reforma-venta con rentabilidades atractivas.",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Inversión Inmobiliaria" },
  formatDetection: { telephone: false },
  openGraph: {
    type: "website",
    locale: "es_ES",
    title: "Inversión Inmobiliaria",
    description: "Plataforma de crowdfunding inmobiliario",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e40af",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={geist.variable}>
      <body className="min-h-screen bg-gray-50 antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
