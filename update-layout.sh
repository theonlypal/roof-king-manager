#!/bin/bash

# Update layout.tsx
cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Roof King Manager",
  description: "Extra work management for roofing projects",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.NodeNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-crown-terracotta text-royal-cream shadow-warm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold transition-all duration-200 hover:text-white">
              Roof King Manager
            </Link>
            <nav className="flex gap-4">
              <Link href="/dashboard" className="transition-all duration-200 hover:text-white hover:underline">
                Dashboard
              </Link>
              <Link href="/jobs/new" className="transition-all duration-200 hover:text-white hover:underline">
                New Job
              </Link>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
EOF

echo "✓ Updated layout.tsx"
