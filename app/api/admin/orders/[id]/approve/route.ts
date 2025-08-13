import { NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server-client"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import { createPaymentLink } from "@/lib/payments"
import { sendOrderApprovedEmail } from "@/lib/mail"

export async function POST(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const server = getServerSupabase()
  const admin = getSupabaseAdmin()
  if (!server || !admin) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
  }

  const {
    data: { user },
    error: userErr,
  } = await server.auth.getUser()
  if (userErr || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await server
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()
  if (profile?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .single()
  if (orderErr || !order) {
    return NextResponse.json({ error: orderErr?.message || "Order not found" }, { status: 404 })
  }

  const payment = await createPaymentLink(order)

  const { error: updErr } = await admin
    .from("orders")
    .update({
      status: "approved",
      approved_at: new Date().toISOString(),
      approved_by: user.id,
      payment_provider: payment?.provider || null,
      payment_intent_id: payment?.id || null,
    })
    .eq("id", params.id)
  if (updErr) {
    return NextResponse.json({ error: updErr.message }, { status: 500 })
  }

  // approve profile if pending
  try {
    await admin
      .from("profiles")
      .update({ status: "approved", role: "client" })
      .eq("email", order.email)
  } catch (e) {
    console.warn("[orders] profile approve failed", e)
  }

  await sendOrderApprovedEmail(order.email, order.id, payment?.url || undefined)

  return NextResponse.json({ status: "approved", paymentLink: payment?.url || null })
}
