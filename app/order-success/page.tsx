"use client"

import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Mail, Phone, FileText, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  // Prefer the value sent from checkout redirect: /order-success?order=CC123
  const orderNumber =
    searchParams.get("order") || `CC${Date.now().toString().slice(-6)}`

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-green-600 mb-2">Order Submitted Successfully!</h1>
          <p className="text-gray-600">Thank you for choosing Chemical Corporation</p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <FileText className="h-5 w-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-medium">Order Number:</span>
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {orderNumber}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Status:</span>
              <Badge className="bg-yellow-100 text-yellow-800">
                <Clock className="h-3 w-3 mr-1" />
                Pending Review
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium">Submitted:</span>
              <span>
                {new Date().toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>What Happens Next?</CardTitle>
          </CardHeader>
          <CardContent className="text-left space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">1</div>
              <div>
                <h3 className="font-semibold">Order Review</h3>
                <p className="text-gray-600 text-sm">Our team will review your order and verify product availability within 2-4 hours.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">2</div>
              <div>
                <h3 className="font-semibold">Quote Confirmation</h3>
                <p className="text-gray-600 text-sm">We'll send you a detailed quote with final pricing and delivery timeline.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full font-bold text-sm">3</div>
              <div>
                <h3 className="font-semibold">Payment & Processing</h3>
                <p className="text-gray-600 text-sm">After your approval, we'll process payment and prepare your order for shipment.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-left">
                <h3 className="font-semibold text-blue-900">Confirmation Email Sent</h3>
                <p className="text-blue-700 text-sm">
                  We've sent a confirmation email with your order details. Please check your inbox and spam folder.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/dashboard/history">
                View Order History
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" asChild size="lg">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>

          <div className="text-center text-sm text-gray-600 space-y-2">
            <p>Need help with your order?</p>
            <div className="flex justify-center gap-4">
              <a href="tel:+91-9876543210" className="flex items-center gap-1 text-blue-600 hover:underline">
                <Phone className="h-4 w-4" />
                Call Support
              </a>
              <a href="mailto:support@chemicalcorp.com" className="flex items-center gap-1 text-blue-600 hover:underline">
                <Mail className="h-4 w-4" />
                Email Support
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
