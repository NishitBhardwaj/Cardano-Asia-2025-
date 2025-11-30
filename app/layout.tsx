import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap', // Optimize font loading
  preload: true,
});

// Dynamically import ChatbotButton to avoid SSR issues
const ChatbotButton = dynamic(() => import("@/components/ChatbotButton"), {
  ssr: false,
  loading: () => null, // No loading state for floating button
});

// Dynamically import CookieConsent
const CookieConsent = dynamic(() => import("@/components/CookieConsent"), {
  ssr: false,
});

// Dynamically import AdminInitializer to automatically create admin account
const AdminInitializer = dynamic(
  () => import("@/components/AdminInitializer").then((mod) => ({ default: mod.AdminInitializer })),
  {
    ssr: false,
    loading: () => null,
  }
);

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: '#0f172a',
};

export const metadata: Metadata = {
  title: "DonateDAO - Cardano Community Donation Platform",
  description: "Transparent community donation platform with multi-sig treasury and governance on Cardano blockchain",
  keywords: ["Cardano", "Donation", "Blockchain", "DApp", "Crowdfunding", "DAO"],
  authors: [{ name: "DonateDAO Team" }],
  openGraph: {
    title: "DonateDAO - Cardano Community Donation Platform",
    description: "Transparent community donation platform with multi-sig treasury and governance on Cardano",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen`} suppressHydrationWarning>
        <AdminInitializer />
        {children}
        <ChatbotButton />
        <CookieConsent />
      </body>
    </html>
  );
}
