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
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Truck, Shield, AlertCircle, CheckCircle, ArrowLeft, FileText, Clock } from "lucide-react"
import Link from "next/link"

export default function PaymentsPage() {
  const { state, clearCart } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const [paymentMethod, setPaymentMethod] = useState("bank_transfer")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login?redirect=/payments")
    }
  }, [user, router, mounted])

  useEffect(() => {
    if (mounted && (!state?.items || state.items.length === 0)) {
      router.push("/cart")
    }
  }, [state?.items, router, mounted])

  const items = state?.items || []
  const itemCount = state?.itemCount || 0
  const subtotal = state?.total || 0

  // Calculate shipping charges
  const shippingCharges = subtotal < 10000 ? 500 : 0
  const taxAmount = Math.round((subtotal + shippingCharges) * 0.18)
  const finalTotal = subtotal + shippingCharges + taxAmount

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to proceed",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate order processing
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Clear cart and redirect to success page
      clearCart()

      toast({
        title: "Order Submitted Successfully!",
        description: "We'll contact you within 24 hours for confirmation",
      })

      router.push("/order-success")
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "There was an error processing your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!mounted) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user || items.length === 0) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/cart">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Payment & Order Confirmation</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Important Notice */}
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-amber-900">Important Notice</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                      <li>• Orders are subject to confirmation and availability verification</li>
                      <li>• Final pricing may vary based on current market rates</li>
                      <li>• Payment will only be processed after order confirmation</li>
                      <li>• We will contact you within 24 hours to confirm your order</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

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
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input id="firstName" required />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input id="lastName" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="company">Company Name *</Label>
                  <Input id="company" required />
                </div>
                <div>
                  <Label htmlFor="address">Complete Address *</Label>
                  <Textarea id="address" required rows={3} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input id="city" required />
                  </div>
                  <div>
                    <Label htmlFor="state">State *</Label>
                    <Input id="state" required />
                  </div>
                  <div>
                    <Label htmlFor="pincode">PIN Code *</Label>
                    <Input id="pincode" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input id="phone" type="tel" required />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input id="email" type="email" defaultValue={user.email || ""} required />
                  </div>
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
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="bank_transfer" id="bank_transfer" />
                    <Label htmlFor="bank_transfer" className="flex-1 cursor-pointer">
                      <div className="font-medium">Bank Transfer / NEFT / RTGS</div>
                      <div className="text-sm text-gray-600">Payment after order confirmation</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="credit_terms" id="credit_terms" />
                    <Label htmlFor="credit_terms" className="flex-1 cursor-pointer">
                      <div className="font-medium">Credit Terms (Net 30)</div>
                      <div className="text-sm text-gray-600">For approved corporate clients</div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value="cheque" id="cheque" />
                    <Label htmlFor="cheque" className="flex-1 cursor-pointer">
                      <div className="font-medium">Cheque Payment</div>
                      <div className="text-sm text-gray-600">Post-dated cheque on delivery</div>
                    </Label>
                  </div>
                </RadioGroup>

                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <div className="font-medium text-blue-900">Secure Payment Process</div>
                      <div className="text-blue-700">
                        No payment will be charged at this stage. We will contact you with final pricing and payment
                        instructions after confirming your order.
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
                  placeholder="Any special handling requirements, delivery preferences, or additional notes..."
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Terms and Conditions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Terms and Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                  <h4 className="font-semibold">Order Processing Terms:</h4>
                  <ul className="space-y-1 text-gray-700">
                    <li>• All orders are subject to availability and confirmation</li>
                    <li>• Prices are subject to change based on market conditions</li>
                    <li>• Orders below ₹10,000 will incur shipping charges of ₹500</li>
                    <li>• Free shipping on orders above ₹10,000</li>
                    <li>• Payment terms as per selected method above</li>
                    <li>• Delivery timeline: 3-7 business days after confirmation</li>
                    <li>• Returns accepted within 30 days for unopened products</li>
                  </ul>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                    I agree to the{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline" target="_blank">
                      Terms and Conditions
                    </Link>{" "}
                    and understand that:
                    <br />• This order is subject to confirmation and availability
                    <br />• Final pricing may vary and will be confirmed before payment
                    <br />• Payment will only be processed after order confirmation
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
                  {items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <div className="flex-1">
                        <div className="font-medium truncate">{item.name}</div>
                        <div className="text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                  {items.length > 3 && (
                    <div className="text-sm text-gray-500">... and {items.length - 3} more items</div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className={shippingCharges === 0 ? "text-green-600" : ""}>
                      {shippingCharges === 0 ? "Free" : `₹${shippingCharges.toLocaleString()}`}
                    </span>
                  </div>
                  {subtotal < 10000 && (
                    <div className="text-xs text-amber-600">
                      Add ₹{(10000 - subtotal).toLocaleString()} more for free shipping
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Tax (18%)</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between text-lg font-bold">
                  <span>Estimated Total</span>
                  <span>₹{finalTotal.toLocaleString()}</span>
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p>* Final amount subject to confirmation</p>
                  <p>* Prices may vary based on availability</p>
                </div>

                <Separator />

                <form onSubmit={handleSubmitOrder}>
                  <Button type="submit" className="w-full" size="lg" disabled={!acceptedTerms || isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Submitting Order...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Submit Order for Confirmation
                      </>
                    )}
                  </Button>
                </form>

                <div className="text-center text-xs text-gray-500">
                  <p>Secure order processing</p>
                  <p>We'll contact you within 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
