"use client"

export const dynamic = "force-dynamic"

import { Suspense, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
  role: "pending" | "client" | "admin" | "rejected"
  created_at: string
}

type Order = {
  id: string
  created_at: string
  user_id: string
  status: "pending" | "confirmed" | "fulfilled" | "cancelled"
  subtotal: number | null
  tax: number | null
  shipping: number | null
  discount: number | null
  grand_total: number | null
}

type OrderItem = {
  id: string
  created_at: string
  order_id: string
  product_id: string | null
  product_name: string
  brand: string | null
  product_code: string | null
  pack_size: string | null
  quantity: number
  unit_price: number
  tax_rate: number | null
  line_total: number
}

type OrderDetails = {
  id: string
  buyer_first_name: string | null
  buyer_last_name: string | null
  company_name: string | null
  buyer_phone: string | null
  shipping_address: {
    address?: string
    city?: string
    state?: string
    pincode?: string
    [k: string]: any
  } | null
  payment_method: string | null
  checkout_snapshot: any | null
}

// ---------- HELPERS ----------
const currency = (n: number | null | undefined) =>
  typeof n === "number" ? n.toLocaleString("en-IN", { style: "currency", currency: "INR" }) : "—"

const formatIST = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

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

// ---------- INNER PAGE (uses useSearchParams) ----------
function AdminReviewInner() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Tab state (URL-driven)
  const initialTab = (() => {
    const t = (searchParams.get("tab") || "").toLowerCase()
    if (t === "orders" || t === "clients" || t === "accounts") return t === "clients" ? "accounts" : (t as "orders" | "accounts")
    return searchParams.get("orderId") ? "orders" : "accounts"
  })()

  const [tab, setTab] = useState<"accounts" | "orders">(initialTab)
  const [loading, setLoading] = useState(false)

  // Accounts state
  const [accounts, setAccounts] = useState<Profile[]>([])
  const [acctQ, setAcctQ] = useState("")

  // Orders state
  const [orders, setOrders] = useState<Order[]>([])
  const [orderQ, setOrderQ] = useState("")

  // Items viewer state
  const [openOrderId, setOpenOrderId] = useState<string | null>(null)
  const [items, setItems] = useState<OrderItem[]>([])
  const [itemsLoading, setItemsLoading] = useState(false)

  // Details viewer state
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [detailsLoading, setDetailsLoading] = useState(false)

  // Keep URL in sync when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab === "accounts" ? "clients" : "orders")
    if (tab === "orders") {
      if (openOrderId) params.set("orderId", openOrderId)
    } else {
      params.delete("orderId")
    }
    router.replace(`/admin/review?${params.toString()}`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Realtime subscriptions
  useEffect(() => {
    const channel = supabase
      .channel("admin-review")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "profiles" }, (payload) =>
        setAccounts((prev) => [payload.new as Profile, ...prev])
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "profiles" }, (payload) =>
        setAccounts((prev) => prev.map((p) => (p.id === (payload.new as any).id ? (payload.new as Profile) : p)))
      )
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, (payload) =>
        setOrders((prev) => [payload.new as Order, ...prev])
      )
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders" }, (payload) =>
        setOrders((prev) => prev.map((o) => (o.id === (payload.new as any).id ? (payload.new as Order) : o)))
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // If URL has orderId, auto-open
  useEffect(() => {
    const id = searchParams.get("orderId")
    if (id) {
      setTab("orders")
      viewItems(id, { pushUrl: false })
      viewOrderDetails(id, { pushUrl: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  // Search filters
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
      [o.id, o.status].filter(Boolean).some((v) => String(v).toLowerCase().includes(q))
    )
  }, [orders, orderQ])

  // View order items
  async function viewItems(orderId: string, opts: { pushUrl?: boolean } = { pushUrl: true }) {
    setOpenOrderId(orderId)
    setItems([])
    setItemsLoading(true)
    const { data, error } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true })
    setItemsLoading(false)
    if (!error) setItems((data || []) as OrderItem[])

    if (opts.pushUrl) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", "orders")
      params.set("orderId", orderId)
      router.replace(`/admin/review?${params.toString()}`)
    }
  }

  // View order details
  async function viewOrderDetails(orderId: string, opts: { pushUrl?: boolean } = { pushUrl: true }) {
    setDetailsLoading(true)
    setOrderDetails(null)
    const { data, error } = await supabase
      .from("orders")
      .select("id, buyer_first_name, buyer_last_name, company_name, buyer_phone, shipping_address, payment_method, checkout_snapshot")
      .eq("id", orderId)
      .single()
    setDetailsLoading(false)
    if (!error) setOrderDetails(data as OrderDetails)

    if (opts.pushUrl) {
      const params = new URLSearchParams(searchParams.toString())
      params.set("tab", "orders")
      params.set("orderId", orderId)
      router.replace(`/admin/review?${params.toString()}`)
    }
  }

  // ---------- UI ----------
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">Admin • Review Center</h1>
        <Button variant="outline" size="sm" onClick={() => location.reload()}>
          <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
        </Button>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
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
                        <td className="py-2 pr-4">{formatIST(a.created_at)}</td>
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
                        <td className="py-2 pr-4">{currency(o.subtotal)}</td>
                        <td className="py-2 pr-4">{currency(o.tax)}</td>
                        <td className="py-2 pr-4">{currency(o.shipping)}</td>
                        <td className="py-2 pr-4">{currency(o.discount)}</td>
                        <td className="py-2 pr-4 font-semibold">{currency(o.grand_total)}</td>
                        <td className="py-2 pr-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setTab("orders")
                                viewItems(o.id)
                              }}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setTab("orders")
                                viewOrderDetails(o.id)
                              }}
                            >
                              Details
                            </Button>
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

              {/* Items panel */}
              {openOrderId && (
                <div className="mt-4 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Items for Order {openOrderId}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOpenOrderId(null)
                        setItems([])
                        const params = new URLSearchParams(searchParams.toString())
                        params.delete("orderId")
                        router.replace(`/admin/review?${params.toString()}`)
                      }}
                    >
                      Close
                    </Button>
                  </div>

                  {itemsLoading ? (
                    <div className="text-sm text-muted-foreground mt-2">Loading items…</div>
                  ) : items.length === 0 ? (
                    <div className="text-sm text-muted-foreground mt-2">No items found</div>
                  ) : (
                    <div className="overflow-x-auto mt-3">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-left border-b">
                            <th className="py-2 pr-4">Product</th>
                            <th className="py-2 pr-4">Code</th>
                            <th className="py-2 pr-4">Pack</th>
                            <th className="py-2 pr-4">Qty</th>
                            <th className="py-2 pr-4">Unit</th>
                            <th className="py-2 pr-4">Line Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {items.map((it) => (
                            <tr key={it.id} className="border-b last:border-none">
                              <td className="py-2 pr-4">{it.product_name}</td>
                              <td className="py-2 pr-4">{it.product_code || "—"}</td>
                              <td className="py-2 pr-4">{it.pack_size || "—"}</td>
                              <td className="py-2 pr-4">{it.quantity}</td>
                              <td className="py-2 pr-4">{currency(it.unit_price)}</td>
                              <td className="py-2 pr-4">{currency(it.line_total)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Details panel */}
              {orderDetails && (
                <div className="mt-4 rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Order Details — {orderDetails.id}</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setOrderDetails(null)
                        const params = new URLSearchParams(searchParams.toString())
                        params.delete("orderId")
                        router.replace(`/admin/review?${params.toString()}`)
                      }}
                    >
                      Close
                    </Button>
                  </div>

                  {detailsLoading ? (
                    <div className="text-sm text-muted-foreground mt-2">Loading details…</div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 text-sm">
                      <div className="space-y-1">
                        <div className="font-semibold">Buyer</div>
                        <div>
                          {(orderDetails.buyer_first_name || "—")}{" "}
                          {(orderDetails.buyer_last_name || "")}
                        </div>
                        <div>{orderDetails.company_name || "—"}</div>
                        <div>{orderDetails.buyer_phone || "—"}</div>
                      </div>

                      <div className="space-y-1">
                        <div className="font-semibold">Shipping</div>
                        {orderDetails.shipping_address ? (
                          <div className="whitespace-pre-wrap break-words">
                            {[
                              orderDetails.shipping_address.address,
                              orderDetails.shipping_address.city,
                              orderDetails.shipping_address.state,
                              orderDetails.shipping_address.pincode,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </div>
                        ) : (
                          <div>—</div>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="font-semibold">Payment</div>
                        <div>Method: {orderDetails.payment_method || "—"}</div>
                      </div>

                      <div className="space-y-1 md:col-span-3">
                        <details className="mt-2">
                          <summary className="cursor-pointer">Raw checkout snapshot</summary>
                          <pre className="mt-2 whitespace-pre-wrap break-words">
                            {orderDetails.checkout_snapshot
                              ? JSON.stringify(orderDetails.checkout_snapshot, null, 2)
                              : "—"}
                          </pre>
                        </details>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// ---------- DEFAULT EXPORT WRAPPED IN SUSPENSE ----------
export default function AdminReviewPage() {
  return (
    <Suspense
      fallback={
        <div className="container mx-auto py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-64 rounded bg-gray-200" />
            <div className="h-10 w-40 rounded bg-gray-200" />
            <div className="h-64 w-full rounded bg-gray-200" />
          </div>
        </div>
      }
    >
      <AdminReviewInner />
    </Suspense>
  )
}
