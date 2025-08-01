"use client"

import { Button } from "@/components/ui/button"
import { MessageCircle } from "lucide-react"

export default function WhatsAppButton() {
  const phoneNumber = "+1234567890" // Replace with your WhatsApp number
  const message = "Hello, I'm interested in your products/services." // Pre-filled message

  const handleClick = () => {
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`
    window.open(url, "_blank")
  }

  return (
    <Button
      onClick={handleClick}
      className="fixed bottom-4 right-4 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg z-50"
      size="icon"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </Button>
  )
}
