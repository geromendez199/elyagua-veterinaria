import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import WhatsAppFloat from "@/components/WhatsAppFloat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://elyagua-veterinaria.vercel.app'),
  title: {
    default: 'El Yagua Veterinaria',
    template: '%s | El Yagua Veterinaria',
  },
  description: 'Tienda online de productos veterinarios en Rafaela, Santa Fe. Alimentos, medicamentos, juguetes y accesorios para tu mascota.',
  keywords: ['veterinaria', 'Rafaela', 'Santa Fe', 'mascotas', 'alimentos', 'medicamentos', 'accesorios', 'perros', 'gatos'],
  openGraph: {
    title: 'El Yagua Veterinaria',
    description: 'Tu veterinaria de confianza en Rafaela. Pedí online y retirá en tienda.',
    url: 'https://elyagua-veterinaria.vercel.app',
    siteName: 'El Yagua Veterinaria',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: '/logo-color.png', width: 512, height: 512, alt: 'El Yagua Veterinaria' }],
  },
  twitter: {
    card: 'summary',
    title: 'El Yagua Veterinaria',
    description: 'Tu veterinaria de confianza en Rafaela, Santa Fe.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${montserrat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-montserrat">
        <CartProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <WhatsAppFloat />
        </CartProvider>
      </body>
    </html>
  );
}
