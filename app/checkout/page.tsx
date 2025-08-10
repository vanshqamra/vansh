"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useCart } from "@/app/context/CartContext"
import { useAuth } from "@/app/context/auth-context"
import { useRouter } from "next/navigation"
import { CreditCard, Truck, Shield } from "lucide-react"
import Link from "next/link"

export default function CheckoutPage() {
  const { state, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Safe access to cart state with defaults
  const items = state?.items || []
  const totalPrice = state?.total || 0
  const totalItems = state?.itemCount || 0

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && !user) router.push("/login?redirect=/checkout")
  }, [user, router, mounted])

  useEffect(() => {
    if (mounted && items.length === 0) router.push("/cart")
  }, [items.length, router, mounted])

  const taxAmount = Math.round(totalPrice * 0.18)
  const finalTotal = totalPrice + taxAmount

  async function handleSubmitOrder(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setErrorMsg(null)

    if (!acceptedTerms) {
      setErrorMsg("Please accept the terms and conditions.")
      return
    }
    if (!user) {
      setErrorMsg("You must be logged in to place an order.")
      router.push("/login?redirect=/checkout")
      return
    }
    if (!Array.isArray(items) || items.length === 0) {
      setErrorMsg("Your cart is empty.")
      router.push("/cart")
      return
    }

    setIsSubmitting(true)
    try {
      const fd = new FormData(e.currentTarget)

      const customer = {
        firstName: String(fd.get("firstName") || ""),
        lastName:  String(fd.get("lastName") || ""),
        company:   String(fd.get("company") || ""),
        address:   String(fd.get("address") || ""),
        city:      String(fd.get("city") || ""),
        state:     String(fd.get("state") || ""),
        pincode:   String(fd.get("pincode") || ""),
        phone:     String(fd.get("phone") || ""),
        notes:     String(fd.get("notes") || ""),
        paymentMethod,
      }

      // Build line items from your cart context
      const lineItems = items.map((it: any) => ({
        product_id: it.id ?? null,
        product_name: it.name,
        brand: it.brand ?? null,
        product_code: it.code ?? null,
        pack_size: it.pack ?? null,
        quantity: Number(it.quantity ?? it.qty ?? 1),
        unit_price: Number(it.price ?? 0),
        line_total: Number(it.price ?? 0) * Number(it.quantity ?? it.qty ?? 1),
      }))

      const totals = {
        subtotal: totalPrice,
        tax: taxAmount,
        shipping: 0,
        discount: 0,
        grand_total: finalTotal,
      }

      const res = await fetch("/api/orders/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items: lineItems, totals }),
      })

      const json = await res.json()
      if (!res.ok) throw new Error(json?.error || "Order failed")

      // success: clear cart and go to success page (pass order id for reference)
      clearCart()
      router.push(`/order-success?order=${encodeURIComponent(json.orderId)}`)
    } catch (err: any) {
      console.error("checkout error:", err)
      setErrorMsg(err?.message || "Something went wrong placing your order.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4" />
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Please Login</h1>
          <p className="mb-4">You need to be logged in to access checkout.</p>
          <Link href="/login?redirect=/checkout">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Your Cart is Empty</h1>
          <p className="mb-4">Add some products to your cart before checkout.</p>
          <Link href="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>

        {/* Wrap ALL content in one form so we can read fields + submit */}
        <form onSubmit={handleSubmitOrder}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Checkout Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="h-5 w-5" />
                    Shipping Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">First Name</Label>
                      <Input id="firstName" name="firstName" required />
                    </div>
                    <div>
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input id="lastName" name="lastName" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input id="company" name="company" required />
                  </div>
                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Textarea id="address" name="address" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input id="city" name="city" required />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input id="state" name="state" required />
                    </div>
                    <div>
                      <Label htmlFor="pincode">PIN Code</Label>
                      <Input id="pincode" name="pincode" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} name="paymentMethod">
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                      <Label htmlFor="bank_transfer" className="flex-1">
                        <div className="font-medium">Bank Transfer / NEFT</div>
                        <div className="text-sm text-gray-600">Payment after order confirmation</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="credit_terms" id="credit_terms" />
                      <Label htmlFor="credit_terms" className="flex-1">
                        <div className="font-medium">Credit Terms</div>
                        <div className="text-sm text-gray-600">Net 30 days payment terms</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cheque" id="cheque" />
                      <Label htmlFor="cheque" className="flex-1">
                        <div className="font-medium">Cheque Payment</div>
                        <div className="text-sm text-gray-600">Post-dated cheque on delivery</div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-2">
                      <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <div className="font-medium text-blue-900">Payment Security</div>
                        <div className="text-blue-700">
                          Payment will only be processed after we confirm your order and provide final pricing. No charges
                          will be made at this stage.
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Special Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    id="notes"
                    name="notes"
                    placeholder="Any special handling requirements, delivery instructions, or additional notes..."
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm leading-relaxed">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                        Terms and Conditions
                      </Link>{" "}
                      and understand that payment will only be processed after order confirmation.
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
                  <div className="space-y-3">
                    {items.map((item: any) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-gray-600">Qty: {item.quantity}</div>
                        </div>
                        <div className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({totalItems} items)</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span className="text-green-600">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax (18%)</span>
                      <span>₹{taxAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>₹{finalTotal.toLocaleString()}</span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1">
                    <p>• Final pricing subject to confirmation</p>
                    <p>• Payment only after order approval</p>
                    <p>• Free shipping included</p>
                  </div>

                  {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

                  <Button type="submit" className="w-full" size="lg" disabled={!acceptedTerms || isSubmitting}>
                    {isSubmitting ? "Processing Order..." : "Place Order"}
                  </Button>

                  <div className="text-center">
                    <Link href="/cart" className="text-sm text-blue-600 hover:underline">
                      ← Back to Cart
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
