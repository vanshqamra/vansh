import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { CartProvider } from "@/app/context/CartContext"
import { QuoteProvider } from "@/app/context/quote-context"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chemical Corporation - Laboratory Supplies & Chemicals",
  description:
    "Leading supplier of laboratory chemicals, equipment, and scientific instruments. Quality products from trusted brands like Qualigens, Borosil, Whatman, and more.",
  keywords:
    "laboratory chemicals, scientific instruments, lab equipment, chemical supplies, Qualigens, Borosil, Whatman",
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
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">{children}</main>
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
