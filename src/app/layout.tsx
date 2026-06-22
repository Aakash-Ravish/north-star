import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import UmamiAnalytics from "@/components/analytics/UmamiAnalytics";
import PrivacyNotice from "@/components/analytics/PrivacyNotice";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "North Star - Your Mental Health Companion",
  description: "Meet Pip, your friendly penguin companion on your mental health journey. Track moods, chat safely, and build healthy habits together.",
  keywords: ["mental health", "wellness", "mood tracking", "companion", "therapy", "mindfulness"],
  authors: [{ name: "North Star Team" }],
  creator: "North Star",
  openGraph: {
    title: "North Star - Your Mental Health Companion",
    description: "Meet Pip, your friendly penguin companion on your mental health journey.",
    type: "website",
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#378ADD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      </head>
      <body className={`${inter.className} min-h-full bg-gradient-to-br from-blue-50 via-white to-green-50`}>
        <div className="min-h-full">
          {children}
        </div>

        {/* Privacy-focused Analytics */}
        <UmamiAnalytics />
        <PrivacyNotice />
      </body>
    </html>
  );
}
