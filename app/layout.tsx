// app/layout.tsx

import type { Metadata } from "next";
// ✨ UPDATED: Premium font pairing for an ultra-luxury feel.
import { Inter, Cinzel } from "next/font/google";
import "./globals.css";


// 1. UI/Body Font: Clean, modern, and highly readable.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

// 2. Display/Heading Font: A premium serif with a classical, elegant feel.
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ['400', '700'], // Regular and Bold weights
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Arvista Real Estate| Luxury Homes in India & Nepal",
  description: "Your Gateway to Luxury Living in India & Nepal.",
  icons: {
    icon: "/homebridge.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        // ✨ UPDATED: Applying our new font variables globally.
        className={`${inter.variable} ${cinzel.variable} bg-dark-bg text-white antialiased`}
      >
  
          {children}
          
      </body>
    </html>
  );
}
