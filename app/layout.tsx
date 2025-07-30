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
  title: "Chemical Corporation - Premium Laboratory Chemicals & Equipment",
  description:
    "Leading supplier of high-quality laboratory chemicals, scientific instruments, and research equipment. Trusted by laboratories worldwide.",
  keywords: "laboratory chemicals, scientific instruments, research equipment, chemical supplier",
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
            <Header />
            <main className="min-h-screen">{children}</main>
            <Footer />
            <WhatsAppButton />
            <Toaster />
          </QuoteProvider>
        </CartProvider>
      </body>
    </html>
  )
}
