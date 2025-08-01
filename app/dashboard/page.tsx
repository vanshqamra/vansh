import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, History, Upload, Settings } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome to Your Dashboard, {user.email}!</h1>
      <p className="text-lg text-gray-600 text-center max-w-3xl mx-auto mb-12">
        Here you can manage your orders, quotes, and account settings.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Package className="h-12 w-12 text-blue-600 mb-4" />
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View your past orders and track their status.</p>
            <Button asChild>
              <Link href="/dashboard/history">Go to Orders</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Upload className="h-12 w-12 text-green-600 mb-4" />
          <CardHeader>
            <CardTitle>Upload Quote Request</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Submit a new quote request or upload relevant documents.</p>
            <Button asChild>
              <Link href="/dashboard/upload">Upload Document</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <History className="h-12 w-12 text-purple-600 mb-4" />
          <CardHeader>
            <CardTitle>Quote Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Review and manage items in your current quote cart.</p>
            <Button asChild>
              <Link href="/dashboard/quote-cart">Go to Quote Cart</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center p-6 text-center">
          <Settings className="h-12 w-12 text-orange-600 mb-4" />
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">Update your profile information and preferences.</p>
            <Button asChild>
              <Link href="/dashboard/settings">Manage Settings</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
