import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Package, History, Upload, MessageCircle, Settings } from "lucide-react"

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  const isAdmin = user.user_metadata?.role === "admin"
  const isVendor = user.user_metadata?.role === "vendor"

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <h1 className="text-4xl font-bold text-center mb-8">Welcome, {user.email}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Package className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-2xl font-semibold">My Dashboard</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">View your personalized dashboard with quick access to key features.</p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <History className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-2xl font-semibold">Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">Track your past orders and quote requests.</p>
            <Button asChild>
              <Link href="/dashboard/history">View History</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <Upload className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-2xl font-semibold">Upload Quote</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">Request custom quotes for bulk orders or specific products.</p>
            <Button asChild>
              <Link href="/dashboard/upload">Upload Quote</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
          <CardHeader>
            <MessageCircle className="h-8 w-8 text-primary mb-2" />
            <CardTitle className="text-2xl font-semibold">Quote Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">Review and submit items added to your quote cart.</p>
            <Button asChild>
              <Link href="/dashboard/quote-cart">View Quote Cart</Link>
            </Button>
          </CardContent>
        </Card>

        {isAdmin && (
          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
            <CardHeader>
              <Settings className="h-8 w-8 text-primary mb-2" />
              <CardTitle className="text-2xl font-semibold">Admin Panel</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">Manage users, orders, and site settings.</p>
              <Button asChild>
                <Link href="/dashboard/admin">Go to Admin</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
