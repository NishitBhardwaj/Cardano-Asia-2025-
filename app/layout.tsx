import type { Metadata } from "next";
import { Inter } from "next/font/google";
import dynamic from "next/dynamic";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

// Dynamically import ChatbotButton to avoid SSR issues
const ChatbotButton = dynamic(() => import("@/components/ChatbotButton"), {
  ssr: false,
});

export const metadata: Metadata = {
  title: "Cardano Community Donation Wallet",
  description: "Transparent community donation platform with multi-sig and governance on Cardano",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        {children}
        <ChatbotButton />
      </body>
    </html>
  );
}
