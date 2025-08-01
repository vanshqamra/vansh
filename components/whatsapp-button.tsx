"use client"

import { FaWhatsapp } from "react-icons/fa"

export function WhatsAppButton() {
  const phoneNumber = "919915533998"
  const message = "Hello! I have a question about your products."
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 text-white rounded-full p-4 shadow-lg hover:bg-green-600 transition-transform hover:scale-110"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp className="w-8 h-8" />
    </a>
  )
}
