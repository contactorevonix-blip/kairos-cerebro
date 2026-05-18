import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-inter",
  display:  "swap",
});

export const metadata: Metadata = {
  title:       "KAIROS — Fraud Detection Infrastructure",
  description: "Verify IBANs, emails, phone numbers and links in milliseconds. Stop fraud before it starts.",
  keywords:    ["fraud detection", "IBAN verification", "email validation", "phone scoring", "link scanning", "API"],
  authors:     [{ name: "KAIROS" }],
  openGraph: {
    type:        "website",
    title:       "KAIROS — Fraud Detection Infrastructure",
    description: "Verify IBANs, emails, phones and links in real-time. Free to try, enterprise-ready.",
    siteName:    "KAIROS",
  },
  twitter: {
    card:        "summary_large_image",
    title:       "KAIROS — Fraud Detection Infrastructure",
    description: "Verify IBANs, emails, phones and links in real-time.",
  },
  robots: { index: true, follow: true },
  metadataBase: new URL("https://kairos.app"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
