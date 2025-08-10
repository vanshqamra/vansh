// app/dashboard/admin/page.tsx
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { redirect } from "next/navigation"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Package, ClipboardList, Settings, Users } from "lucide-react"

type Order = {
  id: string
  created_at: string
  status: "pending" | "confirmed" | "fulfilled" | "cancelled"
  grand_total: number | null
  user_id: string
}

export default async function AdminDashboardPage() {
  const supabase = getServerSupabase()
  if (!supabase) {
    // If env vars are missing during build, render minimal shell
    return (
      <div className="container mx-auto py-12">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Supabase is not configured.</p>
      </div>
    )
  }

  // Auth
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  // Role check
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profileErr || profile?.role !== "admin") {
    redirect("/dashboard")
  }

  // Latest real orders (for all customers)
  const { data: orders } = await supabase
    .from("orders")
    .select("id, created_at, status, grand_total, user_id")
    .order("created_at", { ascending: false })
    .limit(20)

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Quick controls and a live feed of incoming orders.</p>
      </div>

      {/* Admin Quick Links */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Quick Links</CardTitle>
          <CardDescription>Tools you’ll use most often</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button asChild variant="default" className="justify-start">
              <Link href="/quotations/builder">
                <ClipboardList className="mr-2 h-4 w-4" />
                Quotation Builder
              </Link>
            </Button>
            <Button asChild variant="secondary" className="justify-start">
              <Link href="/admin/restock">
                <Settings className="mr-2 h-4 w-4" />
                Restock Page
              </Link>
            </Button>
            <Button asChild variant="destructive" className="justify-start">
              <Link href="/admin/review">
                <Users className="mr-2 h-4 w-4" />
                Client Approvals & Review
              </Link>
            </Button>
            <Button asChild variant="outline" className="justify-start">
              <Link href="/dashboard/upload">
                <ClipboardList className="mr-2 h-4 w-4" />
                Upload/Import Quotes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Orders Received */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders Received
          </CardTitle>
          <CardDescription>Latest 20 orders across all customers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2 pr-4">Placed</th>
                  <th className="py-2 pr-4">Order ID</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Total</th>
                  <th className="py-2 pr-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(orders || []).map((o: Order) => (
                  <tr key={o.id} className="border-b last:border-none">
                    <td className="py-2 pr-4">{new Date(o.created_at).toLocaleString()}</td>
                    <td className="py-2 pr-4 font-mono">{o.id}</td>
                    <td className="py-2 pr-4 capitalize">{o.status}</td>
                    <td className="py-2 pr-4 font-semibold">
                      {typeof o.grand_total === "number"
                        ? o.grand_total.toLocaleString("en-IN", { style: "currency", currency: "INR" })
                        : "—"}
                    </td>
                    <td className="py-2 pr-4">
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/review#${o.id}`}>Open in Review</Link>
                        </Button>
                        {/* If you have an order details page, link it here */}
                        {/* <Button asChild size="sm" variant="secondary">
                          <Link href={`/orders/${o.id}`}>Details</Link>
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                ))}
                {(!orders || orders.length === 0) && (
                  <tr>
                    <td className="py-6 text-center text-muted-foreground" colSpan={5}>
                      No orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
