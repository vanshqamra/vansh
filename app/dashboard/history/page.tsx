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
}

type NormalizedItem = { name: string; sku: string; qty: number }
type PathSeg = string | number

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
    default: return "bg-gray-100 text-gray-800"
  }
}

/** ---------- JSON helpers ---------- */
function coerceJSON(v: any): any {
  if (typeof v === "string") {
    try { return JSON.parse(v) } catch { return v }
  }
  return v
}

function toArray(val: any): any[] {
  const v = coerceJSON(val)
  if (!v) return []
  if (Array.isArray(v)) return v
  if (typeof v === "object") {
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
  const KEYS = ["name","title","product_name","productName","sku","code","product_code","productCode","qty","quantity","count"]
  let hits = 0
  for (const el of arr) {
    if (el && typeof el === "object" && !Array.isArray(el)) {
      const keys = Object.keys(el)
      if (keys.some(k => KEYS.includes(k))) hits++
    } else if (typeof el === "string") {
      hits++
    }
    if (hits >= Math.min(2, arr.length)) break
  }
  return hits > 0
}

/** Try common paths quickly (esp. "order summary" style keys) */
function fastCandidates(snapshot: any): any[] {
  const s = snapshot
  const cands = [
    s?.order_summary?.products,
    s?.order_summary?.items,
    s?.summary?.products,
    s?.summary?.items,
    s?.sidebar?.order_summary?.products,
    s?.sidebar?.order_summary?.items,
    s?.checkout?.summary?.products,
    s?.checkout?.summary?.items,
    s?.products,
    s?.items,
    s?.cart?.products,
    s?.cart?.items,
    s?.order?.products,
    s?.order?.items,
    s?.quote?.products,
    s?.quote?.items,
    s?.line_items,
    s?.payload?.products,
    s?.payload?.items,
    s?.request?.products,
    s?.request?.items,
  ]
  const out: any[] = []
  for (const c of cands) {
    const arr = toArray(c)
    if (looksLikeItems(arr)) out.push(...arr)
  }
  return out
}

/** Deep scan: enumerate every array under the snapshot with its path */
function enumerateArrays(root: any): Array<{ path: PathSeg[]; arr: any[] }> {
  const out: Array<{ path: PathSeg[]; arr: any[] }> = []
  const q: Array<{ node: any; path: PathSeg[] }> = [{ node: coerceJSON(root), path: [] }]
  const seen = new Set<any>()
  while (q.length) {
    const { node, path } = q.shift()!
    if (!node || typeof node !== "object" || seen.has(node)) continue
    seen.add(node)
    if (Array.isArray(node)) {
      out.push({ path, arr: node })
      for (let i = 0; i < node.length; i++) {
        const el = coerceJSON(node[i])
        if (el && typeof el === "object") q.push({ node: el, path: [...path, i] })
      }
      continue
    }
    for (const [k, v] of Object.entries(node)) {
      const vv = coerceJSON(v)
      if (vv && typeof vv === "object") q.push({ node: vv, path: [...path, k] })
      else if (typeof vv === "string") {
        // try parsing stringified JSON
        const parsed = coerceJSON(vv)
        if (parsed && typeof parsed === "object") q.push({ node: parsed, path: [...path, k] })
      }
    }
  }
  return out
}

function pathToString(p: PathSeg[]): string {
  return p.map(seg => typeof seg === "number" ? `[${seg}]` : (p.length && typeof seg === "string" && seg.includes(".") ? `["${seg}"]` : String(seg))).join(".").replace(/\.\[/g, "[")
}

function getByPath(obj: any, p: PathSeg[]): any {
  let cur = obj
  for (const seg of p) {
    if (cur == null) return undefined
    cur = cur[seg as any]
  }
  return cur
}

/** Primary: find items via fast paths, else deep-scan all arrays and pick item-like ones */
function findItems(snapshot: any): { items: any[]; candidates: Array<{ path: PathSeg[]; len: number; sampleKeys: string[] }> } {
  const foundFast = fastCandidates(snapshot)
  if (foundFast.length) return { items: foundFast, candidates: [] }

  const arrays = enumerateArrays(snapshot)
  const itemLike: Array<{ path: PathSeg[]; arr: any[] }> = []
  for (const a of arrays) {
    const arr = toArray(a.arr)
    if (looksLikeItems(arr)) itemLike.push({ path: a.path, arr })
  }

  // Top 8 candidates by length
  const candidates = itemLike
    .sort((a,b)=>b.arr.length - a.arr.length)
    .slice(0, 8)
    .map(x => ({
      path: x.path,
      len: x.arr.length,
      sampleKeys: typeof x.arr[0] === "object" && !Array.isArray(x.arr[0]) ? Object.keys(x.arr[0]).slice(0,6) : []
    }))

  // Auto-pick the longest if any
  if (itemLike.length) {
    const best = itemLike.sort((a,b)=>b.arr.length - a.arr.length)[0]
    return { items: best.arr, candidates }
  }

  return { items: [], candidates }
}

/** Normalize to {name, sku, qty} */
function normalizeItem(it: any): NormalizedItem {
  const rawQty =
    (typeof it?.qty === "number" ? it.qty : undefined) ??
    (typeof it?.quantity === "number" ? it.quantity : undefined) ??
    (typeof it?.count === "number" ? it.count : undefined) ??
    (typeof it?.qty_requested === "number" ? it.qty_requested : undefined) ??
    (typeof it === "number" ? it : undefined)
  const qty = Number.isFinite(rawQty) ? Number(rawQty) : 1

  const name =
    it?.name ??
    it?.product_name ??
    it?.productName ??
    it?.title ??
    it?.description ??
    (typeof it === "string" ? it : "Item")

  const sku =
    it?.sku ??
    it?.code ??
    it?.product_code ??
    it?.productCode ??
    it?.id ??
    it?.part_no ??
    (typeof it === "string" ? it : "") ??
    (typeof it?.sku === "number" ? String(it.sku) : "")

  return { name, sku, qty }
}

/** ---------- Page ---------- */
export default function HistoryPage() {
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [uid, setUid] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [openId, setOpenId] = useState<string | null>(null)
  const [showRaw, setShowRaw] = useState<Record<string, boolean>>({})
  const [manualPath, setManualPath] = useState<Record<string, PathSeg[] | undefined>>({})

  // Fetch via server API + subscribe to realtime
  useEffect(() => {
    let unsub: (() => void) | undefined
    const load = async () => {
      setLoading(true)
      const res = await fetch("/api/me/orders", { cache: "no-store" })
      if (!res.ok) { setOrders([]); setUid(null); setLoading(false); return }
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
                .then(r => r.json())
                .then(j => setOrders(j.orders ?? []))
                .catch(()=>{})
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
      const items = findItems(o.checkout_snapshot).items
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
              <div className="text-slate-400 mb-2"><Calendar className="h-12 w-12 mx-auto" /></div>
              <h3 className="text-lg font-medium text-slate-900 mb-2">No orders found</h3>
              <p className="text-slate-600">{searchTerm ? "Try adjusting your search terms." : "You haven't submitted any quotes yet."}</p>
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
                    // Auto-detect items
                    const auto = findItems(o.checkout_snapshot)
                    const chosen = manualPath[o.id]
                    const manualArr = chosen ? toArray(getByPath(o.checkout_snapshot, chosen)) : undefined
                    const raw = chosen ? (manualArr ?? []) : auto.items
                    const items = raw.map(normalizeItem)
                    const itemsCount = items.length
                    const total = Number(o.grand_total || 0)
                    const status = normalizeStatus(o.status)
                    const isOpen = openId === o.id
                    const showRawThis = showRaw[o.id] === true

                    return (
                      <>
                        <TableRow key={o.id}>
                          <TableCell className="font-medium">{o.id.slice(0, 8)}…</TableCell>
                          <TableCell>{new Date(o.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>{itemsCount} items</TableCell>
                          <TableCell><Badge className={statusClass(o.status)}>{status}</Badge></TableCell>
                          <TableCell className="font-medium text-right">{total > 0 ? `₹${total.toFixed(2)}` : "—"}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center gap-2 justify-end">
                              <Button variant="outline" size="sm" onClick={() => setOpenId(isOpen ? null : o.id)}>
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
                                    <div className="font-medium">{new Date(o.created_at).toLocaleString()}</div>
                                  </div>
                                  <div>
                                    <div className="text-slate-500">Customer</div>
                                    <div className="font-medium">
                                      {o.checkout_snapshot?.customer?.name ||
                                        [o.checkout_snapshot?.customer?.first_name, o.checkout_snapshot?.customer?.last_name].filter(Boolean).join(" ") || "—"}
                                      {o.company_name ? <span className="text-slate-600"> — {o.company_name}</span> : null}
                                    </div>
                                    {o.checkout_snapshot?.customer?.phone ? (<div className="text-slate-600">{o.checkout_snapshot.customer.phone}</div>) : null}
                                    {o.checkout_snapshot?.customer?.email ? (<div className="text-slate-600">{o.checkout_snapshot.customer.email}</div>) : null}
                                  </div>
                                  <div>
                                    <div className="text-slate-500">Total</div>
                                    <div className="font-medium">{total > 0 ? `₹${total.toFixed(2)}` : "—"}</div>
                                  </div>
                                </div>

                                {/* Items */}
                                <div>
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="text-sm text-slate-600">Items</div>
                                    <div className="flex items-center gap-2">
                                      {items.length === 0 && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => setShowRaw((m) => ({ ...m, [o.id]: !showRawThis }))}
                                        >
                                          {showRawThis ? "Hide raw snapshot" : "Show raw snapshot"}
                                        </Button>
                                      )}
                                    </div>
                                  </div>

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
                                    <>
                                      <div className="text-sm text-slate-600 mb-3">No line items found automatically.</div>

                                      {/* Manual candidates (top 8) */}
                                      {auto.candidates.length > 0 && (
                                        <div className="space-y-2">
                                          <div className="text-xs text-slate-500">Possible item arrays detected:</div>
                                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {auto.candidates.map((c, i) => (
                                              <div key={i} className="flex items-center justify-between rounded border p-2 text-xs">
                                                <div className="min-w-0 pr-2">
                                                  <div className="truncate font-medium">{pathToString(c.path) || "(root array)"}</div>
                                                  {c.sampleKeys.length > 0 && (
                                                    <div className="text-slate-500 truncate">keys: {c.sampleKeys.join(", ")} • len: {c.len}</div>
                                                  )}
                                                </div>
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  onClick={() => setManualPath((m) => ({ ...m, [o.id]: c.path }))}
                                                >
                                                  Use
                                                </Button>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}

                                      {/* Raw snapshot to eyeball the exact path */}
                                      {showRawThis && (
                                        <pre className="text-xs bg-slate-50 border rounded p-3 overflow-x-auto mt-3">
                                          {JSON.stringify(o.checkout_snapshot, null, 2)}
                                        </pre>
                                      )}
                                    </>
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
