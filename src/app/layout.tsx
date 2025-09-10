import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { HeaderProvider } from "@/components/shared/layouts/header-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'FigDream - Beauty Salon Booking Platform',
    template: '%s | FigDream'
  },
  description: 'Book appointments at top beauty salons near you. Find hair stylists, nail technicians, spa services, and more.',
  keywords: ['beauty salon', 'hair salon', 'spa', 'nail salon', 'appointment booking', 'beauty services'],
  authors: [{ name: 'FigDream' }],
  creator: 'FigDream',
  publisher: 'FigDream',
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
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://figdream.com',
    title: 'FigDream - Beauty Salon Booking Platform',
    description: 'Book appointments at top beauty salons near you',
    siteName: 'FigDream',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FigDream - Beauty Salon Booking Platform',
    description: 'Book appointments at top beauty salons near you',
    creator: '@figdream',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <HeaderProvider />
        {children}
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
