import type { Metadata } from "next";
import { Geist, Geist_Mono, Montserrat } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import { PHONE, SITE_URL, INSTAGRAM_URL, FACEBOOK_URL } from "@/lib/constants";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { CouponProvider } from "@/context/CouponContext";
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
  description: 'Tienda online de productos veterinarios en Rafaela, Santa Fe. Alimentos, medicamentos, juguetes y accesorios para tu mascota. Pedí online y retirá en tienda.',
  keywords: ['veterinaria', 'Rafaela', 'Santa Fe', 'mascotas', 'alimentos', 'medicamentos', 'accesorios', 'perros', 'gatos', 'El Yagua'],
  openGraph: {
    title: 'El Yagua Veterinaria',
    description: 'Tu veterinaria de confianza en Rafaela. Pedí online y retirá en tienda o recibilo en tu domicilio.',
    url: 'https://elyagua-veterinaria.vercel.app',
    siteName: 'El Yagua Veterinaria',
    locale: 'es_AR',
    type: 'website',
    images: [{ url: '/logo-color.png', width: 512, height: 512, alt: 'El Yagua Veterinaria' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'El Yagua Veterinaria',
    description: 'Tu veterinaria de confianza en Rafaela, Santa Fe.',
    images: ['/logo-color.png'],
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

const localBusinessJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'VeterinaryCare',
  name: 'El Yagua Veterinaria',
  url: SITE_URL,
  telephone: PHONE,
  image: 'https://elyagua-veterinaria.vercel.app/logo-color.png',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Bv Lehmann 609',
    addressLocality: 'Rafaela',
    addressRegion: 'Santa Fe',
    addressCountry: 'AR',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: -31.2527,
    longitude: -61.4873,
  },
  openingHoursSpecification: [
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
      opens: '07:30',
      closes: '21:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '09:00',
      closes: '12:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Saturday',
      opens: '16:00',
      closes: '20:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '10:00',
      closes: '12:00',
    },
    {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: 'Sunday',
      opens: '16:00',
      closes: '20:00',
    },
  ],
  sameAs: [INSTAGRAM_URL, FACEBOOK_URL],
}

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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        {process.env.NEXT_PUBLIC_GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
                    page_path: window.location.pathname,
                  });
                `,
              }}
            />
          </>
        )}
      </head>
      <body className="min-h-full flex flex-col font-montserrat">
        <CartProvider>
          <WishlistProvider>
            <CouponProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
              <WhatsAppFloat />
              <Analytics />
            </CouponProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
