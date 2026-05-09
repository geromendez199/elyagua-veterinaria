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
  url: 'https://elyagua-veterinaria.vercel.app',
  telephone: '+5493492730010',
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
      opens: '08:00',
      closes: '13:00',
    },
  ],
  sameAs: [
    'https://www.instagram.com/elyaguaveterinaria',
    'https://www.facebook.com/elyaguaveterinaria',
  ],
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
      </head>
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
