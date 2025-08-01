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
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { useCart } from "@/app/context/CartContext"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { CheckCircle, Banknote, CreditCard, QrCode } from "lucide-react"

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
    paymentMethod: "bank_transfer",
    specialInstructions: "",
  })

  // Calculate totals
  const subtotal = state.total
  const shippingCharges = subtotal < 10000 ? 500 : 0
  const gst = (subtotal + shippingCharges) * 0.18
  const grandTotal = subtotal + shippingCharges + gst

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

      // Clear cart and redirect
      clearCart()

      toast({
        title: "Order Submitted Successfully!",
        description: "We will contact you within 24 hours for order confirmation.",
      })

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-8">
            <Banknote className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Cart is Empty</h2>
            <p className="text-gray-600 mb-6">Add some products to your cart before proceeding to payment.</p>
            <Button asChild>
              <Link href="/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Order</h1>
          <p className="text-gray-600">Review your order and provide payment details</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Important Notice */}
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center text-orange-800">
                  <Banknote className="h-5 w-5 mr-2" />
                  Important Notice
                </CardTitle>
              </CardHeader>
              <CardContent className="text-orange-700">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Orders are subject to confirmation and availability
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    We will contact you within 24 hours for order verification
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Payment is processed only after order confirmation
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                    Free shipping on orders above ₹10,000
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Company Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="h-5 w-5 mr-2" />
                  Company Information
                </CardTitle>
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
                      placeholder="e.g., 22AAAAA0000A1Z5"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="h-5 w-5 mr-2" />
                  Shipping Address
                </CardTitle>
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
                    <Label htmlFor="pincode">PIN Code *</Label>
                    <Input id="pincode" name="pincode" value={formData.pincode} onChange={handleInputChange} required />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Banknote className="h-5 w-5 mr-2" />
                  Payment Method
                </CardTitle>
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
                    <Label htmlFor="bank_transfer" className="flex items-center">
                      <Banknote className="h-4 w-4 mr-2" />
                      Bank Transfer / NEFT / RTGS
                    </Label>
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
                    <Label htmlFor="credit_terms" className="flex items-center">
                      <CreditCard className="h-4 w-4 mr-2" />
                      Credit Terms (Net 30) - Corporate Only
                    </Label>
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
                    <Label htmlFor="cheque" className="flex items-center">
                      <Banknote className="h-4 w-4 mr-2" />
                      Cheque Payment
                    </Label>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <Banknote className="h-5 w-5 text-blue-600 mr-2 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Secure Payment Process</p>
                      <p>No upfront payment required. Payment details will be shared after order confirmation.</p>
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
                <div className="text-sm text-gray-600 space-y-2">
                  <p>• Orders are subject to availability and confirmation</p>
                  <p>• Prices are subject to change without prior notice</p>
                  <p>• Delivery timeline: 7-15 business days after confirmation</p>
                  <p>• Shipping charges apply for orders below ₹10,000</p>
                  <p>• GST will be added as applicable</p>
                  <p>• Returns accepted only for damaged or incorrect items</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" checked={acceptedTerms} onCheckedChange={setAcceptedTerms} />
                  <Label htmlFor="terms" className="text-sm">
                    I accept the{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline">
                      terms and conditions
                    </Link>
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
                {/* Items */}
                <div className="space-y-3">
                  {state.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <p className="font-medium line-clamp-2">{item.name}</p>
                        <p className="text-gray-500">
                          {item.brand} • Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium ml-2">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({state.itemCount} items)</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center">
                      Shipping
                      {subtotal >= 10000 && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          FREE
                        </Badge>
                      )}
                    </span>
                    <span>₹{shippingCharges.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (18%)</span>
                    <span>₹{gst.toLocaleString()}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{grandTotal.toLocaleString()}</span>
                  </div>
                </div>

                {subtotal < 10000 && (
                  <div className="bg-yellow-50 p-3 rounded-lg text-sm">
                    <p className="text-yellow-800">
                      Add ₹{(10000 - subtotal).toLocaleString()} more for free shipping!
                    </p>
                  </div>
                )}

                {/* Contact Info */}
                <div className="bg-gray-50 p-3 rounded-lg text-sm">
                  <p className="font-medium mb-2">Need Help?</p>
                  <div className="space-y-1 text-gray-600">
                    <div className="flex items-center">
                      <Banknote className="h-3 w-3 mr-2" />
                      <span>+91 98765 43210</span>
                    </div>
                    <div className="flex items-center">
                      <Banknote className="h-3 w-3 mr-2" />
                      <span>orders@chemcorp.com</span>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button onClick={handleSubmit} disabled={isSubmitting || !acceptedTerms} className="w-full" size="lg">
                  {isSubmitting ? "Submitting Order..." : "Submit Order"}
                </Button>

                <p className="text-xs text-gray-500 text-center">Your order will be confirmed within 24 hours</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Payment Information Section */}
        <section className="mb-12 mt-12">
          <h1 className="text-4xl font-bold text-center mb-8">Payment Information</h1>
          <p className="text-lg text-center text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            We offer various secure and convenient payment methods to ensure a smooth transaction process for our
            customers.
          </p>
        </section>

        <Separator className="my-12" />

        {/* Accepted Payment Methods Section */}
        <section className="mb-12">
          <h2 className="text-3xl font-semibold text-center mb-6">Accepted Payment Methods</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Credit/Debit Cards</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Visa</li>
                  <li>Mastercard</li>
                  <li>American Express</li>
                  <li>RuPay</li>
                </ul>
                <p className="text-sm text-gray-500 mt-4">
                  All card transactions are processed securely through our encrypted payment gateway.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Bank Transfers</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  For larger orders or corporate accounts, we accept direct bank transfers.
                </p>
                <p className="text-sm text-gray-500">
                  Please contact our sales team for bank details and to arrange your transfer.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Purchase Orders (PO)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-2">
                  Approved institutional and corporate clients can use Purchase Orders.
                </p>
                <p className="text-sm text-gray-500">
                  Please ensure your PO is authorized and includes all necessary details.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">UPI / QR Code Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Conveniently pay using UPI apps or by scanning a QR code. Available for instant payments.
                </p>
                <div className="mt-4 flex justify-center gap-2">
                  <img src="/placeholder.svg?height=30&width=50" alt="UPI" className="h-6" />
                  <img src="/placeholder.svg?height=30&width=50" alt="Paytm" className="h-6" />
                  <img src="/placeholder.svg?height=30&width=50" alt="Google Pay" className="h-6" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Cash on Delivery (COD)</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Pay for your order in cash when it is delivered to your doorstep. Available for select locations and
                  order values.
                </p>
                <p className="text-sm text-gray-500 mt-2">(Please check availability during checkout)</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Cheque / Demand Draft</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">
                  Payments via Cheque or Demand Draft are accepted. Orders will be dispatched upon successful clearance
                  of the instrument.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="my-12" />

        {/* Payment Security Section */}
        <section>
          <h2 className="text-3xl font-semibold text-center mb-6">Payment Security</h2>
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  **SSL Encryption:** Our website uses industry-standard SSL encryption to protect your personal and
                  payment information during transmission.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  **PCI DSS Compliance:** We adhere to Payment Card Industry Data Security Standard (PCI DSS) guidelines
                  to ensure the secure handling of credit card information.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-1" />
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  **Fraud Protection:** We employ advanced fraud detection systems to safeguard your transactions and
                  prevent unauthorized access.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* New Payment Options Section */}
        <section className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 dark:text-gray-50 mb-4">Payment Options</h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            We offer a variety of secure and convenient payment methods to make your purchasing experience smooth and
            hassle-free.
          </p>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <CardHeader>
              <CreditCard className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Credit/Debit Cards</CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-gray-700 dark:text-gray-300">
              <p className="mb-4">
                We accept all major credit and debit cards, including Visa, MasterCard, American Express, and RuPay.
                Payments are processed securely through our encrypted gateway.
              </p>
              <ul className="list-disc list-inside text-left mx-auto max-w-xs">
                <li>Instant processing</li>
                <li>Secure transactions</li>
                <li>Widely accepted</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <CardHeader>
              <Banknote className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Bank Transfer (NEFT/RTGS)
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-gray-700 dark:text-gray-300">
              <p className="mb-4">
                For larger orders or institutional purchases, you can opt for direct bank transfers. Our bank details
                will be provided upon order confirmation.
              </p>
              <ul className="list-disc list-inside text-left mx-auto max-w-xs">
                <li>Ideal for bulk orders</li>
                <li>No transaction fees</li>
                <li>Secure and traceable</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 text-center">
            <CardHeader>
              <QrCode className="mx-auto h-16 w-16 text-primary mb-4" />
              <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                UPI / QR Code Payments
              </CardTitle>
            </CardHeader>
            <CardContent className="text-lg text-gray-700 dark:text-gray-300">
              <p className="mb-4">
                Make quick and easy payments using UPI apps or by scanning our QR code. This option is available for
                instant payments.
              </p>
              <ul className="list-disc list-inside text-left mx-auto max-w-xs">
                <li>Fast and convenient</li>
                <li>Zero transaction charges</li>
                <li>Supported by all major UPI apps</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* New Assistance Section */}
        <section className="text-center bg-gray-100 dark:bg-gray-800 p-8 rounded-lg">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Secure Transactions</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Your security is our top priority. All online transactions are protected with industry-standard encryption
            and fraud prevention measures.
          </p>
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
        </section>

        <section className="mt-12 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">Need Assistance?</h2>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            If you have any questions regarding payments or need help with your order, please don&apos;t hesitate to
            contact our support team.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            Contact Support
          </Link>
        </section>
      </div>
    </div>
  )
}
