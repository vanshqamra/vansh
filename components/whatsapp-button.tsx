"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"
import Link from "next/link"

export function WhatsappButton() {
  const phoneNumber = "+919876543210" // Replace with your WhatsApp number
  const message = "Hello, I'm interested in your products/services. Can you please assist me?" // Pre-filled message

  const whatsappLink = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Button asChild size="lg" className="rounded-full p-3 shadow-lg bg-green-500 hover:bg-green-600 text-white">
        <Link href={whatsappLink} target="_blank" rel="noopener noreferrer">
          <MessageCircle className="h-6 w-6" />
          <span className="sr-only">Chat on WhatsApp</span>
        </Link>
      </Button>
    </div>
  )
}
