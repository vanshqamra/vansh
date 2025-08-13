"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Eye, EyeOff, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type OrderRow = {
  id: string
  created_at: string
  status: string | null
  grand_total: number | null
  checkout_snapshot: any | null
  company_name?: string | null
  // If your table happens to have a top-level items column in some rows:
  items?: any[] | null
}

type NormalizedItem = { name: string; sku: string; qty: number }

function normalizeStatus(raw: string | null | undefined) {
  const s = (raw || "").toLowerCase()
  if (s === "awaiting_approval") return "pending"
  if (s === "processing") return "approved"
  return s || "pending"
}
function statusClass(status: string | null | undefined) {
  const s = normalizeStatus(status)
  switch (s) {
    case "approved": return "bg-green-100 text-green-800"
    case "pending": return "bg-yellow-100 text-yellow-800"
    case "dispatched": return "bg-blue-100 text-blue-800"
    case "rejected": return "bg-red-100 text-red-800"
    case "paid":
    case "fulfilled": return "bg-emerald-100 text-emerald-800"
    default: return "bg-gray-100 text-gray-800"
  }
}

function extractRawItems(row: OrderRow): any[] {
  const s = row.checkout_snapshot
  const cand = [
    row.items,                           // top-level column (if present)
    s?.items,
    s?.cart?.items,
    s?.order?.items,
    s?.quote?.items,
    s?.line_items,
    s?.products,
    s?.request?.items,
    s?.payload?.items,
  ]
  for (const c of cand) if (Array.isArray(c)) return c
  return []
}
function normalizeItem(it: any): NormalizedItem {
  return {
    name:
      it?.name ??
      it?.title ??
      it?.product_name ??
      it?.description ??
      "Item",
    sku:
      it?.sku ??
      it?.code ??
      it?.product_code ??
      it?.id ??
      it?.part_no ??
      "",
    qty:
      (typeof it?.qty === "number" ? it.qty : undefined) ??
      (typeof it?.quantity === "number" ? it.quantity : undefined) ??
      (typeof it?.count === "number" ? it.count : undefined) ??
      (typeof it?.qty_requested === "number" ? it.qty_requested : undefined) ??
      1,
  }
}

export default function HistoryPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [uid, setUid] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)

  useEffect(() => {
    let unsub: (() => void) | undefined

    const load = async () => {
      setLoading(true)
      const res = await fetch("/api/me/orders", { cache: "no-store" })
      if (!res.ok) {
        setOrders([])
        setUid(null)
        setLoading(false)
        return
      }
      const json = await res.json()
      setOrders(json.orders ?? [])
      setUid(json.uid ?? null)
      setLoading(false)

      if (json.uid) {
        const channel = supabase
          .channel("orders-history-inline")
          .on(
            "postgres_changes",
            { event: "*", schema: "public", table: "orders", filter: `user_id=eq.${json.uid}` },
            () => {
              fetch("/api/me/orders", { cache: "no-store" })
                .then((r) => r.json())
                .then((j) => setOrders(j.orders ?? []))
                .catch(() => {})
            }
          )
          .subscribe()
        unsub = () => supabase.removeChannel(channel)
      }
    }

    load()
    return () => { if (unsub) unsub() }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase()
    if (!q) return orders
    return orders.filter((o) => {
      const idHit = o.id.toLowerCase().includes(q)
      const statusHit = normalizeStatus(o.status).includes(q)
      const items = extractRawItems(o)
      const anyItemHit = items.some((it) =>
        [
          String(it?.name ?? it?.title ?? it?.product_name ?? "").toLowerCase(),
          String(it?.sku ?? it?.code ?? it?.product_code ?? "").toLowerCase(),
        ].some((s) => s.includes(q))
      )
      const companyHit = (o.company_name || "").toLowerCase().includes(q)
      return idHit || statusHit || anyItemHit || companyHit
    })
  }, [orders, searchTerm])

  return (
    <div className="container mx-auto py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">Quote / Order History</h1>
        <p className="text-slate-600">View your submitted quotes and track their status. Click <b>View</b> to expand details.</p>
      </div>

      <Card className="bg-white/80 backdrop-blur-md">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Orders
              </CardTitle>
              <CardDescription>Search by Order ID, status, item code/name, or company.</CardDescription>
            </div>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="text-sm text-slate-600">Loading your orders…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-slate-400 mb-2">
                <Calendar className="h-12 w-12 mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
              <p className="text-slate-600">
                {searchTerm ? "Try adjusting your search terms." : "You haven't submitted any quotes yet."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((o) => {
                    const rawItems = extractRawItems(o)
                    const items: NormalizedItem[] = rawItems.map(normalizeItem)
                    const itemsCount = items.length
                    const total = Number(o.grand_total || 0)
                    const status = normalizeStatus(o.status)
                    const isOpen = openId === o.id

                    return (
                      <>
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.id.slice(0, 8)}…</TableCell>
                          <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{itemsCount} items</TableCell>
                          <TableCell>
                            <Badge className={statusClass(o.status)}>{status}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-right">
                            {total > 0 ? `₹${total.toFixed(2)}` : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setOpenId(isOpen ? null : o.id)}
                              >
                                {isOpen ? (<><EyeOff className="h-4 w-4 mr-1" />Hide</>) : (<><Eye className="h-4 w-4 mr-1" />View</>)}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>

                        {isOpen && (
                          <TableRow key={`${o.id}-details`}>
                            <TableCell colSpan={6}>
                              <div className="rounded-md border p-4 bg-white space-y-6">
                                {/* Summary */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <div className="text-slate-500">Placed</div>
                                    <div className="font-medium">
                                      {new Date(o.created_at).toLocaleString()}
                                    </div>
                                  </div>
                                  <div>
                                    <div className="text-slate-500">Customer</div>
                                    <div className="font-medium">
                                      {o.checkout_snapshot?.customer?.name ||
                                        [o.checkout_snapshot?.customer?.first_name, o.checkout_snapshot?.customer?.last_name].filter(Boolean).join(" ") || "—"}
                                      {o.company_name ? <span className="text-slate-600"> — {o.company_name}</span> : null}
                                    </div>
                                    {o.checkout_snapshot?.customer?.phone ? (
                                      <div className="text-slate-600">{o.checkout_snapshot.customer.phone}</div>
                                    ) : null}
                                    {o.checkout_snapshot?.customer?.email ? (
                                      <div className="text-slate-600">{o.checkout_snapshot.customer.email}</div>
                                    ) : null}
                                  </div>
                                  <div>
                                    <div className="text-slate-500">Total</div>
                                    <div className="font-medium">
                                      {total > 0 ? `₹${total.toFixed(2)}` : "—"}
                                    </div>
                                  </div>
                                </div>

                                {/* Items */}
                                <div>
                                  <div className="text-sm mb-2 text-slate-600">Items</div>
                                  {items.length === 0 ? (
                                    <div className="text-sm text-slate-600">No line items stored.</div>
                                  ) : (
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
                                  )}
                                </div>

                                {/* Shipping (if present) */}
                                {o.checkout_snapshot?.shipping_address ? (
                                  <div>
                                    <div className="text-sm mb-1 text-slate-600">Shipping Address</div>
                                    <pre className="text-xs bg-slate-50 border rounded p-3 overflow-x-auto">
                                      {JSON.stringify(o.checkout_snapshot.shipping_address, null, 2)}
                                    </pre>
                                  </div>
                                ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
