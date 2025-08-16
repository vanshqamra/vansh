// app/dashboard/admin/page.tsx
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

import { redirect } from "next/navigation"
import Link from "next/link"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Package, ClipboardList, Settings, Users } from "lucide-react"

type OrderRow = {
  id: string
  created_at: string
  status: "pending" | "confirmed" | "fulfilled" | "cancelled"
  grand_total: number | null
  user_id: string
}

type QuoteRow = {
  id: string
  created_at: string
  title: string | null
  status: string | null
  client_email: string | null
}

type ProfileRow = {
  id: string
  email: string | null
  full_name: string | null

  // new schema (optional)
  company?: string | null
  phone?: string | null
  gstin?: string | null

  // legacy schema (optional)
  company_name?: string | null
  contact_number?: string | null
  gst_no?: string | null

  role: "pending" | "client" | "admin" | "rejected" | null
  status?: "pending" | "approved" | "rejected" | null
  created_at: string
}

export default async function AdminDashboardPage() {
  const supabase = getServerSupabase()
  if (!supabase) {
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Supabase not configured.</p>
      </div>
    )
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()
  if (profile?.role !== "admin") redirect("/dashboard")

  const [{ data: orders }, { data: quotes }, { data: pending }] = await Promise.all([
    supabase
      .from("orders")
      .select("id, created_at, status, grand_total, user_id")
      .order("created_at", { ascending: false })
      .limit(50),

    supabase
      .from("quotations")
      .select("id, created_at, title, status, client_email")
      .order("created_at", { ascending: false })
      .limit(50),

    // 🔧 FIX: use status = 'pending' and select status explicitly
    supabase
      .from("profiles")
      .select(
        "id, email, full_name, company, company_name, phone, contact_number, gstin, gst_no, role, status, created_at"
      )
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .limit(10),
  ])

  const formatIST = (iso: string) =>
    new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

  const formatINR = (n: number) =>
    n.toLocaleString("en-IN", { style: "currency", currency: "INR" })

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Everything you need at a glance.</p>
      </div>

      {/* Quick Links (trimmed) */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Admin Quick Links</CardTitle>
          <CardDescription>Jump straight into common workflows</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Button asChild variant="default" className="justify-start">
              <Link href="/admin/quotation">
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
            <Button asChild variant="outline" className="justify-start sm:col-span-2 lg:col-span-1">
              <Link href="/dashboard/upload">
                <ClipboardList className="mr-2 h-4 w-4" />
                Upload/Import Quotes
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Orders Received */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Orders Received
            </CardTitle>
            <CardDescription>Latest 50 orders across all clients</CardDescription>
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
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(orders || []).map((o: OrderRow) => (
                    <tr key={o.id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{formatIST(o.created_at)}</td>
                      <td className="py-2 pr-4 font-mono">{o.id}</td>
                      <td className="py-2 pr-4">
                        <Badge
                          variant={
                            o.status === "pending"
                              ? "secondary"
                              : o.status === "confirmed"
                              ? "default"
                              : o.status === "fulfilled"
                              ? "outline"
                              : "destructive"
                          }
                        >
                          {o.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4 font-semibold">
                        {typeof o.grand_total === "number" ? formatINR(o.grand_total) : "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <div className="flex gap-2">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/review?tab=orders&orderId=${o.id}`}>Open in Review</Link>
                          </Button>
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

        {/* Quotation Requests */}
        <Card>
          <CardHeader>
            <CardTitle>Quotation Requests</CardTitle>
            <CardDescription>Latest 50 RFQs from customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left border-b">
                    <th className="py-2 pr-4">Submitted</th>
                    <th className="py-2 pr-4">Title</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Client</th>
                    <th className="py-2 pr-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {(quotes || []).map((q: QuoteRow) => (
                    <tr key={q.id} className="border-b last:border-none">
                      <td className="py-2 pr-4">{formatIST(q.created_at)}</td>
                      <td className="py-2 pr-4">{q.title || q.id}</td>
                      <td className="py-2 pr-4">
                        <Badge variant={q.status === "APPROVED" ? "default" : q.status === "REJECTED" ? "destructive" : "secondary"}>
                          {q.status || "PENDING"}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">{q.client_email || "—"}</td>
                      <td className="py-2 pr-4">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/quotations/${q.id}`}>Open</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {(!quotes || quotes.length === 0) && (
                    <tr>
                      <td className="py-6 text-center text-muted-foreground" colSpan={5}>
                        No quotation requests yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Client Approvals — button only */}
<div className="mt-8">
  <Button asChild>
    <Link href="/admin/client-approvals">Open Client Approvals</Link>
  </Button>
</div>
