import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ParallaxBackground } from "@/components/parallax-background"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { Toaster } from "@/components/ui/toaster"
import { CartProvider } from "@/app/context/CartContext"
import { QuoteProvider } from "@/app/context/quote-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chemical Corporation - Premium Laboratory Chemicals & Equipment",
  description:
    "Leading supplier of high-quality laboratory chemicals, scientific instruments, and research equipment. Trusted by laboratories worldwide.",
  keywords: "laboratory chemicals, scientific instruments, research equipment, analytical reagents, lab supplies",
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
            <div className="relative z-10">
              <Header />
              <main className="min-h-screen">{children}</main>
              <Footer />
              <WhatsAppButton />
              <Toaster />
            </div>
          </QuoteProvider>
        </CartProvider>
      </body>
    </html>
  )
}
