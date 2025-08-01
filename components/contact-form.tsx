"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

export default function ContactForm() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real application, you would send formData to your backend here
    console.log("Form submitted:", formData)

    setIsSubmitting(false)
    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    })

    toast({
      title: "Message Sent!",
      description: "Thank you for contacting us. We will get back to you shortly.",
      variant: "default",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 border rounded-lg shadow-md">
      <div>
        <Label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </Label>
        <Input
          type="text"
          id="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      <div>
        <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          Email
        </Label>
        <Input
          type="email"
          id="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      <div>
        <Label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
          Subject
        </Label>
        <Input
          type="text"
          id="subject"
          value={formData.subject}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      <div>
        <Label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
          Message
        </Label>
        <Textarea
          id="message"
          value={formData.message}
          onChange={handleChange}
          required
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      <Button type="submit" className="w-full py-2" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
