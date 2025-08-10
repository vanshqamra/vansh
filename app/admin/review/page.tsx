"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@supabase/supabase-js"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ChevronDown, RefreshCcw, ShieldCheck, ShieldX, CheckCircle2, XCircle } from "lucide-react"

// ---------- SUPABASE CLIENT (browser) ----------
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
const supabase = createClient(supabaseUrl, supabaseKey)

// ---------- TYPES ----------
type Profile = {
  id: string
  email: string | null
  full_name: string | null
  company: string | null
  phone: string | null
  gstin: string | null
  role: "pending" | "client" | "admin"
  created_at: string
}

type Order = {
  id: string
  created_at: string
  user_id: string
  status: "pending" | "confirmed" | "fulfilled" | "cancelled"
  subtotal: number
  tax: number
  shipping: number
  discount: number
  grand_total: number
}

// ---------- HELPERS ----------
const currency = (n: number | null | undefined) =>
  typeof n === "number" ? n.toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "—"

async function approveUser(userId: string) {
  const { error } = await supabase.from("profiles").update({ role: "client" }).eq("id", userId)
  if (error) throw error
}

async function rejectUser(userId: string) {
  const { error } = await supabase.from("profiles").update({ role: "rejected" }).eq("id", userId)
  if (error) throw error
}

async function setOrderStatus(orderId: string, status: Order["status"]) {
  const { error } = await supabase.from("orders").update({ status }).eq("id", orderId)
  if (error) throw error
}

// ---------- PAGE ----------
export default function AdminReviewPage() {
  const [tab, setTab] = useState("accounts")
  const [loading, setLoading] = useState(false)

  // Accounts state
  const [accounts, setAccounts] = useState<Profile[]>([])
  const [acctQ, setAcctQ] = useState("")

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [orderQ, setOrderQ] = useState("")

  // Initial fetch
  useEffect(() => {
    const init = async () => {
      setLoading(true)
      try {
        const { data: acc, error: accErr } = await supabase
          .from("profiles")
          .select("id,email,full_name,company,phone,gstin,role,created_at")
          .order("created_at", { ascending: false })
        if (accErr) throw accErr
        setAccounts((acc || []) as Profile[])

        const { data: ord, error: ordErr } = await supabase
          .from("orders")
          .select("id,created_at,user_id,status,subtotal,tax,shipping,discount,grand_total")
          .order("created_at", { ascending: false })
        if (ordErr) throw ordErr
        setOrders((ord || []) as Order[])
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("admin-review")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "profiles" },
        (payload) => {
          setAccounts((prev) => [payload.new as Profile, ...prev])
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles" },
        (payload) => {
          setAccounts((prev) => prev.map((p) => (p.id === (payload.new as any).id ? (payload.new as Profile) : p)))
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => [payload.new as Order, ...prev])
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          setOrders((prev) => prev.map((o) => (o.id === (payload.new as any).id ? (payload.new as Order) : o)))
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredAccounts = useMemo(() => {
    const q = acctQ.trim().toLowerCase()
    if (!q) return accounts
    return accounts.filter((a) =>
      [a.email, a.full_name, a.company, a.phone, a.gstin, a.role]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    )
  }, [accounts, acctQ])

  const filteredOrders = useMemo(() => {
    const q = orderQ.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) =>
      [o.id, o.status].some((v) => String(v).toLowerCase().includes(q))
    )
  }, [orders, orderQ])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Admin • Review Center</h1>
        <Button variant="outline" size="sm" onClick={() => location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
        </TabsList>

        {/* ACCOUNTS */}
        <TabsContent value="accounts">
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>New & Pending Accounts</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Search name/email/company/GSTIN…" value={acctQ} onChange={(e) => setAcctQ(e.target.value)} className="w-72" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Created</th>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Company</th>
                      <th className="py-2 pr-4">Phone</th>
                      <th className="py-2 pr-4">GSTIN</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAccounts.map((a) => (
                      <tr key={a.id} className="border-b last:border-none">
                        <td className="py-2 pr-4">{new Date(a.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-4">{a.full_name || "—"}</td>
                        <td className="py-2 pr-4">{a.email}</td>
                        <td className="py-2 pr-4">{a.company || "—"}</td>
                        <td className="py-2 pr-4">{a.phone || "—"}</td>
                        <td className="py-2 pr-4">{a.gstin || "—"}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={a.role === "pending" ? "secondary" : a.role === "client" ? "default" : "destructive"}>{a.role}</Badge>
                        </td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="default" onClick={() => approveUser(a.id)}>
                              <ShieldCheck className="mr-2 h-4 w-4" /> Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => rejectUser(a.id)}>
                              <ShieldX className="mr-2 h-4 w-4" /> Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredAccounts.length === 0 && (
                      <tr>
                        <td className="py-6 text-center text-muted-foreground" colSpan={8}>
                          {loading ? "Loading…" : "No accounts found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ORDERS */}
        <TabsContent value="orders">
          <Card className="mt-4">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Latest Orders</CardTitle>
              <div className="flex gap-2">
                <Input placeholder="Search by ID/status…" value={orderQ} onChange={(e) => setOrderQ(e.target.value)} className="w-64" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Placed</th>
                      <th className="py-2 pr-4">Order ID</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Subtotal</th>
                      <th className="py-2 pr-4">Tax</th>
                      <th className="py-2 pr-4">Shipping</th>
                      <th className="py-2 pr-4">Discount</th>
                      <th className="py-2 pr-4">Grand Total</th>
                      <th className="py-2 pr-4">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((o) => (
                      <tr key={o.id} className="border-b last:border-none">
                        <td className="py-2 pr-4">{new Date(o.created_at).toLocaleString()}</td>
                        <td className="py-2 pr-4 font-mono">{o.id}</td>
                        <td className="py-2 pr-4">
                          <Badge variant={o.status === "pending" ? "secondary" : o.status === "confirmed" ? "default" : o.status === "fulfilled" ? "outline" : "destructive"}>
                            {o.status}
                          </Badge>
                        </td>
                        <td className="py-2 pr-4">{currency(o.subtotal)}</td>
                        <td className="py-2 pr-4">{currency(o.tax)}</td>
                        <td className="py-2 pr-4">{currency(o.shipping)}</td>
                        <td className="py-2 pr-4">{currency(o.discount)}</td>
                        <td className="py-2 pr-4 font-semibold">{currency(o.grand_total)}</td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="default" onClick={() => setOrderStatus(o.id, "confirmed")}> 
                              <CheckCircle2 className="mr-2 h-4 w-4" /> Confirm
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => setOrderStatus(o.id, "fulfilled")}> 
                              <ChevronDown className="mr-2 h-4 w-4" /> Fulfil
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => setOrderStatus(o.id, "cancelled")}> 
                              <XCircle className="mr-2 h-4 w-4" /> Cancel
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredOrders.length === 0 && (
                      <tr>
                        <td className="py-6 text-center text-muted-foreground" colSpan={9}>
                          {loading ? "Loading…" : "No orders found"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
