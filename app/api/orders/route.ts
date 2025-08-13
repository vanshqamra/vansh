// app/api/orders/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { CreateOrderSchema } from "@/lib/validation/order"
import { sendAdminNewOrderEmail, sendOrderReceivedEmail } from "@/lib/mail"

/** Normalize any item-like object into { sku, name, qty } */
function normalizeItems(arr: any[]): Array<{ sku: string; name: string; qty: number }> {
  return (arr || []).map((it: any) => ({
    sku:
      String(
        it?.sku ??
          it?.code ??
          it?.product_code ??
          it?.id ??
          ""
      ),
    name: String(it?.name ?? it?.product_name ?? it?.title ?? "Item"),
    qty: Number(
      it?.qty ?? it?.quantity ?? it?.count ?? 1
    ),
  }))
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  if (!json) {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const parsed = CreateOrderSchema.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }
  const data = parsed.data

  const server = getServerSupabase()
  const admin = getSupabaseAdmin()
  if (!server || !admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  const { data: auth } = await server.auth.getUser()
  const userId = auth.user?.id
  const authedEmail = auth.user?.email ?? null
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rawItems = Array.isArray(data.items)
    ? data.items
    : Array.isArray(data.products)
    ? data.products
    : []
  const normalizedItems = normalizeItems(rawItems)

  const checkout_snapshot: any = {
    source: data.source ?? "web",
    submitted_at: new Date().toISOString(),
    customer: {
      first_name: data.customer?.first_name ?? (data as any).firstName ?? null,
      last_name: data.customer?.last_name ?? (data as any).lastName ?? null,
      email: data.customer?.email ?? authedEmail ?? null,
      phone: data.customer?.phone ?? (data as any).phone ?? null,
      company: data.customer?.company_name ?? (data as any).company_name ?? (data as any).company ?? null,
      gst: data.customer?.gst ?? null,
    },
    shipping_address:
      data.shipping_address ?? {
        firstName: (data as any).firstName ?? null,
        lastName: (data as any).lastName ?? null,
        phone: (data as any).phone ?? null,
        address: (data as any).address ?? null,
        city: (data as any).city ?? null,
        state: (data as any).state ?? null,
        pincode: (data as any).pincode ?? null,
        country: (data as any).country ?? null,
        notes: (data as any).notes ?? null,
      },
    totals: {
      subtotal: data.totals?.subtotal ?? (data as any).subtotal ?? 0,
      tax: data.totals?.tax ?? (data as any).tax ?? 0,
      shipping: data.totals?.shipping ?? (data as any).shipping ?? 0,
      discount: data.totals?.discount ?? (data as any).discount ?? 0,
      grand_total:
        data.totals?.grand_total ??
        (data as any).total ??
        (data as any).grand_total ??
        0,
    },
    items: normalizedItems,
    products: Array.isArray(data.products) ? data.products : undefined,
    raw: json,
  }

  const grand_total = checkout_snapshot.totals.grand_total
  const shipping_address = checkout_snapshot.shipping_address

  const email = checkout_snapshot.customer.email
  const buyer_phone = checkout_snapshot.customer.phone
  const company_name = checkout_snapshot.customer.company
  const gst = checkout_snapshot.customer.gst

  try {
    if (email) {
      await admin.from("profiles").upsert(
        {
          id: userId,
          user_id: userId,
          email,
          company_name,
          gst,
          phone: buyer_phone,
          status: "pending",
        },
        { onConflict: "id" }
      )
    }
  } catch (e) {
    console.warn("[orders] profile upsert failed", e)
  }

  const orderPayload: any = {
    user_id: userId,
    status: "pending",
    subtotal: checkout_snapshot.totals.subtotal,
    tax: checkout_snapshot.totals.tax,
    shipping: checkout_snapshot.totals.shipping,
    discount: checkout_snapshot.totals.discount,
    grand_total,
    buyer_first_name: checkout_snapshot.customer.first_name,
    buyer_last_name: checkout_snapshot.customer.last_name,
    company_name,
    buyer_phone,
    shipping_address,
    payment_method: null,
    checkout_snapshot,
  }

  const { data: order, error } = await admin
    .from("orders")
    .insert(orderPayload)
    .select("id, status")
    .single()

  if (error || !order) {
    return NextResponse.json(
      { error: error?.message || "Order creation failed" },
      { status: 500 }
    )
  }

  if (email) {
    await Promise.allSettled([
      sendAdminNewOrderEmail(order.id, email),
      sendOrderReceivedEmail(email, order.id),
    ])
  }

  return NextResponse.json(
    { orderId: order.id, status: order.status },
    { status: 201 }
  )
}
