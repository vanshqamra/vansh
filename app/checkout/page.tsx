"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/context/CartContext"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"

export default function CheckoutPage() {
  const { state: cartState, clearCart } = useCart()
  const { items, total: subtotal, shippingCost } = cartState
  const router = useRouter()
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    notes: "",
  })
  const [paymentMethod, setPaymentMethod] = useState("cod") // Default to Cash on Delivery
  const [isProcessing, setIsProcessing] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id: string, value: string) => {
    setFormData((prev) => ({ ...prev, [id]: value }))
  }

  const handlePaymentMethodChange = (value: string) => {
    setPaymentMethod(value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    if (items.length === 0) {
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      })
      setIsProcessing(false)
      return
    }

    // Simulate order processing
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // In a real application, you would send order data to your backend
    console.log("Order submitted:", {
      customerInfo: formData,
      cartItems: items,
      totalAmount: subtotal + shippingCost,
      paymentMethod,
    })

    // Clear cart after successful order
    clearCart()

    toast({
      title: "Order Placed!",
      description: "Your order has been successfully placed. Thank you!",
      variant: "default",
    })

    router.push("/order-success")
    setIsProcessing(false)
  }

  if (items.length === 0 && !isProcessing) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-12">
        <Card className="max-w-2xl mx-auto text-center py-12">
          <CardTitle className="mb-4">Your cart is empty.</CardTitle>
          <CardDescription>Looks like you haven't added anything to your cart yet.</CardDescription>
          <Link href="/products">
            <Button className="mt-6">Start Shopping</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Shipping Information */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
              <CardDescription>Enter your delivery address details.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" value={formData.fullName} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" type="tel" value={formData.phone} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={formData.address} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input id="city" value={formData.city} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input id="state" value={formData.state} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="zip">Zip/Postal Code</Label>
                <Input id="zip" value={formData.zip} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleSelectChange("country", value)}>
                  <SelectTrigger id="country">
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="india">India</SelectItem>
                    <SelectItem value="usa">United States</SelectItem>
                    <SelectItem value="canada">Canada</SelectItem>
                    <SelectItem value="uk">United Kingdom</SelectItem>
                    {/* Add more countries as needed */}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <Textarea id="notes" value={formData.notes} onChange={handleInputChange} rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Choose how you'd like to pay.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="cod"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => handlePaymentMethodChange("cod")}
                  className="h-4 w-4"
                />
                <Label htmlFor="cod">Cash on Delivery (COD)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Input
                  type="radio"
                  id="online"
                  name="paymentMethod"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={() => handlePaymentMethodChange("online")}
                  className="h-4 w-4"
                  disabled // Disable online payment for now
                />
                <Label htmlFor="online" className={paymentMethod === "online" ? "" : "text-gray-400"}>
                  Online Payment (Credit Card, UPI, etc.) - Coming Soon
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm text-gray-700">
                    <span>
                      {item.name} (x{item.quantity})
                    </span>
                    <span>₹{(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal:</span>
                <span>₹{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Shipping:</span>
                <span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toLocaleString()}`}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-xl font-extrabold">
                <span>Total:</span>
                <span>₹{(subtotal + shippingCost).toLocaleString()}</span>
              </div>
              <Button type="submit" className="w-full" disabled={isProcessing || items.length === 0}>
                {isProcessing ? "Processing Order..." : "Place Order"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}
