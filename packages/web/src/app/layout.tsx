import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

export const metadata: Metadata = {
  title: 'Kairos Check — Fraud Detection API',
  description: 'OSINT-first fraud scoring API. Detect fraudulent domains, emails, phones and IBANs in one POST. Self-serve. GDPR-native. Starts free.',
  metadataBase: new URL('https://kairoscheck.net'),
  openGraph: {
    title: 'Kairos Check — Fraud Detection API',
    description: 'Stop fraud before it touches your revenue. One API call, instant verdict.',
    url: 'https://kairoscheck.net',
    siteName: 'Kairos Check',
    images: [{ url: '/og-image.png', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kairos Check — Fraud Detection API',
    description: 'Stop fraud before it touches your revenue.',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable}`}
      style={{ colorScheme: 'dark' }}
    >
      <body className="font-sans antialiased bg-[#0a0a0a] text-[#f0f0f0]">
        {children}
      </body>
    </html>
  );
}
