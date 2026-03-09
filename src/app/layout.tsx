import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import NextTopLoader from 'nextjs-toploader';
import Providers from './providers';

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Samatva CRM - Campaign & Lead Management System',
    template: '%s | Samatva CRM',
  },
  description:
    'Comprehensive CRM solution for managing campaigns, leads, and borrower relationships. Track conversions, analyze performance, and streamline your loan disbursement process.',
  keywords: [
    'CRM',
    'Campaign Management',
    'Lead Management',
    'Loan Management',
    'Borrower Management',
    'Financial CRM',
    'Sales Pipeline',
    'Lead Conversion',
    'Samatva',
  ],
  authors: [{ name: 'Samatva' }],
  creator: 'Samatva',
  publisher: 'Samatva',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    title: 'Samatva CRM - Campaign & Lead Management System',
    description:
      'Comprehensive CRM solution for managing campaigns, leads, and borrower relationships.',
    siteName: 'Samatva CRM',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Samatva CRM - Campaign & Lead Management System',
    description:
      'Comprehensive CRM solution for managing campaigns, leads, and borrower relationships.',
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
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        <Providers>
          <NextTopLoader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
