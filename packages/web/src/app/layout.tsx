import type { Metadata } from "next";
import { Inter, Fraunces, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import "./globals.css";

const inter = Inter({
  subsets:  ["latin"],
  variable: "--font-sans",
  display:  "swap",
});

const fraunces = Fraunces({
  subsets:  ["latin"],
  variable: "--font-serif",
  display:  "swap",
  weight:   ["300", "400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets:  ["latin"],
  variable: "--font-mono",
  display:  "swap",
  weight:   ["400", "500"],
});

export const metadata: Metadata = {
  title:       "KAIROS — Fraud detection, in one API call",
  description: "Verify emails, IBANs, phone numbers and URLs against real-time fraud signals. Sub-50ms. GDPR-native.",
  metadataBase: new URL("https://kairoscheck.net"),
  openGraph: {
    title:      "KAIROS — Trust, engineered",
    description: "Fraud detection API. Sub-50ms. GDPR-native. Built in Europe.",
    type:        "website",
    locale:      "en",
    siteName:    "KAIROS",
  },
  twitter: {
    card:  "summary_large_image",
    title: "KAIROS — Fraud detection API",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} ${jetbrainsMono.variable} dark`}
    >
      <body className="bg-black text-white antialiased font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
