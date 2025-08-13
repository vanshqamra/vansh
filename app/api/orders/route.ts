// app/api/orders/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { z } from "zod"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { CreateOrderSchema } from "@/lib/validation/order"
import { sendAdminNewOrderEmail, sendOrderReceivedEmail } from "@/lib/mail"

/**
 * Lightweight quote payload (works with your quote-cart submission)
 * Accepts minimal data and stores details inside checkout_snapshot.
 */
const LiteQuoteSchema = z.object({
  items: z.array(
    z.object({
      sku: z.string().min(1),
      name: z.string().min(1),
      qty: z.number().int().positive()
    })
  ).min(1),
  customer: z.object({
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    company_name: z.string().optional(),
    gst: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional()
  }).optional(),
  source: z.string().optional(),          // e.g. "quote-cart"
  totals: z.object({                       // optional; quotes can be 0
    subtotal: z.number().nonnegative(),
    tax: z.number().nonnegative(),
    shipping: z.number().nonnegative(),
    discount: z.number().nonnegative().optional(),
    grand_total: z.number().nonnegative()
  }).optional(),
  shipping_address: z.any().optional()     // keep flexible; stored in snapshot and column if present
})

export async function POST(req: Request) {
  // 1) Parse JSON
  const json = await req.json().catch(() => null)
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // 2) Try Lite schema first (quote-cart), otherwise fall back to CreateOrderSchema (back-compat)
  let kind: "lite" | "full" = "lite"
  let parsed:
    | z.infer<typeof LiteQuoteSchema>
    | z.infer<typeof CreateOrderSchema>

  const lite = LiteQuoteSchema.safeParse(json)
  if (lite.success) {
    parsed = lite.data
    kind = "lite"
  } else {
    const full = CreateOrderSchema.safeParse(json)
    if (!full.success) {
      // return zod error details for easier debugging
      return NextResponse.json({ error: { lite: lite.error?.flatten?.(), full: full.error.flatten() } }, { status: 400 })
    }
    parsed = full.data
    kind = "full"
  }

  // 3) Get Supabase clients
  const server = getServerSupabase()
  const admin = getSupabaseAdmin()
  if (!server || !admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  // 4) Require authenticated user so orders attach to user_id (enables per-user listing on dashboard)
  const { data: auth } = await server.auth.getUser()
  const userId = auth.user?.id ?? null
  const authedEmail = auth.user?.email ?? null
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to submit a quote." }, { status: 401 })
  }

  // 5) Normalize fields for your orders table
  let email: string | null = null
  let buyer_phone: string | null = null
  let company_name: string | null = null
  let gst: string | null = null
  let shipping_address: any = null

  let subtotal = 0
  let tax = 0
  let shipping = 0
  let discount = 0
  let grand_total = 0

  // Build the checkout_snapshot payload we’ll store (so nothing is lost)
  const checkout_snapshot: Record<string, any> = {
    source: "quote-cart",
    submitted_at: new Date().toISOString(),
  }

  if (kind === "lite") {
    const d = parsed as z.infer<typeof LiteQuoteSchema>
    // derive contact and company details
    email = d.customer?.email ?? authedEmail
    buyer_phone = d.customer?.phone ?? null
    company_name = d.customer?.company_name ?? null
    gst = d.customer?.gst ?? null
    shipping_address = d.shipping_address ?? null

    // totals (optional for quotes)
    if (d.totals) {
      subtotal = d.totals.subtotal
      tax = d.totals.tax
      shipping = d.totals.shipping
      discount = d.totals.discount ?? 0
      grand_total = d.totals.grand_total
    } else {
      subtotal = 0; tax = 0; shipping = 0; discount = 0; grand_total = 0
    }

    checkout_snapshot.items = d.items
    checkout_snapshot.customer = d.customer ?? {}
    checkout_snapshot.shipping_address = shipping_address
    checkout_snapshot.totals = d.totals ?? { subtotal, tax, shipping, discount, grand_total }
    checkout_snapshot.source = d.source ?? "quote-cart"
  } else {
    const d = parsed as z.infer<typeof CreateOrderSchema>
    email = d.email ?? authedEmail
    buyer_phone = d.phone ?? null
    company_name = d.company_name ?? null
    gst = d.gst ?? null
    shipping_address = d.shipping_address ?? null

    subtotal = d.subtotal
    tax = d.tax
    shipping = d.shipping
    discount = d.discount ?? 0
    // your orders table uses grand_total, not total
    grand_total = d.total

    // preserve full payload in snapshot (including line items)
    checkout_snapshot.items = d.items ?? []
    checkout_snapshot.customer = {
      company_name,
      gst,
      phone: buyer_phone,
      email
    }
    checkout_snapshot.shipping_address = shipping_address
    checkout_snapshot.totals = { subtotal, tax, shipping, discount, grand_total }
    checkout_snapshot.source = "create-order-schema"
  }

  // 6) Upsert the profile by email (if available); keep status pending
  try {
    if (email) {
      await admin.from("profiles").upsert(
        {
          id: userId,               // align profile row with auth user
          user_id: userId,          // if you keep a separate user_id col
          email,
          company_name,
          gst,
          phone: buyer_phone,
          status: "pending"
        },
        { onConflict: "id" } // if you want to use email instead, change to "email"
      )
    }
  } catch (e) {
    console.warn("[orders] profile upsert failed", e)
    // non-fatal
  }

  // 7) Insert order into your existing schema
  const orderPayload: any = {
    user_id: userId,
    status: "pending",                 // <— matches your desired statuses
    subtotal,
    tax,
    shipping,
    discount,
    grand_total,
    buyer_first_name: checkout_snapshot.customer?.first_name ?? null,
    buyer_last_name: checkout_snapshot.customer?.last_name ?? null,
    company_name,
    buyer_phone,
    shipping_address: shipping_address || null,
    payment_method: null,
    checkout_snapshot
  }

  const { data: order, error } = await admin
    .from("orders")
    .insert(orderPayload)
    .select("id, status")
    .single()

  if (error || !order) {
    return NextResponse.json({ error: error?.message || "Order creation failed" }, { status: 500 })
  }

  // 8) Fire mail stubs (if email is present)
  if (email) {
    await Promise.allSettled([
      sendAdminNewOrderEmail(order.id, email),
      sendOrderReceivedEmail(email, order.id),
    ])
  }

  // 9) Respond
  return NextResponse.json({ orderId: order.id, status: order.status }, { status: 201 })
}
