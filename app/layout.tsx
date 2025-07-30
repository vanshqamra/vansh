import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { ParallaxBackground } from "@/components/parallax-background"
import { Toaster } from "@/components/ui/toaster"
import { QuoteProvider } from "@/app/context/quote-context"
import { CartProvider } from "@/app/context/CartContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chemical Corporation - B2B Laboratory Supply Portal",
  description:
    "Your trusted partner for bulk chemicals, laboratory supplies, and scientific instruments. Modern B2B portal for chemical vendors and suppliers.",
  keywords: "chemicals, laboratory supplies, B2B, bulk chemicals, scientific instruments, chemical vendors",
  authors: [{ name: "Chemical Corporation" }],
  openGraph: {
    title: "Chemical Corporation - B2B Laboratory Supply Portal",
    description: "Your trusted partner for bulk chemicals, laboratory supplies, and scientific instruments.",
    type: "website",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <CartProvider>
          <QuoteProvider>
            <ParallaxBackground />
            <div className="relative z-10 min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <WhatsAppButton />
            <Toaster />
          </QuoteProvider>
        </CartProvider>
      </body>
    </html>
  )
}
