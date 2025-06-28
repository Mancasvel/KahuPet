import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { AuthProvider } from '@/lib/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'Kahupet - Entiende a tu mascota',
  description: 'La aplicación que entiende a tu mascota y te ofrece recomendaciones personalizadas de entrenamiento, nutrición y bienestar usando lenguaje natural.',
  keywords: ['mascotas', 'perros', 'gatos', 'entrenamiento', 'nutrición', 'bienestar animal', 'veterinario', 'cuidado mascotas'],
  authors: [{ name: 'Kahupet Team' }],
  creator: 'Kahupet',
  publisher: 'Kahupet',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://kahupet.app'),
  openGraph: {
    title: 'Kahupet - Entiende a tu mascota',
    description: 'Cuéntanos qué necesita tu mascota y te ayudamos con recomendaciones personalizadas de entrenamiento, nutrición y bienestar.',
    url: 'https://kahupet.app',
    siteName: 'Kahupet',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Kahupet - Entiende a tu mascota',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kahupet - Entiende a tu mascota',
    description: 'La app que entiende a tu mascota y te da recomendaciones personalizadas.',
    creator: '@kahupet_app',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="light">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Kahupet" />
      </head>
      <body className={inter.className}>
        <Providers>
          <AuthProvider>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  )
} 