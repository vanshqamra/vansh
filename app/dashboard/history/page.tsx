"use client"

import React, { useEffect, useMemo, useState } from "react"
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

// ---------- JSON & Item helpers ----------
function coerceJSON(v: any): any {
  if (typeof v === "string") {
    try {
      return JSON.parse(v)
    } catch {
      return v
    }
  }
  return v
}

function toArray(val: any): any[] {
  const v = coerceJSON(val)
  if (!v) return []
  if (Array.isArray(v)) return v
  if (typeof v === "object") {
    // object map -> array of { sku, ... }
    const out: any[] = []
    for (const [k, vv] of Object.entries(v)) {
      const w = coerceJSON(vv)
      if (w && typeof w === "object" && !Array.isArray(w)) out.push({ sku: k, ...(w as any) })
      else if (typeof w === "number") out.push({ sku: k, qty: w })
      else if (typeof w === "string") out.push({ sku: k, name: w })
    }
    return out
  }
  return []
}

function looksLikeItems(arr: any[]): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false
  const KEYS = ["name", "title", "product_name", "productName", "sku", "code", "product_code", "productCode", "qty", "quantity", "count"]
  let hits = 0
  for (const el of arr) {
    if (el && typeof el === "object" && !Array.isArray(el)) {
      const keys = Object.keys(el)
      if (keys.some((k) => KEYS.includes(k))) hits++
    } else if (typeof el === "string") {
      hits++
    }
    if (hits >= Math.min(2, arr.length)) break
  }
  return hits > 0
}

function normalizeItem(it: any) {
  const rawQty =
    (typeof it?.qty === "number" ? it.qty : undefined) ??
    (typeof it?.quantity === "number" ? it.quantity : undefined) ??
    (typeof it?.count === "number" ? it.count : undefined) ??
    (typeof it === "number" ? it : undefined)

  return {
    name: it?.name ?? it?.product_name ?? it?.productName ?? it?.title ?? it?.description ?? (typeof it === "string" ? it : "Item"),
    sku:
      it?.sku ??
      it?.code ??
      it?.product_code ??
      it?.productCode ??
      it?.id ??
      it?.part_no ??
      (typeof it === "string" ? it : "") ??
      (typeof it?.sku === "number" ? String(it.sku) : ""),
    qty: Number.isFinite(rawQty) ? Number(rawQty) : 1,
  }
}

function fastExtractItems(snapshot: any): any[] {
  if (!snapshot) return []
  const s = coerceJSON(snapshot)
  const candidates = [
    s?.items,
    s?.products,
    s?.order_summary?.items,
    s?.order_summary?.products,
    s?.summary?.items,
    s?.summary?.products,
    s?.checkout?.summary?.items,
    s?.checkout?.summary?.products,
    s?.cart?.items,
    s?.cart?.products,
    s?.order?.items,
    s?.order?.products,
    s?.quote?.items,
    s?.quote?.products,
    s?.line_items,
    s?.payload?.items,
    s?.payload?.products,
    s?.request?.items,
    s?.request?.products,
  ]
  for (const c of candidates) {
    const arr = toArray(c)
    if (looksLikeItems(arr)) return arr
  }
  return []
}

function deepExtractItems(snapshot: any): any[] {
  const root = coerceJSON(snapshot)
  if (!root || typeof root !== "object") return []

  // 1) Fast path first
  const fast = fastExtractItems(root)
  if (fast.length) return fast

  // 2) Deep scan BFS
  const results: any[] = []
  const q: any[] = [root]
  const seen = new Set<any>()

  while (q.length) {
    const node = q.shift()
    if (!node || typeof node !== "object" || seen.has(node)) continue
    seen.add(node)

    if (Array.isArray(node)) {
      if (looksLikeItems(node)) results.push(...node)
      for (const el of node) if (el && typeof el === "object") q.push(el)
      continue
    }

    for (const v of Object.values(node)) {
      const vv = coerceJSON(v)
      if (!vv) continue
      if (Array.isArray(vv)) {
        if (looksLikeItems(vv)) results.push(...vv)
        for (const el of vv) if (el && typeof el === "object") q.push(el)
      } else if (typeof vv === "object") {
        q.push(vv)
      }
    }
  }

  return results
}

function extractItems(snapshot: any) {
  const raw = fastExtractItems(snapshot)
  const arr = raw.length ? raw : deepExtractItems(snapshot)
  return arr.map(normalizeItem)
}

function formatAddress(a: any) {
  if (!a) return "—"
  const parts = [
    [a.firstName, a.lastName].filter(Boolean).join(" "),
    a.company,
    a.address ?? a.line1,
    a.address2 ?? a.line2,
    [a.city, a.state, a.pincode].filter(Boolean).join(", "),
    a.country,
    a.phone ? `Phone: ${a.phone}` : null,
    a.notes ? `Notes: ${a.notes}` : null,
  ].filter(Boolean)
  return parts.join("\n")
}

// ---------- Page ----------
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
                .catch(() => {})
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
                const total = Number(o.grand_total || 0)
                return (
                  <React.Fragment key={o.id}>
                    <TableRow>
                      <TableCell className="font-medium">{o.id.slice(0, 8)}…</TableCell>
                      <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
                      <TableCell>{items.length}</TableCell>
                      <TableCell>{statusBadge(o.status)}</TableCell>
                      <TableCell className="text-right">{total > 0 ? `₹${total.toFixed(2)}` : "—"}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => setOpenId(open ? null : o.id)}>
                          {open ? "Hide" : "View"}
                        </Button>
                      </TableCell>
                    </TableRow>

                    {open && (
                      <TableRow>
                        <TableCell colSpan={6}>
                          <div className="border rounded-md p-4 space-y-4">
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                              <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
                              {statusBadge(o.status)}
                              <div>Placed: {new Date(o.created_at).toLocaleString()}</div>
                              <div>Total: {total > 0 ? `₹${total.toFixed(2)}` : "—"}</div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="font-medium mb-1">Customer</div>
                                <div>
                                  {(o.checkout_snapshot?.customer?.first_name || "") +
                                    " " +
                                    (o.checkout_snapshot?.customer?.last_name || "")}
                                </div>
                                {o.checkout_snapshot?.customer?.company && (
                                  <div className="text-slate-600">
                                    {o.checkout_snapshot.customer.company}
                                  </div>
                                )}
                                {o.checkout_snapshot?.customer?.email && (
                                  <div className="text-slate-600">{o.checkout_snapshot.customer.email}</div>
                                )}
                                {o.checkout_snapshot?.customer?.phone && (
                                  <div className="text-slate-600">{o.checkout_snapshot.customer.phone}</div>
                                )}
                                {!o.checkout_snapshot?.customer?.company && o.company_name && (
                                  <div className="text-slate-600">{o.company_name}</div>
                                )}
                              </div>

                              <div>
                                <div className="font-medium mb-1">Shipping Address</div>
                                {o.checkout_snapshot?.shipping_address ? (
                                  <div className="whitespace-pre-line text-slate-700">
                                    {formatAddress(o.checkout_snapshot.shipping_address)}
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
                                  No items recorded for this order.{" "}
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowRaw((m) => ({ ...m, [o.id]: !m[o.id] }))}
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
                  </React.Fragment>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
