export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { sendAdminNewOrderEmail, sendOrderReceivedEmail } from "@/lib/mail"

type AnyObj = Record<string, any>

function asNumber(v: any, d = 0) {
  const n = Number(v)
  return Number.isFinite(n) ? n : d
}

function pickItems(json: AnyObj): Array<{ sku: string; name: string; qty: number }> {
  // Accept many shapes: items, products, cart/items, order_summary/items, etc.
  const candidates: any[] = []
  const s = json || {}

  const candPaths: any[] = [
    s.items, s.products,
    s.cart?.items, s.cart?.products,
    s.order?.items, s.order?.products,
    s.quote?.items, s.quote?.products,
    s.order_summary?.items, s.order_summary?.products,
    s.summary?.items, s.summary?.products,
    s.checkout?.summary?.items, s.checkout?.summary?.products,
    s.payload?.items, s.payload?.products,
    s.request?.items, s.request?.products,
  ]

  for (const c of candPaths) if (Array.isArray(c)) candidates.push(c)
  if (!candidates.length) return []

  const first = candidates.find((a) => Array.isArray(a) && a.length) || candidates[0]

  const norm = (it: any) => ({
    sku:
      it?.sku ??
      it?.code ??
      it?.product_code ??
      it?.productCode ??
      it?.id ??
      it?.part_no ??
      "",
    name:
      it?.name ??
      it?.product_name ??
      it?.productName ??
      it?.title ??
      it?.description ??
      "Item",
    qty: ((): number => {
      const q = (typeof it?.qty === "number" && it.qty) ??
                (typeof it?.quantity === "number" && it.quantity) ??
                (typeof it?.count === "number" && it.count) ??
                (typeof it?.qty_requested === "number" && it.qty_requested) ?? 1
      return asNumber(q, 1)
    })(),
  })

  return first.map(norm)
}

export async function POST(req: Request) {
  const server = getServerSupabase()
  const admin = getSupabaseAdmin()
  if (!server || !admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  const json = (await req.json().catch(() => null)) as AnyObj | null
  if (!json) return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })

  // Require auth — prevent anonymous empty orders
  const {
    data: { user },
  } = await server.auth.getUser()
  if (!user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  // Normalize items (must exist)
  const items = pickItems(json)
  if (!items.length) {
    return NextResponse.json(
      { error: "No line items found in request (expected items/products array). Fix checkout submit." },
      { status: 400 }
    )
  }

  // Normalize customer + shipping
  const customer = {
    first_name: json.customer?.first_name ?? json.firstName ?? null,
    last_name:  json.customer?.last_name  ?? json.lastName  ?? null,
    email:      json.customer?.email      ?? null,
    phone:      json.customer?.phone      ?? json.phone ?? null,
    company:    json.customer?.company_name ?? json.company ?? null,
    gst:        json.customer?.gst ?? null,
  }

  const shipping_address = json.shipping_address ?? {
    firstName: json.firstName ?? null,
    lastName:  json.lastName ?? null,
    phone:     json.phone ?? null,
    address:   json.address ?? null,
    city:      json.city ?? null,
    state:     json.state ?? null,
    pincode:   json.pincode ?? null,
    country:   json.country ?? "India",
    notes:     json.notes ?? null,
  }

  const totals = {
    subtotal:    asNumber(json.totals?.subtotal ?? json.subtotal),
    tax:         asNumber(json.totals?.tax ?? json.tax),
    shipping:    asNumber(json.totals?.shipping ?? json.shipping),
    discount:    asNumber(json.totals?.discount ?? json.discount),
    grand_total: asNumber(json.totals?.grand_total ?? json.total ?? json.grand_total),
  }

  // Build robust snapshot and also persist key fields into columns
  const checkout_snapshot = {
    source: json.source ?? "web",
    submitted_at: new Date().toISOString(),
    customer,
    shipping_address,
    totals,
    items,                          // normalized for UI
    products: json.products ?? undefined, // keep original if provided
    raw: json, // (optional) remove in prod if sensitive
  }

  // Optional: upsert profile basics
  try {
    await admin.from("profiles").upsert(
      {
        id: user.id,
        email: user.email,
        company_name: customer.company ?? null,
        phone: customer.phone ?? null,
        status: "pending",
      },
      { onConflict: "id" }
    )
  } catch (e) {
    console.warn("[orders] profile upsert failed", e)
  }

  // Insert order
  const { data: order, error } = await admin
    .from("orders")
    .insert({
      user_id: user.id,
      status: "pending",
      grand_total: totals.grand_total,
      shipping_address,
      checkout_snapshot,
    })
    .select("id, status")
    .single()

  if (error || !order) {
    return NextResponse.json({ error: error?.message || "Order creation failed" }, { status: 500 })
  }

  await Promise.allSettled([
    sendAdminNewOrderEmail?.(order.id, user.email ?? ""),
    sendOrderReceivedEmail?.(user.email ?? "", order.id),
  ])

  return NextResponse.json({ orderId: order.id, status: order.status }, { status: 201 })
}
