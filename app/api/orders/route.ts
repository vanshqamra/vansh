export const runtime = "nodejs"
export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { CreateOrderSchema } from "@/lib/validation/order"
import { sendAdminNewOrderEmail, sendOrderReceivedEmail } from "@/lib/mail"

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  const parse = CreateOrderSchema.safeParse(json)
  if (!parse.success) {
    return NextResponse.json({ error: parse.error.flatten() }, { status: 400 })
  }

  const server = getServerSupabase()
  const admin = getSupabaseAdmin()
  if (!server || !admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  const {
    email,
    phone,
    company_name,
    gst,
    shipping_address,
    billing_address,
    items,
    subtotal,
    tax,
    shipping,
    discount,
    total,
  } = parse.data

  const {
    data: { user },
  } = await server.auth.getUser()
  const userId = user?.id || null

  const profilePayload: any = {
    email,
    company_name: company_name || null,
    gst: gst || null,
    phone: phone || null,
    status: "pending",
  }
  if (userId) profilePayload.id = userId

  // Upsert profile by email/id
  try {
    await admin.from("profiles").upsert(profilePayload, { onConflict: userId ? "id" : "email" })
  } catch (e) {
    console.warn("[orders] profile upsert failed", e)
  }

  const orderPayload = {
    user_id: userId,
    email,
    phone: phone || null,
    company_name: company_name || null,
    gst: gst || null,
    shipping_address: shipping_address || null,
    billing_address: billing_address || null,
    items,
    subtotal,
    tax,
    shipping,
    discount: discount ?? 0,
    total,
    status: "awaiting_approval" as const,
  }

  const { data: order, error } = await admin
    .from("orders")
    .insert(orderPayload)
    .select("id, status")
    .single()

  if (error || !order) {
    return NextResponse.json({ error: error?.message || "Order creation failed" }, { status: 500 })
  }

  await Promise.all([
    sendAdminNewOrderEmail(order.id, email),
    sendOrderReceivedEmail(email, order.id),
  ])

  return NextResponse.json({ orderId: order.id, status: order.status }, { status: 201 })
}
