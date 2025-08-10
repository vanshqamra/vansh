// app/api/orders/checkout/route.ts
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { getSupabaseAdmin } from "@/lib/supabase/admin"

export async function POST(req: Request) {
  const server = getServerSupabase()
  const admin = getSupabaseAdmin()
  if (!server || !admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  // Authenticated user becomes the order owner
  const { data: { user } } = await server.auth.getUser()
  if (!user) return NextResponse.json({ error: "Not signed in" }, { status: 401 })

  const { customer, items, totals } = await req.json()

  // 1) Create order
  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert([{
      user_id: user.id,
      status: "pending",
      subtotal: totals?.subtotal ?? 0,
      tax: totals?.tax ?? 0,
      shipping: totals?.shipping ?? 0,
      discount: totals?.discount ?? 0,
      grand_total: totals?.grand_total ?? 0,

      buyer_first_name: customer?.firstName ?? null,
      buyer_last_name:  customer?.lastName ?? null,
      company_name:     customer?.company ?? null,
      buyer_phone:      customer?.phone ?? null,
      shipping_address: {
        address: customer?.address ?? "",
        city:    customer?.city ?? "",
        state:   customer?.state ?? "",
        pincode: customer?.pincode ?? "",
      },
      payment_method:   customer?.paymentMethod ?? null,
      checkout_snapshot: customer ?? null,
    }])
    .select()
    .single()

  if (orderErr) return NextResponse.json({ error: orderErr.message }, { status: 500 })

  // 2) Insert items (optional if no items)
  if (Array.isArray(items) && items.length) {
    const rows = items.map((it: any) => ({
      order_id: order.id,
      product_id: it.product_id ?? null,
      product_name: it.product_name,
      brand: it.brand ?? null,
      product_code: it.product_code ?? null,
      pack_size: it.pack_size ?? null,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
      line_total: Number(it.line_total),
    }))
    const { error: itemsErr } = await admin.from("order_items").insert(rows)
    if (itemsErr) return NextResponse.json({ error: itemsErr.message }, { status: 500 })
  }

  return NextResponse.json({ orderId: order.id }, { status: 201 })
}
