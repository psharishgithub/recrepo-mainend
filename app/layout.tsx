'use client'
import { Lexend } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { useEffect } from "react";


const lexend = Lexend({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  

  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#000000" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={`${lexend.className} bg-stone-950 h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
