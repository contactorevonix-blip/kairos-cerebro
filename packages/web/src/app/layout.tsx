import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { Instrument_Serif } from 'next/font/google';
import './globals.css';

const instrumentSerif = Instrument_Serif({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://kairoscheck.net'),
  title: {
    default: 'Kairos Check — Fraud Detection API for indie devs',
    template: '%s | Kairos Check',
  },
  description: 'OSINT-first fraud scoring API. Detect fraudulent domains, emails, phones and IBANs in one POST. Sub-100ms. Self-serve. GDPR-native.',
  keywords: ['fraud detection', 'fraud API', 'indie dev', 'fraud scoring', 'OSINT', 'email validation', 'IP reputation'],
  authors: [{ name: 'Kairos Check' }],
  creator: 'Kairos Check',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://kairoscheck.net',
    siteName: 'Kairos Check',
    title: 'Kairos Check — Fraud Detection API for indie devs',
    description: 'OSINT-first fraud scoring API. Detect fraudulent domains, emails, phones and IBANs in one POST. Sub-100ms. Self-serve. GDPR-native.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kairos Check — Fraud Detection API',
    description: 'Stop fraud before it ships. One API call, 40+ signals, sub-100ms.',
    creator: '@kairoscheck',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/icon',
    apple: '/apple-icon',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
