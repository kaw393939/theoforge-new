import React from 'react';
import "./globals.css";
import { Inter, Public_Sans } from 'next/font/google'; 
import { siteConfig } from '@/config/site';
import { Analytics } from '@vercel/analytics/react';
import { AuthProvider } from '@/components/Dashboard/AppContext';

// Configure Inter for headings
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter', 
  weight: ['500', '600', '700', '800'] 
});

// Configure Public Sans for body/UI
const publicSans = Public_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-public-sans', 
  weight: ['400', '500', '600', '700'] 
});

import Header from '../components/Layout/Header'; 
import Footer from '../components/Layout/Footer'; 

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: `%s | ${siteConfig.name}`,
    default: `${siteConfig.name} - AI Strategy & Implementation Specialists`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: `${siteConfig.name} - AI Strategy & Implementation | Genesis Engine`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: siteConfig.twitterHandle
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png'
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${publicSans.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased bg-background text-foreground dark:bg-background dark:text-foreground">
        <AuthProvider>
          <Header />
          {/* Remove top padding to eliminate the white space */}
          <main>{children}</main> 
          <Footer />
          <Analytics />
        </AuthProvider>
      </body>
    </html>
  );
}
