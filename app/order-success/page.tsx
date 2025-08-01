import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function OrderSuccessPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center bg-gray-100 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="space-y-1">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
          <CardTitle className="text-3xl font-bold">Order Placed Successfully!</CardTitle>
          <CardDescription>Thank you for your purchase. Your order has been confirmed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">You will receive an email confirmation shortly with your order details.</p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/dashboard/history">View Order History</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">Continue Shopping</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
