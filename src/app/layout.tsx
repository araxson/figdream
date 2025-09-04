import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'),
  title: 'FigDream - Premium Salon Booking Platform',
  description: 'Book appointments at your favorite salons with FigDream. Discover top-rated beauty professionals and manage your appointments easily.',
  keywords: 'salon booking, beauty appointments, hair salon, spa booking, nail salon',
  authors: [{ name: 'FigDream' }],
  creator: 'FigDream',
  publisher: 'FigDream',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://figdream.com',
    siteName: 'FigDream',
    title: 'FigDream - Premium Salon Booking Platform',
    description: 'Book appointments at your favorite salons with FigDream',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FigDream',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FigDream - Premium Salon Booking Platform',
    description: 'Book appointments at your favorite salons with FigDream',
    images: ['/og-image.png'],
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
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}