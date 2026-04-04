import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import { CarritoProvider } from "@/lib/carrito";
import { ViewTransitions } from "next-view-transitions";

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

export const metadata: Metadata = {
  title: "ATELIER",
  description: "Tienda de ropa online en Perú",
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
          <CarritoProvider>{children}</CarritoProvider>
        </body>
      </html>
    </ViewTransitions>
  );
}
