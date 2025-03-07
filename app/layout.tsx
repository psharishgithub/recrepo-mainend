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
      <body className={`${lexend.className} bg-stone-950 h-full`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
