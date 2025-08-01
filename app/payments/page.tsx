"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, ShieldCheck, Truck, AlertCircle, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function PaymentsPage() {
  const { state, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [formData, setFormData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
    specialInstructions: "",
    paymentMethod: "bank_transfer",
  })

  const subtotal = state.total || 0
  const shippingCharges = subtotal < 10000 ? 500 : 0
  const gst = (subtotal + shippingCharges) * 0.18
  const totalAmount = subtotal + shippingCharges + gst

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!acceptedTerms) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and conditions to proceed.",
        variant: "destructive",
      })
      return
    }

    if (state.items.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before proceeding.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Simulate order submission
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Clear cart after successful submission
      clearCart()

      toast({
        title: "Order Submitted Successfully!",
        description: "We will contact you within 24 hours to confirm your order.",
      })

      // Redirect to order success page
      router.push("/order-success")
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your order. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (state.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white rounded-lg shadow-sm p-8">
              <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cart is Empty</h2>
              <p className="text-gray-600 mb-6">Add some products to your cart before proceeding to payment.</p>
              <Button asChild>
                <Link href="/products">Browse Products</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Button variant="ghost" asChild className="mb-4">
              <Link href="/cart">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Cart
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Payment & Order Confirmation</h1>
            <p className="text-gray-600 mt-2">Complete your order details for processing</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Important Notice */}
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-blue-900">
                    <ShieldCheck className="h-5 w-5 mr-2" />
                    Order Confirmation Process
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-blue-800">
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      Orders are subject to confirmation and availability
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      We will contact you within 24 hours to verify your order
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      Payment is processed only after order confirmation
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      No upfront payment required - pay after confirmation
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {/* Company Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Company Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="companyName">Company Name *</Label>
                      <Input
                        id="companyName"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="contactPerson">Contact Person *</Label>
                      <Input
                        id="contactPerson"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="gstNumber">GST Number (Optional)</Label>
                      <Input
                        id="gstNumber"
                        name="gstNumber"
                        value={formData.gstNumber}
                        onChange={handleInputChange}
                        placeholder="Enter GST number for tax benefits"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card>
                <CardHeader>
                  <CardTitle>Shipping Address</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Complete Address *</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input id="city" name="city" value={formData.city} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input id="state" name="state" value={formData.state} onChange={handleInputChange} required />
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode *</Label>
                      <Input
                        id="pincode"
                        name="pincode"
                        value={formData.pincode}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="bank_transfer"
                        name="paymentMethod"
                        value="bank_transfer"
                        checked={formData.paymentMethod === "bank_transfer"}
                        onChange={handleInputChange}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="bank_transfer">Bank Transfer / NEFT / RTGS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="credit_terms"
                        name="paymentMethod"
                        value="credit_terms"
                        checked={formData.paymentMethod === "credit_terms"}
                        onChange={handleInputChange}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="credit_terms">Credit Terms (Net 30) - Corporate Clients</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id="cheque"
                        name="paymentMethod"
                        value="cheque"
                        checked={formData.paymentMethod === "cheque"}
                        onChange={handleInputChange}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="cheque">Cheque Payment</Label>
                    </div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-800">
                      <ShieldCheck className="h-4 w-4 inline mr-1" />
                      Secure Payment: No upfront charges. Payment details will be shared after order confirmation.
                    </p>
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
                    name="specialInstructions"
                    value={formData.specialInstructions}
                    onChange={handleInputChange}
                    placeholder="Any special delivery instructions or requirements..."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Terms and Conditions */}
              <Card>
                <CardHeader>
                  <CardTitle>Terms and Conditions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-2">
                    <h4 className="font-semibold">Order Processing:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>All orders are subject to product availability and confirmation</li>
                      <li>Prices are subject to change without prior notice</li>
                      <li>Delivery timeline: 7-15 business days after confirmation</li>
                      <li>Orders below ₹10,000 will incur shipping charges as applicable</li>
                      <li>GST will be charged as per current rates</li>
                    </ul>
                    <h4 className="font-semibold mt-4">Payment Terms:</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                      <li>Payment is due only after order confirmation</li>
                      <li>Credit terms available for verified corporate clients</li>
                      <li>All payments must be made in Indian Rupees (INR)</li>
                    </ul>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={acceptedTerms}
                      onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    />
                    <Label htmlFor="terms" className="text-sm">
                      I accept the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        terms and conditions
                      </Link>{" "}
                      and confirm that all information provided is accurate.
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Items */}
                  <div className="space-y-3">
                    {state.items.map((item) => (
                      <div key={item.id} className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{item.name}</h4>
                          <p className="text-xs text-gray-600">
                            {item.brand} • Qty: {item.quantity}
                          </p>
                        </div>
                        <div className="text-sm font-medium">₹{(item.price * item.quantity).toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* Pricing */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal ({state.itemCount} items)</span>
                      <span>₹{subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        <Truck className="h-4 w-4 mr-1" />
                        Shipping
                      </span>
                      <div className="text-right">
                        {shippingCharges > 0 ? (
                          <>
                            <span>₹{shippingCharges}</span>
                            <p className="text-xs text-gray-600">
                              Add ₹{(10000 - subtotal).toLocaleString()} for free shipping
                            </p>
                          </>
                        ) : (
                          <Badge variant="secondary">Free</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (18%)</span>
                      <span>₹{gst.toLocaleString()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalAmount.toLocaleString()}</span>
                  </div>

                  <Button onClick={handleSubmit} disabled={isSubmitting || !acceptedTerms} className="w-full" size="lg">
                    {isSubmitting ? "Submitting Order..." : "Submit Order for Confirmation"}
                  </Button>

                  <p className="text-xs text-gray-600 text-center">
                    By submitting, you agree to our terms and conditions. No payment will be charged until order
                    confirmation.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
