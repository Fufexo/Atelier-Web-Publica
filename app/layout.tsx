import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/lib/carrito";
import { ViewTransitions } from "next-view-transitions";
import ViewTransitionGuard from "@/components/store/ViewTransitionGuard";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-manrope",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export const metadata: Metadata = {
  title: { default: 'ATELIER', template: '%s — ATELIER' },
  description: 'Tienda de ropa online en Perú. Moda para mujer, hombre y unisex.',
  metadataBase: new URL(siteUrl || 'http://localhost:3000'),
  openGraph: {
    siteName: 'ATELIER',
    locale: 'es_PE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ViewTransitions>
      <html lang="es" className={`${playfair.variable} ${inter.variable} scroll-smooth`}>
        <head>
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          />
        </head>
        <body className="bg-[#fcf9f4] text-[#1c1c19]">
          <ViewTransitionGuard />
          <CarritoProvider>{children}</CarritoProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
