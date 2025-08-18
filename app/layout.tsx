import type React from "react"
import type { Metadata } from "next"
import { Inter, Manrope } from "next/font/google"
import { BlockchainProvider } from "@/components/blockchain-provider"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
})

export const metadata: Metadata = {
  title: "UNIZIK Blockchain Voting System",
  description: "Secure and transparent blockchain-based voting system for Nnamdi Azikiwe University",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} antialiased`}>
      <body className="font-sans">
        <BlockchainProvider>{children}</BlockchainProvider>
      </body>
    </html>
  )
}
