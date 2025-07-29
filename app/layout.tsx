import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ParallaxBackground } from "@/components/parallax-background"
import { Toaster } from "@/components/ui/toaster"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { QuoteProvider } from "@/context/quote-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: "%s | Chemical Corporation",
    default: "Chemical Corporation - Ultra-Modern B2B Vendor Portal",
  },
  description:
    "The future of B2B chemical and lab supply. An interactive portal for vendors to browse, quote, and order from Chemical Corporation.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className={`${inter.className} bg-transparent text-slate-800`}>
        <QuoteProvider>
          <ParallaxBackground />
          <div className="relative z-10 flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">{children}</main>
            <Footer />
          </div>
          <Toaster />
          <WhatsAppButton />
        </QuoteProvider>
      </body>
    </html>
  )
}
