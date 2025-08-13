"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface OrderRow {
  id: string
  created_at: string
  status: string | null
  grand_total: number | null
  checkout_snapshot: any | null
  company_name?: string | null
}

function statusBadge(status: string | null | undefined) {
  const s = (status || "pending").toLowerCase()
  const color: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    dispatched: "bg-blue-100 text-blue-800",
    rejected: "bg-red-100 text-red-800",
  }
  return <Badge className={color[s] || "bg-gray-100 text-gray-800"}>{s}</Badge>
}

function normalizeItem(it: any) {
  return {
    name: it?.name ?? it?.product_name ?? it?.title ?? "Item",
    sku: it?.sku ?? it?.code ?? it?.product_code ?? it?.id ?? "",
    qty: Number(it?.qty ?? it?.quantity ?? it?.count ?? 1),
  }
}

function extractItems(snapshot: any): Array<{ name: string; sku: string; qty: number }> {
  if (!snapshot) return []
  const direct = (src: any) => (Array.isArray(src) ? src : undefined)
  let arr = direct(snapshot.items) || direct(snapshot.products)
  if (arr) return arr.map(normalizeItem)
  for (const v of Object.values(snapshot)) {
    if (Array.isArray(v) && v.length && typeof v[0] === "object") {
      return v.map(normalizeItem)
    } else if (v && typeof v === "object") {
      const found = extractItems(v)
      if (found.length) return found
    }
  }
  return []
}

export default function HistoryPage() {
  const supabase = useMemo(() => createClient(), [])
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [openId, setOpenId] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({})

  useEffect(() => {
    let unsub: (() => void) | undefined
    const load = async () => {
      const res = await fetch("/api/me/orders", { cache: "no-store" })
      if (!res.ok) return
      const json = await res.json()
      setOrders(json.orders || [])
      if (json.uid) {
        const channel = supabase
          .channel("orders-history")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${json.uid}` },
            () => {
              fetch("/api/me/orders", { cache: "no-store" })
                .then((r) => r.json())
                .then((j) => setOrders(j.orders || []))
            }
          )
          .subscribe()
        unsub = () => supabase.removeChannel(channel)
      }
    }
    load()
    return () => {
      if (unsub) unsub()
    }
  }, [supabase])

  return (
    <div className="container mx-auto py-12">
      <Card className="bg-white/80 backdrop-blur-md">
        <CardHeader>
          <CardTitle>Order History</CardTitle>
          <CardDescription>Your recent quotes and orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">View</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const items = extractItems(o.checkout_snapshot)
                const open = openId === o.id
                return (
                  <>
                    <TableRow key={o.id}>
                      <TableCell className="font-medium">{o.id.slice(0, 8)}…</TableCell>
                      <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                      <TableCell>{items.length}</TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell className="text-right">{(o.grand_total ?? 0) > 0 ? `₹${(o.grand_total ?? 0).toFixed(2)}` : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setOpenId(open ? null : o.id)}>
                          {open ? "Hide" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>
                    {open && (
                      <TableRow key={`${o.id}-details`}>
                        <TableCell colSpan={6}>
                          <div className="border rounded-md p-4 space-y-4">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
                              {statusBadge(o.status)}
                              <div>Placed: {new Date(o.created_at).toLocaleString()}</div>
                              <div>Total: {(o.grand_total ?? 0) > 0 ? `₹${(o.grand_total ?? 0).toFixed(2)}` : "—"}</div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="font-medium mb-1">Customer</div>
                                <div>{o.checkout_snapshot?.customer?.first_name} {o.checkout_snapshot?.customer?.last_name}</div>
                                {o.checkout_snapshot?.customer?.company && (
                                  <div className="text-slate-600">{o.checkout_snapshot.customer.company}</div>
                                )}
                                {o.checkout_snapshot?.customer?.email && (
                                  <div className="text-slate-600">{o.checkout_snapshot.customer.email}</div>
                                )}
                                {o.checkout_snapshot?.customer?.phone && (
                                  <div className="text-slate-600">{o.checkout_snapshot.customer.phone}</div>
                                )}
                              </div>
                              <div>
                                <div className="font-medium mb-1">Shipping Address</div>
                                {o.checkout_snapshot?.shipping_address ? (
                                  <div className="whitespace-pre-line text-slate-700">
                                    {`${o.checkout_snapshot.shipping_address.firstName || ""} ${o.checkout_snapshot.shipping_address.lastName || ""}\n${o.checkout_snapshot.shipping_address.address || ""}\n${[o.checkout_snapshot.shipping_address.city, o.checkout_snapshot.shipping_address.state, o.checkout_snapshot.shipping_address.pincode].filter(Boolean).join(", ")}\n${o.checkout_snapshot.shipping_address.country || ""}\n${o.checkout_snapshot.shipping_address.phone || ""}`.trim()}
                                  </div>
                                ) : (
                                  <div className="text-slate-600">—</div>
                                )}
                              </div>
                            </div>
                            <div>
                              <div className="font-medium mb-2">Line Items</div>
                              {items.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Item</TableHead>
                                      <TableHead>Code</TableHead>
                                      <TableHead className="text-right">Qty</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {items.map((it, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell className="font-medium">{it.name}</TableCell>
                                        <TableCell>{it.sku || "—"}</TableCell>
                                        <TableCell className="text-right">{it.qty}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="text-sm text-slate-600">
                                  No items recorded for this order.{' '}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() =>
                                      setShowRaw((m) => ({ ...m, [o.id]: !m[o.id] }))
                                    }
                                  >
                                    {showRaw[o.id] ? "Hide debug" : "Show debug"}
                                  </Button>
                                  {showRaw[o.id] && (
                                    <pre className="mt-2 text-xs bg-slate-50 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(o.checkout_snapshot, null, 2)}
                                    </pre>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
