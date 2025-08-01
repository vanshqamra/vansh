"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })
  const [billingAddress, setBillingAddress] = useState({
    fullName: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    country: "India",
  })
  const [sameAsShipping, setSameAsShipping] = useState(true)
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { items, total: subtotal, itemCount: totalItems } = state

  useEffect(() => {
    if (!items || items.length === 0) {
      router.push("/cart")
      toast({
        title: "Cart Empty",
        description: "Your cart is empty. Please add items before checking out.",
        variant: "destructive",
      })
    }
  }, [items, router, toast])

  useEffect(() => {
    if (user) {
      // Pre-fill user details if available (e.g., from user profile in a real app)
      // For now, just a placeholder
      setShippingAddress((prev) => ({ ...prev, fullName: user.email || "" }))
      setBillingAddress((prev) => ({ ...prev, fullName: user.email || "" }))
    }
  }, [user])

  const shippingCost = subtotal < 10000 ? 500 : 0
  const grandTotal = subtotal + shippingCost

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!termsAccepted) {
      toast({
        title: "Terms and Conditions",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      })
      return
    }

    if (
      !shippingAddress.fullName ||
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.zipCode
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required shipping address fields.",
        variant: "destructive",
      })
      return
    }

    if (
      !sameAsShipping &&
      (!billingAddress.fullName ||
        !billingAddress.addressLine1 ||
        !billingAddress.city ||
        !billingAddress.state ||
        !billingAddress.zipCode)
    ) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required billing address fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Simulate API call to place order
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real application, you would send order details to your backend
      console.log("Order placed:", {
        items,
        shippingAddress,
        billingAddress: sameAsShipping ? shippingAddress : billingAddress,
        total: grandTotal,
        user: user?.id,
      })

      clearCart() // Clear cart after successful order
      toast({
        title: "Order Placed!",
        description: "Your order has been successfully placed.",
        variant: "success",
      })
      router.push("/order-success")
    } catch (error) {
      console.error("Error placing order:", error)
      toast({
        title: "Order Failed",
        description: "There was an error placing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-150px)] text-center p-4">
        <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
        <p className="text-gray-600 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Button onClick={() => router.push("/products")}>Start Shopping</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-3xl font-bold text-center mb-8">Checkout</h1>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Shipping Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Shipping Information</CardTitle>
            <CardDescription>Enter the address where you want your order delivered.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={shippingAddress.fullName}
                onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address1">Address Line 1</Label>
              <Input
                id="address1"
                value={shippingAddress.addressLine1}
                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address2">Address Line 2 (Optional)</Label>
              <Input
                id="address2"
                value={shippingAddress.addressLine2}
                onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={shippingAddress.city}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={shippingAddress.state}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="zipCode">Zip Code</Label>
                <Input
                  id="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="country">Country</Label>
              <Input id="country" value={shippingAddress.country} disabled />
            </div>
          </CardContent>
        </Card>

        {/* Billing Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Billing Information</CardTitle>
            <CardDescription>Enter your billing address.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="sameAsShipping"
                checked={sameAsShipping}
                onCheckedChange={(checked) => setSameAsShipping(checked as boolean)}
              />
              <Label htmlFor="sameAsShipping">Same as shipping address</Label>
            </div>
            {!sameAsShipping && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="billingFullName">Full Name</Label>
                  <Input
                    id="billingFullName"
                    value={billingAddress.fullName}
                    onChange={(e) => setBillingAddress({ ...billingAddress, fullName: e.target.value })}
                    required={!sameAsShipping}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingAddress1">Address Line 1</Label>
                  <Input
                    id="billingAddress1"
                    value={billingAddress.addressLine1}
                    onChange={(e) => setBillingAddress({ ...billingAddress, addressLine1: e.target.value })}
                    required={!sameAsShipping}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingAddress2">Address Line 2 (Optional)</Label>
                  <Input
                    id="billingAddress2"
                    value={billingAddress.addressLine2}
                    onChange={(e) => setBillingAddress({ ...billingAddress, addressLine2: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="billingCity">City</Label>
                    <Input
                      id="billingCity"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      required={!sameAsShipping}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="billingState">State</Label>
                    <Input
                      id="billingState"
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                      required={!sameAsShipping}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="billingZipCode">Zip Code</Label>
                    <Input
                      id="billingZipCode"
                      value={billingAddress.zipCode}
                      onChange={(e) => setBillingAddress({ ...billingAddress, zipCode: e.target.value })}
                      required={!sameAsShipping}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingCountry">Country</Label>
                  <Input id="billingCountry" value={billingAddress.country} disabled />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Order Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal ({totalItems} items)</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? "Free" : `₹${shippingCost.toFixed(2)}`}</span>
              </div>
              {subtotal < 10000 && <p className="text-sm text-gray-500">(Free shipping on orders above ₹10,000)</p>}
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={termsAccepted}
                onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
              />
              <Label htmlFor="terms">
                I agree to the{" "}
                <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                  Terms & Conditions
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !termsAccepted || items.length === 0}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Placing Order...
                </>
              ) : (
                "Place Order"
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
