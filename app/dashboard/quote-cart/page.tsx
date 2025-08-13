"use client"

import { useEffect, useMemo, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"

import { useQuote } from "@/app/context/quote-context"
import { useToast } from "@/hooks/use-toast"

// ⬇️ Uses your existing Supabase client helper (client-side)
import { createClient } from "@/lib/supabase/client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import AddressSelector from "@/components/address-selector"

type QuoteItem = {
  code: string
  name: string
  quantity: number
}

type OrderRow = {
  id: string
  created_at: string
  status: string | null
  grand_total: number | null
  checkout_snapshot: any | null
}

export default function QuoteCartPage() {
  const supabase = useMemo(() => createClient(), [])
  const router = useRouter()
  const { toast } = useToast()

  const { items, updateQuantity, removeItem, clearQuote, isLoaded } = useQuote()

  const [mounted, setMounted] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  // Orders from DB
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [openOrderId, setOpenOrderId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [shippingAddress, setShippingAddress] = useState<any | null>(null)
  const [saveAddress, setSaveAddress] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!mounted) return
    fetchOrders()

    // Realtime: refresh orders list on any change to this user's orders
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id
      if (!uid) return
      const channel = supabase
        .channel("orders-for-user")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${uid}` },
          () => fetchOrders()
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted])

  async function fetchOrders() {
    setOrdersLoading(true)

    const { data: auth } = await supabase.auth.getUser()
    const uid = auth.user?.id
    if (!uid) {
      setOrders([])
      setOrdersLoading(false)
      return
    }

    const { data, error } = await supabase
      .from("orders")
      .select("id, created_at, status, grand_total, checkout_snapshot")
      .eq("user_id", uid) // user_id is now populated for all orders
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Orders fetch error:", error)
      setOrders([])
    } else {
      setOrders(data || [])
    }
    setOrdersLoading(false)
  }

  function normalizeStatus(raw: string | null | undefined) {
    const s = (raw || "").toLowerCase()
    if (s === "awaiting_approval") return "pending"
    if (s === "processing") return "approved" // optional mapping if you used 'processing'
    return s || "pending"
  }

  function statusBadge(raw: string | null | undefined) {
    const s = normalizeStatus(raw)
    const base = "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border"
    const map: Record<string, string> = {
      pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
      approved: "bg-green-50 text-green-800 border-green-200",
      dispatched: "bg-blue-50 text-blue-800 border-blue-200",
      rejected: "bg-red-50 text-red-800 border-red-200",
    }
    return <span className={`${base} ${map[s] || "bg-slate-50 text-slate-700 border-slate-200"}`}>{s}</span>
  }

  async function handleSubmitQuote() {
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      toast({ title: "Please sign in", description: "Sign in to submit your quote request." })
      router.push("/login?next=/quote-cart")
      return
    }
    if (items.length === 0) return

    setSubmitting(true)
    try {
      // Optional: enrich from profile if you store it
      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name,last_name,company_name,gst,phone,email")
        .eq("id", auth.user.id) // profiles.id = auth.uid()
        .maybeSingle()

      // Build payload for /api/orders
      const payload: any = {
        items: items.map((i: QuoteItem) => ({
          sku: i.code,
          name: i.name,
          qty: i.quantity,
        })),
        customer: {
          first_name: profile?.first_name || null,
          last_name: profile?.last_name || null,
          company_name: profile?.company_name || null,
          gst: profile?.gst || null,
          phone: profile?.phone || null,
          email: profile?.email || auth.user.email || null,
        },
        source: "quote-cart",
      }
      if (shippingAddress) payload.shipping_address = shippingAddress

      if (saveAddress && shippingAddress && !shippingAddress.id) {
        await fetch("/api/me/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(shippingAddress),
        }).catch(() => {})
      }

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const msg = await res.text()
        throw new Error(msg || "Failed to submit quote")
      }

      clearQuote()
      toast({
        title: "Quote submitted",
        description: "We’ve received your request. You’ll see status updates here.",
      })
      await fetchOrders()
    } catch (e: any) {
      console.error(e)
      toast({
        title: "Error",
        description: e.message || "Could not submit quote",
        variant: "destructive" as any,
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!mounted || !isLoaded) {
    return (
      <div className="container mx-auto py-16">
        <Card className="bg-white/80 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Loading Quote Dashboard...</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const hasDraft = items.length > 0

  return (
    <div className="container mx-auto py-12 space-y-10">
      {/* Draft Quote (local cart) */}
      <Card className="bg-white/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Your Quote Cart</CardTitle>
        </CardHeader>
        <CardContent>
          {hasDraft ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="w-[120px]">Quantity</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.code}>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell>{item.code}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) =>
                            updateQuantity(item.code, Number.parseInt(e.target.value || "1", 10))
                          }
                          className="w-20"
                          min={1}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(item.code)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <AddressSelector value={shippingAddress} onChange={setShippingAddress} />
                  <div className="flex items-center gap-2 mt-2">
                    <Checkbox
                      id="save-address"
                      checked={saveAddress}
                      onCheckedChange={(v) => setSaveAddress(!!v)}
                    />
                    <Label htmlFor="save-address">Save this address</Label>
                  </div>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => clearQuote()}>Clear</Button>
                  <Button size="lg" onClick={handleSubmitQuote} disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit Quote Request"}
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <h2 className="text-xl font-semibold mb-2">Your quote cart is empty</h2>
              <p className="text-slate-600 mb-6">Browse products to add items to your quote.</p>
              <Button asChild>
                <Link href="/products/commercial">Browse Products</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submitted Quotes / Orders */}
      <Card className="bg-white/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Your Submitted Quotes / Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="text-sm text-slate-600">Loading your orders…</div>
          ) : orders.length === 0 ? (
            <div className="text-sm text-slate-600">No submitted quotes yet.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Created</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Items</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((o) => {
                  const itemsSnap: any[] =
                    (o.checkout_snapshot?.items as any[]) ??
                    (o.checkout_snapshot?.cart?.items as any[]) ??
                    []
                  const count = Array.isArray(itemsSnap) ? itemsSnap.length : 0
                  const total = o.grand_total ?? 0
                  const open = openOrderId === o.id
                  return (
                    <>
                      <TableRow key={o.id}>
                        <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                        <TableCell className="font-medium">{o.id.slice(0, 8)}…</TableCell>
                        <TableCell>{statusBadge(o.status)}</TableCell>
                        <TableCell className="text-right">{count}</TableCell>
                        <TableCell className="text-right">
                          {Number(total) > 0 ? `₹${Number(total).toFixed(2)}` : "—"}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setOpenOrderId(open ? null : o.id)}
                          >
                            {open ? (
                              <span className="inline-flex items-center gap-1">
                                Hide <ChevronUp className="h-4 w-4" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1">
                                View <ChevronDown className="h-4 w-4" />
                              </span>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {open && (
                        <TableRow key={`${o.id}-details`}>
                          <TableCell colSpan={6}>
                            <div className="rounded-md border p-3 bg-white">
                              {count === 0 ? (
                                <div className="text-sm text-slate-600">No line items stored.</div>
                              ) : (
                                <div className="space-y-2">
                                  {itemsSnap.map((it: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                      <div className="truncate">
                                        <span className="font-medium">{it.name || it.title || "Item"}</span>
                                        {it.sku ? <span className="text-slate-500"> — {it.sku}</span> : null}
                                      </div>
                                      <div className="text-slate-600">Qty: {it.qty || it.quantity || 1}</div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
